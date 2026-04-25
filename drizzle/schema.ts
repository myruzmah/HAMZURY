import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with HAMZURY institutional roles.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** HAMZURY institutional role for dashboard access */
  hamzuryRole: mysqlEnum("hamzuryRole", [
    "founder", "ceo", "cso", "finance", "hr", "bizdev", "department_staff"
  ]).default("department_staff"),
  /** Which department this user belongs to */
  department: varchar("department", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Staff users — email+password login (separate from OAuth users table).
 */
export const staffUsers = mysqlTable("staffUsers", {
  id: int("id").autoincrement().primaryKey(),
  staffRef: varchar("staffRef", { length: 20 }).unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  passwordSalt: varchar("passwordSalt", { length: 128 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  hamzuryRole: mysqlEnum("staffHamzuryRole", ["founder","ceo","cso","cso_staff","finance","hr","bizdev","bizdev_staff","media","skills_staff","systemise_head","tech_lead","compliance_staff","security_staff","department_staff"]).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  firstLogin: boolean("firstLogin").default(true).notNull(),
  passwordChanged: boolean("passwordChanged").default(false).notNull(),
  failedAttempts: int("failedAttempts").default(0).notNull(),
  lockedUntil: timestamp("lockedUntil"),
  lastLogin: timestamp("lastLogin"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type StaffUser = typeof staffUsers.$inferSelect;
export type InsertStaffUser = typeof staffUsers.$inferInsert;

/**
 * Leads captured from the AI chat widget on the public page.
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  ref: varchar("ref", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  businessName: varchar("businessName", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  service: varchar("service", { length: 500 }).notNull(),
  context: text("context"),
  /** Source: chat, referral, walk-in, bizdev */
  source: varchar("source", { length: 50 }).default("chat"),
  status: mysqlEnum("leadStatus", [
    "new",
    "qualified",
    "proposal_sent",
    "negotiation",
    "onboarding",
    "won",
    "lost",
    "paused",
    // Backwards-compat values (pre-v1 restructure) — kept so existing rows stay valid.
    "contacted",
    "converted",
    "archived",
  ]).default("new").notNull(),
  /** CSO lead score 0-10 based on discovery checklist signals */
  leadScore: int("lead_score").default(0),
  /** Referral tracking */
  referralCode: varchar("referralCode", { length: 50 }),
  referrerName: varchar("referrerName", { length: 255 }),
  referralSourceType: varchar("referralSourceType", { length: 50 }),
  leadOwner: varchar("leadOwner", { length: 100 }),
  notifyCso: boolean("notifyCso").default(false),
  /** CSO assignment fields */
  assignedDepartment: varchar("assignedDepartment", { length: 50 }),
  assignedBy: int("assignedBy"),
  assignedAt: timestamp("assignedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════════
// VERIFIED CLIENT TRUTH LAYER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verified clients — the single source of truth for client identity.
 * A client is created when a lead converts OR when staff manually registers one.
 * Every task, invoice, and subscription should reference this table.
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  ref: varchar("ref", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  businessName: varchar("businessName", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  /** Active = paid + open task/subscription. Converted = agreed, may not have paid.
   *  Unverified = pipeline only. Dormant = no activity 60+ days. */
  status: mysqlEnum("clientStatus", ["active", "converted", "unverified", "dormant"]).default("unverified").notNull(),
  /** Primary department owning this client's current work */
  department: varchar("department", { length: 50 }),
  /** Lead that generated this client (nullable — manual clients have no lead) */
  leadId: int("leadId"),
  /** CSO who handled discovery */
  csoOwner: varchar("csoOwner", { length: 255 }),
  /** Department lead responsible for delivery */
  departmentOwner: varchar("departmentOwner", { length: 255 }),
  /** Finance staff tracking payment */
  financeOwner: varchar("financeOwner", { length: 255 }),
  /** Total contracted value across all services */
  contractValue: decimal("contractValue", { precision: 12, scale: 2 }),
  /** Total amount paid to date */
  amountPaid: decimal("amountPaid", { precision: 12, scale: 2 }).default("0"),
  /** Outstanding balance = contractValue - amountPaid */
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0"),
  /** Current blocker preventing progress */
  currentBlocker: text("currentBlocker"),
  /** Next action required */
  nextAction: text("nextAction"),
  /** Due date for next action (YYYY-MM-DD) */
  dueDate: varchar("dueDate", { length: 10 }),
  /** Risk flag: none, low, medium, high, critical */
  riskFlag: mysqlEnum("riskFlag", ["none", "low", "medium", "high", "critical"]).default("none").notNull(),
  /** Free-text notes on missing critical information */
  missingInfo: text("missingInfo"),
  /** Location / city */
  location: varchar("location", { length: 255 }),
  /** How the client found HAMZURY */
  source: varchar("source", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Server-side client sessions for verified dashboard access.
 * Created when a client verifies identity (ref + phone match).
 * Replaces the old localStorage-only approach.
 */
export const clientSessions = mysqlTable("client_sessions", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => clients.id),
  token: varchar("token", { length: 128 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClientSession = typeof clientSessions.$inferSelect;
export type InsertClientSession = typeof clientSessions.$inferInsert;

/**
 * Tasks created from leads or manually by staff.
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  ref: varchar("ref", { length: 20 }).notNull().unique(),
  leadId: int("leadId"),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  businessName: varchar("businessName", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  service: varchar("service", { length: 500 }).notNull(),
  status: mysqlEnum("taskStatus", [
    "Not Started",
    "In Progress",
    "Waiting on Client",
    "Submitted",
    "Completed"
  ]).default("Not Started").notNull(),
  notes: text("notes"),
  assignedTo: int("assignedTo"),
  department: varchar("department", { length: 50 }).default("bizdoc"),
  /** Quoted price for commission calculation */
  quotedPrice: decimal("quotedPrice", { precision: 12, scale: 2 }),
  deadline: varchar("deadline", { length: 20 }),
  completedAt: timestamp("completedAt"),
  /** KPI Engine: manager approves completed task → +1 smooth task */
  kpiApproved: boolean("kpi_approved").default(false).notNull(),
  /** KPI Engine: manager flags task for rework → staff must redo */
  isRework: boolean("is_rework").default(false).notNull(),
  /** Rework reason from manager — shown to staff so they know what to fix */
  reworkNote: text("rework_note"),
  /** Links task to a subscription (for recurring monthly services) */
  subscriptionId: int("subscriptionId"),
  /** Month this task covers e.g. "2026-03" */
  taskMonth: varchar("taskMonth", { length: 7 }),
  /** Expected delivery date (YYYY-MM-DD) */
  expectedDelivery: varchar("expectedDelivery", { length: 20 }),
  /** Actual completion date (YYYY-MM-DD) */
  actualDelivery: varchar("actualDelivery", { length: 20 }),
  /** Estimated hours to complete */
  estimatedHours: int("estimatedHours"),
  /** Actual hours spent */
  actualHours: int("actualHours"),
  /** Task priority level */
  priority: mysqlEnum("priority", ["urgent", "high", "normal", "low"]).default("normal"),
  /** Work category */
  category: varchar("category", { length: 50 }),
  /** Phase 2: who assigned this task (staff openId or ref) — nullable for legacy rows */
  assignedBy: varchar("assignedBy", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * SOP checklist templates defining the standard items for each phase.
 */
export const checklistTemplates = mysqlTable("checklist_templates", {
  id: int("id").autoincrement().primaryKey(),
  department: varchar("department", { length: 50 }).default("bizdoc"),
  phase: mysqlEnum("phase", ["pre", "during", "post"]).notNull(),
  label: varchar("label", { length: 500 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChecklistTemplate = typeof checklistTemplates.$inferSelect;
export type InsertChecklistTemplate = typeof checklistTemplates.$inferInsert;

/**
 * Individual checklist items for each task, linked to templates.
 */
export const taskChecklistItems = mysqlTable("task_checklist_items", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  templateId: int("templateId"),
  phase: mysqlEnum("itemPhase", ["pre", "during", "post"]).notNull(),
  label: varchar("label", { length: 500 }).notNull(),
  checked: boolean("checked").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TaskChecklistItem = typeof taskChecklistItems.$inferSelect;
export type InsertTaskChecklistItem = typeof taskChecklistItems.$inferInsert;

/**
 * Documents attached to tasks (stored in S3).
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  fileName: varchar("fileName", { length: 500 }).notNull(),
  fileKey: varchar("fileKey", { length: 1000 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  uploadedBy: int("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Activity logs for audit trail on tasks.
 */
export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId"),
  leadId: int("leadId"),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════════
// HAMZURY INSTITUTIONAL TABLES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Commission records for completed tasks.
 * Uses the HAMZURY 40/60 split formula with 5 tiers.
 */
export const commissions = mysqlTable("commissions", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  taskRef: varchar("taskRef", { length: 20 }).notNull(),
  clientName: varchar("clientName", { length: 255 }),
  service: varchar("service", { length: 100 }),
  quotedPrice: decimal("quotedPrice", { precision: 12, scale: 2 }).notNull(),
  /** 40% of quoted price goes to institutional allocation */
  institutionalAmount: decimal("institutionalAmount", { precision: 12, scale: 2 }).notNull(),
  /** 60% of quoted price goes to commission pool */
  commissionPool: decimal("commissionPool", { precision: 12, scale: 2 }).notNull(),
  /** Tier breakdown (JSON: { founder, ceo, cso, closer, department }) */
  tierBreakdown: json("tierBreakdown"),
  status: mysqlEnum("commissionStatus", ["pending", "approved", "paid"]).default("pending").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;

/**
 * Attendance records for staff.
 */
export const attendance = mysqlTable("attendance", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  checkIn: timestamp("checkIn"),
  checkOut: timestamp("checkOut"),
  status: mysqlEnum("attendanceStatus", ["present", "absent", "late", "leave"]).default("present").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;

/**
 * Weekly reports submitted by department heads.
 */
export const weeklyReports = mysqlTable("weekly_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  department: varchar("department", { length: 50 }).notNull(),
  weekStart: varchar("weekStart", { length: 10 }).notNull(), // YYYY-MM-DD
  summary: text("summary").notNull(),
  completedTasks: int("completedTasks").default(0),
  pendingTasks: int("pendingTasks").default(0),
  blockers: text("blockers"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WeeklyReport = typeof weeklyReports.$inferSelect;
export type InsertWeeklyReport = typeof weeklyReports.$inferInsert;

/**
 * Institutional audit log for sensitive actions.
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  userName: varchar("userName", { length: 255 }),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }),
  resourceId: int("resourceId"),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEMISE DEPARTMENT TABLES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Appointments scheduled through the Systemise Clarity Desk (Path D).
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId"),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  businessName: varchar("businessName", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  preferredDate: varchar("preferredDate", { length: 10 }).notNull(), // YYYY-MM-DD
  preferredTime: varchar("preferredTime", { length: 20 }).notNull(),
  status: mysqlEnum("appointmentStatus", ["pending", "confirmed", "completed", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Join Us applications submitted through the Systemise Clarity Desk.
 */
export const joinApplications = mysqlTable("join_applications", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  roleInterest: varchar("roleInterest", { length: 255 }),
  experience: text("experience"),
  portfolioUrl: varchar("portfolioUrl", { length: 500 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  status: mysqlEnum("applicationStatus", ["new", "reviewed", "interview", "accepted", "rejected"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JoinApplication = typeof joinApplications.$inferSelect;
export type InsertJoinApplication = typeof joinApplications.$inferInsert;

/**
 * Systemise leads with extended data for checkup diagnostics and payment tracking.
 */
export const systemiseLeads = mysqlTable("systemise_leads", {
  id: int("id").autoincrement().primaryKey(),
  ref: varchar("ref", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  businessName: varchar("businessName", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  /** Which chat path they took: A, B, C, D */
  chosenPath: varchar("chosenPath", { length: 5 }),
  /** Services they're interested in (JSON array) */
  serviceInterest: json("serviceInterest"),
  /** Business type / desired outcome */
  businessType: varchar("businessType", { length: 255 }),
  desiredOutcome: text("desiredOutcome"),
  /** Free text notes from Path B */
  freeTextNotes: text("freeTextNotes"),
  /** Full 8-area checkup data (JSON) */
  checkupData: json("checkupData"),
  /** Recommended next step: direct_proposal, report, appointment */
  recommendedStep: varchar("recommendedStep", { length: 50 }),
  /** Payment status for Growth Positioning Report */
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "claimed", "verified", "refunded"]).default("pending").notNull(),
  /** Lead status */
  status: mysqlEnum("sysLeadStatus", ["new", "contacted", "converted", "archived"]).default("new").notNull(),
  /** Appointment ID if Path D */
  appointmentId: int("appointmentId"),
  source: varchar("source", { length: 50 }).default("clarity_desk"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemiseLead = typeof systemiseLeads.$inferSelect;
export type InsertSystemiseLead = typeof systemiseLeads.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════════
// SKILLS DEPARTMENT TABLES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Cohorts represent a specific run of a program (e.g., "Faceless Content Apr 8-19").
 */
export const cohorts = mysqlTable("cohorts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  program: mysqlEnum("program", ["skills_intensive", "executive", "it_internship", "ai_course"]).notNull(),
  pathway: mysqlEnum("pathway", ["virtual", "physical", "ridi_scholarship"]).default("virtual").notNull(),
  description: text("description"),
  startDate: varchar("startDate", { length: 10 }).notNull(), // YYYY-MM-DD
  endDate: varchar("endDate", { length: 10 }).notNull(),
  enrollDeadline: varchar("enrollDeadline", { length: 10 }),
  maxSeats: int("maxSeats").default(30).notNull(),
  enrolledCount: int("enrolledCount").default(0).notNull(),
  earlyBirdPrice: decimal("earlyBirdPrice", { precision: 12, scale: 2 }),
  standardPrice: decimal("standardPrice", { precision: 12, scale: 2 }),
  status: mysqlEnum("cohortStatus", ["draft", "enrolling", "in_progress", "completed", "cancelled"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Cohort = typeof cohorts.$inferSelect;
export type InsertCohort = typeof cohorts.$inferInsert;

/**
 * Modules within a cohort (e.g., "Week 1: Content Pillars").
 */
export const cohortModules = mysqlTable("cohort_modules", {
  id: int("id").autoincrement().primaryKey(),
  cohortId: int("cohortId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  weekNumber: int("weekNumber").default(1).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CohortModule = typeof cohortModules.$inferSelect;
export type InsertCohortModule = typeof cohortModules.$inferInsert;

/**
 * Applications to Skills programs.
 */
export const skillsApplications = mysqlTable("skills_applications", {
  id: int("id").autoincrement().primaryKey(),
  ref: varchar("ref", { length: 30 }).notNull().unique(),
  cohortId: int("cohortId"),
  /** Step 1: Program selection */
  program: varchar("program", { length: 100 }).notNull(),
  pathway: varchar("pathway", { length: 50 }),
  /** Step 2: Business context */
  businessDescription: text("businessDescription"),
  biggestChallenge: text("biggestChallenge"),
  heardFrom: varchar("heardFrom", { length: 100 }),
  /** Step 3: Commitment */
  canCommitTime: boolean("canCommitTime").default(false),
  hasEquipment: boolean("hasEquipment").default(false),
  willingToExecute: boolean("willingToExecute").default(false),
  /** Step 4: Contact & payment */
  fullName: varchar("fullName", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  pricingTier: varchar("pricingTier", { length: 20 }).default("early_bird"),
  agreedToTerms: boolean("agreedToTerms").default(false),
  agreedToEffort: boolean("agreedToEffort").default(false),
  /** Status */
  status: mysqlEnum("appStatus", ["submitted", "under_review", "accepted", "waitlisted", "rejected"]).default("submitted").notNull(),
  reviewedBy: int("reviewedBy"),
  reviewNotes: text("reviewNotes"),
  paymentStatus: mysqlEnum("appPaymentStatus", ["pending", "paid", "waived", "refunded"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SkillsApplication = typeof skillsApplications.$inferSelect;
export type InsertSkillsApplication = typeof skillsApplications.$inferInsert;

/**
 * Student assignments within a cohort module.
 */
export const studentAssignments = mysqlTable("student_assignments", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  moduleId: int("moduleId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: varchar("dueDate", { length: 10 }),
  status: mysqlEnum("assignmentStatus", ["pending", "submitted", "graded"]).default("pending").notNull(),
  submittedAt: timestamp("submittedAt"),
  grade: varchar("grade", { length: 10 }),
  feedback: text("feedback"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudentAssignment = typeof studentAssignments.$inferSelect;
export type InsertStudentAssignment = typeof studentAssignments.$inferInsert;

/**
 * Live sessions for cohorts (Zoom calls, Q&As, peer reviews).
 */
export const liveSessions = mysqlTable("live_sessions", {
  id: int("id").autoincrement().primaryKey(),
  cohortId: int("cohortId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  sessionDate: varchar("sessionDate", { length: 10 }).notNull(), // YYYY-MM-DD
  sessionTime: varchar("sessionTime", { length: 20 }).notNull(),
  meetingUrl: text("meetingUrl"),
  type: mysqlEnum("sessionType", ["live_qa", "peer_review", "workshop", "guest_speaker"]).default("live_qa").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LiveSession = typeof liveSessions.$inferSelect;
export type InsertLiveSession = typeof liveSessions.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════════
// AFFILIATE PORTAL TABLES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Affiliate accounts — external partners who refer clients to HAMZURY.
 * Each affiliate gets a unique code used in referral links.
 */
export const affiliates = mysqlTable("affiliates", {
  id: int("id").autoincrement().primaryKey(),
  /** Unique referral code, e.g., AFF-001 */
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** salt:hash format using crypto.createHash */
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  status: mysqlEnum("affiliateStatus", ["active", "suspended", "pending"]).default("active").notNull(),
  /** Cumulative total earned (approved records) */
  totalEarnings: decimal("totalEarnings", { precision: 12, scale: 2 }).default("0"),
  /** Balance not yet paid out */
  pendingBalance: decimal("pendingBalance", { precision: 12, scale: 2 }).default("0"),
  /** Total amount paid out */
  paidBalance: decimal("paidBalance", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

/**
 * Records linking an affiliate to a referred lead / completed task.
 * Commission is calculated as a percentage of the task's quoted price.
 */
export const affiliateRecords = mysqlTable("affiliate_records", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  affiliateCode: varchar("affiliateCode", { length: 20 }).notNull(),
  leadId: int("leadId"),
  taskRef: varchar("taskRef", { length: 20 }),
  clientName: varchar("clientName", { length: 255 }),
  service: varchar("service", { length: 100 }),
  department: varchar("department", { length: 50 }),
  quotedAmount: decimal("quotedAmount", { precision: 12, scale: 2 }),
  /** Default 10% of quotedAmount */
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("10"),
  commissionAmount: decimal("commissionAmount", { precision: 12, scale: 2 }),
  status: mysqlEnum("affRecordStatus", ["pending", "earned", "paid"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AffiliateRecord = typeof affiliateRecords.$inferSelect;
export type InsertAffiliateRecord = typeof affiliateRecords.$inferInsert;

/**
 * Withdrawal requests submitted by affiliates.
 */
export const affiliateWithdrawals = mysqlTable("affiliate_withdrawals", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  method: varchar("method", { length: 50 }).notNull().default("bank_transfer"),
  accountName: varchar("accountName", { length: 255 }),
  accountNumber: varchar("accountNumber", { length: 50 }),
  bankName: varchar("bankName", { length: 100 }),
  status: mysqlEnum("withdrawalStatus", ["pending", "processing", "completed", "rejected"]).default("pending").notNull(),
  processedAt: timestamp("processedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AffiliateWithdrawal = typeof affiliateWithdrawals.$inferSelect;
export type InsertAffiliateWithdrawal = typeof affiliateWithdrawals.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION / TAX PRO MAX TABLES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Recurring service subscriptions (Tax Pro Max Monthly, etc.)
 * Created by CSO when a client subscribes to a monthly service.
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId"),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  businessName: varchar("businessName", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  service: varchar("service", { length: 100 }).notNull(),
  department: varchar("department", { length: 50 }).default("bizdoc").notNull(),
  monthlyFee: decimal("monthlyFee", { precision: 12, scale: 2 }).notNull(),
  billingDay: int("billingDay").default(1).notNull(),
  status: mysqlEnum("subscriptionStatus", ["active", "paused", "cancelled"]).default("active").notNull(),
  startDate: varchar("startDate", { length: 10 }).notNull(),
  assignedStaffEmail: varchar("assignedStaffEmail", { length: 255 }),
  notesForStaff: text("notesForStaff"),
  createdBy: varchar("createdBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Monthly payment records for each subscription.
 * Finance staff marks payments as received each month.
 */
export const subscriptionPayments = mysqlTable("subscription_payments", {
  id: int("id").autoincrement().primaryKey(),
  subscriptionId: int("subscriptionId").notNull(),
  month: varchar("month", { length: 7 }).notNull(), // "2026-03"
  amountDue: decimal("amountDue", { precision: 12, scale: 2 }).notNull(),
  amountPaid: decimal("amountPaid", { precision: 12, scale: 2 }),
  status: mysqlEnum("paymentStatus2", ["pending", "paid", "overdue", "waived"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  recordedBy: varchar("recordedBy", { length: 255 }),
  paymentRef: varchar("paymentRef", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SubscriptionPayment = typeof subscriptionPayments.$inferSelect;
export type InsertSubscriptionPayment = typeof subscriptionPayments.$inferInsert;

/**
 * Encrypted client credentials for managed services (Tax Pro Max, FIRS, CAC, etc.)
 * Visible to BizDoc staff assigned to the task. Password stored AES-256-GCM encrypted.
 */
export const clientCredentials = mysqlTable("client_credentials", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId"),
  subscriptionId: int("subscriptionId"),
  platform: varchar("platform", { length: 100 }).notNull(), // "Tax Pro Max", "FIRS", "CAC"
  loginUrl: varchar("loginUrl", { length: 500 }),
  username: varchar("username", { length: 500 }).notNull(),
  passwordEnc: text("passwordEnc").notNull(),   // AES-256-GCM encrypted
  iv: varchar("iv", { length: 64 }).notNull(),  // encryption IV
  notes: text("notes"),
  addedBy: varchar("addedBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ClientCredential = typeof clientCredentials.$inferSelect;
export type InsertClientCredential = typeof clientCredentials.$inferInsert;

/**
 * Year-end tax savings record per subscription client.
 * Records how much tax was saved and HAMZURY's 10% success fee.
 */
export const taxSavingsRecords = mysqlTable("tax_savings_records", {
  id: int("id").autoincrement().primaryKey(),
  subscriptionId: int("subscriptionId").notNull(),
  year: varchar("year", { length: 4 }).notNull(),             // "2026"
  grossTaxLiability: decimal("grossTaxLiability", { precision: 15, scale: 2 }), // what they would have paid
  savedAmount: decimal("savedAmount", { precision: 15, scale: 2 }),             // how much was saved
  hamzuryFee: decimal("hamzuryFee", { precision: 15, scale: 2 }),               // 10% of savedAmount
  tccDelivered: boolean("tccDelivered").default(false).notNull(),
  tccDeliveredAt: timestamp("tccDeliveredAt"),
  notes: text("notes"),
  recordedBy: varchar("recordedBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TaxSavingsRecord = typeof taxSavingsRecords.$inferSelect;
export type InsertTaxSavingsRecord = typeof taxSavingsRecords.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE PRICING, INVOICING, NOTIFICATIONS, PROPOSALS & CERTIFICATES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Standardized pricing for all HAMZURY services across departments.
 */
export const servicePricing = mysqlTable("service_pricing", {
  id: int("id").autoincrement().primaryKey(),
  department: mysqlEnum("pricingDepartment", ["bizdoc", "systemise", "skills", "metfix"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  serviceName: varchar("serviceName", { length: 200 }).notNull(),
  description: text("description"),
  basePrice: int("basePrice").notNull(),
  maxPrice: int("maxPrice"),
  unit: mysqlEnum("pricingUnit", ["one_time", "monthly", "per_cohort", "per_session", "custom"]).default("one_time").notNull(),
  commissionPercent: int("commissionPercent").default(10),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServicePricing = typeof servicePricing.$inferSelect;
export type InsertServicePricing = typeof servicePricing.$inferInsert;

/**
 * Invoices issued to clients for services rendered.
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoiceNumber", { length: 20 }).notNull().unique(),
  leadId: int("leadId"),
  taskId: int("taskId"),
  subscriptionId: int("subscriptionId"),
  clientName: varchar("clientName", { length: 200 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 200 }),
  clientPhone: varchar("clientPhone", { length: 20 }),
  items: json("items").notNull(),
  subtotal: int("subtotal").notNull(),
  discount: int("discount").default(0),
  tax: int("tax").default(0),
  total: int("total").notNull(),
  amountPaid: int("amountPaid").default(0),
  status: mysqlEnum("invoiceStatus", ["draft", "sent", "paid", "partial", "overdue", "cancelled"]).default("draft").notNull(),
  dueDate: timestamp("dueDate"),
  paidAt: timestamp("paidAt"),
  notes: text("notes"),
  createdBy: varchar("createdBy", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * In-app notifications for staff users.
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("userId", { length: 100 }).notNull(),
  type: mysqlEnum("notificationType", ["assignment", "status_change", "payment", "reminder", "system"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  link: varchar("link", { length: 500 }),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Client proposals generated from service pricing.
 */
export const proposals = mysqlTable("proposals", {
  id: int("id").autoincrement().primaryKey(),
  proposalNumber: varchar("proposalNumber", { length: 20 }).notNull().unique(),
  leadId: int("leadId"),
  clientName: varchar("clientName", { length: 200 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 200 }),
  clientPhone: varchar("clientPhone", { length: 20 }),
  businessName: varchar("businessName", { length: 200 }),
  services: json("services").notNull(),
  totalAmount: int("totalAmount").notNull(),
  validUntil: timestamp("validUntil"),
  status: mysqlEnum("proposalStatus", ["draft", "sent", "accepted", "rejected", "expired"]).default("draft").notNull(),
  notes: text("notes"),
  createdBy: varchar("createdBy", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;

/**
 * Certificates issued to students who complete Skills programs.
 */
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  certificateNumber: varchar("certificateNumber", { length: 20 }).notNull().unique(),
  studentName: varchar("studentName", { length: 200 }).notNull(),
  studentEmail: varchar("studentEmail", { length: 200 }),
  cohortId: int("cohortId"),
  program: varchar("program", { length: 200 }).notNull(),
  completionDate: timestamp("completionDate").notNull(),
  grade: varchar("grade", { length: 50 }),
  issuedBy: varchar("issuedBy", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT CALENDAR / MEDIA TABLES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Content posts for the media content calendar and auto-scheduling system.
 * Tracks social media posts across all departments and platforms.
 */
export const contentPosts = mysqlTable("content_posts", {
  id: int("id").autoincrement().primaryKey(),
  department: mysqlEnum("contentDepartment", ["general", "bizdoc", "systemise", "skills"]).default("general").notNull(),
  platform: mysqlEnum("contentPlatform", ["instagram", "tiktok", "twitter", "linkedin"]).notNull(),
  contentType: mysqlEnum("contentType", ["educational", "success_story", "service_spotlight", "behind_scenes", "quote", "carousel"]).notNull(),
  caption: text("caption").notNull(),
  hashtags: text("hashtags"),
  mediaUrl: varchar("mediaUrl", { length: 500 }),
  scheduledFor: timestamp("scheduledFor"),
  postedAt: timestamp("postedAt"),
  status: mysqlEnum("contentStatus", ["draft", "scheduled", "posted", "failed"]).default("draft").notNull(),
  createdBy: varchar("createdBy", { length: 100 }),
  engagement: json("engagement"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContentPost = typeof contentPosts.$inferSelect;
export type InsertContentPost = typeof contentPosts.$inferInsert;

/**
 * Leave requests submitted by staff.
 */
export const leaveRequests = mysqlTable("leave_requests", {
  id: int("id").autoincrement().primaryKey(),
  staffEmail: varchar("staffEmail", { length: 255 }).notNull(),
  staffName: varchar("staffName", { length: 255 }).notNull(),
  startDate: varchar("startDate", { length: 20 }).notNull(),
  endDate: varchar("endDate", { length: 20 }).notNull(),
  reason: text("reason"),
  replacementName: varchar("replacementName", { length: 255 }),
  status: mysqlEnum("leaveStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewedBy: varchar("reviewedBy", { length: 255 }),
  reviewNotes: text("reviewNotes"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = typeof leaveRequests.$inferInsert;

/**
 * Formal discipline records (queries and suspensions).
 */
export const disciplineRecords = mysqlTable("discipline_records", {
  id: int("id").autoincrement().primaryKey(),
  staffEmail: varchar("staffEmail", { length: 255 }).notNull(),
  staffName: varchar("staffName", { length: 255 }).notNull(),
  type: mysqlEnum("disciplineType", ["query", "suspension"]).notNull(),
  reason: varchar("reason", { length: 500 }).notNull(),
  description: text("description"),
  suspensionDays: int("suspensionDays"),
  status: mysqlEnum("disciplineStatus", ["issued", "resolved"]).default("issued").notNull(),
  issuedBy: varchar("issuedBy", { length: 255 }).notNull(),
  resolvedAt: timestamp("resolvedAt"),
  resolvedNotes: text("resolvedNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type DisciplineRecord = typeof disciplineRecords.$inferSelect;
export type InsertDisciplineRecord = typeof disciplineRecords.$inferInsert;

/**
 * BizDoc government portal visit logs per client.
 */
export const portalVisitLogs = mysqlTable("portal_visit_logs", {
  id: int("id").autoincrement().primaryKey(),
  subscriptionId: int("subscriptionId").notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  portalName: varchar("portalName", { length: 255 }).notNull(),  // e.g. "FIRS", "CAC", "SCUML"
  visitedAt: timestamp("visitedAt").defaultNow().notNull(),
  visitedBy: varchar("visitedBy", { length: 255 }),
  actionTaken: text("actionTaken"),
  status: mysqlEnum("portalStatus", ["logged_in", "submitted", "pending", "approved", "rejected", "error"]).default("logged_in").notNull(),
  nextActionDate: varchar("nextActionDate", { length: 20 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PortalVisitLog = typeof portalVisitLogs.$inferSelect;
export type InsertPortalVisitLog = typeof portalVisitLogs.$inferInsert;

/**
 * Weekly content engagement records per staff member.
 */
export const contentEngagementLogs = mysqlTable("content_engagement_logs", {
  id: int("id").autoincrement().primaryKey(),
  weekOf: varchar("weekOf", { length: 10 }).notNull(),  // YYYY-MM-DD (Monday)
  staffEmail: varchar("staffEmail", { length: 255 }).notNull(),
  staffName: varchar("staffName", { length: 255 }).notNull(),
  engaged: boolean("engaged").default(false).notNull(),
  platforms: varchar("platforms", { length: 500 }),
  notes: text("notes"),
  recordedBy: varchar("recordedBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ContentEngagementLog = typeof contentEngagementLogs.$inferSelect;
export type InsertContentEngagementLog = typeof contentEngagementLogs.$inferInsert;

/**
 * Weekly Hub Meeting records: research topics and staff of the week.
 */
export const hubMeetingRecords = mysqlTable("hub_meeting_records", {
  id: int("id").autoincrement().primaryKey(),
  weekOf: varchar("weekOf", { length: 10 }).notNull(),  // YYYY-MM-DD (Monday)
  researchTopic: varchar("researchTopic", { length: 500 }),
  researchAssignedTo: varchar("researchAssignedTo", { length: 255 }),
  researchFormat: varchar("researchFormat", { length: 100 }),
  researchAdopted: boolean("researchAdopted").default(false).notNull(),
  projectLead: varchar("projectLead", { length: 255 }),
  staffOfWeek: varchar("staffOfWeek", { length: 255 }),
  staffOfWeekAchievement: text("staffOfWeekAchievement"),
  trainingTopic: varchar("trainingTopic", { length: 500 }),
  trainingCategory: varchar("trainingCategory", { length: 100 }),
  trainer: varchar("trainer", { length: 255 }),
  todoList: text("todoList"),  // JSON stringified array
  nextWeekTodos: text("nextWeekTodos"),  // JSON stringified array
  notes: text("notes"),
  createdBy: varchar("createdBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HubMeetingRecord = typeof hubMeetingRecords.$inferSelect;
export type InsertHubMeetingRecord = typeof hubMeetingRecords.$inferInsert;

/**
 * Student milestone calendar entries (Skills — physical and online).
 */
export const studentMilestones = mysqlTable("student_milestones", {
  id: int("id").autoincrement().primaryKey(),
  cohortId: int("cohortId"),
  cohortName: varchar("cohortName", { length: 255 }),
  studentType: mysqlEnum("studentType", ["physical", "online", "nitda"]).default("physical").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  milestoneDate: varchar("milestoneDate", { length: 20 }).notNull(),
  type: mysqlEnum("milestoneType", ["assignment", "quiz", "presentation", "celebration", "graduation", "event"]).default("assignment").notNull(),
  celebrated: boolean("celebrated").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type StudentMilestone = typeof studentMilestones.$inferSelect;
export type InsertStudentMilestone = typeof studentMilestones.$inferInsert;

// ─── FINANCE: Revenue Allocations ────────────────────────────────────────────
export const allocations = mysqlTable("allocations", {
  id: int("id").autoincrement().primaryKey(),
  transactionRef: varchar("transactionRef", { length: 50 }).notNull(),
  clientRef: varchar("clientRef", { length: 50 }),
  clientName: varchar("clientName", { length: 255 }),
  service: varchar("service", { length: 255 }),
  department: varchar("department", { length: 50 }),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  /** 50% institutional */
  institutionalAmount: decimal("institutionalAmount", { precision: 12, scale: 2 }).notNull(),
  opsAmount: decimal("opsAmount", { precision: 12, scale: 2 }),
  growthAmount: decimal("growthAmount", { precision: 12, scale: 2 }),
  aiFundAmount: decimal("aiFundAmount", { precision: 12, scale: 2 }),
  reserveAmount: decimal("reserveAmount", { precision: 12, scale: 2 }),
  /** 30% staff pool */
  staffPoolAmount: decimal("staffPoolAmount", { precision: 12, scale: 2 }).notNull(),
  aiStaffShare: decimal("aiStaffShare", { precision: 12, scale: 2 }).default("0"),
  humanStaffAmount: decimal("humanStaffAmount", { precision: 12, scale: 2 }),
  staffPayouts: json("staffPayouts"),
  /** 20% affiliate pool */
  affiliatePoolAmount: decimal("affiliatePoolAmount", { precision: 12, scale: 2 }).notNull(),
  affiliateId: int("affiliateId"),
  affiliateCode: varchar("affiliateCode", { length: 50 }),
  affiliateTier: varchar("affiliateTier", { length: 20 }),
  affiliateCommission: decimal("affiliateCommission", { precision: 12, scale: 2 }).default("0"),
  contentBonus: decimal("contentBonus", { precision: 12, scale: 2 }).default("0"),
  affiliateTotalPayout: decimal("affiliateTotalPayout", { precision: 12, scale: 2 }).default("0"),
  /** AI contribution percentage (0-100) */
  aiContributionPct: int("aiContributionPct").default(0),
  quarter: varchar("quarter", { length: 10 }),
  status: mysqlEnum("allocationStatus", ["pending", "approved", "paid"]).default("pending").notNull(),
  approvedBy: varchar("approvedBy", { length: 255 }),
  allocatedAt: timestamp("allocatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Allocation = typeof allocations.$inferSelect;
export type InsertAllocation = typeof allocations.$inferInsert;

// ─── FINANCE: AI Fund Log ────────────────────────────────────────────────────
export const aiFundLog = mysqlTable("ai_fund_log", {
  id: int("id").autoincrement().primaryKey(),
  allocationId: int("allocationId"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  source: varchar("source", { length: 50 }).notNull(),
  description: text("description"),
  balance: decimal("balance", { precision: 12, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AIFundLog = typeof aiFundLog.$inferSelect;

// ─── FINANCE: Affiliate League Table ─────────────────────────────────────────
export const affiliateLeagueTable = mysqlTable("affiliate_league_table", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  affiliateCode: varchar("affiliateCode", { length: 50 }).notNull(),
  affiliateName: varchar("affiliateName", { length: 255 }).notNull(),
  position: int("position").notNull(),
  tier: mysqlEnum("leagueTier", ["elite", "premier", "standard", "entry", "waiting"]).default("waiting").notNull(),
  totalConversions: int("totalConversions").default(0),
  totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }).default("0"),
  totalEarnings: decimal("totalEarnings", { precision: 12, scale: 2 }).default("0"),
  qualityScore: int("qualityScore").default(0),
  contentBonusTotal: decimal("contentBonusTotal", { precision: 12, scale: 2 }).default("0"),
  quarter: varchar("quarter", { length: 10 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastActivityAt: timestamp("lastActivityAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AffiliateLeagueEntry = typeof affiliateLeagueTable.$inferSelect;

// ─── SKILLS: Calendar / Cohort Schedule ──────────────────────────────────────
export const skillsCalendar = mysqlTable("skills_calendar", {
  id: int("id").autoincrement().primaryKey(),
  quarter: varchar("quarter", { length: 10 }).notNull(),
  theme: varchar("theme", { length: 100 }),
  registrationStart: varchar("registrationStart", { length: 20 }).notNull(),
  registrationEnd: varchar("registrationEnd", { length: 20 }).notNull(),
  orientationDate: varchar("orientationDate", { length: 20 }).notNull(),
  classesStart: varchar("classesStart", { length: 20 }).notNull(),
  classesEnd: varchar("classesEnd", { length: 20 }).notNull(),
  graduationDate: varchar("graduationDate", { length: 20 }).notNull(),
  supportWindowStart: varchar("supportWindowStart", { length: 20 }),
  supportWindowEnd: varchar("supportWindowEnd", { length: 20 }),
  executiveCircleStart: varchar("executiveCircleStart", { length: 20 }),
  executiveCircleEnd: varchar("executiveCircleEnd", { length: 20 }),
  track1Name: varchar("track1Name", { length: 255 }),
  track1Time: varchar("track1Time", { length: 50 }).default("8:00 AM – 10:00 AM"),
  track2Name: varchar("track2Name", { length: 255 }),
  track2Time: varchar("track2Time", { length: 50 }).default("10:30 AM – 12:30 PM"),
  track3Name: varchar("track3Name", { length: 255 }),
  track3Time: varchar("track3Time", { length: 50 }).default("1:30 PM – 3:30 PM"),
  roboticsName: varchar("roboticsName", { length: 255 }).default("Robotics & Creative Tech Lab"),
  roboticsTime: varchar("roboticsTime", { length: 50 }).default("10:00 AM – 1:00 PM"),
  roboticsDays: varchar("roboticsDays", { length: 50 }).default("Thursday–Friday"),
  status: mysqlEnum("calendarStatus", ["upcoming", "registration", "active", "support", "completed"]).default("upcoming").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SkillsCalendarEntry = typeof skillsCalendar.$inferSelect;
export type InsertSkillsCalendar = typeof skillsCalendar.$inferInsert;

// ─── Skills: Competition Teams (Squid Game format) ──────────────────────────
export const skillsTeams = mysqlTable("skills_teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  cohortId: int("cohortId"),
  quarter: varchar("quarter", { length: 10 }).notNull(),
  color: varchar("color", { length: 20 }),
  points: int("points").default(0).notNull(),
  wins: int("wins").default(0),
  losses: int("losses").default(0),
  memberCount: int("memberCount").default(0),
  captainName: varchar("captainName", { length: 255 }),
  status: mysqlEnum("teamStatus", ["active", "eliminated", "champion"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SkillsTeam = typeof skillsTeams.$inferSelect;
export type InsertSkillsTeam = typeof skillsTeams.$inferInsert;

// ─── Skills: Team Members ───────────────────────────────────────────────────
export const skillsTeamMembers = mysqlTable("skills_team_members", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  studentName: varchar("studentName", { length: 255 }).notNull(),
  studentEmail: varchar("studentEmail", { length: 320 }),
  studentType: mysqlEnum("memberType", ["cohort", "planaid", "online"]).default("cohort").notNull(),
  role: varchar("role", { length: 50 }).default("member"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});
export type SkillsTeamMember = typeof skillsTeamMembers.$inferSelect;

// ─── Skills: Weekly Interactive Schedule ────────────────────────────────────
export const skillsInteractiveSessions = mysqlTable("skills_interactive_sessions", {
  id: int("id").autoincrement().primaryKey(),
  quarter: varchar("quarter", { length: 10 }).notNull(),
  weekNumber: int("weekNumber").notNull(),
  dayOfWeek: mysqlEnum("dayOfWeek", ["monday", "tuesday", "wednesday"]).notNull(),
  timeSlot: varchar("timeSlot", { length: 50 }).default("11:00 AM – 1:00 PM"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("sessionType", ["game", "tech_talk", "entrepreneurship", "prompt_challenge", "tool_exploration", "social_media", "content_creation", "branding"]).notNull(),
  teamScores: json("teamScores"),
  winnerTeamId: int("winnerTeamId"),
  status: mysqlEnum("sessionStatus", ["scheduled", "completed", "cancelled"]).default("scheduled").notNull(),
  sessionDate: varchar("sessionDate", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SkillsInteractiveSession = typeof skillsInteractiveSessions.$inferSelect;

// ─── Skills: Quarterly Awards ───────────────────────────────────────────────
export const skillsAwards = mysqlTable("skills_awards", {
  id: int("id").autoincrement().primaryKey(),
  quarter: varchar("quarter", { length: 10 }).notNull(),
  teamId: int("teamId"),
  teamName: varchar("teamName", { length: 100 }),
  awardType: mysqlEnum("awardType", ["champion", "runner_up", "best_project", "best_content", "most_improved", "special"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  recipientName: varchar("recipientName", { length: 255 }),
  certificationIssued: boolean("certificationIssued").default(false),
  awardDate: varchar("awardDate", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SkillsAward = typeof skillsAwards.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT AI CHAT SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Per-client / per-task AI chat threads.
 * Each row holds its own system prompt + full message history so the AI
 * always has context about that specific client engagement.
 */
export const clientChats = mysqlTable("client_chats", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId"),
  clientRef: varchar("clientRef", { length: 50 }).notNull(),
  clientName: varchar("clientName", { length: 255 }),
  department: varchar("department", { length: 50 }),
  systemPrompt: text("systemPrompt").notNull(),
  chatHistory: json("chatHistory"),
  status: mysqlEnum("chatStatus", ["active", "paused", "closed"]).default("active").notNull(),
  createdBy: varchar("createdBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ClientChat = typeof clientChats.$inferSelect;
export type InsertClientChat = typeof clientChats.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════════
// PARTNERSHIPS (BizDev)
// ═══════════════════════════════════════════════════════════════════════════════

export const partnerships = mysqlTable("partnerships", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("partnerType", ["referral_partner", "community_partner", "events_partner", "regional_partner", "ecosystem_partner"]).notNull(),
  contact: varchar("contact", { length: 255 }),
  stage: mysqlEnum("partnerStage", ["researching", "outreach", "agreed", "active", "paused"]).default("researching").notNull(),
  referrals: int("referrals").default(0).notNull(),
  notes: text("notes"),
  createdBy: varchar("createdBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Partnership = typeof partnerships.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════════
// BRAND QA (BizDev)
// ═══════════════════════════════════════════════════════════════════════════════

export const brandQaItems = mysqlTable("brandQaItems", {
  id: int("id").autoincrement().primaryKey(),
  department: varchar("department", { length: 50 }).notNull(),
  item: text("item").notNull(),
  type: mysqlEnum("qaType", ["proposal", "content", "visual", "document"]).notNull(),
  status: mysqlEnum("qaStatus", ["pending", "approved", "revision"]).default("pending").notNull(),
  submittedBy: varchar("submittedBy", { length: 255 }),
  reviewedBy: varchar("reviewedBy", { length: 255 }),
  urgent: boolean("urgent").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type BrandQaItem = typeof brandQaItems.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════════
// JOB POSTINGS & HIRING (HR)
// ═══════════════════════════════════════════════════════════════════════════════

export const jobPostings = mysqlTable("jobPostings", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  department: varchar("department", { length: 100 }).notNull(),
  status: mysqlEnum("jobStatus", ["open", "on_hold", "closed", "filled"]).default("open").notNull(),
  description: text("description"),
  requirements: text("requirements"),
  createdBy: varchar("createdBy", { length: 255 }),
  postedAt: timestamp("postedAt").defaultNow().notNull(),
  closedAt: timestamp("closedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type JobPosting = typeof jobPostings.$inferSelect;

export const hiringApplications = mysqlTable("hiringApplications", {
  id: int("id").autoincrement().primaryKey(),
  jobPostingId: int("jobPostingId").notNull(),
  candidateName: varchar("candidateName", { length: 255 }).notNull(),
  candidateEmail: varchar("candidateEmail", { length: 255 }),
  candidatePhone: varchar("candidatePhone", { length: 50 }),
  status: mysqlEnum("hiringStatus", ["received", "shortlisted", "interviewed", "offer_sent", "hired", "rejected"]).default("received").notNull(),
  score: varchar("score", { length: 20 }),
  interviewDate: varchar("interviewDate", { length: 30 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HiringApplication = typeof hiringApplications.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════════
// TRAINING & DEVELOPMENT (HR)
// ═══════════════════════════════════════════════════════════════════════════════

export const trainingSessions = mysqlTable("trainingSessions", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("trainingType", ["internal", "external", "online", "workshop"]).default("internal").notNull(),
  sessionDate: varchar("sessionDate", { length: 30 }),
  participants: int("participants").default(0).notNull(),
  status: mysqlEnum("trainingStatus", ["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled").notNull(),
  notes: text("notes"),
  createdBy: varchar("createdBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TrainingSession = typeof trainingSessions.$inferSelect;

export const developmentPlans = mysqlTable("developmentPlans", {
  id: int("id").autoincrement().primaryKey(),
  staffEmail: varchar("staffEmail", { length: 255 }).notNull(),
  staffName: varchar("staffName", { length: 255 }).notNull(),
  goal: text("goal").notNull(),
  targetDate: varchar("targetDate", { length: 30 }),
  progress: int("progress").default(0).notNull(),
  support: varchar("support", { length: 255 }),
  notes: text("notes"),
  createdBy: varchar("createdBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type DevelopmentPlan = typeof developmentPlans.$inferSelect;

export const performanceCycles = mysqlTable("performanceCycles", {
  id: int("id").autoincrement().primaryKey(),
  cycleName: varchar("cycleName", { length: 255 }).notNull(),
  period: varchar("period", { length: 50 }).notNull(),
  status: mysqlEnum("cycleStatus", ["upcoming", "active", "completed"]).default("upcoming").notNull(),
  totalReviews: int("totalReviews").default(0).notNull(),
  completedReviews: int("completedReviews").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PerformanceCycle = typeof performanceCycles.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════════
// RIDI COMMUNITIES
// ═══════════════════════════════════════════════════════════════════════════════

export const ridiCommunities = mysqlTable("ridiCommunities", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  coordinator: varchar("coordinator", { length: 255 }),
  members: int("members").default(0).notNull(),
  status: mysqlEnum("communityStatus", ["active", "inactive", "forming"]).default("forming").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type RidiCommunity = typeof ridiCommunities.$inferSelect;

// ═══════════════════════════════════════════════════════════════════════════════
// MEDIA — PODCASTS, ASSETS, SOCIAL STATS
// ═══════════════════════════════════════════════════════════════════════════════

export const podcastEpisodes = mysqlTable("podcastEpisodes", {
  id: int("id").autoincrement().primaryKey(),
  episodeNumber: int("episodeNumber").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  guest: varchar("guest", { length: 255 }),
  recordingDate: varchar("recordingDate", { length: 30 }),
  duration: varchar("duration", { length: 20 }),
  status: mysqlEnum("podcastStatus", ["scheduled", "recorded", "editing", "published"]).default("scheduled").notNull(),
  plays: int("plays").default(0).notNull(),
  audioUrl: varchar("audioUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PodcastEpisode = typeof podcastEpisodes.$inferSelect;

export const mediaAssets = mysqlTable("mediaAssets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("assetType", ["zip", "audio", "video", "figma", "image", "document"]).notNull(),
  fileSize: varchar("fileSize", { length: 50 }),
  fileUrl: varchar("fileUrl", { length: 500 }),
  uploadedBy: varchar("uploadedBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MediaAsset = typeof mediaAssets.$inferSelect;

export const socialPlatformStats = mysqlTable("socialPlatformStats", {
  id: int("id").autoincrement().primaryKey(),
  platform: varchar("platform", { length: 50 }).notNull(),
  handle: varchar("handle", { length: 100 }),
  followers: int("followers").default(0).notNull(),
  growth: varchar("growth", { length: 20 }),
  postsCount: int("postsCount").default(0).notNull(),
  reach: int("reach").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SocialPlatformStat = typeof socialPlatformStats.$inferSelect;

// ─── Weekly Targets (CEO → Departments → HR tracks) ─────────────────────────
export const weeklyTargets = mysqlTable("weekly_targets_v2", {
  id: int("id").autoincrement().primaryKey(),
  weekOf: varchar("weekOf", { length: 10 }).notNull(), // YYYY-MM-DD (Monday)
  department: varchar("department", { length: 50 }).notNull(), // bizdoc, systemise, skills, media, bizdev
  targetType: varchar("targetType", { length: 50 }).notNull(), // client, task, learning, content, custom
  description: text("description").notNull(),
  assignedBy: varchar("assignedBy", { length: 255 }).notNull(), // CEO staff ref or name
  assignedTo: varchar("assignedTo", { length: 255 }), // specific staff or dept lead
  deadline: varchar("deadline", { length: 30 }).notNull(), // e.g. "Friday 2pm"
  status: mysqlEnum("targetStatus", ["issued", "in_progress", "submitted", "approved", "revision_requested"]).default("issued").notNull(),
  submissionNote: text("submissionNote"), // staff submission text
  reviewNote: text("reviewNote"), // CEO review feedback
  outcome: mysqlEnum("targetOutcome", ["hit", "missed", "partial"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type WeeklyTarget = typeof weeklyTargets.$inferSelect;
export type InsertWeeklyTarget = typeof weeklyTargets.$inferInsert;

// Inter-Department Messaging
export const deptMessages = mysqlTable("dept_messages", {
  id: int("id").autoincrement().primaryKey(),
  threadId: varchar("threadId", { length: 50 }).notNull(), // group messages by thread
  fromStaffId: varchar("fromStaffId", { length: 50 }).notNull(), // sender staff ref
  fromName: varchar("fromName", { length: 255 }).notNull(),
  fromDepartment: varchar("fromDepartment", { length: 50 }).notNull(),
  toDepartment: varchar("toDepartment", { length: 50 }), // null = direct message
  toStaffId: varchar("toStaffId", { length: 50 }), // null = department channel
  message: text("message").notNull(),
  messageType: mysqlEnum("messageType", ["text", "file", "task_ref", "system"]).default("text").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type DeptMessage = typeof deptMessages.$inferSelect;
export type InsertDeptMessage = typeof deptMessages.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════════
// AI AGENT SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

// Persistent agent state — survives server restarts
export const agentState = mysqlTable("agent_state", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 50 }).notNull().unique(),
  enabled: boolean("enabled").default(true).notNull(),
  lastRun: timestamp("lastRun"),
  taskCount: int("taskCount").default(0).notNull(),
  successRate: int("successRate").default(100).notNull(),
  status: varchar("status", { length: 20 }).default("idle").notNull(),
  lastError: text("lastError"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AgentStateRow = typeof agentState.$inferSelect;

// Agent suggestions — structured outputs for staff to accept/reject
export const agentSuggestions = mysqlTable("agent_suggestions", {
  id: int("id").autoincrement().primaryKey(),
  agentId: varchar("agentId", { length: 50 }).notNull(),
  targetDepartment: varchar("targetDepartment", { length: 50 }).notNull(),
  targetEntityType: varchar("targetEntityType", { length: 50 }).notNull(), // lead, task, application, commission
  targetEntityId: int("targetEntityId").notNull(),
  suggestionType: varchar("suggestionType", { length: 50 }).notNull(), // checklist, email_draft, brief, score, assignment, welcome_msg, meeting_prep, leave_review, commission_review, content_draft
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  status: mysqlEnum("suggestionStatus", ["pending", "accepted", "rejected", "expired"]).default("pending").notNull(),
  reviewedBy: varchar("reviewedBy", { length: 255 }),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AgentSuggestion = typeof agentSuggestions.$inferSelect;
export type InsertAgentSuggestion = typeof agentSuggestions.$inferInsert;

// ============================================================================
// TILZ SPA BY TILDA — Client Portal Tables
// Luxury spa business in Wuse 2, Abuja
// Services: Spa treatments, Sauna, Barbing Salon
// ============================================================================

/**
 * Spa client records
 */
export const spaClients = mysqlTable("spa_clients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 320 }),
  gender: mysqlEnum("gender", ["male", "female", "other"]).notNull(),
  preferences: text("preferences"),
  birthday: varchar("birthday", { length: 20 }),
  referralSource: varchar("referralSource", { length: 100 }),
  totalSpent: decimal("totalSpent", { precision: 10, scale: 2 }).default("0").notNull(),
  visitCount: int("visitCount").default(0).notNull(),
  lastVisit: timestamp("lastVisit"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SpaClient = typeof spaClients.$inferSelect;
export type InsertSpaClient = typeof spaClients.$inferInsert;

/**
 * Spa service catalogue
 */
export const spaServices = mysqlTable("spa_services", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("spaServiceCategory", ["spa", "sauna", "barbing", "facial", "bridal", "couples"]).notNull(),
  description: text("description").notNull(),
  duration: int("duration").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SpaService = typeof spaServices.$inferSelect;
export type InsertSpaService = typeof spaServices.$inferInsert;

/**
 * Spa appointment bookings
 */
export const spaAppointments = mysqlTable("spa_appointments", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => spaClients.id),
  serviceId: int("serviceId").notNull().references(() => spaServices.id),
  appointmentDate: timestamp("appointmentDate").notNull(),
  endTime: timestamp("endTime"),
  status: mysqlEnum("appointmentStatus", ["pending", "confirmed", "checked_in", "in_progress", "completed", "cancelled", "no_show"]).default("pending").notNull(),
  therapist: varchar("therapist", { length: 255 }),
  notes: text("notes"),
  source: mysqlEnum("appointmentSource", ["whatsapp", "walk_in", "instagram", "phone", "website"]).notNull(),
  reminderSent: boolean("reminderSent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SpaAppointment = typeof spaAppointments.$inferSelect;
export type InsertSpaAppointment = typeof spaAppointments.$inferInsert;

/**
 * Spa payment transactions
 */
export const spaTransactions = mysqlTable("spa_transactions", {
  id: int("id").autoincrement().primaryKey(),
  appointmentId: int("appointmentId").references(() => spaAppointments.id),
  clientId: int("clientId").notNull().references(() => spaClients.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("spaPaymentMethod", ["cash", "transfer", "pos", "online"]).notNull(),
  status: mysqlEnum("spaTransactionStatus", ["pending", "completed", "refunded"]).default("pending").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  processedBy: varchar("processedBy", { length: 255 }),
  transactionDate: timestamp("transactionDate").defaultNow().notNull(),
});
export type SpaTransaction = typeof spaTransactions.$inferSelect;
export type InsertSpaTransaction = typeof spaTransactions.$inferInsert;

/**
 * Spa product inventory tracking
 */
export const spaInventory = mysqlTable("spa_inventory", {
  id: int("id").autoincrement().primaryKey(),
  productName: varchar("productName", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  quantity: int("quantity").notNull(),
  reorderLevel: int("reorderLevel").default(5).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  supplier: varchar("supplier", { length: 255 }),
  lastRestocked: timestamp("lastRestocked"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SpaInventoryItem = typeof spaInventory.$inferSelect;
export type InsertSpaInventoryItem = typeof spaInventory.$inferInsert;

/**
 * Spa staff / employees
 */
export const spaStaff = mysqlTable("spa_staff", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  role: mysqlEnum("spaStaffRole", ["founder", "receptionist", "therapist", "barber", "manager"]).notNull(),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  passwordSalt: varchar("passwordSalt", { length: 128 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SpaStaffMember = typeof spaStaff.$inferSelect;
export type InsertSpaStaffMember = typeof spaStaff.$inferInsert;

/**
 * WhatsApp automation message log
 */
export const spaWhatsappMessages = mysqlTable("spa_whatsapp_messages", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").references(() => spaClients.id),
  phone: varchar("phone", { length: 50 }).notNull(),
  direction: mysqlEnum("messageDirection", ["inbound", "outbound"]).notNull(),
  messageType: mysqlEnum("spaMessageType", ["greeting", "booking_request", "confirmation", "reminder", "follow_up", "review_request", "custom"]).notNull(),
  content: text("content").notNull(),
  status: mysqlEnum("spaMessageStatus", ["sent", "delivered", "read", "failed"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SpaWhatsappMessage = typeof spaWhatsappMessages.$inferSelect;
export type InsertSpaWhatsappMessage = typeof spaWhatsappMessages.$inferInsert;

/**
 * Client reviews and feedback
 */
export const spaReviews = mysqlTable("spa_reviews", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => spaClients.id),
  appointmentId: int("appointmentId").references(() => spaAppointments.id),
  rating: int("rating").notNull(),
  comment: text("comment"),
  platform: mysqlEnum("reviewPlatform", ["google", "instagram", "whatsapp", "in_person"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SpaReview = typeof spaReviews.$inferSelect;
export type InsertSpaReview = typeof spaReviews.$inferInsert;

/**
 * Spa business expenses
 */
export const spaExpenses = mysqlTable("spa_expenses", {
  id: int("id").autoincrement().primaryKey(),
  category: mysqlEnum("spaExpenseCategory", ["rent", "utilities", "products", "salaries", "marketing", "equipment", "other"]).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paidBy: varchar("paidBy", { length: 255 }).notNull(),
  expenseDate: timestamp("expenseDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SpaExpense = typeof spaExpenses.$inferSelect;
export type InsertSpaExpense = typeof spaExpenses.$inferInsert;

/**
 * Spa audit / activity log
 */
export const spaActivityLog = mysqlTable("spa_activity_log", {
  id: int("id").autoincrement().primaryKey(),
  staffId: int("staffId"),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: int("entityId"),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SpaActivityLogEntry = typeof spaActivityLog.$inferSelect;
export type InsertSpaActivityLogEntry = typeof spaActivityLog.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════════════
// CSO PORTAL — PHASE 2
// Targets (role-level KPI), Calendar Events (shared), Client Notes (timeline)
// ═══════════════════════════════════════════════════════════════════════════════

/** Role- or user-level targets set by CEO/Founder. Metrics auto-computed by server. */
export const targets = mysqlTable("targets", {
  id: int("id").autoincrement().primaryKey(),
  /** openId of assigner (CEO/Founder) */
  assignedBy: varchar("assignedBy", { length: 100 }).notNull(),
  assignedByName: varchar("assignedByName", { length: 255 }),
  /** Role or specific staff id. Examples: "cso", "founder", "staff:42" */
  assignedTo: varchar("assignedTo", { length: 100 }).notNull(),
  period: mysqlEnum("targetPeriod", ["month", "quarter", "year"]).notNull(),
  periodStart: varchar("periodStart", { length: 10 }).notNull(),   // YYYY-MM-DD
  periodEnd: varchar("periodEnd", { length: 10 }).notNull(),       // YYYY-MM-DD
  metric: mysqlEnum("targetMetric", [
    "leads_qualified",
    "proposals_sent",
    "clients_onboarded",
    "revenue_closed",
    "custom",
  ]).notNull(),
  targetValue: decimal("targetValue", { precision: 14, scale: 2 }).notNull(),
  notes: text("notes"),
  status: mysqlEnum("targetStatusV2", ["active", "completed", "cancelled"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TargetV2 = typeof targets.$inferSelect;
export type InsertTargetV2 = typeof targets.$inferInsert;

/** Unified calendar events (meetings, follow-ups, deadlines, renewals). */
export const calendarEvents = mysqlTable("calendar_events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startAt: timestamp("startAt").notNull(),
  endAt: timestamp("endAt"),
  allDay: boolean("allDay").default(false).notNull(),
  eventType: mysqlEnum("eventType", ["meeting", "follow_up", "deadline", "renewal", "internal", "other"]).default("other").notNull(),
  /** openId of owner */
  ownerId: varchar("ownerId", { length: 100 }).notNull(),
  ownerName: varchar("ownerName", { length: 255 }),
  visibility: mysqlEnum("eventVisibility", ["private", "team", "public"]).default("team").notNull(),
  clientId: int("clientId"),
  leadId: int("leadId"),
  location: text("location"),
  reminderMinutes: int("reminderMinutes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;

/** Timeline notes attached to a client — CSO, CEO briefs, client updates, risk flags. */
export const clientNotes = mysqlTable("client_notes", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  /** openId of author */
  authorId: varchar("authorId", { length: 100 }).notNull(),
  authorName: varchar("authorName", { length: 255 }),
  kind: mysqlEnum("clientNoteKind", ["internal", "ceo_brief", "client_update", "risk_flag"]).default("internal").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ClientNote = typeof clientNotes.$inferSelect;
export type InsertClientNote = typeof clientNotes.$inferInsert;

/**
 * v1 restructure — Content creator / affiliate registry for the CSO Source Tracker.
 * Founder / CSO managed. Each creator has a unique short code used in lead attribution.
 */
export const contentCreators = mysqlTable("content_creators", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  handle: varchar("handle", { length: 255 }),
  platform: mysqlEnum("platform", ["instagram", "tiktok", "x", "youtube", "blog", "other"]).default("other").notNull(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("10.00").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  status: mysqlEnum("creatorStatus", ["active", "paused", "removed"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ContentCreator = typeof contentCreators.$inferSelect;
export type InsertContentCreator = typeof contentCreators.$inferInsert;

/* ══════════════════════════════════════════════════════════════════════════════
 * FOUNDER PORTAL — Life & Legacy System
 * Founder-only. Migrated from localStorage (opsStore) to real DB.
 * Source shapes mirror client/src/pages/FounderPortal.tsx.
 * Vault `secret` + `recovery` fields are encrypted at rest (server/_core/crypto.ts).
 * ══════════════════════════════════════════════════════════════════════════════ */

/** Debt repayment log — every payment toward founder debt freedom. */
export const founderDebtPayments = mysqlTable("founder_debt_payments", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(),       // ISO YYYY-MM-DD
  amount: int("amount").notNull(),                        // NGN
  source: varchar("source", { length: 255 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FounderDebtPayment = typeof founderDebtPayments.$inferSelect;
export type InsertFounderDebtPayment = typeof founderDebtPayments.$inferInsert;

/** Weekly schedule completion ticks. (week, slot) is unique per row. */
export const founderScheduleChecks = mysqlTable("founder_schedule_checks", {
  id: int("id").autoincrement().primaryKey(),
  week: varchar("week", { length: 10 }).notNull(),        // ISO week, e.g. "2026-W17"
  slot: varchar("slot", { length: 200 }).notNull(),       // "Monday|6:30 AM|Gym"
  done: boolean("done").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FounderScheduleCheck = typeof founderScheduleChecks.$inferSelect;
export type InsertFounderScheduleCheck = typeof founderScheduleChecks.$inferInsert;

/** Content tracker — what was posted, where, performance. */
export const founderContent = mysqlTable("founder_content", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(),
  platform: varchar("platform", { length: 80 }).notNull(),
  contentType: varchar("contentType", { length: 80 }).notNull(),
  theme: varchar("theme", { length: 255 }),
  mentor: varchar("mentor", { length: 120 }),
  posted: varchar("posted", { length: 20 }).notNull(),    // "Yes" | "No" | "Scheduled"
  engagement: varchar("engagement", { length: 100 }),
  saved: boolean("saved").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FounderContentRow = typeof founderContent.$inferSelect;
export type InsertFounderContentRow = typeof founderContent.$inferInsert;

/** Learning journal — lessons from mentors / books / podcasts. */
export const founderLearning = mysqlTable("founder_learning", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 10 }).notNull(),
  source: varchar("source", { length: 255 }).notNull(),
  mentor: varchar("mentor", { length: 120 }),
  lesson: text("lesson").notNull(),
  screenshot: boolean("screenshot").default(false).notNull(),
  whyWorth: text("whyWorth"),
  howApply: text("howApply"),
  applied: mysqlEnum("founderLearningApplied", ["Not Yet", "In Progress", "Yes"])
    .default("Not Yet").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FounderLearningRow = typeof founderLearning.$inferSelect;
export type InsertFounderLearningRow = typeof founderLearning.$inferInsert;

/** Vision milestones toward 2027 freedom. */
export const founderMilestones = mysqlTable("founder_milestones", {
  id: int("id").autoincrement().primaryKey(),
  label: varchar("label", { length: 255 }).notNull(),
  target: varchar("target", { length: 10 }),               // ISO date
  status: mysqlEnum("founderMilestoneStatus", [
    "Not Started", "Planning", "In Progress", "Done",
  ]).default("Not Started").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FounderMilestone = typeof founderMilestones.$inferSelect;
export type InsertFounderMilestone = typeof founderMilestones.$inferInsert;

/** Encrypted vault — passwords, recovery info. `secret` + `recovery` are AES-256-GCM blobs. */
export const founderVault = mysqlTable("founder_vault", {
  id: int("id").autoincrement().primaryKey(),
  kind: mysqlEnum("founderVaultKind", ["account", "doc"]).default("account").notNull(),
  service: varchar("service", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }),
  /** ENCRYPTED — never read raw. Use decryptString() in server. */
  secret: text("secret"),
  securityQ: text("securityQ"),
  /** ENCRYPTED — never read raw. */
  recovery: text("recovery"),
  storageLocation: varchar("storageLocation", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FounderVaultRow = typeof founderVault.$inferSelect;
export type InsertFounderVaultRow = typeof founderVault.$inferInsert;

/* ══════════════════════════════════════════════════════════════════════════════
 * VIDEO OPS PORTAL — Salis (lead video editor)
 * Migrated from localStorage (opsStore "video" portal) to real DB.
 * Source shapes mirror client/src/pages/VideoOpsPortal.tsx.
 * ══════════════════════════════════════════════════════════════════════════════ */

/** Video projects — top-level production records. */
export const videoProjects = mysqlTable("video_projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  client: varchar("client", { length: 255 }).notNull().default(""),
  /** Human-readable code, e.g. "VID-001". Distinct from `id`. */
  projectCode: varchar("projectCode", { length: 80 }).notNull().default(""),
  deliveryDate: varchar("deliveryDate", { length: 10 }).notNull().default(""),  // ISO YYYY-MM-DD or ""
  budget: int("budget").notNull().default(0),                                    // NGN
  /** JSON-serialised array of ServiceTag values. */
  services: text("services").notNull(),
  status: mysqlEnum("videoProjectStatus", ["Pre", "Production", "Post", "Delivered"])
    .default("Pre").notNull(),
  phase: varchar("phase", { length: 40 }).notNull().default("script"),
  owner: mysqlEnum("videoProjectOwner", ["Salis", "Client"]).default("Salis").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type VideoProject = typeof videoProjects.$inferSelect;
export type InsertVideoProject = typeof videoProjects.$inferInsert;

/** Video assets — production materials per project (footage, audio, graphics, copy). */
export const videoAssets = mysqlTable("video_assets", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  assetGroup: mysqlEnum("videoAssetGroup", ["Footage", "Audio", "Graphics", "Copy"])
    .default("Footage").notNull(),
  done: boolean("done").default(false).notNull(),
  path: varchar("path", { length: 1024 }),
  owner: varchar("owner", { length: 120 }),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type VideoAsset = typeof videoAssets.$inferSelect;
export type InsertVideoAsset = typeof videoAssets.$inferInsert;

/** Video revisions — client feedback rounds (v1/v2/v3). */
export const videoRevisions = mysqlTable("video_revisions", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  version: varchar("version", { length: 20 }).notNull(),       // "v1", "v2", "v3"
  feedback: text("feedback").notNull(),
  status: mysqlEnum("videoRevisionStatus", ["Pending", "In Progress", "Resolved"])
    .default("Pending").notNull(),
  date: varchar("date", { length: 10 }).notNull(),             // ISO YYYY-MM-DD
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type VideoRevision = typeof videoRevisions.$inferSelect;
export type InsertVideoRevision = typeof videoRevisions.$inferInsert;

/** Video deliverables — final outputs per project (MP4, thumbnail, SRT, project file). */
export const videoDeliverables = mysqlTable("video_deliverables", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  kind: mysqlEnum("videoDeliverableKind", ["MP4", "Thumbnail", "SRT", "Project File", "Other"])
    .default("MP4").notNull(),
  path: varchar("path", { length: 1024 }),
  format: varchar("format", { length: 80 }),
  resolution: varchar("resolution", { length: 80 }),
  done: boolean("done").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type VideoDeliverable = typeof videoDeliverables.$inferSelect;
export type InsertVideoDeliverable = typeof videoDeliverables.$inferInsert;

/* ══════════════════════════════════════════════════════════════════════════════
 * SCALAR OPS PORTAL — Dajot + Felix (web · app · automation team)
 * Migrated from localStorage (opsStore "scalar" portal) to real DB.
 * Source shapes mirror client/src/pages/ScalarOpsPortal.tsx.
 * Project ref convention: HMZ-P-XXX (sequential, generated server-side).
 * Children FK on the int `projectId`, not the string `ref`.
 * ══════════════════════════════════════════════════════════════════════════════ */

/** Scalar projects — top-level project records (HMZ-P-XXX). */
export const scalarProjects = mysqlTable("scalar_projects", {
  id: int("id").autoincrement().primaryKey(),
  /** Human-readable sequential code, e.g. "HMZ-P-001". */
  ref: varchar("ref", { length: 20 }).notNull().default(""),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientContact: varchar("clientContact", { length: 255 }),
  clientEmail: varchar("clientEmail", { length: 255 }),
  clientPhone: varchar("clientPhone", { length: 50 }),
  service: mysqlEnum("scalarProjectService", ["Website", "App", "Automation"])
    .default("Website").notNull(),
  status: mysqlEnum("scalarProjectStatus", [
    "Queued", "In Progress", "On Hold", "Completed", "Cancelled",
  ]).default("Queued").notNull(),
  week: int("week"),
  phaseId: varchar("phaseId", { length: 40 }),
  lead: mysqlEnum("scalarProjectLead", ["Dajot", "Felix", ""])
    .default("").notNull(),
  startDate: varchar("startDate", { length: 10 }),
  targetDelivery: varchar("targetDelivery", { length: 10 }),
  actualDelivery: varchar("actualDelivery", { length: 10 }),
  projectValue: int("projectValue"),
  scope: text("scope"),
  goals: text("goals"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ScalarProject = typeof scalarProjects.$inferSelect;
export type InsertScalarProject = typeof scalarProjects.$inferInsert;

/** Scalar deliverables — artefacts per project (also doubles as files when group="File"). */
export const scalarDeliverables = mysqlTable("scalar_deliverables", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: varchar("dueDate", { length: 10 }),
  done: boolean("done").default(false).notNull(),
  deliveredAt: varchar("deliveredAt", { length: 10 }),
  clientApproved: boolean("clientApproved").default(false).notNull(),
  groupName: varchar("groupName", { length: 80 }),
  owner: varchar("owner", { length: 120 }),
  path: varchar("path", { length: 1024 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ScalarDeliverable = typeof scalarDeliverables.$inferSelect;
export type InsertScalarDeliverable = typeof scalarDeliverables.$inferInsert;

/** Scalar blockers — open issues per project. */
export const scalarBlockers = mysqlTable("scalar_blockers", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  issue: text("issue").notNull(),
  impact: text("impact"),
  status: mysqlEnum("scalarBlockerStatus", ["Open", "Resolved"])
    .default("Open").notNull(),
  resolution: text("resolution"),
  resolvedAt: varchar("resolvedAt", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ScalarBlocker = typeof scalarBlockers.$inferSelect;
export type InsertScalarBlocker = typeof scalarBlockers.$inferInsert;

/** Scalar comms — client communication log per project. */
export const scalarComms = mysqlTable("scalar_comms", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  commType: varchar("commType", { length: 80 }).notNull(),
  summary: text("summary").notNull(),
  actionItems: text("actionItems"),
  followUpDate: varchar("followUpDate", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ScalarComm = typeof scalarComms.$inferSelect;
export type InsertScalarComm = typeof scalarComms.$inferInsert;

/** Scalar notes — decisions and notes per project. */
export const scalarNotes = mysqlTable("scalar_notes", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  body: text("body").notNull(),
  decidedBy: varchar("decidedBy", { length: 255 }),
  impact: text("impact"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ScalarNote = typeof scalarNotes.$inferSelect;
export type InsertScalarNote = typeof scalarNotes.$inferInsert;

/** Scalar QA checks — feature/test-case tracking per project. */
export const scalarQaChecks = mysqlTable("scalar_qa_checks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  feature: varchar("feature", { length: 255 }).notNull(),
  testCase: text("testCase").notNull(),
  expected: text("expected"),
  actual: text("actual"),
  status: mysqlEnum("scalarQaStatus", ["Not Tested", "Pass", "Fail", "Fixed"])
    .default("Not Tested").notNull(),
  bug: text("bug"),
  fixedAt: varchar("fixedAt", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ScalarQaCheck = typeof scalarQaChecks.$inferSelect;
export type InsertScalarQaCheck = typeof scalarQaChecks.$inferInsert;

/* ══════════════════════════════════════════════════════════════════════════════
 * PODCAST OPS PORTAL — Maryam Lalo (Host) + Habeeba (Producer)
 * Migrated from localStorage (opsStore "podcast" portal) to real DB.
 * Source shapes mirror client/src/pages/PodcastOpsPortal.tsx.
 *
 * Note: a separate `podcastEpisodes` table (see line ~1339) serves the CEO
 * dashboard — it is intentionally distinct from `podcast_episodes_ops`. The
 * latter is the production-ops record (kanban phases, raw assets, host).
 * Children FK on int parent ids (showId, episodeId).
 * ══════════════════════════════════════════════════════════════════════════════ */

/** Podcast shows — corporate clients / season-based productions. */
export const podcastShows = mysqlTable("podcast_shows", {
  id: int("id").autoincrement().primaryKey(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  showName: varchar("showName", { length: 255 }).notNull(),
  tier: mysqlEnum("podcastShowTier", [
    "10ep", "15ep", "20ep", "interview", "edit-only", "corporate",
  ]).default("10ep").notNull(),
  episodesTotal: int("episodesTotal").default(0).notNull(),
  episodesDelivered: int("episodesDelivered").default(0).notNull(),
  priceNGN: int("priceNGN").default(0).notNull(),
  startDate: varchar("startDate", { length: 10 }),
  releaseCadence: mysqlEnum("podcastShowCadence", [
    "Weekly", "Biweekly", "Monthly", "Ad-hoc",
  ]).default("Weekly").notNull(),
  contact: varchar("contact", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PodcastShow = typeof podcastShows.$inferSelect;
export type InsertPodcastShow = typeof podcastShows.$inferInsert;

/**
 * Podcast episodes — per-episode production tracker (kanban phases).
 * Distinct from `podcastEpisodes` (CEO dashboard). The `assets` column stores
 * a JSON-stringified AssetItem[] to preserve the original UI's checklist UX
 * without splitting into a separate child table.
 */
export const podcastEpisodesOps = mysqlTable("podcast_episodes_ops", {
  id: int("id").autoincrement().primaryKey(),
  epNumber: varchar("epNumber", { length: 40 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  topic: varchar("topic", { length: 255 }),
  /** FK to podcast_shows.id (nullable — internal HAMZURY episodes have no show). */
  showId: int("showId"),
  guestName: varchar("guestName", { length: 255 }),
  /** FK to podcast_guests.id (nullable). */
  guestId: int("guestId"),
  host: mysqlEnum("podcastEpisodeHost", ["Maryam", "Habeeba", "Co-host"])
    .default("Maryam").notNull(),
  phase: mysqlEnum("podcastEpisodePhase", [
    "topic", "research", "script", "booked", "recorded",
    "assembly", "cleaning", "mixing", "qc", "published",
  ]).default("topic").notNull(),
  recordingDate: varchar("recordingDate", { length: 10 }),
  publishDate: varchar("publishDate", { length: 10 }),
  durationTarget: varchar("durationTarget", { length: 40 }),
  notes: text("notes"),
  /** JSON-stringified AssetItem[] — checklist of episode assets. */
  assets: text("assets"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PodcastEpisodeOps = typeof podcastEpisodesOps.$inferSelect;
export type InsertPodcastEpisodeOps = typeof podcastEpisodesOps.$inferInsert;

/** Podcast guests — guest roster + prep status. */
export const podcastGuests = mysqlTable("podcast_guests", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  preferredName: varchar("preferredName", { length: 255 }),
  title: varchar("title", { length: 255 }),
  company: varchar("company", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  bio: text("bio"),
  headshotUrl: varchar("headshotUrl", { length: 1024 }),
  expertise: text("expertise"),
  talkingPoints: text("talkingPoints"),
  avoidTopics: text("avoidTopics"),
  availability: varchar("availability", { length: 255 }),
  timezone: varchar("timezone", { length: 60 }),
  recordingPreference: mysqlEnum("podcastGuestRecPref", ["Remote", "In-Person"])
    .default("Remote").notNull(),
  micSetup: varchar("micSetup", { length: 255 }),
  briefSent: boolean("briefSent").default(false).notNull(),
  techCheckDone: boolean("techCheckDone").default(false).notNull(),
  formReceived: boolean("formReceived").default(false).notNull(),
  episodeTitle: varchar("episodeTitle", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PodcastGuest = typeof podcastGuests.$inferSelect;
export type InsertPodcastGuest = typeof podcastGuests.$inferInsert;

/** Podcast publishing — release calendar + platform verification. */
export const podcastPublishing = mysqlTable("podcast_publishing", {
  id: int("id").autoincrement().primaryKey(),
  /** FK to podcast_episodes_ops.id (nullable — freeform entries allowed). */
  episodeId: int("episodeId"),
  epLabel: varchar("epLabel", { length: 255 }).notNull(),
  /** FK to podcast_shows.id (nullable). */
  showId: int("showId"),
  scheduledDate: varchar("scheduledDate", { length: 10 }).notNull(),
  apple: boolean("apple").default(false).notNull(),
  spotify: boolean("spotify").default(false).notNull(),
  google: boolean("google").default(false).notNull(),
  amazon: boolean("amazon").default(false).notNull(),
  audiogramReady: boolean("audiogramReady").default(false).notNull(),
  quoteCardsReady: boolean("quoteCardsReady").default(false).notNull(),
  socialPostScheduled: boolean("socialPostScheduled").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PodcastPublishing = typeof podcastPublishing.$inferSelect;
export type InsertPodcastPublishing = typeof podcastPublishing.$inferInsert;

/** Podcast analytics — per-episode 7-day / 30-day download tracking. */
export const podcastAnalytics = mysqlTable("podcast_analytics", {
  id: int("id").autoincrement().primaryKey(),
  /** FK to podcast_episodes_ops.id (nullable). */
  episodeId: int("episodeId"),
  epLabel: varchar("epLabel", { length: 255 }).notNull(),
  publishedOn: varchar("publishedOn", { length: 10 }).notNull(),
  downloads7d: int("downloads7d").default(0).notNull(),
  downloads30d: int("downloads30d").default(0),
  topPlatform: varchar("topPlatform", { length: 60 }),
  completionPct: int("completionPct"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PodcastAnalytics = typeof podcastAnalytics.$inferSelect;
export type InsertPodcastAnalytics = typeof podcastAnalytics.$inferInsert;

/** Podcast equipment — mics, interfaces, headphones, software inventory. */
export const podcastEquipment = mysqlTable("podcast_equipment", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("podcastEquipmentCategory", [
    "Microphone", "Interface", "Headphones", "Software", "Other",
  ]).default("Microphone").notNull(),
  brand: varchar("brand", { length: 255 }),
  assignedTo: varchar("assignedTo", { length: 120 }),
  condition: mysqlEnum("podcastEquipmentCondition", [
    "Good", "Needs Repair", "Retired",
  ]).default("Good").notNull(),
  location: varchar("location", { length: 255 }),
  serial: varchar("serial", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PodcastEquipment = typeof podcastEquipment.$inferSelect;
export type InsertPodcastEquipment = typeof podcastEquipment.$inferInsert;

/* ══════════════════════════════════════════════════════════════════════════════
 * MEDIALY OPS PORTAL — Hikma (Lead) + Ahmad (Content) + Salis (Video)
 * Migrated from localStorage (opsStore "medialy" portal) to real DB.
 * Source shapes mirror client/src/pages/MedialyOpsPortal.tsx.
 *
 * Note: a separate `clients` table (line ~108) serves the CRM/lead pipeline —
 * it is intentionally distinct from `medialy_clients`. The latter is the
 * retainer record (tier, monthly fee, posts quota, satisfaction). A separate
 * `socialPlatformStats` table also exists; `medialy_performance` is
 * client-scoped weekly/monthly entries and is kept separate.
 *
 * Two server-generated ref formats:
 *   - medialy_approvals.ref → CNT-NNN
 *   - medialy_tasks.ref     → TSK-NNN
 *
 * Multi-value JSON columns (stringified text):
 *   - medialy_clients.platforms → Platform[]
 *   - medialy_performance.platformBreakdown → already string label, not JSON
 * ══════════════════════════════════════════════════════════════════════════════ */

/** Medialy retainer clients — tier-based monthly fee + posts quota. */
export const medialyClients = mysqlTable("medialy_clients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 255 }),
  tier: mysqlEnum("medialyClientTier", [
    "Setup", "Manage", "Accelerate", "Authority",
  ]).default("Manage").notNull(),
  monthlyFee: int("monthlyFee").default(0).notNull(),
  /** JSON-stringified Platform[] (Instagram | TikTok | Facebook | LinkedIn | Twitter | YouTube). */
  platforms: text("platforms"),
  postsPerMonth: int("postsPerMonth").default(0).notNull(),
  postsRemaining: int("postsRemaining").default(0).notNull(),
  paymentStatus: mysqlEnum("medialyClientPayStatus", [
    "Paid", "Due", "Overdue",
  ]).default("Paid").notNull(),
  nextPaymentDue: varchar("nextPaymentDue", { length: 10 }),
  satisfaction: int("satisfaction").default(5).notNull(),
  startedAt: varchar("startedAt", { length: 10 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MedialyClient = typeof medialyClients.$inferSelect;
export type InsertMedialyClient = typeof medialyClients.$inferInsert;

/** Medialy content calendar — every post per client, drafting → posted. */
export const medialyContent = mysqlTable("medialy_content", {
  id: int("id").autoincrement().primaryKey(),
  /** FK to medialy_clients.id (no formal constraint). */
  clientId: int("clientId").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  platform: mysqlEnum("medialyContentPlatform", [
    "Instagram", "TikTok", "Facebook", "LinkedIn", "Twitter", "YouTube",
  ]).default("Instagram").notNull(),
  postType: mysqlEnum("medialyContentType", [
    "Feed", "Reel", "Story", "Carousel", "Flyer", "Video",
  ]).default("Feed").notNull(),
  caption: text("caption"),
  hashtags: text("hashtags"),
  assetLink: varchar("assetLink", { length: 1024 }),
  status: mysqlEnum("medialyContentStatus", [
    "Draft", "Review", "Approved", "Scheduled", "Posted",
  ]).default("Draft").notNull(),
  postTime: varchar("postTime", { length: 10 }),
  assignee: mysqlEnum("medialyContentAssignee", [
    "Hikma", "Ahmad", "Salis",
  ]).default("Ahmad").notNull(),
  likes: int("likes"),
  comments: int("comments"),
  shares: int("shares"),
  engagementPct: int("engagementPct"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MedialyContent = typeof medialyContent.$inferSelect;
export type InsertMedialyContent = typeof medialyContent.$inferInsert;

/** Medialy approvals — CNT-NNN ref, Friday-submit / Weekend-approve loop. */
export const medialyApprovals = mysqlTable("medialy_approvals", {
  id: int("id").autoincrement().primaryKey(),
  /** Server-generated, e.g. "CNT-001". */
  ref: varchar("ref", { length: 20 }).notNull().unique(),
  /** FK to medialy_clients.id. */
  clientId: int("clientId").notNull(),
  /** Snapshot of client name at submission time. */
  clientName: varchar("clientName", { length: 255 }).notNull(),
  weekLabel: varchar("weekLabel", { length: 80 }).notNull(),
  itemCount: int("itemCount").default(0).notNull(),
  previewLink: varchar("previewLink", { length: 1024 }),
  submittedAt: varchar("submittedAt", { length: 10 }),
  feedback: text("feedback"),
  revisionCount: int("revisionCount").default(0).notNull(),
  approvedAt: varchar("approvedAt", { length: 10 }),
  status: mysqlEnum("medialyApprovalStatus", [
    "Pending", "Changes Requested", "Approved", "Rejected",
  ]).default("Pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MedialyApproval = typeof medialyApprovals.$inferSelect;
export type InsertMedialyApproval = typeof medialyApprovals.$inferInsert;

/** Medialy tasks — TSK-NNN ref for the 3-person team. */
export const medialyTasks = mysqlTable("medialy_tasks", {
  id: int("id").autoincrement().primaryKey(),
  /** Server-generated, e.g. "TSK-001". */
  ref: varchar("ref", { length: 20 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  taskType: mysqlEnum("medialyTaskType", [
    "Content Creation", "Photography", "Reporting", "Meeting", "Editing", "Admin",
  ]).default("Content Creation").notNull(),
  /** FK to medialy_clients.id (nullable — internal tasks have no client). */
  clientId: int("clientId"),
  /** Free-form varchar (not a strict enum) so future hires don't break the schema. */
  assignee: varchar("assignee", { length: 120 }).notNull(),
  dueDate: varchar("dueDate", { length: 10 }).notNull(),
  status: mysqlEnum("medialyTaskStatus", [
    "Not Started", "In Progress", "Done", "Blocked",
  ]).default("Not Started").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MedialyTask = typeof medialyTasks.$inferSelect;
export type InsertMedialyTask = typeof medialyTasks.$inferInsert;

/** Medialy performance — weekly + monthly metrics per client. */
export const medialyPerformance = mysqlTable("medialy_performance", {
  id: int("id").autoincrement().primaryKey(),
  /** FK to medialy_clients.id. */
  clientId: int("clientId").notNull(),
  period: mysqlEnum("medialyPerfPeriod", ["Week", "Month"])
    .default("Week").notNull(),
  /** e.g. "2026-W17" or "April 2026". */
  label: varchar("label", { length: 80 }).notNull(),
  reach: int("reach").default(0).notNull(),
  engagement: int("engagement").default(0).notNull(),
  /** Float-as-int: caller may multiply by 10; store as int for simplicity. */
  followerGrowthPct: int("followerGrowthPct").default(0).notNull(),
  bestPost: varchar("bestPost", { length: 1024 }),
  worstPost: varchar("worstPost", { length: 1024 }),
  /** Free-form string in source ("IG 60% · TikTok 30%"); kept as text. */
  platformBreakdown: text("platformBreakdown"),
  bestContentType: mysqlEnum("medialyPerfBestType", [
    "Feed", "Reel", "Story", "Carousel", "Flyer", "Video",
  ]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MedialyPerformance = typeof medialyPerformance.$inferSelect;
export type InsertMedialyPerformance = typeof medialyPerformance.$inferInsert;

/** Medialy comms log — touchpoints per client. */
export const medialyComms = mysqlTable("medialy_comms", {
  id: int("id").autoincrement().primaryKey(),
  /** FK to medialy_clients.id. */
  clientId: int("clientId").notNull(),
  whenDate: varchar("whenDate", { length: 10 }).notNull(),
  commType: mysqlEnum("medialyCommType", [
    "WhatsApp", "Video Call", "Email", "Phone", "In Person",
  ]).default("WhatsApp").notNull(),
  summary: text("summary").notNull(),
  followUpOn: varchar("followUpOn", { length: 10 }),
  owner: mysqlEnum("medialyCommOwner", ["Hikma", "Ahmad", "Salis"])
    .default("Hikma").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MedialyComms = typeof medialyComms.$inferSelect;
export type InsertMedialyComms = typeof medialyComms.$inferInsert;

/** Medialy reports — saved weekly CSO summaries. */
export const medialyReports = mysqlTable("medialy_reports", {
  id: int("id").autoincrement().primaryKey(),
  label: varchar("label", { length: 255 }).notNull(),
  weekOf: varchar("weekOf", { length: 10 }).notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MedialyReport = typeof medialyReports.$inferSelect;
export type InsertMedialyReport = typeof medialyReports.$inferInsert;

