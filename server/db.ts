import { eq, desc, sql, and, gte, lte, ne, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
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
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
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

export function generateRefNumber(): string {
  // Random 6-char alphanumeric — not guessable, not year-locked
  const token = randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
  return `BZ-${token}`;
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export async function createLead(data: Omit<InsertLead, "id" | "createdAt" | "updatedAt">): Promise<Lead> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ref = data.ref || generateRefNumber();
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

export async function getTaskByPhone(phoneDigits: string) {
  const db = await getDb();
  if (!db) return undefined;
  const last6 = phoneDigits.replace(/\D/g, "").slice(-6);
  const result = await db.select().from(tasks).where(like(tasks.phone, `%${last6}`)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTask(id: number, data: Partial<Pick<Task, "status" | "notes" | "deadline" | "assignedTo" | "quotedPrice" | "completedAt">>) {
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

export async function getCompletedTasksWithPrice() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks)
    .where(and(eq(tasks.status, "Completed"), sql`${tasks.quotedPrice} IS NOT NULL AND ${tasks.quotedPrice} > 0`))
    .orderBy(desc(tasks.completedAt));
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

export function generateHZRefNumber(): string {
  const token = randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
  return `HZ-${token}`;
}

export async function createSystemiseLead(data: Omit<InsertSystemiseLead, "id" | "createdAt" | "updatedAt">): Promise<SystemiseLead> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ref = data.ref || generateHZRefNumber();
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

export function generateSKLRefNumber(): string {
  const token = randomBytes(4).toString("hex").toUpperCase().slice(0, 6);
  return `SKL-${token}`;
}

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
  const ref = data.ref || generateSKLRefNumber();
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

// ─── Skills Admin Stats ─────────────────────────────────────────────────────

export async function getSkillsAdminStats() {
  const db = await getDb();
  if (!db) return { activeCohorts: 0, upcomingCohorts: 0, pendingApps: 0, totalStudents: 0, ridiCommunities: 28 };

  const allCohorts = await db.select().from(cohorts);
  const allApps = await db.select().from(skillsApplications);

  const activeCohorts = allCohorts.filter(c => c.status === "enrolling" || c.status === "in_progress").length;
  const upcomingCohorts = allCohorts.filter(c => c.status === "enrolling").length;
  const pendingApps = allApps.filter(a => a.status === "submitted").length;
  const totalStudents = allApps.filter(a => a.status === "accepted").length;

  return {
    activeCohorts,
    upcomingCohorts,
    pendingApps,
    totalStudents,
    ridiCommunities: 28,
  };
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
