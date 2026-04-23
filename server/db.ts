import { eq, desc, sql, and, gte, lte, ne, like, or, not, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { createHash, randomBytes, timingSafeEqual, scrypt } from "crypto";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const scryptAsync = promisify(scrypt);
import {
  InsertUser, users, User,
  leads, InsertLead, Lead,
  tasks, InsertTask, Task,
  checklistTemplates, ChecklistTemplate,
  taskChecklistItems, InsertTaskChecklistItem, TaskChecklistItem,
  documents, InsertDocument, Document,
  activityLogs, InsertActivityLog, ActivityLog,
  commissions, InsertCommission, Commission,
  attendance, InsertAttendance, Attendance,
  weeklyReports, InsertWeeklyReport, WeeklyReport,
  auditLogs, InsertAuditLog, AuditLog,
  systemiseLeads, InsertSystemiseLead, SystemiseLead,
  appointments, InsertAppointment, Appointment,
  joinApplications, InsertJoinApplication, JoinApplication,
  cohorts, InsertCohort, Cohort,
  cohortModules, InsertCohortModule, CohortModule,
  skillsApplications, InsertSkillsApplication, SkillsApplication,
  studentAssignments, InsertStudentAssignment, StudentAssignment,
  liveSessions, InsertLiveSession, LiveSession,
  affiliates, InsertAffiliate, Affiliate,
  affiliateRecords, InsertAffiliateRecord, AffiliateRecord,
  affiliateWithdrawals, InsertAffiliateWithdrawal, AffiliateWithdrawal,
  staffUsers, StaffUser, InsertStaffUser,
  subscriptions, InsertSubscription, Subscription,
  subscriptionPayments, InsertSubscriptionPayment, SubscriptionPayment,
  clientCredentials, InsertClientCredential, ClientCredential,
  taxSavingsRecords, InsertTaxSavingsRecord, TaxSavingsRecord,
  servicePricing, InsertServicePricing, ServicePricing,
  invoices, InsertInvoice, Invoice,
  notifications, InsertNotification, Notification,
  proposals, InsertProposal, Proposal,
  certificates, InsertCertificate, Certificate,
  contentPosts, InsertContentPost, ContentPost,
  leaveRequests, InsertLeaveRequest, LeaveRequest,
  disciplineRecords, InsertDisciplineRecord, DisciplineRecord,
  portalVisitLogs, InsertPortalVisitLog, PortalVisitLog,
  contentEngagementLogs, InsertContentEngagementLog, ContentEngagementLog,
  hubMeetingRecords, InsertHubMeetingRecord, HubMeetingRecord,
  studentMilestones, InsertStudentMilestone, StudentMilestone,
  allocations, InsertAllocation, Allocation,
  aiFundLog,
  affiliateLeagueTable,
  skillsCalendar, InsertSkillsCalendar,
  skillsTeams, InsertSkillsTeam, SkillsTeam,
  skillsTeamMembers, SkillsTeamMember,
  skillsInteractiveSessions, SkillsInteractiveSession,
  skillsAwards, SkillsAward,
  clientChats, InsertClientChat, ClientChat,
  partnerships, Partnership,
  brandQaItems, BrandQaItem,
  jobPostings, JobPosting,
  hiringApplications, HiringApplication,
  trainingSessions, TrainingSession,
  developmentPlans, DevelopmentPlan,
  performanceCycles, PerformanceCycle,
  ridiCommunities, RidiCommunity,
  podcastEpisodes, PodcastEpisode,
  mediaAssets, MediaAsset,
  socialPlatformStats, SocialPlatformStat,
  weeklyTargets, InsertWeeklyTarget, WeeklyTarget,
  deptMessages, InsertDeptMessage, DeptMessage,
  agentState,
  agentSuggestions,
  clients, InsertClient, Client,
  clientSessions, InsertClientSession, ClientSession,
  targets, InsertTargetV2, TargetV2,
  calendarEvents, InsertCalendarEvent, CalendarEvent,
  clientNotes, InsertClientNote, ClientNote,
  contentCreators, InsertContentCreator, ContentCreator,
} from "../drizzle/schema";
import { ENV } from './_core/env';

// ─── Password Utilities (scrypt — for staffUsers table) ───────────────────────

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(32).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
  return { hash: derivedKey.toString("hex"), salt };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  try {
    const derivedKey = await scryptAsync(password, salt, 64) as Buffer;
    const storedBuffer = Buffer.from(hash, "hex");
    if (derivedKey.length !== storedBuffer.length) return false;
    return timingSafeEqual(derivedKey, storedBuffer);
  } catch { return false; }
}

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  if (!_db && dbUrl) {
    try {
      _db = drizzle(dbUrl);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function runMigrations(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.log("[migrate] Database not available — skipping migrations");
    return;
  }
  try {
    // In production: dist/index.js lives in dist/, migrations are in drizzle/ at root
    const migrationsFolder = join(dirname(fileURLToPath(import.meta.url)), "../drizzle");
    await migrate(db, { migrationsFolder });
    console.log("[migrate] All migrations applied successfully");
  } catch (err) {
    console.log("[migrate] Migration error (tables may already exist):", String(err));
  }
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) { values.lastSignedIn = new Date(); }
    if (Object.keys(updateSet).length === 0) { updateSet.lastSignedIn = new Date(); }
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllStaff(): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(users.name);
}

export async function updateUserRole(userId: number, hamzuryRole: string, department?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { hamzuryRole };
  if (department !== undefined) updateData.department = department;
  await db.update(users).set(updateData).where(eq(users.id, userId));
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0];
}

// ─── Reference Number Generator ──────────────────────────────────────────────

/**
 * Unified ref format: HAM-XXXX-YYYY
 *   XXXX = 4 random alphanumeric (A-Z, 0-9)
 *   YYYY = last 4 digits of phone (or 4 random digits if phone missing/short)
 */
export function generateRef(phone?: string | null): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1);

  const digits = phone ? phone.replace(/\D/g, "") : "";
  const last4 = digits.length >= 4
    ? digits.slice(-4)
    : String(Math.floor(1000 + Math.random() * 9000));

  return `HMZ-${yy}/${m}-${last4}`;
}

// Backward-compat aliases
export const generateHMZRef = generateRef;
export const generateRefNumber = generateRef;
export const generateHZRefNumber = (phone?: string | null) => generateRef(phone);
export const generateSKLRefNumber = (phone?: string | null) => generateRef(phone);

// ─── Leads ───────────────────────────────────────────────────────────────────

export async function createLead(data: Omit<InsertLead, "id" | "createdAt" | "updatedAt">): Promise<Lead> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ref = data.ref || generateHMZRef(data.phone);
  await db.insert(leads).values({ ...data, ref });
  const result = await db.select().from(leads).where(eq(leads.ref, ref)).limit(1);
  return result[0];
}

export async function getLeads() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt));
}

export async function getUnassignedLeads() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads)
    .where(sql`${leads.assignedDepartment} IS NULL`)
    .orderBy(desc(leads.createdAt));
}

export async function assignLead(leadId: number, department: string, assignedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(leads).set({
    assignedDepartment: department,
    assignedBy,
    assignedAt: new Date(),
    status: "contacted",
  }).where(eq(leads.id, leadId));
  const result = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  return result[0];
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export async function createTask(data: {
  clientName: string; service: string; department: string;
  assignedTo?: number; notes?: string; deadline?: string;
  businessName?: string; phone?: string; expectedDelivery?: string;
  estimatedHours?: number; priority?: string; category?: string;
}): Promise<Task> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ref = generateRef();
  await db.insert(tasks).values({
    ref,
    clientName: data.clientName,
    businessName: data.businessName,
    phone: data.phone,
    service: data.service,
    department: data.department,
    assignedTo: data.assignedTo,
    notes: data.notes,
    deadline: data.deadline,
    expectedDelivery: data.expectedDelivery,
    estimatedHours: data.estimatedHours,
    priority: (data.priority?.toLowerCase() || "normal") as "urgent" | "high" | "normal" | "low",
    category: data.category,
    status: "Not Started",
  });
  const result = await db.select().from(tasks).where(eq(tasks.ref, ref)).limit(1);
  return result[0];
}

export async function createTaskFromLead(lead: Lead): Promise<Task> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(tasks).values({
    ref: lead.ref,
    leadId: lead.id,
    clientName: lead.name,
    businessName: lead.businessName,
    phone: lead.phone,
    service: lead.service,
    status: "Not Started",
    department: "bizdoc",
    notes: lead.context ? `Lead context: ${lead.context}` : `Lead captured via AI Desk. Phone: ${lead.phone}`,
  });
  const taskResult = await db.select().from(tasks).where(eq(tasks.ref, lead.ref)).limit(1);
  const task = taskResult[0];
  // Create default checklist items from templates
  const templates = await db.select().from(checklistTemplates).orderBy(checklistTemplates.phase, checklistTemplates.sortOrder);
  if (templates.length > 0) {
    const items: InsertTaskChecklistItem[] = templates.map(t => ({
      taskId: task.id,
      templateId: t.id,
      phase: t.phase,
      label: t.label,
      checked: false,
      sortOrder: t.sortOrder,
    }));
    await db.insert(taskChecklistItems).values(items);
  }
  await db.insert(activityLogs).values({
    taskId: task.id,
    leadId: lead.id,
    action: "task_created",
    details: `Task created from lead: ${lead.name} - ${lead.service}`,
  });
  return task;
}

export async function getTasks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).orderBy(desc(tasks.createdAt));
}

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTaskByRef(ref: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tasks).where(eq(tasks.ref, ref)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/** Find a lead by its ref number */
export async function getLeadByRef(ref: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(leads).where(eq(leads.ref, ref)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/** Find tasks matching a lead's phone number */
export async function getTasksByLeadPhone(phone: string): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  const last6 = phone.replace(/\D/g, "").slice(-6);
  if (!last6) return [];
  return db.select().from(tasks).where(like(tasks.phone, `%${last6}`)).orderBy(desc(tasks.createdAt));
}

export async function getTasksByLeadId(leadId: number): Promise<Task[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.leadId, leadId)).orderBy(desc(tasks.createdAt));
}

export async function getTasksByClientPhone(phone: string): Promise<Task[]> {
  const db = await getDb();
  if (!db) return [];
  const last6 = phone.replace(/\D/g, "").slice(-6);
  if (!last6) return [];
  return db.select().from(tasks).where(like(tasks.phone, `%${last6}`)).orderBy(desc(tasks.createdAt));
}

export async function getTaskByPhone(phoneDigits: string) {
  const db = await getDb();
  if (!db) return undefined;
  const last6 = phoneDigits.replace(/\D/g, "").slice(-6);
  const result = await db.select().from(tasks).where(like(tasks.phone, `%${last6}`)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTask(id: number, data: Partial<Pick<Task, "status" | "notes" | "deadline" | "assignedTo" | "department" | "quotedPrice" | "completedAt" | "kpiApproved" | "isRework" | "reworkNote" | "subscriptionId" | "taskMonth">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tasks).set(data).where(eq(tasks.id, id));
  return getTaskById(id);
}

export async function getTasksByDepartment(department: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.department, department)).orderBy(desc(tasks.createdAt));
}

/** When CSO assigns a lead to a department, sync the linked task's department field */
export async function updateTaskDepartmentByLeadId(leadId: number, department: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(tasks).set({ department }).where(eq(tasks.leadId, leadId));
}

/** All tasks submitted for CSO review (status = Submitted, not yet kpiApproved) */
export async function getSubmittedTasksForReview() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks)
    .where(and(eq(tasks.status, "Submitted"), eq(tasks.kpiApproved, false)))
    .orderBy(desc(tasks.updatedAt));
}

export async function getTasksByAssignee(staffUserId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.assignedTo, staffUserId)).orderBy(desc(tasks.createdAt));
}

/** Get tasks by department for staff member KPI/workspace */
export async function getTasksByDeptForStaff(department: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks)
    .where(eq(tasks.department, department))
    .orderBy(desc(tasks.createdAt));
}

/** Get commission by task ref — used to prevent duplicate commission creation */
export async function getCommissionByTaskRef(taskRef: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(commissions).where(eq(commissions.taskRef, taskRef)).limit(1);
  return result[0];
}

/** Update lead — partial update of any lead fields */
export async function updateLead(leadId: number, data: Partial<Omit<InsertLead, "id" | "createdAt" | "updatedAt" | "ref">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(leads).set(data).where(eq(leads.id, leadId));
  const result = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  return result[0];
}

/** Hard-delete a lead. Nulls leadId on any linked tasks (no FK, plain column). */
export async function deleteLead(leadId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Null leadId on any task that pointed at this lead
  try {
    await db.update(tasks).set({ leadId: null } as any).where(eq(tasks.leadId, leadId));
  } catch { /* no-op if no tasks referenced */ }
  await db.delete(leads).where(eq(leads.id, leadId));
}

/** Update lead score */
export async function updateLeadScore(leadId: number, score: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(leads).set({ leadScore: score }).where(eq(leads.id, leadId));
}

// ─── Checklist Items ─────────────────────────────────────────────────────────

export async function getChecklistItemsByTaskId(taskId: number): Promise<TaskChecklistItem[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(taskChecklistItems)
    .where(eq(taskChecklistItems.taskId, taskId))
    .orderBy(taskChecklistItems.phase, taskChecklistItems.sortOrder);
}

export async function toggleChecklistItem(itemId: number): Promise<TaskChecklistItem | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const current = await db.select().from(taskChecklistItems).where(eq(taskChecklistItems.id, itemId)).limit(1);
  if (current.length === 0) return undefined;
  const newChecked = !current[0].checked;
  await db.update(taskChecklistItems).set({ checked: newChecked }).where(eq(taskChecklistItems.id, itemId));
  const result = await db.select().from(taskChecklistItems).where(eq(taskChecklistItems.id, itemId)).limit(1);
  return result[0];
}

export async function getChecklistTemplates(): Promise<ChecklistTemplate[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(checklistTemplates).orderBy(checklistTemplates.phase, checklistTemplates.sortOrder);
}

// ─── Documents ───────────────────────────────────────────────────────────────

export async function createDocument(data: Omit<InsertDocument, "id" | "createdAt">): Promise<Document> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(documents).values(data);
  const insertId = result[0].insertId;
  const doc = await db.select().from(documents).where(eq(documents.id, insertId)).limit(1);
  return doc[0];
}

export async function getDocumentsByTaskId(taskId: number): Promise<Document[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.taskId, taskId)).orderBy(desc(documents.createdAt));
}

export async function deleteDocument(docId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(documents).where(eq(documents.id, docId));
}

// ─── Activity Logs ───────────────────────────────────────────────────────────

export async function createActivityLog(data: Omit<InsertActivityLog, "id" | "createdAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityLogs).values(data);
}

export async function getActivityLogsByTaskId(taskId: number): Promise<ActivityLog[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLogs).where(eq(activityLogs.taskId, taskId)).orderBy(desc(activityLogs.createdAt));
}

export async function getRecentActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalTasks: 0, notStarted: 0, inProgress: 0, waitingOnClient: 0, submitted: 0, completed: 0, totalLeads: 0 };
  const allTasks = await db.select().from(tasks);
  const allLeads = await db.select().from(leads);
  return {
    totalTasks: allTasks.length,
    notStarted: allTasks.filter(t => t.status === "Not Started").length,
    inProgress: allTasks.filter(t => t.status === "In Progress").length,
    waitingOnClient: allTasks.filter(t => t.status === "Waiting on Client").length,
    submitted: allTasks.filter(t => t.status === "Submitted").length,
    completed: allTasks.filter(t => t.status === "Completed").length,
    totalLeads: allLeads.length,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HAMZURY INSTITUTIONAL HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Commissions ─────────────────────────────────────────────────────────────

export async function createCommission(data: Omit<InsertCommission, "id" | "createdAt" | "updatedAt">): Promise<Commission> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(commissions).values(data);
  const insertId = result[0].insertId;
  const row = await db.select().from(commissions).where(eq(commissions.id, insertId)).limit(1);
  return row[0];
}

export async function getCommissions(): Promise<Commission[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(commissions).orderBy(desc(commissions.createdAt));
}

export async function updateCommissionStatus(id: number, status: "pending" | "approved" | "paid", approvedBy?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: Record<string, unknown> = { status };
  if (status === "approved" && approvedBy) {
    updateData.approvedBy = approvedBy;
    updateData.approvedAt = new Date();
  }
  if (status === "paid") {
    updateData.paidAt = new Date();
  }
  await db.update(commissions).set(updateData).where(eq(commissions.id, id));
  const result = await db.select().from(commissions).where(eq(commissions.id, id)).limit(1);
  return result[0];
}

// ─── Attendance ──────────────────────────────────────────────────────────────

export async function recordAttendance(data: Omit<InsertAttendance, "id" | "createdAt">): Promise<Attendance> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(attendance).values(data);
  const insertId = result[0].insertId;
  const row = await db.select().from(attendance).where(eq(attendance.id, insertId)).limit(1);
  return row[0];
}

export async function getAttendanceByDate(date: string): Promise<Attendance[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attendance).where(eq(attendance.date, date));
}

export async function getAttendanceByUser(userId: number): Promise<Attendance[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attendance).where(eq(attendance.userId, userId)).orderBy(desc(attendance.date));
}

// ─── Weekly Reports ──────────────────────────────────────────────────────────

export async function createWeeklyReport(data: Omit<InsertWeeklyReport, "id" | "createdAt" | "updatedAt">): Promise<WeeklyReport> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(weeklyReports).values(data);
  const insertId = result[0].insertId;
  const row = await db.select().from(weeklyReports).where(eq(weeklyReports.id, insertId)).limit(1);
  return row[0];
}

export async function getWeeklyReports(): Promise<WeeklyReport[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(weeklyReports).orderBy(desc(weeklyReports.createdAt));
}

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export async function createAuditLog(data: Omit<InsertAuditLog, "id" | "createdAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values(data);
}

export async function getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}

// ─── Institutional Stats ─────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEMISE DEPARTMENT HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

// generateHZRefNumber is now an alias defined at the top — see generateRef()

export async function createSystemiseLead(data: Omit<InsertSystemiseLead, "id" | "createdAt" | "updatedAt">): Promise<SystemiseLead> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ref = data.ref || generateRef(data.phone);
  await db.insert(systemiseLeads).values({ ...data, ref });
  const result = await db.select().from(systemiseLeads).where(eq(systemiseLeads.ref, ref)).limit(1);
  return result[0];
}

export async function getSystemiseLeads(): Promise<SystemiseLead[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(systemiseLeads).orderBy(desc(systemiseLeads.createdAt));
}

export async function getSystemiseLeadByRef(ref: string): Promise<SystemiseLead | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(systemiseLeads).where(eq(systemiseLeads.ref, ref)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAppointment(data: Omit<InsertAppointment, "id" | "createdAt" | "updatedAt">): Promise<Appointment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(appointments).values(data);
  const insertId = result[0].insertId;
  const row = await db.select().from(appointments).where(eq(appointments.id, insertId)).limit(1);
  return row[0];
}

export async function getAppointments(): Promise<Appointment[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).orderBy(desc(appointments.createdAt));
}

export async function createJoinApplication(data: Omit<InsertJoinApplication, "id" | "createdAt" | "updatedAt">): Promise<JoinApplication> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(joinApplications).values(data);
  const insertId = result[0].insertId;
  const row = await db.select().from(joinApplications).where(eq(joinApplications.id, insertId)).limit(1);
  return row[0];
}

export async function getJoinApplications(): Promise<JoinApplication[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(joinApplications).orderBy(desc(joinApplications.createdAt));
}

export async function getInstitutionalStats() {
  const db = await getDb();
  if (!db) return { totalStaff: 0, totalLeads: 0, totalTasks: 0, completedTasks: 0, totalRevenue: 0, pendingCommissions: 0 };

  const allUsers = await db.select().from(users);
  const allLeads = await db.select().from(leads);
  const allTasks = await db.select().from(tasks);
  const allCommissions = await db.select().from(commissions);

  const totalRevenue = allCommissions.reduce((sum, c) => sum + Number(c.quotedPrice || 0), 0);
  const pendingCommissions = allCommissions.filter(c => c.status === "pending").length;

  return {
    totalStaff: allUsers.length,
    totalLeads: allLeads.length,
    totalTasks: allTasks.length,
    completedTasks: allTasks.filter(t => t.status === "Completed").length,
    totalRevenue,
    pendingCommissions,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKILLS DEPARTMENT HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

// generateSKLRefNumber is now an alias defined at the top — see generateRef()

// ─── Cohorts ────────────────────────────────────────────────────────────────

export async function listCohorts(): Promise<Cohort[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cohorts).orderBy(desc(cohorts.createdAt));
}

export async function getCohortById(id: number): Promise<Cohort | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(cohorts).where(eq(cohorts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Skills Applications ────────────────────────────────────────────────────

export async function createSkillsApplication(data: Omit<InsertSkillsApplication, "id" | "createdAt" | "updatedAt">): Promise<SkillsApplication> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ref = data.ref || generateRef(data.phone);
  await db.insert(skillsApplications).values({ ...data, ref });
  const result = await db.select().from(skillsApplications).where(eq(skillsApplications.ref, ref)).limit(1);
  return result[0];
}

export async function getSkillsApplications(): Promise<SkillsApplication[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(skillsApplications).orderBy(desc(skillsApplications.createdAt));
}

export async function getSkillsApplicationByRef(ref: string): Promise<SkillsApplication | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(skillsApplications).where(eq(skillsApplications.ref, ref)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSkillsApplicationByEmail(email: string): Promise<SkillsApplication | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(skillsApplications).where(eq(skillsApplications.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCohortModules(cohortId: number): Promise<CohortModule[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cohortModules).where(eq(cohortModules.cohortId, cohortId)).orderBy(cohortModules.sortOrder);
}

export async function getStudentAssignments(applicationId: number): Promise<StudentAssignment[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studentAssignments).where(eq(studentAssignments.applicationId, applicationId)).orderBy(desc(studentAssignments.createdAt));
}

export async function getLiveSessions(cohortId: number): Promise<LiveSession[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(liveSessions).where(eq(liveSessions.cohortId, cohortId)).orderBy(liveSessions.sessionDate, liveSessions.sessionTime);
}

export async function updateStudentAssignment(id: number, data: Partial<InsertStudentAssignment>): Promise<StudentAssignment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(studentAssignments).set(data).where(eq(studentAssignments.id, id));
  const result = await db.select().from(studentAssignments).where(eq(studentAssignments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSkillsApplicationStatus(id: number, status: string, reviewedBy?: number, reviewNotes?: string): Promise<SkillsApplication | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const updateData: Record<string, unknown> = { status };
  if (reviewedBy) updateData.reviewedBy = reviewedBy;
  if (reviewNotes) updateData.reviewNotes = reviewNotes;
  await db.update(skillsApplications).set(updateData).where(eq(skillsApplications.id, id));
  const result = await db.select().from(skillsApplications).where(eq(skillsApplications.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AFFILIATE PORTAL
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Password Utilities ───────────────────────────────────────────────────────

export function hashAffiliatePassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(password + salt).digest("hex");
  return `${salt}:${hash}`;
}

export function verifyAffiliatePassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(":");
    const inputHash = createHash("sha256").update(password + salt).digest("hex");
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(inputHash, "hex"));
  } catch {
    return false;
  }
}

export function generateAffiliateCode(): string {
  const num = Math.floor(100 + Math.random() * 900);
  return `AFF-${num}`;
}

// ─── Affiliates ───────────────────────────────────────────────────────────────

export async function createAffiliate(data: {
  name: string; email: string; password: string; phone?: string;
}): Promise<Affiliate> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const code = generateAffiliateCode();
  const passwordHash = hashAffiliatePassword(data.password);
  await db.insert(affiliates).values({
    code, name: data.name, email: data.email, passwordHash, phone: data.phone,
  });
  const result = await db.select().from(affiliates).where(eq(affiliates.email, data.email)).limit(1);
  return result[0];
}

export async function getAffiliateByEmail(email: string): Promise<Affiliate | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(affiliates).where(eq(affiliates.email, email)).limit(1);
  return result[0];
}

export async function getAffiliateById(id: number): Promise<Affiliate | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(affiliates).where(eq(affiliates.id, id)).limit(1);
  return result[0];
}

export async function getAffiliateByCode(code: string): Promise<Affiliate | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(affiliates).where(eq(affiliates.code, code)).limit(1);
  return result[0];
}

export async function getAllAffiliates(): Promise<Affiliate[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(affiliates).orderBy(desc(affiliates.createdAt));
}

// ─── Affiliate Records ────────────────────────────────────────────────────────

export async function createAffiliateRecord(data: InsertAffiliateRecord): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(affiliateRecords).values(data);
}

export async function getAffiliateRecordsByAffiliate(affiliateId: number): Promise<AffiliateRecord[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(affiliateRecords)
    .where(eq(affiliateRecords.affiliateId, affiliateId))
    .orderBy(desc(affiliateRecords.createdAt));
}

export async function updateAffiliateRecordStatus(
  id: number, status: "pending" | "earned" | "paid"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: Record<string, unknown> = { status };
  if (status === "paid") updates.paidAt = new Date();
  await db.update(affiliateRecords).set(updates).where(eq(affiliateRecords.id, id));
}

// ─── Affiliate Withdrawals ────────────────────────────────────────────────────

export async function createAffiliateWithdrawal(
  data: InsertAffiliateWithdrawal
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(affiliateWithdrawals).values(data);
}

export async function getAffiliateWithdrawals(affiliateId: number): Promise<AffiliateWithdrawal[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(affiliateWithdrawals)
    .where(eq(affiliateWithdrawals.affiliateId, affiliateId))
    .orderBy(desc(affiliateWithdrawals.createdAt));
}

export async function getAffiliateStats(affiliateId: number) {
  const records = await getAffiliateRecordsByAffiliate(affiliateId);
  const total = records.length;
  const converted = records.filter(r => r.status !== "pending").length;
  const pendingEarnings = records
    .filter(r => r.status === "earned")
    .reduce((sum, r) => sum + parseFloat(r.commissionAmount?.toString() || "0"), 0);
  const totalPaid = records
    .filter(r => r.status === "paid")
    .reduce((sum, r) => sum + parseFloat(r.commissionAmount?.toString() || "0"), 0);
  return { total, converted, pendingEarnings, totalPaid };
}

// ─── Staff Users ─────────────────────────────────────────────────────────────

/** Department codes for staff ref generation */
const DEPT_CODES: Record<string, string> = {
  founder: "01", ceo: "02", cso: "03", finance: "04", hr: "05",
  bizdev: "06", media: "07", skills_staff: "08", systemise_head: "09",
  tech_lead: "10", compliance_staff: "11", security_staff: "12",
  department_staff: "13", bizdev_staff: "06",
};

/** Generate a staff reference: HMZ-0001-01 */
export async function generateStaffRef(role: string): Promise<string> {
  const db = await getDb();
  const deptCode = DEPT_CODES[role] || "00";
  const count = db ? (await db.select().from(staffUsers)).length : 0;
  const seq = String(count + 1).padStart(4, "0");
  return `HMZ-${seq}-${deptCode}`;
}

/** Look up staff by their staff ref (HMZ-0001-01) */
export async function getStaffUserByRef(ref: string): Promise<StaffUser | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const results = await db.select().from(staffUsers).where(eq(staffUsers.staffRef, ref.toUpperCase().trim())).limit(1);
    return results[0] ?? null;
  } catch {
    // staffRef column may not exist yet — return null so login falls back to email
    return null;
  }
}

export async function getStaffUserByEmail(email: string): Promise<StaffUser | null> {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(staffUsers).where(eq(staffUsers.email, email.toLowerCase())).limit(1);
  return results[0] ?? null;
}

export async function getStaffUserById(id: number): Promise<StaffUser | null> {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(staffUsers).where(eq(staffUsers.id, id)).limit(1);
  return results[0] ?? null;
}

export async function createStaffUser(data: InsertStaffUser): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(staffUsers).values(data);
}

export async function updateStaffUserLogin(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(staffUsers).set({ lastLogin: new Date(), failedAttempts: 0, lockedUntil: null, firstLogin: false }).where(eq(staffUsers.id, id));
}

export async function incrementStaffFailedAttempts(id: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const user = await getStaffUserById(id);
  if (!user) return 0;
  const attempts = (user.failedAttempts ?? 0) + 1;
  const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
  await db.update(staffUsers).set({ failedAttempts: attempts, lockedUntil }).where(eq(staffUsers.id, id));
  return attempts;
}

export async function updateStaffPassword(id: number, passwordHash: string, passwordSalt: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(staffUsers).set({ passwordHash, passwordSalt, passwordChanged: true, firstLogin: false }).where(eq(staffUsers.id, id));
}

export async function listAllStaffUsers(): Promise<StaffUser[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(staffUsers).orderBy(staffUsers.createdAt);
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function createSubscription(data: Omit<InsertSubscription, "id" | "createdAt" | "updatedAt">): Promise<Subscription> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(subscriptions).values(data);
  const row = await db.select().from(subscriptions).where(eq(subscriptions.id, result[0].insertId)).limit(1);
  return row[0];
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
}

export async function getSubscriptionById(id: number): Promise<Subscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1);
  return result[0];
}

export async function updateSubscriptionStatus(id: number, status: "active" | "paused" | "cancelled"): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(subscriptions).set({ status }).where(eq(subscriptions.id, id));
}

// ─── Subscription Payments ────────────────────────────────────────────────────

export async function createSubscriptionPayment(data: Omit<InsertSubscriptionPayment, "id" | "createdAt">): Promise<SubscriptionPayment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(subscriptionPayments).values(data);
  const row = await db.select().from(subscriptionPayments).where(eq(subscriptionPayments.id, result[0].insertId)).limit(1);
  return row[0];
}

export async function getPaymentsBySubscription(subscriptionId: number): Promise<SubscriptionPayment[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptionPayments)
    .where(eq(subscriptionPayments.subscriptionId, subscriptionId))
    .orderBy(desc(subscriptionPayments.month));
}

export async function getAllSubscriptionPayments(): Promise<SubscriptionPayment[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptionPayments).orderBy(desc(subscriptionPayments.createdAt));
}

export async function updateSubscriptionPayment(id: number, data: Partial<Pick<SubscriptionPayment, "status" | "amountPaid" | "paidAt" | "recordedBy" | "paymentRef" | "notes">>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(subscriptionPayments).set(data).where(eq(subscriptionPayments.id, id));
}

export async function getOrCreateMonthlyPayment(subscriptionId: number, month: string, amountDue: string): Promise<SubscriptionPayment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(subscriptionPayments)
    .where(and(eq(subscriptionPayments.subscriptionId, subscriptionId), eq(subscriptionPayments.month, month)))
    .limit(1);
  if (existing[0]) return existing[0];
  const result = await db.insert(subscriptionPayments).values({ subscriptionId, month, amountDue, status: "pending" });
  const row = await db.select().from(subscriptionPayments).where(eq(subscriptionPayments.id, result[0].insertId)).limit(1);
  return row[0];
}

// ─── Client Credentials ───────────────────────────────────────────────────────

export async function createClientCredential(data: Omit<InsertClientCredential, "id" | "createdAt" | "updatedAt">): Promise<ClientCredential> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clientCredentials).values(data);
  const row = await db.select().from(clientCredentials).where(eq(clientCredentials.id, result[0].insertId)).limit(1);
  return row[0];
}

export async function getCredentialsByTaskId(taskId: number): Promise<ClientCredential[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientCredentials).where(eq(clientCredentials.taskId, taskId));
}

export async function getCredentialsBySubscriptionId(subscriptionId: number): Promise<ClientCredential[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientCredentials).where(eq(clientCredentials.subscriptionId, subscriptionId));
}

export async function deleteClientCredential(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(clientCredentials).where(eq(clientCredentials.id, id));
}

export async function getTasksBySubscriptionId(subscriptionId: number): Promise<Task[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks)
    .where(eq(tasks.subscriptionId, subscriptionId))
    .orderBy(desc(tasks.createdAt));
}

export async function getSubscriptionByLeadRef(ref: string): Promise<Subscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const leadRow = await db.select({ id: leads.id }).from(leads).where(eq(leads.ref, ref)).limit(1);
  if (!leadRow[0]) return undefined;
  const subRow = await db.select().from(subscriptions).where(eq(subscriptions.leadId, leadRow[0].id)).limit(1);
  return subRow[0];
}

// ─── Tax Savings Records ──────────────────────────────────────────────────────

export async function upsertTaxSavingsRecord(data: {
  subscriptionId: number;
  year: string;
  grossTaxLiability?: string;
  savedAmount?: string;
  hamzuryFee?: string;
  tccDelivered?: boolean;
  tccDeliveredAt?: Date;
  notes?: string;
  recordedBy?: string;
}): Promise<TaxSavingsRecord> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db.select().from(taxSavingsRecords)
    .where(and(eq(taxSavingsRecords.subscriptionId, data.subscriptionId), eq(taxSavingsRecords.year, data.year)))
    .limit(1);
  if (existing[0]) {
    await db.update(taxSavingsRecords).set({ ...data }).where(eq(taxSavingsRecords.id, existing[0].id));
    const updated = await db.select().from(taxSavingsRecords).where(eq(taxSavingsRecords.id, existing[0].id)).limit(1);
    return updated[0];
  }
  const result = await db.insert(taxSavingsRecords).values(data);
  const row = await db.select().from(taxSavingsRecords).where(eq(taxSavingsRecords.id, result[0].insertId)).limit(1);
  return row[0];
}

export async function getTaxSavingsBySubscription(subscriptionId: number): Promise<TaxSavingsRecord[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(taxSavingsRecords)
    .where(eq(taxSavingsRecords.subscriptionId, subscriptionId))
    .orderBy(desc(taxSavingsRecords.year));
}

// ─── Seed Tax Management Clients ──────────────────────────────────────────────

export async function seedTaxClients(): Promise<void> {
  const db = await getDb();
  if (!db) { console.log("[seed-clients] DB not available — skipping"); return; }

  const clients = [
    {
      clientName: "Kano Baba",
      businessName: "Kano Ltd",
      email: "kanobaba@gmail.com",
      service: "Tax Pro Max Annual",
      department: "bizdoc",
      monthlyFee: "150000",
      billingDay: 1,
      startDate: "2026-01-01",
      status: "active" as const,
      createdBy: "system-seed",
    },
    {
      clientName: "Aljazira Data",
      businessName: "Aljazira Data",
      email: "aljaziradata@gmail.com",
      service: "Tax Pro Max Annual",
      department: "bizdoc",
      monthlyFee: "150000",
      billingDay: 1,
      startDate: "2026-01-01",
      status: "active" as const,
      createdBy: "system-seed",
    },
  ];

  for (const client of clients) {
    const existing = await db.select({ id: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.email, client.email))
      .limit(1);
    if (existing.length > 0) {
      console.log(`[seed-clients] ${client.businessName} already exists — skipping`);
      continue;
    }
    const result = await db.insert(subscriptions).values(client);
    const sub = await db.select().from(subscriptions).where(eq(subscriptions.id, result[0].insertId)).limit(1);
    // Create the annual payment record for 2026
    await db.insert(subscriptionPayments).values({
      subscriptionId: sub[0].id,
      month: "2026-01",
      amountDue: "150000",
      status: "paid",
      paidAt: new Date("2026-01-01"),
      recordedBy: "system-seed",
      notes: "Annual subscription fee — paid January 2026",
    });
    console.log(`[seed-clients] Created: ${client.businessName}`);
  }
}

// ─── Seed Media / Social Media Management Clients ────────────────────────────

export async function seedMediaClients(): Promise<void> {
  const db = await getDb();
  if (!db) { console.log("[seed-media] DB not available — skipping"); return; }

  type SubSeed = {
    clientName: string;
    businessName?: string;
    email?: string;
    phone?: string;
    service: string;
    department: string;
    monthlyFee: string;
    billingDay: number;
    startDate: string;
    status: "active" | "paused" | "cancelled";
    createdBy: string;
    notesForStaff?: string;
  };

  type PaymentSeed = {
    month: string;
    amountDue: string;
    status: "paid" | "pending" | "overdue";
    paidAt?: Date;
    recordedBy: string;
    notes: string;
  };

  const clients: (SubSeed & { payment?: PaymentSeed })[] = [
    // ── Internal dept clients (social media managed by HAMZURY Media) ──
    {
      clientName: "Hamzury Skills",
      businessName: "Hamzury Skills Academy",
      service: "Social Media Full Management — FB, IG, TikTok, LinkedIn, X",
      department: "media",
      monthlyFee: "400000",
      billingDay: 1,
      startDate: "2026-01-01",
      status: "active",
      createdBy: "system-seed",
      notesForStaff: "2 Reels/week · 8 Carousels · 5 Flyers · Story management · ₦1.2M for 3 months",
      payment: {
        month: "2026-01",
        amountDue: "1200000",
        status: "paid",
        paidAt: new Date("2026-01-01"),
        recordedBy: "system-seed",
        notes: "3-month package paid in full — ₦1.2M (Jan–Mar 2026)",
      },
    },
    {
      clientName: "Systemise",
      businessName: "Hamzury Systemise",
      service: "Social Media Full Management — FB, IG, TikTok, LinkedIn, X",
      department: "media",
      monthlyFee: "400000",
      billingDay: 1,
      startDate: "2026-01-01",
      status: "active",
      createdBy: "system-seed",
      notesForStaff: "Same package as Hamzury Skills — 2 Reels/week · 8 Carousels · 5 Flyers · Story management",
      payment: {
        month: "2026-01",
        amountDue: "1200000",
        status: "paid",
        paidAt: new Date("2026-01-01"),
        recordedBy: "system-seed",
        notes: "3-month package paid in full — ₦1.2M (Jan–Mar 2026)",
      },
    },
    {
      clientName: "RIDI",
      businessName: "RIDI Initiative",
      service: "Social Media Management — LinkedIn & Instagram",
      department: "media",
      monthlyFee: "0",
      billingDay: 1,
      startDate: "2026-01-01",
      status: "active",
      createdBy: "system-seed",
      notesForStaff: "LinkedIn and Instagram only — internal initiative, pricing TBD",
    },
    // ── External clients ──
    {
      clientName: "Muhammad Hamzury",
      businessName: "Muhammad Hamzury (Personal Brand)",
      email: "founder@hamzury.com",
      service: "Personal Brand — Instagram & TikTok Management",
      department: "media",
      monthlyFee: "0",
      billingDay: 1,
      startDate: "2026-01-01",
      status: "active",
      createdBy: "system-seed",
      notesForStaff: "Founder personal brand — Instagram and TikTok. Full plan and execution by Media team.",
    },
    // ── Tilz Spa — Full Branding + Social Media Project ──
    {
      clientName: "Tilda",
      businessName: "Tilz Spa by Tilda",
      service: "Full Business Architecture + Social Media — Build Package",
      department: "media",
      monthlyFee: "150000",
      billingDay: 18,
      startDate: "2026-03-18",
      status: "active",
      createdBy: "system-seed",
      notesForStaff: "Total project: ₦1.2M · Paid deposit: ₦500k · Balance: ₦700k at week 6 · 8-week build. Wuse 2, Abuja luxury spa. Proposal approved March 18 2026.",
      payment: {
        month: "2026-03",
        amountDue: "600000",
        status: "paid",
        paidAt: new Date("2026-03-18"),
        recordedBy: "system-seed",
        notes: "Deposit payment received — ₦500,000 (client paid ₦500k of ₦600k deposit. ₦100k outstanding on deposit, ₦700k at delivery week 6)",
      },
    },
    // ── Bakori — SCUML Certificate (one-time, BizDoc) ──
    {
      clientName: "Bakori Client",
      businessName: "Bakori",
      service: "SCUML Certificate Registration",
      department: "bizdoc",
      monthlyFee: "50000",
      billingDay: 1,
      startDate: "2026-03-01",
      status: "active",
      createdBy: "system-seed",
      notesForStaff: "One-time SCUML cert. Original fee ₦60k — ₦10k loyalty card discount applied = ₦50k. Client has loyalty card.",
      payment: {
        month: "2026-03",
        amountDue: "50000",
        status: "paid",
        paidAt: new Date("2026-03-01"),
        recordedBy: "system-seed",
        notes: "Paid ₦50,000 (₦60k - ₦10k loyalty discount)",
      },
    },
  ];

  for (const client of clients) {
    // Check by businessName + service combo to avoid duplicates
    const existing = await db.select({ id: subscriptions.id })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.businessName, client.businessName || client.clientName),
          eq(subscriptions.service, client.service)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      console.log(`[seed-media] ${client.businessName || client.clientName} already exists — skipping`);
      continue;
    }

    const { payment: paymentData, ...subData } = client;
    const result = await db.insert(subscriptions).values(subData);
    const sub = await db.select().from(subscriptions).where(eq(subscriptions.id, result[0].insertId)).limit(1);

    if (paymentData) {
      await db.insert(subscriptionPayments).values({
        subscriptionId: sub[0].id,
        ...paymentData,
      });
    }
    console.log(`[seed-media] Created: ${client.businessName || client.clientName}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE PRICING, INVOICING, NOTIFICATIONS, PROPOSALS & CERTIFICATES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Service Pricing ─────────────────────────────────────────────────────────

export async function createServicePricing(data: Omit<InsertServicePricing, "id" | "createdAt" | "updatedAt">): Promise<ServicePricing> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(servicePricing).values(data);
  const row = await db.select().from(servicePricing).where(eq(servicePricing.id, result[0].insertId)).limit(1);
  return row[0];
}

export async function getServicePricing(department?: string): Promise<ServicePricing[]> {
  const db = await getDb();
  if (!db) return [];
  if (department) {
    return db.select().from(servicePricing)
      .where(and(eq(servicePricing.department, department as any), eq(servicePricing.isActive, true)))
      .orderBy(servicePricing.category, servicePricing.serviceName);
  }
  return db.select().from(servicePricing)
    .where(eq(servicePricing.isActive, true))
    .orderBy(servicePricing.department, servicePricing.category, servicePricing.serviceName);
}

export async function getServicePricingById(id: number): Promise<ServicePricing | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(servicePricing).where(eq(servicePricing.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateServicePricing(id: number, data: Partial<Pick<ServicePricing, "serviceName" | "description" | "basePrice" | "maxPrice" | "unit" | "commissionPercent" | "isActive" | "category">>): Promise<ServicePricing | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(servicePricing).set(data).where(eq(servicePricing.id, id));
  const result = await db.select().from(servicePricing).where(eq(servicePricing.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function seedDefaultPricing(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if pricing already seeded
  const existing = await db.select().from(servicePricing).limit(1);
  if (existing.length > 0) return;

  const defaults: Omit<InsertServicePricing, "id" | "createdAt" | "updatedAt">[] = [
    // ── BizDoc ──
    { department: "bizdoc", category: "Registration", serviceName: "Business Registration (CAC)", basePrice: 50000, maxPrice: 150000, unit: "one_time", commissionPercent: 10 },
    { department: "bizdoc", category: "Registration", serviceName: "Business Name Registration", basePrice: 25000, maxPrice: null, unit: "one_time", commissionPercent: 10 },
    { department: "bizdoc", category: "Compliance", serviceName: "Tax Compliance (TIN/VAT/PAYE)", basePrice: 40000, maxPrice: 100000, unit: "one_time", commissionPercent: 10 },
    { department: "bizdoc", category: "Compliance", serviceName: "SCUML Registration", basePrice: 35000, maxPrice: null, unit: "one_time", commissionPercent: 10 },
    { department: "bizdoc", category: "License", serviceName: "Industry License (NAFDAC/SON/DPR)", basePrice: 100000, maxPrice: 500000, unit: "one_time", commissionPercent: 8 },
    { department: "bizdoc", category: "IP", serviceName: "Trademark Registration", basePrice: 80000, maxPrice: 200000, unit: "one_time", commissionPercent: 8 },
    { department: "bizdoc", category: "Legal", serviceName: "Contract Drafting", basePrice: 30000, maxPrice: 100000, unit: "one_time", commissionPercent: 10 },
    { department: "bizdoc", category: "Package", serviceName: "Full Business Setup (Local)", basePrice: 250000, maxPrice: 500000, unit: "one_time", commissionPercent: 8 },
    { department: "bizdoc", category: "Package", serviceName: "Full Business Setup (Foreign)", basePrice: 500000, maxPrice: 2000000, unit: "one_time", commissionPercent: 8 },
    { department: "bizdoc", category: "Recurring", serviceName: "Compliance Management", basePrice: 50000, maxPrice: null, unit: "monthly", commissionPercent: 15 },
    { department: "bizdoc", category: "Compliance", serviceName: "Annual Returns Filing", basePrice: 30000, maxPrice: null, unit: "one_time", commissionPercent: 10 },

    // ── Systemise ──
    { department: "systemise", category: "Branding", serviceName: "Brand Identity Package", basePrice: 150000, maxPrice: 400000, unit: "one_time", commissionPercent: 10 },
    { department: "systemise", category: "Web", serviceName: "Website Design & Development", basePrice: 200000, maxPrice: 1000000, unit: "one_time", commissionPercent: 10 },
    { department: "systemise", category: "Social", serviceName: "Social Media Management", basePrice: 80000, maxPrice: 200000, unit: "monthly", commissionPercent: 15 },
    { department: "systemise", category: "Automation", serviceName: "Business Process Automation", basePrice: 150000, maxPrice: 500000, unit: "one_time", commissionPercent: 10 },
    { department: "systemise", category: "Automation", serviceName: "CRM Setup & Configuration", basePrice: 100000, maxPrice: 300000, unit: "one_time", commissionPercent: 10 },
    { department: "systemise", category: "Media", serviceName: "Podcast Production", basePrice: 100000, maxPrice: 250000, unit: "monthly", commissionPercent: 12 },
    { department: "systemise", category: "Media", serviceName: "Faceless Channel Setup", basePrice: 150000, maxPrice: 350000, unit: "one_time", commissionPercent: 10 },
    { department: "systemise", category: "Strategy", serviceName: "Growth Strategy Consulting", basePrice: 200000, maxPrice: 500000, unit: "one_time", commissionPercent: 8 },
    { department: "systemise", category: "Package", serviceName: "Full Digital Setup Package", basePrice: 500000, maxPrice: 2000000, unit: "one_time", commissionPercent: 8 },

    // ── Skills ──
    { department: "skills", category: "Cohort", serviceName: "Business Essentials Cohort", basePrice: 35000, maxPrice: null, unit: "per_cohort", commissionPercent: 10 },
    { department: "skills", category: "Cohort", serviceName: "Digital Marketing Program", basePrice: 50000, maxPrice: null, unit: "per_cohort", commissionPercent: 10 },
    { department: "skills", category: "Cohort", serviceName: "IT Internship Program", basePrice: 25000, maxPrice: null, unit: "per_cohort", commissionPercent: 10 },
    { department: "skills", category: "Cohort", serviceName: "CEO Development Program", basePrice: 100000, maxPrice: null, unit: "per_cohort", commissionPercent: 8 },
    { department: "skills", category: "Cohort", serviceName: "AI-Powered Learning Track", basePrice: 45000, maxPrice: null, unit: "per_cohort", commissionPercent: 10 },
  ];

  await db.insert(servicePricing).values(defaults);
}

// ─── Invoices ────────────────────────────────────────────────────────────────

/**
 * Invoice number format per Finance Operations Guide:
 *   HMZ-INV-XXX (sequential-ish)
 * Uses a 6-char hex token so we don't have to lock-step with a counter —
 * still unique, still sequential-looking, still HMZ-branded.
 */
export function generateInvoiceNumber(): string {
  const token = randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
  return `HMZ-INV-${token}`;
}

export async function createInvoice(data: Omit<InsertInvoice, "id" | "createdAt" | "updatedAt">): Promise<Invoice> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const invoiceNumber = data.invoiceNumber || generateInvoiceNumber();
  const result = await db.insert(invoices).values({ ...data, invoiceNumber });
  const row = await db.select().from(invoices).where(eq(invoices.id, result[0].insertId)).limit(1);
  return row[0];
}

export async function getInvoices(status?: string): Promise<Invoice[]> {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return db.select().from(invoices)
      .where(eq(invoices.status, status as any))
      .orderBy(desc(invoices.createdAt));
  }
  return db.select().from(invoices).orderBy(desc(invoices.createdAt));
}

export async function getInvoiceById(id: number): Promise<Invoice | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invoices).where(eq(invoices.invoiceNumber, invoiceNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateInvoice(id: number, data: Partial<Pick<Invoice, "status" | "amountPaid" | "paidAt" | "notes" | "dueDate" | "discount" | "tax" | "total">>): Promise<Invoice | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(invoices).set(data).where(eq(invoices.id, id));
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getInvoicesByTaskId(taskId: number): Promise<Invoice[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.taskId, taskId)).orderBy(desc(invoices.createdAt));
}

// ─── Notifications ───────────────────────────────────────────────────────────

export async function createNotification(data: Omit<InsertNotification, "id" | "createdAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function getUnreadNotifications(userId: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return result.length;
}

export async function markNotificationRead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

export async function createAssignmentNotification(userId: string, title: string, message: string, link?: string): Promise<void> {
  await createNotification({ userId, type: "assignment", title, message, link });
}

// ─── Proposals ───────────────────────────────────────────────────────────────

export function generateProposalNumber(): string {
  const token = randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
  return `PROP-${token}`;
}

export async function createProposal(data: Omit<InsertProposal, "id" | "createdAt" | "updatedAt">): Promise<Proposal> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const proposalNumber = data.proposalNumber || generateProposalNumber();
  const result = await db.insert(proposals).values({ ...data, proposalNumber });
  const row = await db.select().from(proposals).where(eq(proposals.id, result[0].insertId)).limit(1);
  return row[0];
}

export async function getProposals(status?: string): Promise<Proposal[]> {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return db.select().from(proposals)
      .where(eq(proposals.status, status as any))
      .orderBy(desc(proposals.createdAt));
  }
  return db.select().from(proposals).orderBy(desc(proposals.createdAt));
}

export async function getProposalById(id: number): Promise<Proposal | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProposalByNumber(proposalNumber: string): Promise<Proposal | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(proposals).where(eq(proposals.proposalNumber, proposalNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateProposal(id: number, data: Partial<Pick<Proposal, "status" | "notes" | "totalAmount" | "validUntil" | "services" | "clientName" | "clientEmail" | "clientPhone" | "businessName">>): Promise<Proposal | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(proposals).set(data).where(eq(proposals.id, id));
  const result = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Certificates ────────────────────────────────────────────────────────────

export function generateCertificateNumber(): string {
  const token = randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
  return `CERT-${token}`;
}

export async function createCertificate(data: Omit<InsertCertificate, "id" | "createdAt">): Promise<Certificate> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const certificateNumber = data.certificateNumber || generateCertificateNumber();
  const result = await db.insert(certificates).values({ ...data, certificateNumber });
  const row = await db.select().from(certificates).where(eq(certificates.id, result[0].insertId)).limit(1);
  return row[0];
}

export async function getCertificates(cohortId?: number): Promise<Certificate[]> {
  const db = await getDb();
  if (!db) return [];
  if (cohortId) {
    return db.select().from(certificates)
      .where(eq(certificates.cohortId, cohortId))
      .orderBy(desc(certificates.createdAt));
  }
  return db.select().from(certificates).orderBy(desc(certificates.createdAt));
}

export async function getCertificateByNumber(certificateNumber: string): Promise<Certificate | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(certificates).where(eq(certificates.certificateNumber, certificateNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCertificatesByStudent(studentEmail: string): Promise<Certificate[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certificates)
    .where(eq(certificates.studentEmail, studentEmail))
    .orderBy(desc(certificates.createdAt));
}

// ─── Content Calendar ──────────────────────────────────────────────────────

export async function createContentPost(data: Omit<InsertContentPost, "id" | "createdAt">): Promise<ContentPost> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(contentPosts).values(data);
  const [row] = await db.select().from(contentPosts).where(eq(contentPosts.id, (result as any).insertId));
  return row;
}

export async function getContentPosts(
  department?: string,
  status?: string,
  limit = 50,
): Promise<ContentPost[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [];
  if (department && department !== "all") conditions.push(eq(contentPosts.department, department as any));
  if (status && status !== "all") conditions.push(eq(contentPosts.status, status as any));
  const q = db.select().from(contentPosts);
  const filtered = conditions.length > 0
    ? q.where(conditions.length === 1 ? conditions[0] : and(...conditions))
    : q;
  return filtered.orderBy(desc(contentPosts.scheduledFor)).limit(limit);
}

export async function updateContentPost(id: number, data: Partial<Omit<InsertContentPost, "id" | "createdAt">>): Promise<ContentPost | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(contentPosts).set(data as any).where(eq(contentPosts.id, id));
  const [row] = await db.select().from(contentPosts).where(eq(contentPosts.id, id));
  return row;
}

export async function getContentCalendar(startDate: Date, endDate: Date): Promise<ContentPost[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentPosts)
    .where(and(
      gte(contentPosts.scheduledFor, startDate),
      lte(contentPosts.scheduledFor, endDate),
    ))
    .orderBy(contentPosts.scheduledFor);
}

export async function seedContentPosts(): Promise<{ inserted: number; skipped: boolean }> {
  const db = await getDb();
  if (!db) return { inserted: 0, skipped: true };

  const existing = await db.select().from(contentPosts).limit(1);
  if (existing.length > 0) return { inserted: 0, skipped: true };

  const departments = ["general", "bizdoc", "systemise", "skills"] as const;
  const platforms = ["instagram", "tiktok", "twitter", "linkedin"] as const;
  const types = ["educational", "success_story", "service_spotlight", "behind_scenes", "quote", "carousel"] as const;
  const statuses = ["draft", "scheduled", "posted"] as const;

  const posts: Omit<InsertContentPost, "id" | "createdAt">[] = [
    { department: "bizdoc", platform: "instagram", contentType: "educational", caption: "5 documents you MUST have before approaching any investor in Nigeria. Number 3 surprises most founders.", hashtags: "#BusinessRegistration #NigerianBusiness #CAC #InvestorReady #HAMZURY", status: "scheduled", scheduledFor: new Date("2026-03-30T09:00:00"), createdBy: "ai_muse" },
    { department: "general", platform: "linkedin", contentType: "quote", caption: "\"Systems don't replace people. They free people to do what only people can do.\" — Muhammad Hamzury, Founder @HAMZURY", hashtags: "#Leadership #Systems #AfricanBusiness #Entrepreneurship", status: "scheduled", scheduledFor: new Date("2026-03-30T12:00:00"), createdBy: "ai_muse" },
    { department: "skills", platform: "tiktok", contentType: "behind_scenes", caption: "POV: You just finished your first week of the HAMZURY Skills Intensive and your content calendar is FULL. This is what structured learning looks like.", hashtags: "#FacelessContent #SkillsIntensive #LearnWithHAMZURY #ContentCreation", status: "scheduled", scheduledFor: new Date("2026-03-30T15:00:00"), createdBy: "hikma@hamzury.com" },
    { department: "bizdoc", platform: "twitter", contentType: "educational", caption: "CAC name search takes 24-48 hours. Budget ₦500 per search. Pro tip: have 3 backup names ready before you start. Thread below on the full CAC registration timeline.", hashtags: "#CACRegistration #Nigeria #StartupTips", status: "scheduled", scheduledFor: new Date("2026-03-31T08:30:00"), createdBy: "ai_muse" },
    { department: "systemise", platform: "instagram", contentType: "service_spotlight", caption: "Your business needs more than a website — it needs a SYSTEM. We build brands, websites, CRMs, and social funnels that work while you sleep. Link in bio.", hashtags: "#Systemise #DigitalBusiness #WebDevelopment #HAMZURY", status: "scheduled", scheduledFor: new Date("2026-03-31T11:00:00"), createdBy: "ai_muse" },
    { department: "general", platform: "linkedin", contentType: "success_story", caption: "From market stall to registered, tax-compliant business in 14 days. Meet Amina, our client from Kano who used BizDoc + Systemise to transform her garment business.", hashtags: "#ClientStory #NigerianEntrepreneur #WomenInBusiness #HAMZURY", status: "scheduled", scheduledFor: new Date("2026-03-31T14:00:00"), createdBy: "khadija@hamzury.com" },
    { department: "skills", platform: "linkedin", contentType: "educational", caption: "The RIDI programme is bridging the rural-urban skills gap. Applications for Q2 2026 are now open. No laptop? No problem — we provide equipment for physical pathway students.", hashtags: "#RIDI #RuralDevelopment #DigitalInclusion #HAMZURY #Nigeria", status: "scheduled", scheduledFor: new Date("2026-04-01T09:00:00"), createdBy: "ai_muse" },
    { department: "bizdoc", platform: "tiktok", contentType: "educational", caption: "If you're running a business in Nigeria without a TIN, you're leaving money on the table. Here's why every business needs a Tax Identification Number.", hashtags: "#TaxCompliance #FIRS #TIN #NigerianBusiness", status: "scheduled", scheduledFor: new Date("2026-04-01T12:00:00"), createdBy: "ai_muse" },
    { department: "general", platform: "instagram", contentType: "carousel", caption: "HAMZURY in numbers — Q1 2026 recap: 87 businesses registered, 42 systems deployed, 120+ students trained. Slide through for the full breakdown.", hashtags: "#Q1Recap #HAMZURY #Impact #AfricanBusiness", status: "draft", scheduledFor: new Date("2026-04-01T15:00:00"), createdBy: "lalo@hamzury.com" },
    { department: "systemise", platform: "twitter", contentType: "quote", caption: "Most Nigerian businesses fail not because of bad ideas, but because of bad systems. Fix the system, fix the business.", hashtags: "#BusinessSystems #Systemise #HAMZURY", status: "scheduled", scheduledFor: new Date("2026-04-02T08:00:00"), createdBy: "ai_muse" },
    { department: "bizdoc", platform: "instagram", contentType: "service_spotlight", caption: "Foreign Business Registration in Nigeria: CAMA 2020 compliance, CERPAC, Expatriate Quota, Business Permit — we handle the full stack. DM 'FOREIGN' to start.", hashtags: "#ForeignBusiness #NigeriaRegistration #CAMA2020 #HAMZURY", status: "scheduled", scheduledFor: new Date("2026-04-02T11:00:00"), createdBy: "ai_muse" },
    { department: "skills", platform: "tiktok", contentType: "success_story", caption: "She started the Faceless Content programme with zero followers. 10 days later, she had 2,400 and her first brand deal. Real student, real results.", hashtags: "#FacelessContent #StudentSuccess #HAMZURYSkills", status: "draft", scheduledFor: new Date("2026-04-02T14:00:00"), createdBy: "hikma@hamzury.com" },
    { department: "general", platform: "linkedin", contentType: "educational", caption: "3 reasons Nigerian SMEs should separate their business and personal bank accounts. Reason 1: CAC requires it for compliance. Thread.", hashtags: "#BusinessBanking #SME #Compliance #NigerianBusiness", status: "scheduled", scheduledFor: new Date("2026-04-03T09:00:00"), createdBy: "ai_muse" },
    { department: "systemise", platform: "instagram", contentType: "behind_scenes", caption: "Behind the scenes at HAMZURY HQ in Abuja — our CTO reviewing the latest client portal build. Every pixel, every API call, every user flow tested.", hashtags: "#TechTeam #BuildingInAfrica #BehindTheScenes #HAMZURY", status: "scheduled", scheduledFor: new Date("2026-04-03T12:00:00"), createdBy: "maryam@hamzury.com" },
    { department: "bizdoc", platform: "linkedin", contentType: "educational", caption: "SCUML registration is mandatory for all designated non-financial businesses in Nigeria. Here is who needs it and what happens if you skip it.", hashtags: "#SCUML #AML #NigerianCompliance #BizDoc", status: "scheduled", scheduledFor: new Date("2026-04-04T09:00:00"), createdBy: "ai_muse" },
    { department: "skills", platform: "instagram", contentType: "carousel", caption: "Meet the 6 facilitators powering HAMZURY Skills Q2 2026. Each one is a practitioner — not just a teacher. Swipe to meet the team.", hashtags: "#HAMZURYSkills #Facilitators #MeetTheTeam #Education", status: "draft", scheduledFor: new Date("2026-04-04T12:00:00"), createdBy: "lalo@hamzury.com" },
    { department: "general", platform: "tiktok", contentType: "behind_scenes", caption: "Day in the life of a HAMZURY CSO: 6 client calls, 3 proposals, 1 site visit, and a podcast recording. This is how we serve 80+ active clients.", hashtags: "#DayInTheLife #CSO #HAMZURYTeam #ClientService", status: "scheduled", scheduledFor: new Date("2026-04-04T15:00:00"), createdBy: "ai_muse" },
    { department: "bizdoc", platform: "twitter", contentType: "service_spotlight", caption: "Annual returns due? We file for all business types — BN, LTD, LLP. Same-week turnaround. No stress. WhatsApp the link in bio or visit hamzury.com/bizdoc", hashtags: "#AnnualReturns #CAC #BusinessCompliance #HAMZURY", status: "scheduled", scheduledFor: new Date("2026-04-05T08:30:00"), createdBy: "ai_muse" },
    { department: "systemise", platform: "linkedin", contentType: "success_story", caption: "Tilz Spar went from zero online presence to a fully integrated booking + payment system in 3 weeks. Systemise built the brand identity, website, and CRM. Results: 40% increase in bookings month 1.", hashtags: "#ClientSuccess #Systemise #DigitalTransformation #HAMZURY", status: "posted", scheduledFor: new Date("2026-03-25T09:00:00"), postedAt: new Date("2026-03-25T09:02:00"), createdBy: "khadija@hamzury.com", engagement: { likes: 47, comments: 8, shares: 12 } },
    { department: "general", platform: "instagram", contentType: "quote", caption: "\"If your business can't run without you for a week, you don't have a business — you have a job.\" Start systemising today.", hashtags: "#BusinessQuote #Entrepreneurship #HAMZURY #Systems", status: "posted", scheduledFor: new Date("2026-03-26T10:00:00"), postedAt: new Date("2026-03-26T10:01:00"), createdBy: "ai_muse", engagement: { likes: 134, comments: 21, shares: 38 } },
  ];

  for (const post of posts) {
    await db.insert(contentPosts).values(post);
  }

  return { inserted: posts.length, skipped: false };
}

// ─── QA Checklist Seed ─────────────────────────────────────────────────────

export async function seedQAChecklists(): Promise<{ inserted: number; skipped: boolean }> {
  const db = await getDb();
  if (!db) return { inserted: 0, skipped: true };

  // Check if QA templates already exist to avoid duplicates
  const existing = await db.select().from(checklistTemplates).where(eq(checklistTemplates.phase, "post"));
  if (existing.length > 0) return { inserted: 0, skipped: true };

  const templates: { department: string; phase: "post"; label: string; sortOrder: number }[] = [
    // BizDoc QA
    { department: "bizdoc", phase: "post", label: "All documents reviewed for accuracy", sortOrder: 1 },
    { department: "bizdoc", phase: "post", label: "Client name and details verified", sortOrder: 2 },
    { department: "bizdoc", phase: "post", label: "Filing numbers confirmed with regulatory body", sortOrder: 3 },
    { department: "bizdoc", phase: "post", label: "Scanned copies saved to client file", sortOrder: 4 },
    { department: "bizdoc", phase: "post", label: "Original documents packaged for delivery", sortOrder: 5 },
    { department: "bizdoc", phase: "post", label: "Invoice generated and sent", sortOrder: 6 },
    { department: "bizdoc", phase: "post", label: "Client notified of completion", sortOrder: 7 },
    // Systemise QA
    { department: "systemise", phase: "post", label: "All deliverables match project scope", sortOrder: 1 },
    { department: "systemise", phase: "post", label: "Website tested on mobile and desktop", sortOrder: 2 },
    { department: "systemise", phase: "post", label: "Social media accounts configured and verified", sortOrder: 3 },
    { department: "systemise", phase: "post", label: "Client credentials securely stored", sortOrder: 4 },
    { department: "systemise", phase: "post", label: "Training session completed with client", sortOrder: 5 },
    { department: "systemise", phase: "post", label: "Handover document prepared", sortOrder: 6 },
    { department: "systemise", phase: "post", label: "Invoice generated and sent", sortOrder: 7 },
    // Skills QA
    { department: "skills", phase: "post", label: "Student completed all required modules", sortOrder: 1 },
    { department: "skills", phase: "post", label: "Assignments graded and feedback given", sortOrder: 2 },
    { department: "skills", phase: "post", label: "Attendance meets minimum threshold", sortOrder: 3 },
    { department: "skills", phase: "post", label: "Certificate details verified", sortOrder: 4 },
    { department: "skills", phase: "post", label: "Student added to alumni records", sortOrder: 5 },
  ];

  for (const t of templates) {
    await db.insert(checklistTemplates).values(t);
  }

  return { inserted: templates.length, skipped: false };
}

// ─── Leave Requests ────────────────────────────────────────────────────────────

export async function createLeaveRequest(data: Omit<InsertLeaveRequest, "id" | "createdAt">): Promise<void> {
  const db = await getDb(); if (!db) return;
  await db.insert(leaveRequests).values(data);
}

export async function getLeaveRequests(staffEmail?: string): Promise<LeaveRequest[]> {
  const db = await getDb(); if (!db) return [];
  if (staffEmail) return db.select().from(leaveRequests).where(eq(leaveRequests.staffEmail, staffEmail)).orderBy(desc(leaveRequests.createdAt));
  return db.select().from(leaveRequests).orderBy(desc(leaveRequests.createdAt));
}

export async function updateLeaveRequestStatus(id: number, status: "approved" | "rejected", reviewedBy: string, reviewNotes?: string): Promise<void> {
  const db = await getDb(); if (!db) return;
  await db.update(leaveRequests).set({ status, reviewedBy, reviewNotes: reviewNotes ?? null, reviewedAt: new Date() }).where(eq(leaveRequests.id, id));
}

// ─── Discipline Records ─────────────────────────────────────────────────────────

export async function createDisciplineRecord(data: Omit<InsertDisciplineRecord, "id" | "createdAt">): Promise<void> {
  const db = await getDb(); if (!db) return;
  await db.insert(disciplineRecords).values(data);
}

export async function getDisciplineRecords(staffEmail?: string): Promise<DisciplineRecord[]> {
  const db = await getDb(); if (!db) return [];
  if (staffEmail) return db.select().from(disciplineRecords).where(eq(disciplineRecords.staffEmail, staffEmail)).orderBy(desc(disciplineRecords.createdAt));
  return db.select().from(disciplineRecords).orderBy(desc(disciplineRecords.createdAt));
}

export async function resolveDisciplineRecord(id: number, resolvedNotes: string): Promise<void> {
  const db = await getDb(); if (!db) return;
  await db.update(disciplineRecords).set({ status: "resolved", resolvedNotes, resolvedAt: new Date() }).where(eq(disciplineRecords.id, id));
}

// ─── Portal Visit Logs ─────────────────────────────────────────────────────────

export async function createPortalVisitLog(data: Omit<InsertPortalVisitLog, "id" | "createdAt">): Promise<void> {
  const db = await getDb(); if (!db) return;
  await db.insert(portalVisitLogs).values(data);
}

export async function getPortalVisitLogs(subscriptionId?: number): Promise<PortalVisitLog[]> {
  const db = await getDb(); if (!db) return [];
  if (subscriptionId) return db.select().from(portalVisitLogs).where(eq(portalVisitLogs.subscriptionId, subscriptionId)).orderBy(desc(portalVisitLogs.createdAt));
  return db.select().from(portalVisitLogs).orderBy(desc(portalVisitLogs.createdAt));
}

// ─── Content Engagement Logs ────────────────────────────────────────────────────

export async function upsertContentEngagement(weekOf: string, staffEmail: string, staffName: string, engaged: boolean, platforms?: string, notes?: string, recordedBy?: string): Promise<void> {
  const db = await getDb(); if (!db) return;
  const existing = await db.select().from(contentEngagementLogs).where(and(eq(contentEngagementLogs.weekOf, weekOf), eq(contentEngagementLogs.staffEmail, staffEmail)));
  if (existing.length > 0) {
    await db.update(contentEngagementLogs).set({ engaged, platforms: platforms ?? null, notes: notes ?? null, recordedBy: recordedBy ?? null }).where(and(eq(contentEngagementLogs.weekOf, weekOf), eq(contentEngagementLogs.staffEmail, staffEmail)));
  } else {
    await db.insert(contentEngagementLogs).values({ weekOf, staffEmail, staffName, engaged, platforms: platforms ?? null, notes: notes ?? null, recordedBy: recordedBy ?? null });
  }
}

export async function getContentEngagementForWeek(weekOf: string): Promise<ContentEngagementLog[]> {
  const db = await getDb(); if (!db) return [];
  return db.select().from(contentEngagementLogs).where(eq(contentEngagementLogs.weekOf, weekOf));
}

// ─── Hub Meeting Records ────────────────────────────────────────────────────────

export async function upsertHubMeetingRecord(weekOf: string, data: Partial<Omit<InsertHubMeetingRecord, "id" | "createdAt" | "updatedAt">>): Promise<void> {
  const db = await getDb(); if (!db) return;
  const existing = await db.select().from(hubMeetingRecords).where(eq(hubMeetingRecords.weekOf, weekOf));
  if (existing.length > 0) {
    await db.update(hubMeetingRecords).set(data).where(eq(hubMeetingRecords.weekOf, weekOf));
  } else {
    await db.insert(hubMeetingRecords).values({ ...data, weekOf });
  }
}

export async function getHubMeetingRecord(weekOf: string): Promise<HubMeetingRecord | null> {
  const db = await getDb(); if (!db) return null;
  const rows = await db.select().from(hubMeetingRecords).where(eq(hubMeetingRecords.weekOf, weekOf));
  return rows[0] ?? null;
}

export async function getHubMeetingHistory(limit = 10): Promise<HubMeetingRecord[]> {
  const db = await getDb(); if (!db) return [];
  return db.select().from(hubMeetingRecords).orderBy(desc(hubMeetingRecords.weekOf)).limit(limit);
}

// ─── Student Milestones ─────────────────────────────────────────────────────────

export async function createStudentMilestone(data: Omit<InsertStudentMilestone, "id" | "createdAt">): Promise<void> {
  const db = await getDb(); if (!db) return;
  await db.insert(studentMilestones).values(data);
}

export async function getStudentMilestones(studentType?: "physical" | "online" | "nitda"): Promise<StudentMilestone[]> {
  const db = await getDb(); if (!db) return [];
  if (studentType) return db.select().from(studentMilestones).where(eq(studentMilestones.studentType, studentType)).orderBy(desc(studentMilestones.milestoneDate));
  return db.select().from(studentMilestones).orderBy(desc(studentMilestones.milestoneDate));
}

export async function markMilestoneCelebrated(id: number): Promise<void> {
  const db = await getDb(); if (!db) return;
  await db.update(studentMilestones).set({ celebrated: true }).where(eq(studentMilestones.id, id));
}

// ─── Revenue Allocation ──────────────────────────────────────────────────────

export async function createAllocation(data: Omit<InsertAllocation, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(allocations).values(data);
  const result = await db.select().from(allocations).where(eq(allocations.transactionRef, data.transactionRef)).limit(1);
  return result[0];
}

export async function getAllocations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(allocations).orderBy(desc(allocations.createdAt));
}

export async function getAllocationsByQuarter(quarter: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(allocations).where(eq(allocations.quarter, quarter)).orderBy(desc(allocations.createdAt));
}

// ─── AI Fund ─────────────────────────────────────────────────────────────────

export async function createAIFundEntry(data: { allocationId?: number; amount: string; source: string; description?: string; balance?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(aiFundLog).values(data);
}

export async function getAIFundBalance(): Promise<string> {
  const db = await getDb();
  if (!db) return "0";
  const entries = await db.select().from(aiFundLog).orderBy(desc(aiFundLog.createdAt)).limit(1);
  return entries[0]?.balance ?? "0";
}

export async function getAIFundLog() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(aiFundLog).orderBy(desc(aiFundLog.createdAt));
}

// ─── Affiliate League Table ──────────────────────────────────────────────────

export async function getLeagueTable(quarter: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(affiliateLeagueTable).where(eq(affiliateLeagueTable.quarter, quarter)).orderBy(affiliateLeagueTable.position);
}

// ─── Skills Calendar ─────────────────────────────────────────────────────────

export async function getSkillsCalendar() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(skillsCalendar).orderBy(skillsCalendar.quarter);
}

export async function createSkillsCalendarEntry(data: Omit<InsertSkillsCalendar, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(skillsCalendar).values(data);
}

// ─── Skills Competition Teams ───────────────────────────────────────────────

export async function getSkillsTeams(quarter: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(skillsTeams).where(eq(skillsTeams.quarter, quarter)).orderBy(desc(skillsTeams.points));
}

export async function createSkillsTeam(data: Omit<InsertSkillsTeam, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(skillsTeams).values(data);
}

export async function updateSkillsTeamPoints(id: number, points: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(skillsTeams).set({ points }).where(eq(skillsTeams.id, id));
}

// ─── Skills Interactive Sessions ────────────────────────────────────────────

export async function getInteractiveSessions(quarter: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(skillsInteractiveSessions).where(eq(skillsInteractiveSessions.quarter, quarter)).orderBy(skillsInteractiveSessions.weekNumber);
}

export async function createInteractiveSession(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(skillsInteractiveSessions).values(data);
}

// ─── Skills Awards ──────────────────────────────────────────────────────────

export async function getSkillsAwards(quarter: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(skillsAwards).where(eq(skillsAwards.quarter, quarter));
}

export async function createSkillsAward(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(skillsAwards).values(data);
}

// ─── Client AI Chat ──────────────────────────────────────────────────────────

export async function createClientChat(data: Omit<InsertClientChat, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(clientChats).values(data);
  const result = await db.select().from(clientChats).where(eq(clientChats.clientRef, data.clientRef)).orderBy(desc(clientChats.createdAt)).limit(1);
  return result[0];
}

export async function getClientChatsByTask(taskId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientChats).where(eq(clientChats.taskId, taskId)).orderBy(desc(clientChats.createdAt));
}

export async function getClientChatByRef(clientRef: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clientChats).where(eq(clientChats.clientRef, clientRef)).orderBy(desc(clientChats.createdAt)).limit(1);
  return result[0] ?? null;
}

export async function getClientChatById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clientChats).where(eq(clientChats.id, id)).limit(1);
  return result[0] ?? null;
}

export async function updateClientChat(id: number, data: Partial<{ chatHistory: any; status: "active" | "paused" | "closed"; systemPrompt: string }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clientChats).set(data).where(eq(clientChats.id, id));
  const result = await db.select().from(clientChats).where(eq(clientChats.id, id)).limit(1);
  return result[0];
}

// ─── Partnerships (BizDev) ──────────────────────────────────────────────────

export async function listPartnerships(): Promise<Partnership[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(partnerships).orderBy(desc(partnerships.createdAt));
}

export async function createPartnership(data: Omit<Partnership, "id" | "createdAt" | "updatedAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(partnerships).values(data);
}

export async function updatePartnership(id: number, data: Partial<Pick<Partnership, "name" | "type" | "contact" | "stage" | "referrals" | "notes">>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(partnerships).set(data).where(eq(partnerships.id, id));
}

// ─── Brand QA (BizDev) ─────────────────────────────────────────────────────

export async function listBrandQaItems(): Promise<BrandQaItem[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(brandQaItems).orderBy(desc(brandQaItems.createdAt));
}

export async function createBrandQaItem(data: Omit<BrandQaItem, "id" | "createdAt" | "updatedAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(brandQaItems).values(data);
}

export async function updateBrandQaItem(id: number, data: Partial<Pick<BrandQaItem, "status" | "reviewedBy" | "notes">>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(brandQaItems).set(data).where(eq(brandQaItems.id, id));
}

// ─── Job Postings (HR) ─────────────────────────────────────────────────────

export async function listJobPostings(): Promise<JobPosting[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobPostings).orderBy(desc(jobPostings.createdAt));
}

export async function createJobPosting(data: Omit<JobPosting, "id" | "createdAt" | "updatedAt" | "postedAt" | "closedAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(jobPostings).values(data);
}

export async function updateJobPosting(id: number, data: Partial<Pick<JobPosting, "title" | "department" | "status" | "description" | "requirements" | "closedAt">>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(jobPostings).set(data).where(eq(jobPostings.id, id));
}

// ─── Hiring Applications (HR) ──────────────────────────────────────────────

export async function listHiringApplications(): Promise<HiringApplication[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(hiringApplications).orderBy(desc(hiringApplications.createdAt));
}

export async function createHiringApplication(data: Omit<HiringApplication, "id" | "createdAt" | "updatedAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(hiringApplications).values(data);
}

export async function updateHiringApplication(id: number, data: Partial<Pick<HiringApplication, "status" | "score" | "interviewDate" | "notes">>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(hiringApplications).set(data).where(eq(hiringApplications.id, id));
}

// ─── Training Sessions (HR) ────────────────────────────────────────────────

export async function listTrainingSessions(): Promise<TrainingSession[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trainingSessions).orderBy(desc(trainingSessions.createdAt));
}

export async function createTrainingSession(data: Omit<TrainingSession, "id" | "createdAt" | "updatedAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(trainingSessions).values(data);
}

export async function updateTrainingSession(id: number, data: Partial<Pick<TrainingSession, "title" | "type" | "sessionDate" | "participants" | "status" | "notes">>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(trainingSessions).set(data).where(eq(trainingSessions.id, id));
}

// ─── Development Plans (HR) ────────────────────────────────────────────────

export async function listDevelopmentPlans(): Promise<DevelopmentPlan[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(developmentPlans).orderBy(desc(developmentPlans.createdAt));
}

export async function createDevelopmentPlan(data: Omit<DevelopmentPlan, "id" | "createdAt" | "updatedAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(developmentPlans).values(data);
}

export async function updateDevelopmentPlan(id: number, data: Partial<Pick<DevelopmentPlan, "goal" | "targetDate" | "progress" | "support" | "notes">>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(developmentPlans).set(data).where(eq(developmentPlans.id, id));
}

// ─── Performance Cycles (HR) ───────────────────────────────────────────────

export async function listPerformanceCycles(): Promise<PerformanceCycle[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(performanceCycles).orderBy(desc(performanceCycles.createdAt));
}

export async function createPerformanceCycle(data: Omit<PerformanceCycle, "id" | "createdAt" | "updatedAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(performanceCycles).values(data);
}

export async function updatePerformanceCycle(id: number, data: Partial<Pick<PerformanceCycle, "cycleName" | "period" | "status" | "totalReviews" | "completedReviews">>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(performanceCycles).set(data).where(eq(performanceCycles.id, id));
}

// ─── RIDI Communities ──────────────────────────────────────────────────────

export async function listRidiCommunities(): Promise<RidiCommunity[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ridiCommunities).orderBy(desc(ridiCommunities.createdAt));
}

export async function createRidiCommunity(data: Omit<RidiCommunity, "id" | "createdAt" | "updatedAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(ridiCommunities).values(data);
}

export async function updateRidiCommunity(id: number, data: Partial<Pick<RidiCommunity, "name" | "state" | "coordinator" | "members" | "status">>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(ridiCommunities).set(data).where(eq(ridiCommunities.id, id));
}

// ─── Podcast Episodes (Media) ──────────────────────────────────────────────

export async function listPodcastEpisodes(): Promise<PodcastEpisode[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(podcastEpisodes).orderBy(desc(podcastEpisodes.createdAt));
}

export async function createPodcastEpisode(data: Omit<PodcastEpisode, "id" | "createdAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(podcastEpisodes).values(data);
}

export async function updatePodcastEpisode(id: number, data: Partial<Pick<PodcastEpisode, "title" | "guest" | "recordingDate" | "duration" | "status" | "plays" | "audioUrl">>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(podcastEpisodes).set(data).where(eq(podcastEpisodes.id, id));
}

// ─── Media Assets ──────────────────────────────────────────────────────────

export async function listMediaAssets(): Promise<MediaAsset[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt));
}

export async function createMediaAsset(data: Omit<MediaAsset, "id" | "createdAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(mediaAssets).values(data);
}

export async function deleteMediaAsset(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
}

// ─── Social Platform Stats (Media) ─────────────────────────────────────────

export async function listSocialPlatformStats(): Promise<SocialPlatformStat[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(socialPlatformStats).orderBy(socialPlatformStats.platform);
}

export async function upsertSocialPlatformStat(data: Omit<SocialPlatformStat, "id" | "createdAt" | "updatedAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(socialPlatformStats).where(eq(socialPlatformStats.platform, data.platform)).limit(1);
  if (existing[0]) {
    await db.update(socialPlatformStats).set(data).where(eq(socialPlatformStats.id, existing[0].id));
  } else {
    await db.insert(socialPlatformStats).values(data);
  }
}

export async function createSocialPlatformStat(data: Omit<SocialPlatformStat, "id" | "createdAt" | "updatedAt">): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(socialPlatformStats).values(data);
}

// ─── Weekly Targets (CEO → Departments → HR tracks) ─────────────────────────

export async function createWeeklyTarget(data: Omit<InsertWeeklyTarget, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) return { id: 0 };
  const result = await db.insert(weeklyTargets).values(data);
  return { id: result[0].insertId };
}

export async function getWeeklyTargets(weekOf?: string): Promise<WeeklyTarget[]> {
  const db = await getDb();
  if (!db) return [];
  if (weekOf) {
    return db.select().from(weeklyTargets).where(eq(weeklyTargets.weekOf, weekOf)).orderBy(desc(weeklyTargets.createdAt));
  }
  return db.select().from(weeklyTargets).orderBy(desc(weeklyTargets.createdAt)).limit(50);
}

export async function getWeeklyTargetsByDepartment(department: string, weekOf?: string): Promise<WeeklyTarget[]> {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(weeklyTargets.department, department)];
  if (weekOf) conditions.push(eq(weeklyTargets.weekOf, weekOf));
  return db.select().from(weeklyTargets).where(and(...conditions)).orderBy(desc(weeklyTargets.createdAt));
}

export async function updateWeeklyTarget(id: number, data: Partial<InsertWeeklyTarget>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(weeklyTargets).set(data).where(eq(weeklyTargets.id, id));
  return db.select().from(weeklyTargets).where(eq(weeklyTargets.id, id)).then(r => r[0]);
}

export async function getTargetSubmissionStatus(weekOf: string) {
  const db = await getDb();
  if (!db) return [];
  const targets = await db.select().from(weeklyTargets).where(eq(weeklyTargets.weekOf, weekOf));
  const depts = ["bizdoc", "systemise", "skills", "media", "bizdev"];
  return depts.map(d => ({
    department: d,
    total: targets.filter(t => t.department === d).length,
    submitted: targets.filter(t => t.department === d && (t.status === "submitted" || t.status === "approved")).length,
    approved: targets.filter(t => t.department === d && t.status === "approved").length,
    pending: targets.filter(t => t.department === d && (t.status === "issued" || t.status === "in_progress")).length,
  }));
}

// ── Inter-Department Chat ──

export async function createDeptMessage(data: Omit<InsertDeptMessage, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) return { id: 0 };
  const result = await db.insert(deptMessages).values(data);
  return { id: result[0].insertId };
}

export async function getDeptMessages(filters: { threadId?: string; toDepartment?: string; toStaffId?: string; limit?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters.threadId) conditions.push(eq(deptMessages.threadId, filters.threadId));
  if (filters.toDepartment) conditions.push(eq(deptMessages.toDepartment, filters.toDepartment));
  if (filters.toStaffId) conditions.push(eq(deptMessages.toStaffId, filters.toStaffId));

  const query = conditions.length > 0
    ? db.select().from(deptMessages).where(or(...conditions)).orderBy(desc(deptMessages.createdAt)).limit(filters.limit || 50)
    : db.select().from(deptMessages).orderBy(desc(deptMessages.createdAt)).limit(filters.limit || 50);
  return query;
}

export async function getDeptThreads(department: string) {
  const db = await getDb();
  if (!db) return [];
  // Get latest message per thread for a department
  const messages = await db.select().from(deptMessages)
    .where(or(
      eq(deptMessages.toDepartment, department),
      eq(deptMessages.fromDepartment, department)
    ))
    .orderBy(desc(deptMessages.createdAt))
    .limit(100);

  // Group by threadId, return latest per thread
  const threadMap = new Map<string, typeof messages[0]>();
  for (const msg of messages) {
    if (!threadMap.has(msg.threadId)) threadMap.set(msg.threadId, msg);
  }
  return Array.from(threadMap.values());
}

export async function getUnreadDeptMessageCount(department: string, staffId?: string) {
  const db = await getDb();
  if (!db) return 0;
  const conditions = [eq(deptMessages.isRead, false)];
  if (staffId) {
    conditions.push(or(
      eq(deptMessages.toDepartment, department),
      eq(deptMessages.toStaffId, staffId)
    )!);
  } else {
    conditions.push(eq(deptMessages.toDepartment, department));
  }
  const result = await db.select({ count: count() }).from(deptMessages).where(and(...conditions));
  return result[0]?.count || 0;
}

export async function markDeptMessagesRead(threadId: string, readerStaffId: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(deptMessages)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
      eq(deptMessages.threadId, threadId),
      not(eq(deptMessages.fromStaffId, readerStaffId)),
      eq(deptMessages.isRead, false)
    ));
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI AGENT STATE & SUGGESTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** Load persisted agent state from DB. Returns null if not yet stored. */
export async function loadAgentState(agentId: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(agentState).where(eq(agentState.agentId, agentId)).limit(1);
  return rows[0] || null;
}

/** Upsert agent state after each run or toggle. */
export async function saveAgentState(agentId: string, patch: {
  enabled?: boolean;
  lastRun?: Date | null;
  taskCount?: number;
  successRate?: number;
  status?: string;
  lastError?: string | null;
}) {
  const db = await getDb();
  if (!db) return;
  const existing = await loadAgentState(agentId);
  if (existing) {
    await db.update(agentState).set(patch).where(eq(agentState.agentId, agentId));
  } else {
    await db.insert(agentState).values({ agentId, ...patch } as any);
  }
}

/** Create an agent suggestion. */
export async function createAgentSuggestion(data: {
  agentId: string;
  targetDepartment: string;
  targetEntityType: string;
  targetEntityId: number;
  suggestionType: string;
  title: string;
  content: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(agentSuggestions).values(data);
  return { id: result[0].insertId, ...data, status: "pending" as const };
}

/** Get pending suggestions for a department. */
export async function getAgentSuggestions(department: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(agentSuggestions)
    .where(and(
      eq(agentSuggestions.targetDepartment, department),
      eq(agentSuggestions.status, "pending")
    ))
    .orderBy(agentSuggestions.createdAt);
}

/** Get a single suggestion by ID. */
export async function getAgentSuggestionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(agentSuggestions).where(eq(agentSuggestions.id, id)).limit(1);
  return rows[0] || null;
}

/** Review (accept/reject) a suggestion. */
export async function reviewAgentSuggestion(id: number, action: "accepted" | "rejected", reviewedBy: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(agentSuggestions).set({
    status: action,
    reviewedBy,
    reviewedAt: new Date(),
  }).where(eq(agentSuggestions.id, id));
}

/** Expire old pending suggestions (older than 7 days). */
export async function expireOldSuggestions() {
  const db = await getDb();
  if (!db) return;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  await db.update(agentSuggestions).set({ status: "expired" })
    .where(and(
      eq(agentSuggestions.status, "pending"),
      sql`${agentSuggestions.createdAt} < ${sevenDaysAgo}`
    ));
}

// ═══════════════════════════════════════════════════════════════════════════════
// VERIFIED CLIENT TRUTH LAYER
// ═══════════════════════════════════════════════════════════════════════════════

/** Create a new verified client record */
export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clients).values(data);
  return { id: result[0].insertId };
}

/** Get a client by their HAMZURY reference number */
export async function getClientByRef(ref: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(clients).where(eq(clients.ref, ref)).limit(1);
  return rows[0] || null;
}

/** Get a client by phone number */
export async function getClientByPhone(phone: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(clients).where(eq(clients.phone, phone)).limit(1);
  return rows[0] || null;
}

/** Get all clients, ordered by most recently updated */
export async function getAllClients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).orderBy(desc(clients.updatedAt));
}

/** Get clients filtered by status */
export async function getClientsByStatus(status: "active" | "converted" | "unverified" | "dormant") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.status, status)).orderBy(desc(clients.updatedAt));
}

/** Get clients filtered by department */
export async function getClientsByDepartment(department: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.department, department)).orderBy(desc(clients.updatedAt));
}

/** Update a client record */
export async function updateClient(id: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clients).set(data).where(eq(clients.id, id));
}

/** Verify client identity: ref + phone must both match. Returns client or null. */
export async function verifyClientIdentity(ref: string, phone: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(clients)
    .where(and(eq(clients.ref, ref), eq(clients.phone, phone)))
    .limit(1);
  return rows[0] || null;
}

/** Create a server-side client session after identity verification */
export async function createClientSession(clientId: number, phone: string): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const token = randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await db.insert(clientSessions).values({ clientId, token, phone, expiresAt });
  return token;
}

/** Validate a client session token. Returns the client record or null if expired/invalid. */
export async function validateClientSession(token: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(clientSessions)
    .where(and(eq(clientSessions.token, token), sql`${clientSessions.expiresAt} > NOW()`))
    .limit(1);
  if (!rows[0]) return null;
  // Fetch the client
  const clientRows = await db.select().from(clients).where(eq(clients.id, rows[0].clientId)).limit(1);
  return clientRows[0] || null;
}

/** Clean up expired client sessions */
export async function cleanExpiredClientSessions() {
  const db = await getDb();
  if (!db) return;
  await db.delete(clientSessions).where(sql`${clientSessions.expiresAt} < NOW()`);
}

/** Get all tasks linked to a client (by ref or phone) */
export async function getTasksForClient(ref: string, phone: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks)
    .where(or(eq(tasks.ref, ref), eq(tasks.phone, phone)))
    .orderBy(desc(tasks.updatedAt));
}

/** Get subscriptions for a client by name and phone */
export async function getSubscriptionsForClient(clientName: string, phone: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptions)
    .where(or(
      eq(subscriptions.clientName, clientName),
      eq(subscriptions.phone, phone),
    ))
    .orderBy(desc(subscriptions.updatedAt));
}

/** Get invoices for a client by phone */
export async function getInvoicesForClient(phone: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices)
    .where(eq(invoices.clientPhone, phone))
    .orderBy(desc(invoices.createdAt));
}

// ═══════════════════════════════════════════════════════════════════════════════
// CSO PHASE 2 — Targets / Calendar / Client Notes helpers
// ═══════════════════════════════════════════════════════════════════════════════

export async function createTargetV2(data: Omit<InsertTargetV2, "id" | "createdAt" | "updatedAt">): Promise<TargetV2 | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(targets).values(data);
  const row = await db.select().from(targets).where(eq(targets.id, result[0].insertId)).limit(1);
  return row[0] || null;
}

export async function getTargetsForAssignee(assignedTo: string): Promise<TargetV2[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(targets)
    .where(eq(targets.assignedTo, assignedTo))
    .orderBy(desc(targets.createdAt));
}

export async function getAllTargets(): Promise<TargetV2[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(targets).orderBy(desc(targets.createdAt));
}

export async function updateTargetV2(id: number, data: Partial<InsertTargetV2>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(targets).set(data).where(eq(targets.id, id));
}

/** Compute actual progress for a target based on its metric + period window. */
export async function computeTargetActual(t: TargetV2): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const start = t.periodStart;
  const end = t.periodEnd;
  try {
    if (t.metric === "leads_qualified") {
      // Count leads moved out of "new" within the window (contacted | converted)
      const rows = await db.select().from(leads)
        .where(and(
          ne(leads.status, "new"),
          gte(leads.updatedAt, new Date(start)),
          lte(leads.updatedAt, new Date(end + "T23:59:59")),
        ));
      return rows.length;
    }
    if (t.metric === "proposals_sent") {
      const rows = await db.select().from(proposals)
        .where(and(
          ne(proposals.status, "draft"),
          gte(proposals.createdAt, new Date(start)),
          lte(proposals.createdAt, new Date(end + "T23:59:59")),
        ));
      return rows.length;
    }
    if (t.metric === "clients_onboarded") {
      const rows = await db.select().from(clients)
        .where(and(
          eq(clients.status, "active"),
          gte(clients.updatedAt, new Date(start)),
          lte(clients.updatedAt, new Date(end + "T23:59:59")),
        ));
      return rows.length;
    }
    if (t.metric === "revenue_closed") {
      const rows = await db.select().from(invoices)
        .where(and(
          eq(invoices.status, "paid"),
          gte(invoices.updatedAt, new Date(start)),
          lte(invoices.updatedAt, new Date(end + "T23:59:59")),
        ));
      return rows.reduce((sum, r) => sum + (r.amountPaid ?? r.total ?? 0), 0);
    }
    return 0;
  } catch {
    return 0;
  }
}

// ─── Calendar Events ────────────────────────────────────────────────────────
export async function createCalendarEvent(data: Omit<InsertCalendarEvent, "id" | "createdAt" | "updatedAt">): Promise<CalendarEvent | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(calendarEvents).values(data);
  const row = await db.select().from(calendarEvents).where(eq(calendarEvents.id, result[0].insertId)).limit(1);
  return row[0] || null;
}

export async function listCalendarEvents(opts: { from: string; to: string; ownerId?: string; clientId?: number }): Promise<CalendarEvent[]> {
  const db = await getDb();
  if (!db) return [];
  const conds = [
    gte(calendarEvents.startAt, new Date(opts.from)),
    lte(calendarEvents.startAt, new Date(opts.to)),
  ];
  if (opts.ownerId) conds.push(eq(calendarEvents.ownerId, opts.ownerId));
  if (opts.clientId) conds.push(eq(calendarEvents.clientId, opts.clientId));
  return db.select().from(calendarEvents).where(and(...conds)).orderBy(calendarEvents.startAt);
}

export async function updateCalendarEvent(id: number, data: Partial<InsertCalendarEvent>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(calendarEvents).set(data).where(eq(calendarEvents.id, id));
}

export async function deleteCalendarEvent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
}

// ─── Client Notes ───────────────────────────────────────────────────────────
export async function createClientNote(data: Omit<InsertClientNote, "id" | "createdAt">): Promise<ClientNote | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(clientNotes).values(data);
  const row = await db.select().from(clientNotes).where(eq(clientNotes.id, result[0].insertId)).limit(1);
  return row[0] || null;
}

export async function listClientNotes(clientId: number): Promise<ClientNote[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientNotes)
    .where(eq(clientNotes.clientId, clientId))
    .orderBy(desc(clientNotes.createdAt));
}

// ─── Content Creators (v1 restructure — Source Tracker) ────────────────────
export async function createContentCreator(data: Omit<InsertContentCreator, "id" | "createdAt" | "updatedAt">): Promise<ContentCreator | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(contentCreators).values(data);
  const row = await db.select().from(contentCreators).where(eq(contentCreators.id, result[0].insertId)).limit(1);
  return row[0] || null;
}

export async function listContentCreators(): Promise<ContentCreator[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentCreators).orderBy(desc(contentCreators.createdAt));
}

export async function updateContentCreator(id: number, data: Partial<Omit<InsertContentCreator, "id" | "createdAt" | "updatedAt">>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(contentCreators).set(data).where(eq(contentCreators.id, id));
}

// ─── CSO v1 audit list ─────────────────────────────────────────────────────
export async function listAuditLogsForCso(limit = 200): Promise<AuditLog[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}
