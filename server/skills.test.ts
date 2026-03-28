import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Helper: create a public (unauthenticated) context ─────────────────────
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// ─── Helper: create an authenticated staff context ──────────────────────────
function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-skills-admin",
      email: "admin@hamzury.com",
      name: "Skills Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Skills Department Routes", () => {

  // ─── Public: List Cohorts ──────────────────────────────────────────────────
  describe("skills.listCohorts", () => {
    it("returns an array of cohorts (public access)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.skills.listCohorts();
      expect(Array.isArray(result)).toBe(true);
      // Each cohort should have expected shape
      if (result.length > 0) {
        const cohort = result[0];
        expect(cohort).toHaveProperty("id");
        expect(cohort).toHaveProperty("title");
        expect(cohort).toHaveProperty("program");
        expect(cohort).toHaveProperty("pathway");
        expect(cohort).toHaveProperty("startDate");
        expect(cohort).toHaveProperty("endDate");
        expect(cohort).toHaveProperty("maxSeats");
        expect(cohort).toHaveProperty("enrolledCount");
        expect(cohort).toHaveProperty("status");
      }
    });
  });

  // ─── Public: Submit Application ────────────────────────────────────────────
  describe("skills.submitApplication", () => {
    it("creates an application and returns a SKL reference", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.skills.submitApplication({
        program: "skills_intensive",
        pathway: "virtual",
        businessDescription: "E-commerce fashion brand",
        biggestChallenge: "Scaling operations",
        heardFrom: "Instagram",
        canCommitTime: true,
        hasEquipment: true,
        willingToExecute: true,
        fullName: "Amina Bello",
        phone: "+2348012345678",
        email: "amina@example.com",
        pricingTier: "early_bird",
        agreedToTerms: true,
        agreedToEffort: true,
      });
      expect(result).toHaveProperty("ref");
      expect(result.ref).toMatch(/^HAM-[A-Z0-9]{4}-\d{4}$/);
      expect(result).toHaveProperty("applicationId");
      expect(typeof result.applicationId).toBe("number");
    });

    it("requires fullName and program at minimum", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.skills.submitApplication({
        program: "executive",
        fullName: "Chidi Okafor",
      });
      expect(result).toHaveProperty("ref");
      expect(result.ref).toMatch(/^HAM-[A-Z0-9]{4}-\d{4}$/);
    });

    it("rejects empty program", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.skills.submitApplication({
          program: "",
          fullName: "Test User",
        })
      ).rejects.toThrow();
    });

    it("rejects empty fullName", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.skills.submitApplication({
          program: "ai_course",
          fullName: "",
        })
      ).rejects.toThrow();
    });
  });

  // ─── Public: Track Application ─────────────────────────────────────────────
  describe("skills.trackApplication", () => {
    it("returns found=false for non-existent reference", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.skills.trackApplication({ ref: "HAM-ZZ00-0000" });
      expect(result.found).toBe(false);
    });

    it("tracks a submitted application by reference", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      // First submit
      const app = await caller.skills.submitApplication({
        program: "it_internship",
        fullName: "Tracking Test User",
        phone: "+2348099999999",
      });
      // Then track
      const result = await caller.skills.trackApplication({ ref: app.ref });
      expect(result.found).toBe(true);
      if (result.found) {
        expect(result.ref).toBe(app.ref);
        expect(result.program).toBe("it_internship");
        expect(result.status).toBe("submitted");
        expect(result.paymentStatus).toBe("pending");
      }
    });
  });

  // ─── Protected: Admin Stats ────────────────────────────────────────────────
  describe("skills.adminStats", () => {
    it("returns stats for authenticated users", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const stats = await caller.skills.adminStats();
      expect(stats).toHaveProperty("activeCohorts");
      expect(stats).toHaveProperty("upcomingCohorts");
      expect(stats).toHaveProperty("pendingApps");
      expect(stats).toHaveProperty("totalStudents");
      expect(stats).toHaveProperty("ridiCommunities");
      expect(typeof stats.activeCohorts).toBe("number");
      expect(typeof stats.pendingApps).toBe("number");
    });

    it("rejects unauthenticated access", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.skills.adminStats()).rejects.toThrow();
    });
  });

  // ─── Protected: List Applications ──────────────────────────────────────────
  describe("skills.applications", () => {
    it("returns applications list for authenticated users", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const apps = await caller.skills.applications();
      expect(Array.isArray(apps)).toBe(true);
    });

    it("rejects unauthenticated access", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.skills.applications()).rejects.toThrow();
    });
  });

  // ─── Reference Number Format ───────────────────────────────────────────────
  describe("SKL reference number format", () => {
    it("generates unique references in HAM-XXXX-YYYY format", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const refs = new Set<string>();
      for (let i = 0; i < 5; i++) {
        const result = await caller.skills.submitApplication({
          program: "skills_intensive",
          fullName: `Test User ${i}`,
        });
        expect(result.ref).toMatch(/^HAM-[A-Z0-9]{4}-\d{4}$/);
        refs.add(result.ref);
      }
      // All references should be unique (with very high probability)
      expect(refs.size).toBe(5);
    });
  });
});
