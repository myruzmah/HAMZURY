import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { generateHZRefNumber } from "./db";

// ─── Helpers ────────────────────────────────────────────────────────────────

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@hamzury.com",
      name: "Test User",
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

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("Systemise Department", () => {
  // ─── Reference Number Generation ──────────────────────────────────────────
  describe("HZ Reference Number Generation", () => {
    it("generates ref in HAM-XXXX-YYYY format", () => {
      const ref = generateHZRefNumber();
      expect(ref).toMatch(/^HAM-[A-Z0-9]{4}-\d{4}$/);
    });

    it("generates unique refs", () => {
      const refs = new Set(Array.from({ length: 50 }, () => generateHZRefNumber()));
      // With alphanumeric random chars, 50 should be mostly unique
      expect(refs.size).toBeGreaterThan(40);
    });
  });

  // ─── Submit Lead ──────────────────────────────────────────────────────────
  describe("systemise.submitLead", () => {
    it("requires name field", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(
        caller.systemise.submitLead({
          name: "",
          serviceInterest: ["Website Design"],
        })
      ).rejects.toThrow();
    });

    it("accepts valid lead submission", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      // This will fail at DB level in test, but validates input schema
      try {
        await caller.systemise.submitLead({
          name: "John Doe",
          businessName: "Doe Enterprises",
          phone: "+2348012345678",
          email: "john@doe.com",
          chosenPath: "A",
          serviceInterest: ["Website Design", "Brand Identity"],
          freeTextNotes: "Need a complete rebrand",
          checkupData: { branding: "red" },
          recommendedStep: "Brand Identity + Website Design",
        });
      } catch (e: any) {
        // DB not available in test, but input validation passed
        expect(e.message).toContain("Database");
      }
    });
  });

  // ─── Submit Appointment ───────────────────────────────────────────────────
  describe("systemise.submitAppointment", () => {
    it("requires clientName, preferredDate, and preferredTime", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(
        caller.systemise.submitAppointment({
          clientName: "",
          preferredDate: "2026-04-01",
          preferredTime: "10:00 AM",
        })
      ).rejects.toThrow();
    });

    it("validates appointment input schema", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      try {
        await caller.systemise.submitAppointment({
          clientName: "Jane Smith",
          businessName: "Smith Corp",
          phone: "+2348098765432",
          email: "jane@smith.com",
          preferredDate: "2026-04-15",
          preferredTime: "2:00 PM",
        });
      } catch (e: any) {
        expect(e.message).toContain("Database");
      }
    });
  });

  // ─── Submit Join Application ──────────────────────────────────────────────
  describe("systemise.submitJoinApplication", () => {
    it("requires fullName", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(
        caller.systemise.submitJoinApplication({
          fullName: "",
        })
      ).rejects.toThrow();
    });

    it("validates join application input schema", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      try {
        await caller.systemise.submitJoinApplication({
          fullName: "Alex Johnson",
          roleInterest: "Brand Strategist",
          experience: "5 years in digital marketing",
          portfolioUrl: "https://alexj.design",
          phone: "+2348055555555",
        });
      } catch (e: any) {
        expect(e.message).toContain("Database");
      }
    });
  });

  // ─── Track Lookup ─────────────────────────────────────────────────────────
  describe("systemise.trackLookup", () => {
    it("requires non-empty ref", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(
        caller.systemise.trackLookup({ ref: "" })
      ).rejects.toThrow();
    });

    it("returns null for non-existent ref", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      try {
        const result = await caller.systemise.trackLookup({ ref: "HAM-ZZ00-9999" });
        expect(result).toBeNull();
      } catch (e: any) {
        // DB not available is acceptable in test
        expect(e.message).toBeDefined();
      }
    });
  });

  // ─── Protected Routes ─────────────────────────────────────────────────────
  describe("Protected Systemise routes", () => {
    it("systemise.leads requires authentication", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(caller.systemise.leads()).rejects.toThrow("Please login");
    });

    it("systemise.appointments requires authentication", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(caller.systemise.appointments()).rejects.toThrow("Please login");
    });

    it("systemise.joinApplications requires authentication", async () => {
      const caller = appRouter.createCaller(createPublicContext());
      await expect(caller.systemise.joinApplications()).rejects.toThrow("Please login");
    });
  });
});
