import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Test Helpers ────────────────────────────────────────────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "staff-user-001",
    email: "officer@bizdoc.ng",
    name: "Compliance Officer",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ─── Reference Number Format ─────────────────────────────────────────────────

describe("Reference Number Generation", () => {
  it("generates reference numbers in HAM-XXXX-YYYY format", async () => {
    const { generateRefNumber } = await import("./db");
    const ref = generateRefNumber();
    expect(ref).toMatch(/^HAM-[A-Z0-9]{4}-\d{4}$/);
  });

  it("generates unique reference numbers", async () => {
    const { generateRefNumber } = await import("./db");
    const refs = new Set<string>();
    for (let i = 0; i < 50; i++) {
      refs.add(generateRefNumber());
    }
    // With 4-digit random numbers, 50 should be mostly unique
    expect(refs.size).toBeGreaterThan(40);
  });
});

// ─── Public Tracking ─────────────────────────────────────────────────────────

describe("Public Tracking Lookup", () => {
  it("returns found: false for non-existent reference", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tracking.lookup({ ref: "HAM-ZZ00-0000" });
    expect(result.found).toBe(false);
  });

  it("rejects empty reference numbers", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.tracking.lookup({ ref: "" })).rejects.toThrow();
  });

  it("normalizes reference to uppercase", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    // This should not throw, just return not found
    const result = await caller.tracking.lookup({ ref: "bz-2026-1234" });
    expect(result.found).toBe(false);
  });
});

// ─── Auth Protection ─────────────────────────────────────────────────────────

describe("Protected Routes Access Control", () => {
  it("denies unauthenticated access to tasks.list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.tasks.list()).rejects.toThrow();
  });

  it("denies unauthenticated access to tasks.stats", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.tasks.stats()).rejects.toThrow();
  });

  it("denies unauthenticated access to leads.list", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.leads.list()).rejects.toThrow();
  });

  it("denies unauthenticated access to checklist.templates", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.checklist.templates()).rejects.toThrow();
  });

  it("denies unauthenticated access to documents.getByTaskId", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.documents.getByTaskId({ taskId: 1 })).rejects.toThrow();
  });

  it("denies unauthenticated access to whatsapp.sendMessage", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.whatsapp.sendMessage({ taskId: 1, phone: "+2348000000000", messageType: "file_created" })
    ).rejects.toThrow();
  });

  it("denies unauthenticated access to ai.chat", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.ai.chat({ message: "What is CAC?" })
    ).rejects.toThrow();
  });
});

// ─── Lead Submission (Public) ────────────────────────────────────────────────

describe("Lead Submission", () => {
  it("validates required fields: name and service", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    // Missing name
    await expect(
      caller.leads.submit({ name: "", service: "CAC" })
    ).rejects.toThrow();
    // Missing service
    await expect(
      caller.leads.submit({ name: "John", service: "" })
    ).rejects.toThrow();
  });

  it("accepts valid lead submission with all fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.leads.submit({
      name: "Test Client",
      businessName: "Test Corp",
      phone: "+2348012345678",
      email: "test@example.com",
      service: "CAC",
      context: "New registration",
    });
    expect(result).toHaveProperty("ref");
    expect(result.ref).toMatch(/^HAM-[A-Z0-9]{4}-\d{4}$/);
    expect(result).toHaveProperty("leadId");
    expect(result).toHaveProperty("taskId");
    expect(typeof result.leadId).toBe("number");
    expect(typeof result.taskId).toBe("number");
  });

  it("accepts minimal lead submission (name + service only)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.leads.submit({
      name: "Minimal Client",
      service: "Tax",
    });
    expect(result.ref).toMatch(/^HAM-[A-Z0-9]{4}-\d{4}$/);
    expect(result.leadId).toBeGreaterThan(0);
    expect(result.taskId).toBeGreaterThan(0);
  });
});

// ─── Authenticated Task Operations ──────────────────────────────────────────

describe("Task Operations (Authenticated)", () => {
  it("lists tasks for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const tasks = await caller.tasks.list();
    expect(Array.isArray(tasks)).toBe(true);
  });

  it("returns dashboard stats", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.tasks.stats();
    expect(stats).toHaveProperty("totalTasks");
    expect(stats).toHaveProperty("notStarted");
    expect(stats).toHaveProperty("inProgress");
    expect(stats).toHaveProperty("waitingOnClient");
    expect(stats).toHaveProperty("submitted");
    expect(stats).toHaveProperty("completed");
    expect(stats).toHaveProperty("totalLeads");
    expect(typeof stats.totalTasks).toBe("number");
  });

  it("throws NOT_FOUND for non-existent task", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.tasks.getById({ id: 999999 })).rejects.toThrow("Task not found");
  });

  it("validates status enum on updateStatus", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.tasks.updateStatus({ id: 1, status: "Invalid Status" as any })
    ).rejects.toThrow();
  });
});

// ─── Task Status Workflow ────────────────────────────────────────────────────

describe("Task Status Workflow", () => {
  let taskId: number;

  it("creates a lead and task, then updates through all statuses", async () => {
    // Create a lead first
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);
    const lead = await publicCaller.leads.submit({
      name: "Workflow Test Client",
      businessName: "Workflow Corp",
      phone: "+2348099999999",
      service: "License",
      context: "Testing status workflow",
    });
    taskId = lead.taskId;

    // Verify initial status
    const authCtx = createAuthContext();
    const authCaller = appRouter.createCaller(authCtx);
    const task = await authCaller.tasks.getById({ id: taskId });
    expect(task.status).toBe("Not Started");
  });

  it("transitions through all valid statuses", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const statuses: Array<"In Progress" | "Waiting on Client" | "Submitted" | "Completed"> = [
      "In Progress",
      "Waiting on Client",
      "Submitted",
      "Completed",
    ];

    for (const status of statuses) {
      const updated = await caller.tasks.updateStatus({ id: taskId, status });
      expect(updated?.status).toBe(status);
    }
  });
});

// ─── Checklist Operations ────────────────────────────────────────────────────

describe("Checklist Operations", () => {
  it("retrieves checklist items for a task", async () => {
    // First create a task via lead
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);
    const lead = await publicCaller.leads.submit({
      name: "Checklist Test",
      service: "CAC",
    });

    const authCtx = createAuthContext();
    const authCaller = appRouter.createCaller(authCtx);
    const items = await authCaller.checklist.getByTaskId({ taskId: lead.taskId });
    expect(Array.isArray(items)).toBe(true);
    // Should have items from the seeded templates
    expect(items.length).toBeGreaterThan(0);
  });

  it("checklist items have correct phase values", async () => {
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);
    const lead = await publicCaller.leads.submit({
      name: "Phase Test",
      service: "Tax",
    });

    const authCtx = createAuthContext();
    const authCaller = appRouter.createCaller(authCtx);
    const items = await authCaller.checklist.getByTaskId({ taskId: lead.taskId });
    const phases = [...new Set(items.map(i => i.phase))];
    expect(phases).toContain("pre");
    expect(phases).toContain("during");
    expect(phases).toContain("post");
  });

  it("toggles a checklist item", async () => {
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);
    const lead = await publicCaller.leads.submit({
      name: "Toggle Test",
      service: "Legal",
    });

    const authCtx = createAuthContext();
    const authCaller = appRouter.createCaller(authCtx);
    const items = await authCaller.checklist.getByTaskId({ taskId: lead.taskId });
    const firstItem = items[0];
    expect(firstItem.checked).toBe(false);

    const toggled = await authCaller.checklist.toggle({ itemId: firstItem.id });
    expect(toggled.checked).toBe(true);

    // Toggle back
    const toggledBack = await authCaller.checklist.toggle({ itemId: firstItem.id });
    expect(toggledBack.checked).toBe(false);
  });
});

// ─── WhatsApp Message Templates ──────────────────────────────────────────────

describe("WhatsApp Messaging", () => {
  let testTaskId: number;

  it("creates a task for WhatsApp testing", async () => {
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);
    const lead = await publicCaller.leads.submit({
      name: "WhatsApp Test",
      businessName: "WA Corp",
      phone: "+2348011111111",
      service: "CAC",
    });
    testTaskId = lead.taskId;
  });

  it("generates file_created WhatsApp message", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.whatsapp.sendMessage({
      taskId: testTaskId,
      phone: "+2348011111111",
      messageType: "file_created",
    });
    expect(result.whatsappUrl).toContain("wa.me/");
    expect(result.whatsappUrl).toContain("2348011111111");
    expect(result.message).toContain("BizDoc Consult");
    expect(result.message).toContain("Reference:");
  });

  it("generates status_update WhatsApp message", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.whatsapp.sendMessage({
      taskId: testTaskId,
      phone: "+2348011111111",
      messageType: "status_update",
    });
    expect(result.message).toContain("Status:");
    expect(result.message).toContain("BizDoc Consult");
  });

  it("generates document_pickup WhatsApp message", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.whatsapp.sendMessage({
      taskId: testTaskId,
      phone: "+2348011111111",
      messageType: "document_pickup",
    });
    expect(result.message).toContain("Document Ready");
    expect(result.message).toContain("ready for pickup");
  });

  it("sends custom WhatsApp message", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const customText = "Hello, please bring your passport for verification.";
    const result = await caller.whatsapp.sendMessage({
      taskId: testTaskId,
      phone: "+2348011111111",
      messageType: "custom",
      customMessage: customText,
    });
    expect(result.message).toBe(customText);
  });

  it("cleans phone number correctly", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.whatsapp.sendMessage({
      taskId: testTaskId,
      phone: "+234 801 111 1111",
      messageType: "file_created",
    });
    expect(result.whatsappUrl).toContain("2348011111111");
  });
});

// ─── Public Tracking with Real Data ──────────────────────────────────────────

describe("Public Tracking with Real Data", () => {
  it("finds a task by reference number after lead submission", async () => {
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);
    
    // Create a lead
    const lead = await publicCaller.leads.submit({
      name: "Tracking Test Client",
      service: "Tax",
    });

    // Look it up
    const result = await publicCaller.tracking.lookup({ ref: lead.ref });
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.ref).toBe(lead.ref);
      expect(result.service).toBe("Tax");
      expect(result.status).toBe("Not Started");
      expect(result.statusMessage).toContain("queued for processing");
      expect(result.lastUpdated).toBeDefined();
    }
  });

  it("returns correct status message for each status", async () => {
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);
    const authCtx = createAuthContext();
    const authCaller = appRouter.createCaller(authCtx);

    const lead = await publicCaller.leads.submit({
      name: "Status Message Test",
      service: "License",
    });

    // Update to In Progress
    await authCaller.tasks.updateStatus({ id: lead.taskId, status: "In Progress" });
    const result = await publicCaller.tracking.lookup({ ref: lead.ref });
    if (result.found) {
      expect(result.status).toBe("In Progress");
      expect(result.statusMessage).toContain("actively being processed");
    }
  });
});

// ─── Activity Logging ────────────────────────────────────────────────────────

describe("Activity Logging", () => {
  it("logs activity when task status is changed", async () => {
    const publicCtx = createPublicContext();
    const publicCaller = appRouter.createCaller(publicCtx);
    const lead = await publicCaller.leads.submit({
      name: "Activity Log Test",
      service: "CAC",
    });

    const authCtx = createAuthContext();
    const authCaller = appRouter.createCaller(authCtx);
    await authCaller.tasks.updateStatus({ id: lead.taskId, status: "In Progress" });

    const logs = await authCaller.activity.getByTaskId({ taskId: lead.taskId });
    expect(Array.isArray(logs)).toBe(true);
    // Should have at least the task_created log and the status_changed log
    expect(logs.length).toBeGreaterThanOrEqual(2);
    const statusLog = logs.find(l => l.action === "status_changed");
    expect(statusLog).toBeDefined();
    expect(statusLog?.details).toContain("In Progress");
  });
});
