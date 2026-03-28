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
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  passwordSalt: varchar("passwordSalt", { length: 128 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  hamzuryRole: mysqlEnum("staffHamzuryRole", ["founder","ceo","cso","finance","hr","bizdev","bizdev_staff","media","skills_staff","systemise_head","tech_lead","compliance_staff","security_staff","department_staff"]).notNull(),
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
  service: varchar("service", { length: 100 }).notNull(),
  context: text("context"),
  /** Source: chat, referral, walk-in, bizdev */
  source: varchar("source", { length: 50 }).default("chat"),
  status: mysqlEnum("leadStatus", ["new", "contacted", "converted", "archived"]).default("new").notNull(),
  /** CSO lead score 0-10 based on discovery checklist signals */
  leadScore: int("lead_score").default(0),
  /** CSO assignment fields */
  assignedDepartment: varchar("assignedDepartment", { length: 50 }),
  assignedBy: int("assignedBy"),
  assignedAt: timestamp("assignedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

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
  service: varchar("service", { length: 100 }).notNull(),
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
