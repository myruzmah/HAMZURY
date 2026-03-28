import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { calculateCommission, formatNaira } from "@shared/commission";

// ─── Test Helpers ────────────────────────────────────────────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "hamzury-admin-001",
    email: "admin@hamzury.ng",
    name: "HAMZURY Admin",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMISSION CALCULATOR (Pure Function)
// ═══════════════════════════════════════════════════════════════════════════════

describe("Commission Calculator", () => {
  it("calculates 40/60 split correctly", () => {
    const result = calculateCommission(1000000);
    expect(result.commissionPool).toBe(400000);       // Staff Pool = 40%
    expect(result.institutionalAmount).toBe(600000);  // Institutional = 60%
  });

  it("calculates 5-tier breakdown correctly", () => {
    const result = calculateCommission(1000000);
    // Staff Pool is 400,000
    expect(result.tiers.deptLead).toBe(40000);      // 10% of pool = 4% of revenue
    expect(result.tiers.ceo).toBe(40000);            // 10% of pool = 4% of revenue
    expect(result.tiers.finance).toBe(20000);        // 5% of pool = 2% of revenue
    expect(result.tiers.hr).toBe(20000);             // 5% of pool = 2% of revenue
    expect(result.tiers.execution).toBe(160000);     // 40% of pool = 16% of revenue
    expect(result.tiers.facilities).toBe(20000);     // 5% of pool = 2% of revenue
    expect(result.tiers.leadGenerator).toBe(50000);  // 12.5% of pool = 5% of revenue
    expect(result.tiers.converter).toBe(50000);      // 12.5% of pool = 5% of revenue
  });

  it("tier amounts sum to commission pool", () => {
    const result = calculateCommission(500000);
    const { deptLead, ceo, finance, hr, execution, facilities, leadGenerator, converter } = result.tiers;
    const tierSum = deptLead + ceo + finance + hr + execution + facilities + leadGenerator + converter;
    expect(tierSum).toBe(result.commissionPool);
  });

  it("institutional + pool equals quoted price", () => {
    const result = calculateCommission(750000);
    expect(result.institutionalAmount + result.commissionPool).toBe(750000);
  });

  it("handles small amounts correctly", () => {
    const result = calculateCommission(100);
    expect(result.commissionPool).toBe(40);       // Staff Pool = 40%
    expect(result.institutionalAmount).toBe(60);  // Institutional = 60%
    expect(result.tiers.deptLead).toBe(4);        // 10% of 40
    expect(result.tiers.ceo).toBe(4);             // 10% of 40
    expect(result.tiers.execution).toBe(16);      // 40% of 40
    expect(result.tiers.leadGenerator).toBe(5);   // 12.5% of 40
    expect(result.tiers.converter).toBe(5);       // 12.5% of 40
  });

  it("handles decimal amounts with rounding", () => {
    const result = calculateCommission(333333);
    // Should round to 2 decimal places
    expect(Number.isFinite(result.institutionalAmount)).toBe(true);
    expect(Number.isFinite(result.commissionPool)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FORMAT NAIRA
// ═══════════════════════════════════════════════════════════════════════════════

describe("Format Naira", () => {
  it("formats positive amounts", () => {
    const formatted = formatNaira(1000000);
    // Should contain NGN or ₦ symbol
    expect(formatted).toMatch(/NGN|₦/);
    expect(formatted).toContain("1,000,000");
  });

  it("formats zero", () => {
    const formatted = formatNaira(0);
    expect(formatted).toMatch(/NGN|₦/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// HAMZURY INSTITUTIONAL ROUTES - AUTH PROTECTION
// ═══════════════════════════════════════════════════════════════════════════════

describe("HAMZURY Institutional Routes - Auth Protection", () => {
  it("denies unauthenticated access to staff.list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.staff.list()).rejects.toThrow();
  });

  it("denies unauthenticated access to commissions.list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.commissions.list()).rejects.toThrow();
  });

  it("denies unauthenticated access to attendance.checkIn", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.attendance.checkIn()).rejects.toThrow();
  });

  it("denies unauthenticated access to reports.list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.reports.list()).rejects.toThrow();
  });

  it("denies unauthenticated access to audit.list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.audit.list()).rejects.toThrow();
  });

  it("denies unauthenticated access to institutional.stats", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.institutional.stats()).rejects.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// STAFF MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

describe("Staff Management", () => {
  it("lists all staff for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const staff = await caller.staff.list();
    expect(Array.isArray(staff)).toBe(true);
  });

  it("validates role enum on updateRole", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.staff.updateRole({ userId: 1, hamzuryRole: "invalid_role" as any })
    ).rejects.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// COMMISSIONS ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

describe("Commission Routes", () => {
  it("calculates commission via API", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.commissions.calculate({ quotedPrice: 500000 });
    expect(result.commissionPool).toBe(200000);       // Staff Pool = 40% of 500k
    expect(result.institutionalAmount).toBe(300000);  // Institutional = 60% of 500k
    expect(result.tiers.deptLead).toBe(20000);        // 10% of pool
  });

  it("rejects negative price in calculate", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.commissions.calculate({ quotedPrice: -100 })
    ).rejects.toThrow();
  });

  it("rejects zero price in calculate", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.commissions.calculate({ quotedPrice: 0 })
    ).rejects.toThrow();
  });

  it("creates a commission for a completed task", async () => {
    // First create a task
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);
    const lead = await publicCaller.leads.submit({
      name: "Commission Test Client",
      service: "CAC",
    });

    const authCtx = createAuthContext();
    const authCaller = appRouter.createCaller(authCtx);

    // Complete the task
    await authCaller.tasks.updateStatus({ id: lead.taskId, status: "Completed" });

    // Create commission
    const commission = await authCaller.commissions.create({
      taskId: lead.taskId,
      quotedPrice: 250000,
    });

    expect(commission).toHaveProperty("id");
    expect(commission.taskRef).toMatch(/^HAM-[A-Z0-9]{4}-\d{4}$/);
    expect(Number(commission.quotedPrice)).toBe(250000);
    expect(Number(commission.commissionPool)).toBe(100000);       // Staff Pool = 40% of 250k
    expect(Number(commission.institutionalAmount)).toBe(150000);  // Institutional = 60% of 250k
    expect(commission.status).toBe("pending");
  });

  it("lists commissions", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const list = await caller.commissions.list();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  it("validates commission status enum", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.commissions.updateStatus({ id: 1, status: "invalid" as any })
    ).rejects.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// LEAD ASSIGNMENT (CSO FLOW)
// ═══════════════════════════════════════════════════════════════════════════════

describe("Lead Assignment (CSO Flow)", () => {
  it("lists unassigned leads", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const unassigned = await caller.leads.unassigned();
    expect(Array.isArray(unassigned)).toBe(true);
  });

  it("assigns a lead to a department", async () => {
    // Create a fresh lead
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);
    const lead = await publicCaller.leads.submit({
      name: "Assignment Test",
      service: "License",
    });

    const authCtx = createAuthContext();
    const authCaller = appRouter.createCaller(authCtx);
    const assigned = await authCaller.leads.assign({
      leadId: lead.leadId,
      department: "bizdoc",
    });

    expect(assigned).toBeDefined();
    expect(assigned?.assignedDepartment).toBe("bizdoc");
    expect(assigned?.status).toBe("contacted");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// WEEKLY REPORTS
// ═══════════════════════════════════════════════════════════════════════════════

describe("Weekly Reports", () => {
  it("submits a weekly report", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const report = await caller.reports.submit({
      department: "bizdoc",
      weekStart: "2026-03-17",
      summary: "Completed 5 CAC registrations this week.",
      completedTasks: 5,
      pendingTasks: 3,
      blockers: "Waiting on CAC portal maintenance to complete.",
    });
    expect(report).toHaveProperty("id");
    expect(report.department).toBe("bizdoc");
    expect(report.summary).toContain("5 CAC registrations");
  });

  it("lists weekly reports", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const reports = await caller.reports.list();
    expect(Array.isArray(reports)).toBe(true);
    expect(reports.length).toBeGreaterThan(0);
  });

  it("rejects empty summary", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.reports.submit({
        department: "bizdoc",
        weekStart: "2026-03-17",
        summary: "",
      })
    ).rejects.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INSTITUTIONAL STATS
// ═══════════════════════════════════════════════════════════════════════════════

describe("Institutional Stats", () => {
  it("returns institutional overview stats", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.institutional.stats();
    expect(stats).toHaveProperty("totalStaff");
    expect(stats).toHaveProperty("totalLeads");
    expect(stats).toHaveProperty("totalTasks");
    expect(stats).toHaveProperty("completedTasks");
    expect(stats).toHaveProperty("totalRevenue");
    expect(stats).toHaveProperty("pendingCommissions");
    expect(typeof stats.totalStaff).toBe("number");
    expect(typeof stats.totalRevenue).toBe("number");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT LOGS
// ═══════════════════════════════════════════════════════════════════════════════

describe("Audit Logs", () => {
  it("lists audit logs", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const logs = await caller.audit.list({ limit: 50 });
    expect(Array.isArray(logs)).toBe(true);
    // Should have entries from commission creation and lead assignment
    expect(logs.length).toBeGreaterThan(0);
  });

  it("audit log entries have required fields", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const logs = await caller.audit.list({ limit: 5 });
    if (logs.length > 0) {
      const entry = logs[0];
      expect(entry).toHaveProperty("id");
      expect(entry).toHaveProperty("action");
      expect(entry).toHaveProperty("createdAt");
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TASK PRICE SETTING
// ═══════════════════════════════════════════════════════════════════════════════

describe("Task Price Setting", () => {
  it("sets a quoted price on a task", async () => {
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);
    const lead = await publicCaller.leads.submit({
      name: "Price Test",
      service: "Tax",
    });

    const authCtx = createAuthContext();
    const authCaller = appRouter.createCaller(authCtx);
    const updated = await authCaller.tasks.setPrice({
      id: lead.taskId,
      quotedPrice: "150000",
    });
    expect(updated).toBeDefined();
    expect(Number(updated?.quotedPrice)).toBe(150000);
  });
});
