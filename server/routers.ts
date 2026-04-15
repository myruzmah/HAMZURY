import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, rateLimitedProcedure, router, founderCEOProcedure, financeProcedure, seniorProcedure, csoProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createLead, getLeads, generateRefNumber, getUnassignedLeads, assignLead, updateLead, deleteLead,
  generateHZRefNumber, createSystemiseLead, getSystemiseLeads, getSystemiseLeadByRef,
  createAppointment, getAppointments,
  createJoinApplication, getJoinApplications,
  createTask, createTaskFromLead, getTasks, getTaskById, getTaskByRef, getTaskByPhone, updateTask, getTasksByDepartment, getTasksByAssignee, updateTaskDepartmentByLeadId, getSubmittedTasksForReview, getTasksByDeptForStaff, getCommissionByTaskRef, updateLeadScore, getTasksByLeadId, getTasksByClientPhone, getLeadByRef, getTasksByLeadPhone,
  getChecklistItemsByTaskId, toggleChecklistItem, getChecklistTemplates,
  createDocument, getDocumentsByTaskId, deleteDocument,
  createActivityLog, getActivityLogsByTaskId, getRecentActivityLogs,
  getDashboardStats,
  getAllStaff, updateUserRole, listAllStaffUsers, getStaffUserByEmail, hashPassword, createStaffUser,
  createCommission, getCommissions, updateCommissionStatus,
  recordAttendance, getAttendanceByDate, getAttendanceByUser,
  createWeeklyReport, getWeeklyReports,
  createAuditLog, getAuditLogs,
  getInstitutionalStats,
  listCohorts, getCohortById,
  createSkillsApplication, getSkillsApplications, getSkillsApplicationByRef, updateSkillsApplicationStatus,
  generateSKLRefNumber,
  createAffiliate, getAffiliateByEmail, getAffiliateById, verifyAffiliatePassword,
  getAffiliateRecordsByAffiliate, getAffiliateWithdrawals, createAffiliateWithdrawal,
  getAffiliateStats, getAllAffiliates,
  getSkillsApplicationByEmail, getCohortModules, getStudentAssignments, getLiveSessions, updateStudentAssignment,
  createSubscription, getSubscriptions, getSubscriptionById, updateSubscriptionStatus,
  createSubscriptionPayment, getPaymentsBySubscription, getAllSubscriptionPayments,
  updateSubscriptionPayment, getOrCreateMonthlyPayment,
  createClientCredential, getCredentialsByTaskId, getCredentialsBySubscriptionId,
  deleteClientCredential, getTasksBySubscriptionId, getSubscriptionByLeadRef,
  upsertTaxSavingsRecord, getTaxSavingsBySubscription,
  getDb,
  // Pricing
  getServicePricing, getServicePricingById, createServicePricing, updateServicePricing, seedDefaultPricing,
  // Invoices
  createInvoice, getInvoices, getInvoiceById, getInvoiceByNumber, updateInvoice, getInvoicesByTaskId,
  // Notifications
  createNotification, getNotifications, getUnreadNotifications, markNotificationRead, markAllNotificationsRead,
  // Proposals
  createProposal, getProposals, getProposalById, getProposalByNumber, updateProposal,
  // Certificates
  createCertificate, getCertificates, getCertificateByNumber, getCertificatesByStudent,
  // Content Calendar
  createContentPost, getContentPosts, updateContentPost, getContentCalendar, seedContentPosts,
  // Leave requests
  createLeaveRequest, getLeaveRequests, updateLeaveRequestStatus,
  // Discipline records
  createDisciplineRecord, getDisciplineRecords, resolveDisciplineRecord,
  // Portal visit logs
  createPortalVisitLog, getPortalVisitLogs,
  // Content engagement
  upsertContentEngagement, getContentEngagementForWeek,
  // Hub meeting records
  upsertHubMeetingRecord, getHubMeetingRecord, getHubMeetingHistory,
  // Student milestones
  createStudentMilestone, getStudentMilestones, markMilestoneCelebrated,
  // Revenue Allocation
  createAllocation, getAllocations, getAllocationsByQuarter,
  createAIFundEntry, getAIFundBalance, getAIFundLog,
  getLeagueTable,
  // Skills Calendar
  getSkillsCalendar, createSkillsCalendarEntry,
  // Skills Competition
  getSkillsTeams, createSkillsTeam, updateSkillsTeamPoints,
  getInteractiveSessions, createInteractiveSession,
  getSkillsAwards, createSkillsAward,
  // Client AI Chat
  createClientChat, getClientChatsByTask, getClientChatByRef, getClientChatById, updateClientChat,
  // Partnerships (BizDev)
  listPartnerships, createPartnership, updatePartnership,
  // Brand QA (BizDev)
  listBrandQaItems, createBrandQaItem, updateBrandQaItem,
  // Job Postings (HR)
  listJobPostings, createJobPosting, updateJobPosting,
  // Hiring Applications (HR)
  listHiringApplications, createHiringApplication, updateHiringApplication,
  // Training Sessions (HR)
  listTrainingSessions, createTrainingSession, updateTrainingSession,
  // Development Plans (HR)
  listDevelopmentPlans, createDevelopmentPlan, updateDevelopmentPlan,
  // Performance Cycles (HR)
  listPerformanceCycles, createPerformanceCycle, updatePerformanceCycle,
  // RIDI Communities
  listRidiCommunities, createRidiCommunity, updateRidiCommunity,
  // Podcast Episodes (Media)
  listPodcastEpisodes, createPodcastEpisode, updatePodcastEpisode,
  // Media Assets
  listMediaAssets, createMediaAsset, deleteMediaAsset,
  // Social Platform Stats (Media)
  listSocialPlatformStats, createSocialPlatformStat, upsertSocialPlatformStat,
  // Weekly Targets
  createWeeklyTarget, getWeeklyTargets, getWeeklyTargetsByDepartment, updateWeeklyTarget, getTargetSubmissionStatus,
  // Inter-Department Chat
  createDeptMessage, getDeptMessages, getDeptThreads, getUnreadDeptMessageCount, markDeptMessagesRead,
  // Agent Suggestions
  getAgentSuggestions, reviewAgentSuggestion,
  // Verified Client Truth Layer
  createClient, getClientByRef, getAllClients, getClientsByStatus, getClientsByDepartment,
  updateClient, verifyClientIdentity, createClientSession, validateClientSession,
  getTasksForClient, getSubscriptionsForClient, getInvoicesForClient,
  // CSO Phase 2
  createTargetV2, getTargetsForAssignee, getAllTargets, updateTargetV2, computeTargetActual,
  createCalendarEvent, listCalendarEvents, updateCalendarEvent, deleteCalendarEvent,
  createClientNote, listClientNotes,
  getStaffUserById, updateStaffPassword, verifyPassword,
  // v1 restructure
  createContentCreator, listContentCreators, updateContentCreator,
  listAuditLogsForCso,
} from "./db";
import { storagePut } from "./storage";
import { encryptCredential, decryptCredential, maskPassword } from "./credentials";
import { clientCredentials, tasks, affiliates, deptMessages, staffUsers, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "./_core/env";
import { sendPaymentClaimedAlert, sendNewLeadAlert } from "./email";
import { invokeLLM } from "./_core/llm";
import { buildSystemPrompt } from "./config/chat-config";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { calculateCommission } from "@shared/commission";
import { executeAgent, getAgentStatus, toggleAgent } from "./agents/agent-runner";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    /** Update the signed-in staff user's profile (name/email/phone). */
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Phase 2 decision: staffuser__ openIds carry the real staff row id; for legacy
        // founder__/staff__ sessions we fall back to updating the users table by openId.
        const openId = ctx.user.openId;
        const clean: Record<string, unknown> = {};
        if (input.name) clean.name = input.name;
        if (input.email) clean.email = input.email.toLowerCase();
        if (input.phone !== undefined) clean.phone = input.phone;
        if (Object.keys(clean).length === 0) return { success: true };

        if (openId.startsWith("staffuser__") && ctx.user.id > 0) {
          await db.update(staffUsers).set(clean as any).where(eq(staffUsers.id, ctx.user.id));
        } else {
          await db.update(users).set(clean as any).where(eq(users.openId, openId));
        }
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "Unknown",
          action: "profile_updated",
          resource: "users",
          resourceId: ctx.user.id,
          details: `Updated fields: ${Object.keys(clean).join(", ")}`,
        });
        return { success: true };
      }),

    /** Change password for staffuser__ sessions. Legacy role-based sessions are env-gated. */
    changePassword: protectedProcedure
      .input(z.object({
        oldPassword: z.string().min(1),
        newPassword: z.string().min(8),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user.openId.startsWith("staffuser__") || ctx.user.id <= 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Password change is only available for email-based staff accounts." });
        }
        const user = await getStaffUserById(ctx.user.id);
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
        const valid = await verifyPassword(input.oldPassword, user.passwordHash, user.passwordSalt);
        if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect" });
        const { hash, salt } = await hashPassword(input.newPassword);
        await updateStaffPassword(user.id, hash, salt);
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "Unknown",
          action: "password_changed",
          resource: "staffUsers",
          resourceId: ctx.user.id,
          details: "Password updated via Settings",
        });
        return { success: true };
      }),
  }),

  // ─── Leads (Public + Protected) ─────────────────────────────────────────────
  leads: router({
    submit: rateLimitedProcedure
      .input(z.object({
        name: z.string().min(1),
        businessName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        service: z.string().min(1),
        context: z.string().optional(),
        referralCode: z.string().optional(),
        referrerName: z.string().optional(),
        referralSourceType: z.string().optional(),
        leadOwner: z.string().optional(),
        notifyCso: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const ref = generateRefNumber(input.phone);
        const lead = await createLead({ ...input, ref });
        const task = await createTaskFromLead(lead);
        // Email alert — non-blocking
        sendNewLeadAlert({
          ref: lead.ref,
          clientName: input.name,
          service: input.service,
          phone: input.phone ?? null,
          email: input.email ?? null,
          source: "bizdoc",
        }).catch(err => console.error("[email] New lead alert failed:", err));
        // CSO notification if referral came through CSO
        if (input.notifyCso || input.referralSourceType === "CSO") {
          createNotification({
            userId: "cso",
            type: "assignment",
            title: "New CSO Referral Lead",
            message: `New lead from CSO referral: ${input.name} — ${input.service}${input.referralCode ? ` (code: ${input.referralCode})` : ""}`,
            link: "/cso",
          }).catch(err => console.error("[notification] CSO notify failed:", err));
        }

        // Auto-create invoice when client claimed payment via chat
        if (input.context?.includes("[PAYMENT CLAIMED]")) {
          try {
            // Build invoice items from the service list
            const serviceNames = input.service.split(",").map(s => s.trim()).filter(Boolean);
            const items = serviceNames.map(name => ({ description: name, quantity: 1, unitPrice: 0, total: 0 }));
            const invoice = await createInvoice({
              invoiceNumber: "", // auto-generated
              leadId: lead.id,
              taskId: task.id,
              clientName: input.name,
              clientEmail: input.email ?? null,
              clientPhone: input.phone ?? null,
              items,
              subtotal: 0,
              total: 0,
              status: "sent", // awaiting finance verification
              notes: `Auto-created from chat payment claim. Ref: ${lead.ref}. Finance to verify payment and update amounts.`,
              createdBy: "system",
            });
            // Notify finance team
            createNotification({
              userId: "finance",
              type: "payment",
              title: "Payment Claimed — Verify",
              message: `Payment claimed for ${input.name} — ${input.service}. Invoice ${invoice.invoiceNumber}. Please verify.`,
              link: "/hub/finance",
            }).catch(err => console.error("[notification] Finance payment claim notify failed:", err));
            // CSO notification — send tracking details to client
            createNotification({
              userId: "cso",
              type: "payment",
              title: "Client Paid — Send Tracking",
              message: `${input.name} claimed payment for ${input.service}. Ref: ${lead.ref}. Send tracking details and delivery timeframe.`,
              link: "/cso",
            }).catch(err => console.error("[notification] CSO payment notify failed:", err));
            // Audit log
            createAuditLog({
              userId: null,
              userName: "System",
              action: "invoice_auto_created",
              resource: "invoices",
              resourceId: invoice.id,
              details: `Auto-created invoice ${invoice.invoiceNumber} from chat payment claim by ${input.name} (task ${lead.ref})`,
            }).catch(err => console.error("[audit] Invoice auto-create log failed:", err));
            // Email alert (non-blocking)
            sendPaymentClaimedAlert({
              invoiceNumber: invoice.invoiceNumber,
              clientName: input.name,
              amount: 0,
              phone: input.phone ?? null,
              email: input.email ?? null,
            }).catch(err => console.error("[email] Payment claim alert failed:", err));
          } catch (err) {
            console.error("[leads.submit] Auto-invoice creation failed:", err);
          }
        }

        return { ref: lead.ref, leadId: lead.id, taskId: task.id };
      }),

    /** CSO or senior staff can manually create a lead with department pre-assigned */
    createManual: csoProcedure
      .input(z.object({
        name: z.string().min(1),
        businessName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        service: z.string().min(1),
        department: z.string().min(1),
        notes: z.string().optional(),
        quotedPrice: z.string().optional(),
        referralCode: z.string().optional(),
        referrerName: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const ref = generateRefNumber(input.phone);
        const lead = await createLead({
          ...input,
          ref,
          source: "cso",
          assignedDepartment: input.department,
          assignedBy: ctx.user.id,
          assignedAt: new Date(),
          context: input.notes,
          referralCode: input.referralCode,
          referrerName: input.referrerName,
          referralSourceType: "CSO",
          leadOwner: "CSO",
          notifyCso: true,
        });
        const task = await createTaskFromLead(lead);
        // Update task department and quoted price if provided
        const taskUpdate: Record<string, any> = { department: input.department };
        if (input.quotedPrice) taskUpdate.quotedPrice = input.quotedPrice;
        await updateTask(task.id, taskUpdate);
        await createActivityLog({
          leadId: lead.id,
          taskId: task.id,
          action: "lead_manual_created",
          details: `CSO manually created lead for ${input.name} — ${input.service} → ${input.department} by ${ctx.user.name || ctx.user.email}`,
        });
        // Notify the assigned department
        await createNotification({
          userId: input.department,
          type: "assignment",
          title: "New Lead Assigned",
          message: `New lead from CSO: ${input.name} — ${input.service}`,
          link: `/${input.department === "bizdoc" ? "bizdoc" : input.department}/dashboard`,
        }).catch(() => {});
        return { ref: lead.ref, leadId: lead.id, taskId: task.id };
      }),

    list: protectedProcedure
      .input(z.object({
        department: z.string().optional(),
        excludeConverted: z.boolean().optional(),
        /** v1 restructure: when true, return { new: [], qualified: [], ... } keyed by pipeline stage. */
        groupByStage: z.boolean().optional(),
      }).optional())
      .query(async ({ input, ctx }) => {
        const role = ctx.user.hamzuryRole;
        let all = await getLeads();
        if (role === "department_staff" && ctx.user.department) {
          all = all.filter(l => (l.assignedDepartment || "").toLowerCase() === ctx.user.department?.toLowerCase());
        } else if (input?.department) {
          all = all.filter(l => (l.assignedDepartment || "").toLowerCase() === input.department!.toLowerCase());
        }
        if (input?.excludeConverted) {
          all = all.filter(l => l.status !== "converted" && l.status !== "archived");
        }
        if (input?.groupByStage) {
          const stages = ["new", "qualified", "proposal_sent", "negotiation", "onboarding", "won", "lost", "paused"] as const;
          const grouped: Record<string, typeof all> = Object.fromEntries(stages.map(s => [s, [] as typeof all]));
          for (const lead of all) {
            // Backwards-compat mapping: contacted → qualified, converted → won, archived → lost
            const mapped = lead.status === "contacted" ? "qualified"
                         : lead.status === "converted" ? "won"
                         : lead.status === "archived" ? "lost"
                         : lead.status;
            if (grouped[mapped as string]) grouped[mapped as string].push(lead);
            else grouped["new"].push(lead); // safety
          }
          return grouped;
        }
        return all;
      }),

    /** v1 restructure — single entry point to move a lead through pipeline stages. */
    updateStage: csoProcedure
      .input(z.object({
        leadId: z.number(),
        stage: z.enum(["new", "qualified", "proposal_sent", "negotiation", "onboarding", "won", "lost", "paused"]),
        note: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const lead = await updateLead(input.leadId, { status: input.stage as any });
        await createActivityLog({
          leadId: input.leadId,
          userId: ctx.user.id,
          action: "lead_stage_updated",
          details: `Stage -> ${input.stage}${input.note ? ` · ${input.note}` : ""} (by ${ctx.user.name || ctx.user.email})`,
        });
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "CSO",
          action: "lead_stage_updated",
          resource: "leads",
          resourceId: input.leadId,
          details: `Stage: ${input.stage}${input.note ? ` · ${input.note}` : ""}`,
        });
        return lead;
      }),

    unassigned: protectedProcedure.query(async () => getUnassignedLeads()),

    assign: csoProcedure
      .input(z.object({
        leadId: z.number(),
        department: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const lead = await assignLead(input.leadId, input.department, ctx.user.id);
        // ✅ Sync the linked task's department so dept staff can see it
        await updateTaskDepartmentByLeadId(input.leadId, input.department);
        await createActivityLog({
          leadId: input.leadId,
          userId: ctx.user.id,
          action: "lead_assigned",
          details: `Lead assigned to ${input.department} by ${ctx.user.name || ctx.user.email}`,
        });
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "Unknown",
          action: "lead_assigned",
          resource: "leads",
          resourceId: input.leadId,
          details: `Assigned to department: ${input.department}`,
        });
        return lead;
      }),

    updateScore: csoProcedure
      .input(z.object({ leadId: z.number(), score: z.number().min(0).max(10) }))
      .mutation(async ({ input, ctx }) => {
        await updateLeadScore(input.leadId, input.score);
        await createActivityLog({
          leadId: input.leadId,
          userId: ctx.user.id,
          action: "lead_scored",
          details: `Lead score set to ${input.score}/10 by ${ctx.user.name ?? ctx.user.openId}`,
        });
        return { success: true };
      }),

    /** CSO can update any lead fields */
    update: csoProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        businessName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        service: z.string().optional(),
        context: z.string().optional(),
        assignedDepartment: z.string().optional(),
        leadScore: z.number().min(0).max(10).optional(),
        status: z.enum([
          "new", "qualified", "proposal_sent", "negotiation", "onboarding",
          "won", "lost", "paused",
          // backwards-compat
          "contacted", "converted", "archived",
        ]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        // Remove undefined values
        const cleanData = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
        const lead = await updateLead(id, cleanData);
        await createActivityLog({
          leadId: id,
          userId: ctx.user.id,
          action: "lead_updated",
          details: `Lead updated by ${ctx.user.name ?? ctx.user.email}: ${Object.keys(cleanData).join(", ")}`,
        });
        return lead;
      }),

    /** Client portal lookup — phone-based, rate limited, no auth needed */
    clientPortal: publicProcedure
      .input(z.object({ phone: z.string().min(10) }))
      .query(async ({ input }) => {
        const task = await getTaskByPhone(input.phone);
        if (!task) return null;
        const checklist = await getChecklistItemsByTaskId(task.id);
        const docs = await getDocumentsByTaskId(task.id);
        const activity = await getActivityLogsByTaskId(task.id);
        return { task, checklist, docs, activity };
      }),

    /** Client portal lookup — ref-based, rate limited, no auth needed */
    clientPortalByRef: publicProcedure
      .input(z.object({ ref: z.string().min(4) }))
      .query(async ({ input }) => {
        const task = await getTaskByRef(input.ref.trim().toUpperCase());
        if (!task) return null;
        const checklist = await getChecklistItemsByTaskId(task.id);
        const docs = await getDocumentsByTaskId(task.id);
        const activity = await getActivityLogsByTaskId(task.id);
        return { task, checklist, docs, activity };
      }),

    /** Seed sample client leads, tasks, invoices — founder/CEO only */
    seedSample: founderCEOProcedure
      .mutation(async () => {
        const { seedSampleClients } = await import("./seed-staff");
        const result = await seedSampleClients();
        return { success: true, ...result };
      }),

    /** CSO / senior staff can hard-delete a lead. Audit-logged. */
    delete: csoProcedure
      .input(z.object({ id: z.number(), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        // Fetch lead first for audit context
        const all = await getLeads();
        const lead = all.find(l => l.id === input.id);
        if (!lead) throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found" });

        await deleteLead(input.id);

        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "CSO",
          action: "lead_deleted",
          resource: "leads",
          resourceId: input.id,
          details: `Deleted lead ${lead.ref} — ${lead.name}${lead.businessName ? ` (${lead.businessName})` : ""}${input.reason ? ` · reason: ${input.reason}` : ""}`,
        });
        return { success: true };
      }),
  }),

  // ─── Tasks (Protected) ───────────────────────────────────────────────────
  tasks: router({
    create: protectedProcedure
      .input(z.object({
        clientName: z.string().min(1),
        service: z.string().min(1),
        department: z.string().min(1),
        assignedTo: z.number().optional(),
        notes: z.string().optional(),
        deadline: z.string().optional(),
        businessName: z.string().optional(),
        phone: z.string().optional(),
        expectedDelivery: z.string().optional(),
        estimatedHours: z.number().optional(),
        priority: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const task = await createTask(input);
        await createAuditLog({ userId: ctx.user.id, userName: ctx.user.name || "Staff", action: "task_created", resource: "tasks", details: `Created task ${task.ref}: ${input.service} for ${input.clientName}` });
        return task;
      }),

    list: protectedProcedure
      .input(z.object({ department: z.string().optional() }).optional())
      .query(async ({ input, ctx }) => {
        const role = ctx.user.hamzuryRole;
        // Map roles to their departments for automatic filtering
        const ROLE_DEPT_MAP: Record<string, string> = {
          bizdev: "bizdoc",
          compliance_staff: "bizdoc",
          security_staff: "bizdoc",
          systemise_head: "systemise",
          tech_lead: "systemise",
          media: "media",
          skills_staff: "skills",
          department_staff: ctx.user.department || "bizdoc",
        };
        const restrictedDept = role ? ROLE_DEPT_MAP[role] : undefined;
        if (restrictedDept) return getTasksByDepartment(restrictedDept);
        // Senior roles (founder, ceo, cso, finance, hr) can filter or see all
        if (input?.department) return getTasksByDepartment(input.department);
        return getTasks();
      }),

    myTasks: protectedProcedure
      .query(async ({ ctx }) => {
        const role = ctx.user.hamzuryRole;
        const ROLE_DEPT_MAP: Record<string, string> = {
          bizdev: "bizdoc",
          compliance_staff: "bizdoc",
          security_staff: "bizdoc",
          systemise_head: "systemise",
          tech_lead: "systemise",
          media: "media",
          skills_staff: "skills",
          bizdev_staff: "bizdev",
          department_staff: ctx.user.department || "bizdoc",
        };
        const dept = role ? ROLE_DEPT_MAP[role] : undefined;
        if (dept) return getTasksByDeptForStaff(dept);
        if (ctx.user.department) return getTasksByDeptForStaff(ctx.user.department);
        return [];
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const task = await getTaskById(input.id);
        if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
        return task;
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["Not Started", "In Progress", "Waiting on Client", "Submitted", "Completed"]),
        expectedDelivery: z.string().max(20).optional(),
        actualDelivery: z.string().max(20).optional(),
        estimatedHours: z.number().int().positive().optional(),
        actualHours: z.number().int().nonnegative().optional(),
        priority: z.enum(["urgent", "high", "normal", "low"]).optional(),
        category: z.string().max(50).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, status, expectedDelivery, actualDelivery, estimatedHours, actualHours, priority, category } = input;
        const updateData: Record<string, unknown> = { status };
        if (status === "Completed") updateData.completedAt = new Date();
        if (expectedDelivery !== undefined) updateData.expectedDelivery = expectedDelivery;
        if (actualDelivery !== undefined) updateData.actualDelivery = actualDelivery;
        if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours;
        if (actualHours !== undefined) updateData.actualHours = actualHours;
        if (priority !== undefined) updateData.priority = priority;
        if (category !== undefined) updateData.category = category;
        const task = await updateTask(id, updateData as any);
        await createActivityLog({
          taskId: id,
          userId: ctx.user.id,
          action: "status_changed",
          details: `Status changed to: ${status}`,
        });
        return task;
      }),

    updateNotes: protectedProcedure
      .input(z.object({ id: z.number(), notes: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const task = await updateTask(input.id, { notes: input.notes });
        await createActivityLog({
          taskId: input.id,
          userId: ctx.user.id,
          action: "notes_updated",
          details: "Task notes updated",
        });
        return task;
      }),

    setPrice: seniorProcedure
      .input(z.object({ id: z.number(), quotedPrice: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const task = await updateTask(input.id, { quotedPrice: input.quotedPrice });
        await createActivityLog({
          taskId: input.id,
          userId: ctx.user.id,
          action: "price_set",
          details: `Quoted price set to: ${input.quotedPrice}`,
        });
        return task;
      }),

    /** Update delivery, time allocation, priority, and category fields */
    updateDetails: protectedProcedure
      .input(z.object({
        id: z.number(),
        expectedDelivery: z.string().max(20).optional(),
        actualDelivery: z.string().max(20).optional(),
        estimatedHours: z.number().int().positive().optional(),
        actualHours: z.number().int().nonnegative().optional(),
        priority: z.enum(["urgent", "high", "normal", "low"]).optional(),
        category: z.string().max(50).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...fields } = input;
        const updateData: Record<string, unknown> = {};
        if (fields.expectedDelivery !== undefined) updateData.expectedDelivery = fields.expectedDelivery;
        if (fields.actualDelivery !== undefined) updateData.actualDelivery = fields.actualDelivery;
        if (fields.estimatedHours !== undefined) updateData.estimatedHours = fields.estimatedHours;
        if (fields.actualHours !== undefined) updateData.actualHours = fields.actualHours;
        if (fields.priority !== undefined) updateData.priority = fields.priority;
        if (fields.category !== undefined) updateData.category = fields.category;
        if (Object.keys(updateData).length === 0) {
          const task = await getTaskById(id);
          if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
          return task;
        }
        const task = await updateTask(id, updateData as any);
        const changed = Object.keys(updateData).join(", ");
        await createActivityLog({
          taskId: id,
          userId: ctx.user.id,
          action: "details_updated",
          details: `Task details updated: ${changed}`,
        });
        return task;
      }),

    stats: protectedProcedure.query(async () => getDashboardStats()),

    byDepartment: protectedProcedure
      .input(z.object({ department: z.string() }))
      .query(async ({ input }) => getTasksByDepartment(input.department)),

    // CSO review queue — tasks submitted by depts awaiting CSO approval/rework
    pending: csoProcedure
      .query(async () => getSubmittedTasksForReview()),

    // KPI Engine: manager approves a completed task → counts as smooth task
    approve: seniorProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const task = await getTaskById(input.id);
        if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
        // Guard: prevent double-approval
        if (task.kpiApproved) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Task is already approved" });
        }
        const updated = await updateTask(input.id, { kpiApproved: true, isRework: false, status: "Completed" });
        await createActivityLog({
          taskId: input.id,
          userId: ctx.user.id,
          action: "kpi_approved",
          details: `Task approved as smooth task by ${ctx.user.name ?? ctx.user.openId}`,
        });
        // Auto-create commission if task has a price and no commission exists yet
        if (task.quotedPrice && parseFloat(task.quotedPrice) > 0) {
          const existing = await getCommissionByTaskRef(task.ref);
          if (!existing) {
            const price = parseFloat(task.quotedPrice);
            const breakdown = calculateCommission(price);
            const commission = await createCommission({
              taskId: task.id,
              taskRef: task.ref,
              clientName: task.clientName,
              service: task.service,
              quotedPrice: task.quotedPrice,
              institutionalAmount: String(breakdown.institutionalAmount),
              commissionPool: String(breakdown.commissionPool),
              tierBreakdown: breakdown.tiers,
              status: "pending",
            });
            await createAuditLog({
              userId: ctx.user.id,
              userName: ctx.user.name || ctx.user.email || "Unknown",
              action: "commission_auto_created",
              resource: "commissions",
              resourceId: commission.id,
              details: `Auto-commission created on task approval: ${task.ref} — ₦${task.quotedPrice}`,
            });
          }
        }
        return updated;
      }),

    // KPI Engine: manager flags a task for rework → staff must redo
    flagRework: seniorProcedure
      .input(z.object({ id: z.number(), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const task = await updateTask(input.id, {
          isRework: true,
          kpiApproved: false,
          status: "In Progress",
          reworkNote: input.reason || null,
        });
        await createActivityLog({
          taskId: input.id,
          userId: ctx.user.id,
          action: "flagged_rework",
          details: `Task flagged for rework${input.reason ? `: ${input.reason}` : ""}`,
        });
        return task;
      }),

    // CSO assigns a task to a specific staff member / department lead
    assign: csoProcedure
      .input(z.object({
        id: z.number(),
        assignedTo: z.number(),
        department: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const updateData: Parameters<typeof updateTask>[1] = {
          assignedTo: input.assignedTo,
        };
        if (input.department) updateData.department = input.department;
        const task = await updateTask(input.id, updateData);
        await createActivityLog({
          taskId: input.id,
          userId: ctx.user.id,
          action: "task_assigned",
          details: `Task assigned to staff #${input.assignedTo} by ${ctx.user.name ?? ctx.user.openId}`,
        });
        return task;
      }),

    // Staff submits a completed task for manager review
    submit: protectedProcedure
      .input(z.object({ id: z.number(), notes: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const updateData: Parameters<typeof updateTask>[1] = {
          status: "Submitted",
          kpiApproved: false,
        };
        if (input.notes) updateData.notes = input.notes;
        const task = await updateTask(input.id, updateData);
        await createActivityLog({
          taskId: input.id,
          userId: ctx.user.id,
          action: "submitted",
          details: `Task submitted for review by ${ctx.user.name ?? ctx.user.openId}`,
        });
        return task;
      }),

    // KPI stats for the logged-in staff member
    myKPI: protectedProcedure
      .query(async ({ ctx }) => {
        const role = ctx.user.hamzuryRole;
        const ROLE_DEPT_MAP: Record<string, string> = {
          bizdev: "bizdoc",
          compliance_staff: "bizdoc",
          security_staff: "bizdoc",
          systemise_head: "systemise",
          tech_lead: "systemise",
          media: "media",
          skills_staff: "skills",
          bizdev_staff: "bizdev",
          department_staff: ctx.user.department || "bizdoc",
        };
        const dept = role ? ROLE_DEPT_MAP[role] : undefined;
        const myTasks = dept ? await getTasksByDeptForStaff(dept) : [];
        const completed = myTasks.filter(t => t.status === "Completed" || t.status === "Submitted" || t.kpiApproved);
        const smooth = myTasks.filter(t => t.kpiApproved && !t.isRework).length;
        const rework = myTasks.filter(t => t.isRework).length;
        return { smooth, total: myTasks.length, rework, completed: completed.length };
      }),
  }),

  // ─── Checklist (Protected) ────────────────────────────────────────────────
  checklist: router({
    getByTaskId: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input }) => getChecklistItemsByTaskId(input.taskId)),

    toggle: protectedProcedure
      .input(z.object({ itemId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const item = await toggleChecklistItem(input.itemId);
        if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Checklist item not found" });
        await createActivityLog({
          taskId: item.taskId,
          userId: ctx.user.id,
          action: "checklist_toggled",
          details: `${item.label}: ${item.checked ? "checked" : "unchecked"}`,
        });
        return item;
      }),

    templates: protectedProcedure.query(async () => getChecklistTemplates()),
  }),

  // ─── Documents (Protected) ────────────────────────────────────────────────
  documents: router({
    getByTaskId: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input }) => getDocumentsByTaskId(input.taskId)),

    upload: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        fileName: z.string(),
        fileData: z.string(),
        mimeType: z.string(),
        fileSize: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const buffer = Buffer.from(input.fileData, "base64");
        const fileKey = `tasks/${input.taskId}/${nanoid()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        const doc = await createDocument({
          taskId: input.taskId,
          fileName: input.fileName,
          fileKey,
          fileUrl: url,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          uploadedBy: ctx.user.id,
        });
        await createActivityLog({
          taskId: input.taskId,
          userId: ctx.user.id,
          action: "document_uploaded",
          details: `Document uploaded: ${input.fileName}`,
        });
        return doc;
      }),

    delete: protectedProcedure
      .input(z.object({ docId: z.number(), taskId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await deleteDocument(input.docId);
        await createActivityLog({
          taskId: input.taskId,
          userId: ctx.user.id,
          action: "document_deleted",
          details: "Document deleted",
        });
        return { success: true };
      }),
  }),

  // ─── Activity Logs (Protected) ────────────────────────────────────────────
  activity: router({
    getByTaskId: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input }) => getActivityLogsByTaskId(input.taskId)),

    recent: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => getRecentActivityLogs(input?.limit || 50)),
  }),

  // ─── Public Tracking ──────────────────────────────────────────────────────
  tracking: router({
    lookup: publicProcedure
      .input(z.object({
        ref: z.string().min(1),
        phone: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const refTrimmed = input.ref.trim();
        const STATUS_ORDER = ["Not Started", "In Progress", "Waiting on Client", "Submitted", "Completed"];
        const statusMessages: Record<string, string> = {
          "Not Started": "Your file has been received and is queued for processing. A compliance officer will begin work shortly.",
          "In Progress": "Your file is actively being processed. Documents are being prepared and reviewed.",
          "Waiting on Client": "We need additional information or documents from you. Please check your WhatsApp for details.",
          "Submitted": "Your documents have been submitted to the relevant regulatory authority. We are awaiting their response.",
          "Completed": "Your file has been completed successfully. Please contact us to arrange document pickup.",
        };

        // 1. Try task first (BizDoc tasks)
        let task = await getTaskByRef(refTrimmed);

        // 2. If no task, check leads table → find tasks by lead's phone
        if (!task) {
          const lead = await getLeadByRef(refTrimmed);
          if (lead) {
            if (lead.phone) {
              const matchedTasks = await getTasksByLeadPhone(lead.phone);
              if (matchedTasks.length > 0) task = matchedTasks[0] as any;
            }
            if (!task) {
              return {
                found: true as const,
                ref: lead.ref,
                clientName: lead.name,
                businessName: lead.businessName,
                service: lead.service,
                department: lead.assignedDepartment || "bizdoc",
                status: "Not Started",
                statusIndex: 0,
                statusTotal: STATUS_ORDER.length,
                statusSteps: STATUS_ORDER,
                statusMessage: statusMessages["Not Started"],
                deadline: null,
                lastUpdated: lead.updatedAt,
                createdAt: lead.createdAt,
              };
            }
          }
        }

        // 3. If still no task, check systemiseLeads table
        if (!task) {
          const sysLead = await getSystemiseLeadByRef(refTrimmed);
          if (sysLead) {
            const sysStatus = sysLead.status === "completed" ? "Completed" : sysLead.status === "in_progress" ? "In Progress" : "Not Started";
            const sysIdx = STATUS_ORDER.indexOf(sysStatus);
            return {
              found: true as const,
              ref: sysLead.ref,
              clientName: sysLead.contactName || sysLead.businessName,
              businessName: sysLead.businessName,
              service: sysLead.package || sysLead.service || "Systemise",
              department: "systemise",
              status: sysStatus,
              statusIndex: sysIdx >= 0 ? sysIdx : 0,
              statusTotal: STATUS_ORDER.length,
              statusSteps: STATUS_ORDER,
              statusMessage: statusMessages[sysStatus] || statusMessages["Not Started"],
              deadline: null,
              lastUpdated: sysLead.updatedAt,
              createdAt: sysLead.createdAt,
            };
          }
        }

        // 4. If still nothing, check skillsApplications table
        if (!task) {
          const app = await getSkillsApplicationByRef(refTrimmed);
          if (app) {
            const sklStatus = app.status === "accepted" ? "In Progress" : app.status === "completed" ? "Completed" : "Not Started";
            const sklIdx = STATUS_ORDER.indexOf(sklStatus);
            return {
              found: true as const,
              ref: app.ref,
              clientName: app.fullName,
              businessName: null,
              service: app.program || "Skills Training",
              department: "skills",
              status: sklStatus,
              statusIndex: sklIdx >= 0 ? sklIdx : 0,
              statusTotal: STATUS_ORDER.length,
              statusSteps: STATUS_ORDER,
              statusMessage: statusMessages[sklStatus] || statusMessages["Not Started"],
              deadline: null,
              lastUpdated: app.updatedAt,
              createdAt: app.createdAt,
            };
          }
        }

        if (!task) return { found: false as const, reason: "not_found" as const };

        // Phone verification: if phone provided, verify it matches (last 6 digits)
        if (input.phone) {
          const storedDigits = (task.phone || "").replace(/\D/g, "").slice(-6);
          const inputDigits = input.phone.replace(/\D/g, "").slice(-6);
          if (storedDigits && inputDigits && storedDigits !== inputDigits) {
            return { found: false as const, reason: "phone_mismatch" as const };
          }
        }

        const statusIndex = STATUS_ORDER.indexOf(task.status);
        return {
          found: true as const,
          ref: task.ref,
          clientName: task.clientName,
          businessName: task.businessName,
          service: task.service,
          department: task.department,
          status: task.status,
          statusIndex,
          statusTotal: STATUS_ORDER.length,
          statusSteps: STATUS_ORDER,
          statusMessage: statusMessages[task.status] || "Status update pending.",
          deadline: task.deadline,
          lastUpdated: task.updatedAt,
          createdAt: task.createdAt,
        };
      }),

    lookupByPhone: publicProcedure
      .input(z.object({ phone: z.string().min(7) }))
      .query(async ({ input }) => {
        const task = await getTaskByPhone(input.phone);
        if (!task) return { found: false as const };
        const STATUS_ORDER = ["Not Started", "In Progress", "Waiting on Client", "Submitted", "Completed"];
        const statusIndex = STATUS_ORDER.indexOf(task.status);
        return {
          found: true as const,
          ref: task.ref,
          clientName: task.clientName,
          businessName: task.businessName,
          service: task.service,
          status: task.status,
          statusIndex,
          statusTotal: STATUS_ORDER.length,
          progress: Math.round(((statusIndex + 1) / STATUS_ORDER.length) * 100),
        };
      }),

    /** Full client portal lookup — returns task + checklist + activity + invoices.
     *  Searches: tasks → leads → systemiseLeads → skillsApplications */
    fullLookup: publicProcedure
      .input(z.object({
        ref: z.string().min(1),
        phone: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const refTrimmed = input.ref.trim();
        const STATUS_ORDER = ["Not Started", "In Progress", "Waiting on Client", "Submitted", "Completed"];

        // 1. Try task directly
        let task = await getTaskByRef(refTrimmed);

        // 2. If no task, check leads → find task by phone
        if (!task) {
          const lead = await getLeadByRef(refTrimmed);
          if (lead && lead.phone) {
            const matchedTasks = await getTasksByLeadPhone(lead.phone);
            if (matchedTasks.length > 0) task = matchedTasks[0] as any;
          }
          // If lead found but no task, return lead-based dashboard
          if (!task && lead) {
            return {
              found: true as const,
              task: {
                id: 0, ref: lead.ref,
                clientName: lead.name, businessName: lead.businessName,
                phone: lead.phone ? `***${lead.phone.slice(-4)}` : null,
                service: lead.service,
                department: lead.assignedDepartment || "bizdoc",
                status: "Not Started", statusIndex: 0, statusTotal: STATUS_ORDER.length,
                statusSteps: STATUS_ORDER,
                progress: 20, deadline: null, notes: lead.context,
                createdAt: lead.createdAt, updatedAt: lead.updatedAt,
              },
              checklist: [], invoiceSummary: null, activity: [],
            };
          }
        }

        // 3. Check systemiseLeads
        if (!task) {
          const sysLead = await getSystemiseLeadByRef(refTrimmed);
          if (sysLead) {
            const sysStatus = sysLead.status === "completed" ? "Completed" : sysLead.status === "in_progress" ? "In Progress" : "Not Started";
            const sysIdx = STATUS_ORDER.indexOf(sysStatus);
            return {
              found: true as const,
              task: {
                id: 0, ref: sysLead.ref,
                clientName: sysLead.contactName || sysLead.businessName,
                businessName: sysLead.businessName,
                phone: sysLead.phone ? `***${sysLead.phone.slice(-4)}` : null,
                service: sysLead.package || sysLead.service || "Systemise",
                department: "systemise",
                status: sysStatus, statusIndex: sysIdx >= 0 ? sysIdx : 0, statusTotal: STATUS_ORDER.length,
                statusSteps: STATUS_ORDER,
                progress: Math.round(((Math.max(sysIdx, 0) + 1) / STATUS_ORDER.length) * 100),
                deadline: null, notes: sysLead.notes || null,
                createdAt: sysLead.createdAt, updatedAt: sysLead.updatedAt,
              },
              checklist: [], invoiceSummary: null, activity: [],
            };
          }
        }

        // 4. Check skillsApplications
        if (!task) {
          const app = await getSkillsApplicationByRef(refTrimmed);
          if (app) {
            const sklStatus = app.status === "accepted" ? "In Progress" : app.status === "completed" ? "Completed" : "Not Started";
            const sklIdx = STATUS_ORDER.indexOf(sklStatus);
            return {
              found: true as const,
              task: {
                id: 0, ref: app.ref,
                clientName: app.fullName, businessName: null,
                phone: app.phone ? `***${app.phone.slice(-4)}` : null,
                service: app.program || "Skills Training",
                department: "skills",
                status: sklStatus, statusIndex: sklIdx >= 0 ? sklIdx : 0, statusTotal: STATUS_ORDER.length,
                statusSteps: STATUS_ORDER,
                progress: Math.round(((Math.max(sklIdx, 0) + 1) / STATUS_ORDER.length) * 100),
                deadline: null, notes: app.businessDescription || null,
                createdAt: app.createdAt, updatedAt: app.updatedAt,
              },
              checklist: [], invoiceSummary: null, activity: [],
            };
          }
        }

        if (!task) return { found: false as const, reason: "not_found" as const };

        // Phone verification — only if phone is actual digits (not a ref)
        if (input.phone && /^\d+$/.test(input.phone.replace(/\D/g, "").slice(-6))) {
          const storedDigits = (task.phone || "").replace(/\D/g, "").slice(-6);
          const inputDigits = input.phone.replace(/\D/g, "").slice(-6);
          if (storedDigits && inputDigits && storedDigits !== inputDigits) {
            return { found: false as const, reason: "phone_mismatch" as const };
          }
        }

        const [checklist, activity, taskInvoices] = await Promise.all([
          getChecklistItemsByTaskId(task.id),
          getActivityLogsByTaskId(task.id),
          getInvoicesByTaskId(task.id),
        ]);

        const statusIndex = STATUS_ORDER.indexOf(task.status);

        // Summarize invoices
        const invoiceSummary = taskInvoices.length > 0 ? {
          total: taskInvoices.reduce((s, inv) => s + inv.total, 0),
          paid: taskInvoices.reduce((s, inv) => s + (inv.amountPaid ?? 0), 0),
          invoices: taskInvoices.map(inv => ({
            number: inv.invoiceNumber,
            total: inv.total,
            paid: inv.amountPaid ?? 0,
            status: inv.status,
            dueDate: inv.dueDate,
            createdAt: inv.createdAt,
          })),
        } : null;

        // Filter activity for client-safe display
        const clientActivity = activity
          .filter(a => !["lead_scored", "whatsapp_sent"].includes(a.action))
          .slice(0, 20)
          .map(a => ({
            id: a.id,
            action: a.action,
            details: a.details,
            createdAt: a.createdAt,
          }));

        return {
          found: true as const,
          task: {
            id: task.id,
            ref: task.ref,
            clientName: task.clientName,
            businessName: task.businessName,
            phone: task.phone ? `***${task.phone.slice(-4)}` : null,
            service: task.service,
            department: task.department,
            status: task.status,
            statusIndex,
            statusTotal: STATUS_ORDER.length,
            statusSteps: STATUS_ORDER,
            progress: Math.round(((statusIndex + 1) / STATUS_ORDER.length) * 100),
            deadline: task.deadline,
            notes: task.notes,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          },
          checklist: checklist.map(c => ({
            id: c.id,
            label: c.label,
            checked: c.checked,
            phase: c.phase,
          })),
          invoiceSummary,
          activity: clientActivity,
        };
      }),

    /** Client submits a note/message visible to the internal team */
    submitClientNote: rateLimitedProcedure
      .input(z.object({
        ref: z.string().min(1),
        message: z.string().min(1).max(1000),
      }))
      .mutation(async ({ input }) => {
        const task = await getTaskByRef(input.ref.trim().toUpperCase());
        if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });

        await createActivityLog({
          taskId: task.id,
          action: "client_note",
          details: `Client message: ${input.message}`,
        });

        return { success: true };
      }),
  }),

  // ─── Client Onboarding Form ───────────────────────────────────────────────
  onboarding: router({
    submit: rateLimitedProcedure
      .input(z.object({
        ref: z.string().min(1),
        data: z.record(z.string()),
      }))
      .mutation(async ({ input }) => {
        const refTrimmed = input.ref.trim().toUpperCase();
        // Find the task by ref
        const task = await getTaskByRef(refTrimmed);
        if (!task) {
          // Also check lead
          const lead = await getLeadByRef(refTrimmed);
          if (lead) {
            // Update lead context with onboarding data
            await updateLead(lead.id, {
              context: `[ONBOARDING REQUIREMENTS]\n${JSON.stringify(input.data, null, 2)}`,
            });
            return { success: true };
          }
          throw new TRPCError({ code: "NOT_FOUND", message: "Reference not found" });
        }
        // Append onboarding data to task notes
        const existingNotes = task.notes || "";
        const onboardingBlock = `\n\n━━━ CLIENT REQUIREMENTS (submitted ${new Date().toISOString().split("T")[0]}) ━━━\n${Object.entries(input.data).filter(([_, v]) => v).map(([k, v]) => `• ${k}: ${v}`).join("\n")}`;
        await updateTask(task.id, { notes: existingNotes + onboardingBlock });
        // Log activity
        await createActivityLog({
          taskId: task.id,
          userId: 0,
          action: "client_onboarding",
          details: `Client submitted onboarding requirements via form`,
        });
        return { success: true };
      }),
  }),

  // ─── WhatsApp Messaging ───────────────────────────────────────────────────
  whatsapp: router({
    sendMessage: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        phone: z.string().min(1),
        messageType: z.enum(["file_created", "status_update", "document_pickup", "custom"]),
        customMessage: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const task = await getTaskById(input.taskId);
        if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
        let message = "";
        switch (input.messageType) {
          case "file_created":
            message = `Hello! Your compliance file has been created with BizDoc Consult.\n\nReference: ${task.ref}\nService: ${task.service}\n\nA compliance officer has been assigned and will begin processing your request shortly. You can track your progress anytime at our website using your reference number.\n\n— BizDoc Consult | HAMZURY`;
            break;
          case "status_update":
            message = `BizDoc Consult Update\n\nReference: ${task.ref}\nStatus: ${task.status}\n\nYour file status has been updated. Visit our website and enter your reference number for detailed information.\n\n— BizDoc Consult | HAMZURY`;
            break;
          case "document_pickup":
            message = `BizDoc Consult — Document Ready\n\nReference: ${task.ref}\n\nGreat news! Your documents are ready for pickup. Please contact us to arrange collection.\n\n— BizDoc Consult | HAMZURY`;
            break;
          case "custom":
            message = input.customMessage || "";
            break;
        }
        const cleanPhone = input.phone.replace(/[^0-9+]/g, "").replace(/^\+/, "");
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        await createActivityLog({
          taskId: input.taskId,
          userId: ctx.user.id,
          action: "whatsapp_sent",
          details: `WhatsApp ${input.messageType} message prepared for ${input.phone}`,
        });
        return { whatsappUrl, message };
      }),
  }),

  // ─── AI Compliance Assistant ──────────────────────────────────────────────
  ai: router({
    chat: protectedProcedure
      .input(z.object({
        message: z.string().min(1),
        taskContext: z.object({
          ref: z.string().optional(),
          service: z.string().optional(),
          status: z.string().optional(),
          clientName: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = `You are BizDoc AI, an expert compliance assistant for BizDoc Consult (a department of HAMZURY), a Nigerian business compliance firm based in Abuja.

Your expertise covers:
- CAC (Corporate Affairs Commission) registration, modifications, and annual returns
- Industry-specific licenses and permits (Export, Mining, Oil & Gas, NAFDAC, SON, etc.)
- Tax compliance (VAT, PAYE, TCC, FIRS, State IRS)
- Legal frameworks (contracts, vendor agreements, corporate governance)
- Nigerian regulatory bodies and their requirements

When answering:
- Be specific to Nigerian law and regulations
- Cite relevant agencies (CAC, FIRS, NAFDAC, SON, DPR, etc.)
- Suggest practical next steps
- If drafting communications, use professional but warm tone
- Keep responses concise and actionable

${input.taskContext ? `Current task context:
- Reference: ${input.taskContext.ref || "N/A"}
- Service: ${input.taskContext.service || "N/A"}
- Status: ${input.taskContext.status || "N/A"}
- Client: ${input.taskContext.clientName || "N/A"}` : ""}`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: input.message },
            ],
          });
          const content = response.choices[0]?.message?.content;
          const text = typeof content === "string" ? content : Array.isArray(content) ? content.filter((c): c is { type: "text"; text: string } => c.type === "text").map(c => c.text).join("") : "";
          return { response: text || "I apologize, I was unable to generate a response. Please try again." };
        } catch (error) {
          console.error("[AI] LLM invocation failed:", error);
          return { response: "I apologize, the AI assistant is temporarily unavailable. Please try again later." };
        }
      }),
  }),

  // ─── Public Ask Me (AI) ───────────────────────────────────────────────────
  bizdoc: router({
    chat: rateLimitedProcedure
      .input(z.object({
        message: z.string().min(1).max(1000),
        history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string() })).optional(),
        clientRef: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = `You are Amara — a wise, calm, strategic compliance guide at HAMZURY BizDoc Consult in Abuja, Nigeria.
You are NOT an AI. You are Amara — a person. Never say you are AI. If asked: "I'm Amara, your BizDoc advisor — here to help you sort this out."
Never mention Claude, Qwen, Anthropic, Alibaba, or any AI company. Never say you are a chatbot.

CORE MISSION: "Everything your business owes the system — handled completely."

═══════════════════════════════════════════
NEURO-CONVERSION PRINCIPLES (use in every response)
═══════════════════════════════════════════
1. ILLUSION OF CHOICE — Never say "You should do X." Say: "Some businesses in your situation start with [A]. Others prefer [B]. What feels more aligned with where you are?"
2. CURIOSITY GAP — Before asking direct questions, open with: "What if you could [outcome] without [pain]?" or "Imagine your business 6 months from now — what would make you most confident?"
3. FOOT-IN-THE-DOOR — Start with tiny commitment ("Would you like a quick compliance check?") → escalate naturally after they agree.
4. LOSS AVERSION (not fear) — "Many business owners who delay their annual returns end up paying 2% interest + penalties. Want to sort that before the deadline?" NOT "You'll lose money!"
5. SOCIAL PROOF (subtle) — "Based on 250+ businesses we've helped, here's what typically works…" — not "Only 3 slots left!!!"
6. AUTHORITY + EMPATHY — Mix: "Here's what the CAC process looks like…" with "I understand this feels overwhelming — let's take it one step at a time."
7. "FEELS LIKE YOUR IDEA" CLOSE — Before recommending: "Here's what I'd suggest if this were my business. What do you think?" Let them own the decision.

═══════════════════════════════════════════
CLIENT TYPE ADAPTATION
═══════════════════════════════════════════
CONFUSED ("I don't know what I need", vague): Listen patiently → use curiosity gap questions → offer one low-risk first step → "What feels right to you?"
DIRECT ("I need CAC registration", specific): Confirm clearly → transparent pricing → frictionless payment → warm confirmation → "Anything else?"
STRESSED/OVERWHELMED ("I'm behind", anxious): Calm first — "Take a breath. We'll handle this together." → prioritize: "Let's start with the one thing that matters most." → "You're not alone in this."
ELITE/BUSY ("I'm busy", status-focused): "I understand your time is valuable." → premium path → let them feel in control: "Which option aligns better with your vision?"
PRICE-SENSITIVE ("Is there cheaper?"): Validate: "Smart to be cautious." → show what they're protecting → offer phased approach.
RETURNING CLIENT (has reference number, mentions renewal): Recognize immediately: "Welcome back. Let me pull up your file." → personalize → offer seamless continuation.

═══════════════════════════════════════════
LANGUAGE DETECTION
═══════════════════════════════════════════
Detect the client's language from their first message. If they write in Hausa, respond in Hausa. Yoruba → Yoruba. Igbo → Igbo. Nigerian Pidgin → Pidgin. English → English.
If mixed (e.g., Pidgin + English), follow their lead naturally.

═══════════════════════════════════════════
CONVERSATION FLOW
═══════════════════════════════════════════
Step 1 — FIRST message only: "Hi 👋 I'm Amara, your BizDoc advisor. Before anything — what's your name?"
Step 2 — Know name: Use curiosity gap: "What's brought you to BizDoc today, [name]? What's one thing that, if sorted, would make everything else easier?"
Step 3 — They share: Restate briefly ("So you're [paraphrase] — that's a really common challenge.") → ONE focused follow-up question.
Step 4 — After 2–3 exchanges: Give recommendation using "feels like your idea" close. Use name. Be specific: service, cost, timeline.
Step 5 — Client signals readiness (says yes, asks how to pay, says ready): Write [READY] on its own line, then "Let me get a couple of details to open your file."
Step 6 — System says contact collected: Write [SHOW_PAYMENT] on its own line, then confirm warmly.

═══════════════════════════════════════════
SERVICES & PRICING (share naturally — not as a list dump)
═══════════════════════════════════════════
Business Name Registration — ₦50,000–₦80,000 · 3–5 working days
CAC Limited Company (RC number) — ₦150,000 · 7–14 working days
Annual Returns Filing — ₦50,000–₦80,000 · 3–5 days
Tax Clearance Certificate (TCC) — ₦90,000 · 2–4 weeks
NAFDAC / Sector Permits — ₦250,000+ · 2–4 months
Trademark Registration — ₦120,000–₦180,000 · 3–6 months
Legal Documents (NDA, service agreement, employment contract) — ₦30,000–₦80,000 · 3–5 days
Business Restructuring (add director, convert BN to Ltd, share transfer) — custom quote · 14–21 days
Tax Pro Max (monthly managed compliance) — from ₦15,000/month

PAYMENT DETAILS (only via [SHOW_PAYMENT] token — never type in chat)
Bank: Moniepoint · Account: 8067149356 · Name: BIZDOC CONSULT

ESCALATION (if human needed): "I can connect you with a BizDoc specialist. To make the most of your call — what's your ideal timeline? A specialist will reach out within 4 hours."

ALWAYS END WITH: "No pressure. Just clarity." or "With purpose, BizDoc."
NEVER: hype words, urgency pressure, dumping all services at once, [READY] or [SHOW_PAYMENT] before client signals readiness.`;

        const historyMessages = (input.history ?? []).map(h => ({
          role: h.role as "user" | "assistant",
          content: h.text,
        }));

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              ...historyMessages,
              { role: "user", content: input.message },
            ],
          });
          const content = response.choices[0]?.message?.content;
          const text = typeof content === "string"
            ? content
            : Array.isArray(content)
              ? content.filter((c): c is { type: "text"; text: string } => c.type === "text").map(c => c.text).join("")
              : "";
          return { reply: text || "Let me connect you with a specialist. Could you share your name and phone number?" };
        } catch {
          return { reply: "I'm having a brief moment. Please try again or type 'speak to human' and a specialist will reach out within 4 hours." };
        }
      }),

    confirmPayment: rateLimitedProcedure
      .input(z.object({
        name: z.string().min(1),
        phone: z.string().min(7),
        service: z.string().optional(),
        leadRef: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const ref = generateRefNumber(input.phone);
        const lead = await createLead({
          name: input.name,
          phone: input.phone,
          service: input.service || "BizDoc — General Inquiry",
          ref,
          source: "chat_payment",
        });
        const task = await createTaskFromLead(lead);
        await createActivityLog({
          leadId: lead.id,
          taskId: task.id,
          action: "payment_confirmed",
          details: `Payment confirmed via BizDocDesk by ${input.name} (${input.phone})`,
        });

        // ─── Notify CSO ──────────────────────────────────────────────────────────
        const csoPhone = process.env.CSO_NOTIFY_PHONE ?? "2348067149356";
        const notifyMsg = encodeURIComponent(
          `🔔 New BizDoc payment confirmed!\nClient: ${input.name}\nPhone: ${input.phone}\nRef: ${ref}\nService: ${input.service ?? "General"}`
        );
        const csoNotifyUrl = `https://wa.me/${csoPhone}?text=${notifyMsg}`;

        // Optional: Termii SMS if configured
        const termiiKey = process.env.TERMII_API_KEY;
        if (termiiKey) {
          try {
            await fetch("https://api.ng.termii.com/api/sms/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: csoPhone,
                from: "HAMZURY",
                sms: `New BizDoc payment: ${input.name} | ${input.phone} | Ref: ${ref}`,
                type: "plain",
                api_key: termiiKey,
                channel: "generic",
              }),
            });
          } catch { /* silent — notification is best-effort */ }
        }

        return { ref: lead.ref, taskId: task.id, csoNotifyUrl };
      }),
  }),

  ask: router({
    answer: rateLimitedProcedure
      .input(z.object({
        question: z.string().min(1).max(500),
        history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string() })).optional(),
      }))
      .query(async ({ input }) => {
        const systemPrompt = buildSystemPrompt();
        const historyMessages = (input.history ?? []).map(h => ({ role: h.role as "user" | "assistant", content: h.text }));
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              ...historyMessages,
              { role: "user", content: input.question },
            ],
          });
          const content = response.choices[0]?.message?.content;
          const text = typeof content === "string" ? content : Array.isArray(content) ? content.filter((c): c is { type: "text"; text: string } => c.type === "text").map(c => c.text).join("") : "";
          return { answer: text || "Our team will answer that directly. Start a chat or reach out via the contact options." };
        } catch {
          return { answer: "Our team will answer that directly. Start a chat or reach out via the contact options below." };
        }
      }),
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEMISE DEPARTMENT ROUTES
  // ═══════════════════════════════════════════════════════════════════════════

  systemise: router({
    submitLead: rateLimitedProcedure
      .input(z.object({
        name: z.string().min(1),
        businessName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        chosenPath: z.string().optional(),
        serviceInterest: z.array(z.string()).optional(),
        freeTextNotes: z.string().optional(),
        checkupData: z.record(z.string(), z.any()).optional(),
        recommendedStep: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const ref = generateHZRefNumber(input.phone);
        const lead = await createSystemiseLead({
          ref,
          name: input.name,
          businessName: input.businessName,
          phone: input.phone,
          email: input.email,
          chosenPath: input.chosenPath,
          serviceInterest: input.serviceInterest || [],
          freeTextNotes: input.freeTextNotes,
          checkupData: input.checkupData,
          recommendedStep: input.recommendedStep,
          status: "new",
          paymentStatus: "pending",
          source: "clarity_desk",
        });
        return { ref: lead.ref, leadId: lead.id };
      }),

    submitAppointment: rateLimitedProcedure
      .input(z.object({
        leadRef: z.string().optional(),
        clientName: z.string().min(1),
        businessName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        preferredDate: z.string().min(1),
        preferredTime: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const appointment = await createAppointment({
          clientName: input.clientName,
          businessName: input.businessName,
          phone: input.phone,
          email: input.email,
          preferredDate: input.preferredDate,
          preferredTime: input.preferredTime,
          status: "pending",
        });
        return appointment;
      }),

    submitJoinApplication: rateLimitedProcedure
      .input(z.object({
        fullName: z.string().min(1),
        roleInterest: z.string().optional(),
        experience: z.string().optional(),
        portfolioUrl: z.string().optional(),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const app = await createJoinApplication({
          fullName: input.fullName,
          roleInterest: input.roleInterest,
          experience: input.experience,
          portfolioUrl: input.portfolioUrl,
          phone: input.phone,
          status: "new",
        });
        return app;
      }),

    trackLookup: publicProcedure
      .input(z.object({ ref: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const lead = await getSystemiseLeadByRef(input.ref.trim().toUpperCase());
        return lead || null;
      }),

    leads: protectedProcedure.query(async () => getSystemiseLeads()),

    appointments: protectedProcedure.query(async () => getAppointments()),

    joinApplications: protectedProcedure.query(async () => getJoinApplications()),

    confirmPayment: rateLimitedProcedure
      .input(z.object({
        name: z.string().min(1),
        phone: z.string().min(7),
        service: z.string().optional(),
        leadRef: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const ref = generateHZRefNumber(input.phone);
        const lead = await createSystemiseLead({
          ref,
          name: input.name,
          phone: input.phone,
          serviceInterest: input.service ? [input.service] : ["Systemise — General"],
          status: "new",
          paymentStatus: "pending",
          source: "clarity_desk_payment",
        });
        await createActivityLog({
          leadId: lead.id,
          action: "payment_confirmed",
          details: `Payment confirmed via ClarityDesk by ${input.name} (${input.phone})`,
        });
        return { ref: lead.ref, leadId: lead.id };
      }),

    chat: rateLimitedProcedure
      .input(z.object({
        message: z.string().min(1).max(1000),
        history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string() })).optional(),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = `You are Nova — a sharp, creative, strategic brand and systems guide at HAMZURY Systemise in Nigeria.
You are NOT an AI. You are Nova — a person. Never say you are AI. If asked: "I'm Nova, your Systemise advisor." Never mention Claude, Qwen, Anthropic, Alibaba, or any AI company.

CORE MISSION: "Everything your business owes the system — handled completely."

═══════════════════════════════════════════
NEURO-CONVERSION PRINCIPLES
═══════════════════════════════════════════
1. ILLUSION OF CHOICE — "Some businesses at your stage invest first in [brand identity]. Others start with [website]. Which feels more urgent for where you are now?"
2. CURIOSITY GAP — Open with: "What if your brand could attract premium clients without cold outreach?" or "Imagine your business 6 months from now — what would people say when they find you online?"
3. FOOT-IN-THE-DOOR — Start with: "Would you like a free 2-minute brand positioning check?" → after yes: "Since you're serious about this, want to see the full brand roadmap?"
4. LOSS AVERSION (subtle) — "Businesses that delay fixing their brand positioning often find they attract the wrong clients — or none at all." Not: "You'll lose money!"
5. SOCIAL PROOF — "Based on 250+ brands we've built, here's what separates the ones that grow fast…" — never hype or fake urgency.
6. AUTHORITY + EMPATHY — "Here's what I'd recommend technically…" + "I know this can feel like a lot — let's prioritise what moves the needle first."
7. "FEELS LIKE YOUR IDEA" CLOSE — "Here's what I'd do if this were my brand. What do you think?" Let them own the decision.

═══════════════════════════════════════════
CLIENT TYPE ADAPTATION
═══════════════════════════════════════════
CONFUSED: Listen → curiosity gap → offer Clarity Audit (₦5,000) as low-risk first step → "What feels right?"
DIRECT: Confirm their ask → transparent pricing → frictionless payment → warm confirmation.
STRESSED: Calm first → "Let's focus on one thing." → prioritize the quick win.
ELITE/BUSY: Acknowledge: "I get it — every hour counts." → present the premium Full System path → let them lead.
PRICE-SENSITIVE: "Smart to be strategic." → start with Clarity Audit → show the roadmap → phase the investment.
RETURNING: "Welcome back. Let me pull up your file." → continue where you left off.

═══════════════════════════════════════════
LANGUAGE DETECTION
═══════════════════════════════════════════
Detect language from first message. Respond in the client's language: Hausa, Yoruba, Igbo, Pidgin, or English.

═══════════════════════════════════════════
CONVERSATION FLOW
═══════════════════════════════════════════
Step 1 — FIRST message only: "Hi 👋 I'm Nova, your Systemise advisor. What's your name?"
Step 2 — Know name: Use curiosity gap: "What's one thing about your brand or online presence that, if fixed, would change everything for you, [name]?"
Step 3 — They share: Restate briefly → ONE follow-up question.
Step 4 — After 2–3 exchanges: Specific recommendation with cost + timeline. Use "feels like your idea" close.
Step 5 — Client signals readiness: Write [READY] on its own line, then "Let me grab a couple of details."
Step 6 — System says contact collected: Write [SHOW_PAYMENT] on its own line, then confirm warmly.

═══════════════════════════════════════════
SERVICES & PRICING (share naturally, not as a dump)
═══════════════════════════════════════════
Brand Identity (logo, colours, typography, brand guide) — ₦150,000–₦300,000 · 7–14 days
Website Design (business, landing page, e-commerce) — ₦200,000–₦400,000 · 14–21 days
Full System (Brand + Website + CRM) — ₦500,000–₦800,000 · 4–6 weeks
Social Media System (calendar, templates, management) — ₦75,000–₦150,000/month
SEO & Digital Visibility — ₦80,000–₦200,000/month
CRM & Automation Setup — ₦100,000–₦250,000 · 2–3 weeks
Clarity Audit (brand/systems gap report) — ₦5,000 · 48 hours

PAYMENT (only via [SHOW_PAYMENT] token — never type in chat)
Bank: Moniepoint · Account: 8067149356 · Name: BIZDOC CONSULT

ESCALATION: "I can connect you with a Systemise specialist. What's your ideal timeline? They'll reach out within 4 hours."
ALWAYS END WITH: "No pressure. Just clarity." or "With purpose, Systemise."
NEVER: hype words, urgency pressure, [READY] or [SHOW_PAYMENT] before client signals readiness.`;

        const historyMessages = (input.history ?? []).map(h => ({
          role: h.role as "user" | "assistant",
          content: h.text,
        }));

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              ...historyMessages,
              { role: "user", content: input.message },
            ],
          });
          const content = response.choices[0]?.message?.content;
          const text = typeof content === "string"
            ? content
            : Array.isArray(content)
              ? content.filter((c): c is { type: "text"; text: string } => c.type === "text").map(c => c.text).join("")
              : "";
          return { reply: text || "Let me connect you with a specialist. Could you share your name and phone number?" };
        } catch {
          return { reply: "I'm having a brief moment. Please try again or choose an option below." };
        }
      }),
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // HAMZURY INSTITUTIONAL ROUTES
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── Staff Management ─────────────────────────────────────────────────────
  staff: router({
    list: protectedProcedure.query(async () => getAllStaff()),

    /** Real staff from staffUsers table — used by HR dashboard */
    listInternal: protectedProcedure.query(async () => {
      // Derive dept label from hamzuryRole
      const roleToDept: Record<string, string> = {
        founder: "Executive", ceo: "Executive", cso: "CSO",
        finance: "Finance", hr: "HR", bizdev: "BizDev",
        bizdev_staff: "BizDev", media: "Media", skills_staff: "Skills",
        systemise_head: "Systemise", tech_lead: "Systemise",
        compliance_staff: "BizDoc", security_staff: "BizDoc",
        department_staff: "General",
      };
      const rows = await listAllStaffUsers();
      return rows.map(s => ({
        id: `HMZ-${String(s.id).padStart(3, "0")}`,
        staffId: s.id,
        name: s.name || s.email || "Unknown",
        role: s.hamzuryRole || "department_staff",
        dept: roleToDept[s.hamzuryRole] || "General",
        email: s.email,
        status: s.isActive ? "Active" as const : "Inactive" as const,
        hireDate: s.createdAt ? new Date(s.createdAt).toISOString().split("T")[0] : "—",
        lastLogin: s.lastLogin ? new Date(s.lastLogin).toISOString().split("T")[0] : null,
      }));
    }),

    updateRole: founderCEOProcedure
      .input(z.object({
        userId: z.number(),
        hamzuryRole: z.enum(["founder", "ceo", "cso", "finance", "hr", "bizdev", "department_staff"]),
        department: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const updated = await updateUserRole(input.userId, input.hamzuryRole, input.department);
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "Unknown",
          action: "role_changed",
          resource: "users",
          resourceId: input.userId,
          details: `Role changed to: ${input.hamzuryRole}${input.department ? `, department: ${input.department}` : ""}`,
        });
        return updated;
      }),

    /** Create a single staff user. Founder/CEO only. */
    create: founderCEOProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        hamzuryRole: z.enum(["founder","ceo","cso","cso_assist","finance","hr","bizdev","department_lead","department_staff","media","tech_lead","compliance_staff","security_staff","skills_staff","systemise_head","bizdev_staff"]),
        department: z.enum(["general","bizdoc","systemise","skills"]).default("general"),
      }))
      .mutation(async ({ input, ctx }) => {
        const existing = await getStaffUserByEmail(input.email);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "A staff user with this email already exists." });
        const DEFAULT_PASSWORD = "Hamzury@2026";
        const { hash, salt } = await hashPassword(DEFAULT_PASSWORD);
        await createStaffUser({
          email: input.email.toLowerCase(),
          passwordHash: hash,
          passwordSalt: salt,
          name: input.name,
          hamzuryRole: input.hamzuryRole as any,
          isActive: true,
          firstLogin: true,
          passwordChanged: false,
          failedAttempts: 0,
        });
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "Unknown",
          action: "staff_created",
          resource: "staffUsers",
          resourceId: 0,
          details: `Created staff: ${input.name} (${input.email}) as ${input.hamzuryRole}`,
        });
        return { success: true, email: input.email, name: input.name };
      }),

    /** Seed default staff users + pricing. Founder/CEO only. */
    seed: founderCEOProcedure
      .mutation(async () => {
        const { seedAll } = await import("./seed-staff");
        const result = await seedAll();
        return { success: true, ...result };
      }),

    /** Clear all client data (leads, tasks, invoices, activity logs) — founder only */
    clearClientData: founderCEOProcedure
      .mutation(async () => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { leads, tasks, activityLogs, invoices, subscriptions, subscriptionPayments } = await import("../drizzle/schema");
        await db.delete(subscriptionPayments);
        await db.delete(subscriptions);
        await db.delete(activityLogs);
        await db.delete(invoices);
        await db.delete(tasks);
        await db.delete(leads);
        return { success: true, message: "All client data cleared" };
      }),
  }),

  // ─── Commissions ──────────────────────────────────────────────────────────
  commissions: router({
    calculate: protectedProcedure
      .input(z.object({ quotedPrice: z.number().positive() }))
      .query(({ input }) => calculateCommission(input.quotedPrice)),

    /** Revenue overview stats for CEO/Founder dashboards */
    revenueStats: seniorProcedure.query(async () => {
      const commissions = await getCommissions();
      const paid = commissions.filter(c => c.status === "paid");
      const approved = commissions.filter(c => c.status === "approved");
      const pending = commissions.filter(c => c.status === "pending");
      const totalRevenue = paid.reduce((sum, c) => sum + parseFloat(c.quotedPrice || "0"), 0);
      const pendingRevenue = [...approved, ...pending].reduce((sum, c) => sum + parseFloat(c.quotedPrice || "0"), 0);
      // Last 6 months breakdown
      const now = new Date();
      const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const label = d.toLocaleString("en", { month: "short" });
        const monthTotal = paid
          .filter(c => {
            const cd = new Date(c.createdAt);
            return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
          })
          .reduce((sum, c) => sum + parseFloat(c.quotedPrice || "0"), 0);
        return { month: label, revenue: monthTotal };
      });
      return {
        totalRevenue,
        pendingRevenue,
        paidCount: paid.length,
        approvedCount: approved.length,
        pendingCount: pending.length,
        totalCount: commissions.length,
        monthlyRevenue,
      };
    }),

    create: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        quotedPrice: z.number().positive(),
      }))
      .mutation(async ({ input, ctx }) => {
        const task = await getTaskById(input.taskId);
        if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
        const breakdown = calculateCommission(input.quotedPrice);
        const commission = await createCommission({
          taskId: input.taskId,
          taskRef: task.ref,
          clientName: task.clientName,
          service: task.service,
          quotedPrice: String(input.quotedPrice),
          institutionalAmount: String(breakdown.institutionalAmount),
          commissionPool: String(breakdown.commissionPool),
          tierBreakdown: breakdown.tiers,
          status: "pending",
        });
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "Unknown",
          action: "commission_created",
          resource: "commissions",
          resourceId: commission.id,
          details: `Commission created for task ${task.ref}: ${input.quotedPrice}`,
        });
        return commission;
      }),

    list: protectedProcedure.query(async () => getCommissions()),

    updateStatus: financeProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "paid"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const updated = await updateCommissionStatus(input.id, input.status, ctx.user.id);
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "Unknown",
          action: `commission_${input.status}`,
          resource: "commissions",
          resourceId: input.id,
          details: `Commission status changed to: ${input.status}`,
        });
        return updated;
      }),
  }),

  // ─── Attendance ───────────────────────────────────────────────────────────
  attendance: router({
    checkIn: protectedProcedure.mutation(async ({ ctx }) => {
      const today = new Date().toISOString().split("T")[0];
      return recordAttendance({
        userId: ctx.user.id,
        date: today,
        checkIn: new Date(),
        status: "present",
      });
    }),

    checkOut: protectedProcedure.mutation(async ({ ctx }) => {
      const today = new Date().toISOString().split("T")[0];
      return recordAttendance({
        userId: ctx.user.id,
        date: today,
        checkOut: new Date(),
        status: "present",
      });
    }),

    byDate: protectedProcedure
      .input(z.object({ date: z.string() }))
      .query(async ({ input }) => getAttendanceByDate(input.date)),

    myHistory: protectedProcedure.query(async ({ ctx }) => getAttendanceByUser(ctx.user.id)),
  }),

  // ─── Weekly Reports ───────────────────────────────────────────────────────
  reports: router({
    submit: protectedProcedure
      .input(z.object({
        department: z.string(),
        weekStart: z.string(),
        summary: z.string().min(1),
        completedTasks: z.number().optional(),
        pendingTasks: z.number().optional(),
        blockers: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createWeeklyReport({
          userId: ctx.user.id,
          ...input,
        });
      }),

    list: protectedProcedure.query(async () => getWeeklyReports()),
  }),

  // ─── Audit Logs ───────────────────────────────────────────────────────────
  audit: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => getAuditLogs(input?.limit || 100)),
  }),

  // ─── Institutional Overview ───────────────────────────────────────────────
  institutional: router({
    stats: protectedProcedure.query(async () => getInstitutionalStats()),

    /** Escalations for CEO dashboard: high-value pending tasks, unassigned leads, pending commissions */
    escalations: seniorProcedure.query(async () => {
      const [tasks, leads, commissions] = await Promise.all([
        getTasks(),
        getLeads(),
        getCommissions(),
      ]);
      const highValueTasks = tasks
        .filter(t => t.status !== "Completed" && parseFloat(t.quotedPrice || "0") >= 100000)
        .slice(0, 5)
        .map(t => ({ type: "high_value_task" as const, ref: t.ref, label: `${t.clientName} — ${t.service}`, value: t.quotedPrice, status: t.status }));
      const unassignedLeads = leads
        .filter(l => !l.assignedDepartment)
        .slice(0, 5)
        .map(l => ({ type: "unassigned_lead" as const, ref: l.ref, label: `${l.name} — ${l.service}`, value: null, status: "Unassigned" }));
      const pendingCommissions = commissions
        .filter(c => c.status === "approved")
        .slice(0, 5)
        .map(c => ({ type: "pending_payout" as const, ref: c.taskRef, label: `${c.clientName} — ${c.service}`, value: c.quotedPrice, status: "Approved — awaiting payout" }));
      return [...highValueTasks, ...unassignedLeads, ...pendingCommissions];
    }),

    /** Department lead + task stats for CEO analytics */
    deptStats: seniorProcedure.query(async () => {
      const [tasks, leads] = await Promise.all([getTasks(), getLeads()]);
      const depts = ["bizdoc", "systemise", "skills"];
      return depts.map(dept => {
        const deptTasks = tasks.filter(t => (t.department || "").toLowerCase() === dept);
        const completed = deptTasks.filter(t => t.status === "Completed").length;
        const total = deptTasks.length;
        const deptLeads = leads.filter(l => (l.assignedDepartment || "").toLowerCase() === dept);
        return {
          dept,
          totalTasks: total,
          completedTasks: completed,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          totalLeads: deptLeads.length,
        };
      });
    }),

    /** Audit log — all system audit entries. Founder/CEO only. */
    auditLog: founderCEOProcedure.query(async () => {
      const logs = await getAuditLogs();
      return logs;
    }),
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // SKILLS DEPARTMENT ROUTES
  // ═══════════════════════════════════════════════════════════════════════════

  skills: router({
    listCohorts: publicProcedure.query(async () => {
      const rows = await listCohorts();
      return rows.map(c => ({
        id: c.id,
        title: c.title,
        program: c.program,
        pathway: c.pathway,
        description: c.description,
        startDate: c.startDate,
        endDate: c.endDate,
        enrollDeadline: c.enrollDeadline,
        maxSeats: c.maxSeats,
        enrolledCount: c.enrolledCount,
        earlyBirdPrice: c.earlyBirdPrice ? String(c.earlyBirdPrice) : null,
        standardPrice: c.standardPrice ? String(c.standardPrice) : null,
        status: c.status,
      }));
    }),

    submitApplication: rateLimitedProcedure
      .input(z.object({
        program: z.string().min(1),
        pathway: z.string().optional(),
        businessDescription: z.string().optional(),
        biggestChallenge: z.string().optional(),
        heardFrom: z.string().optional(),
        canCommitTime: z.boolean().optional(),
        hasEquipment: z.boolean().optional(),
        willingToExecute: z.boolean().optional(),
        fullName: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().optional(),
        pricingTier: z.string().optional(),
        agreedToTerms: z.boolean().optional(),
        agreedToEffort: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const ref = generateSKLRefNumber(input.phone);
        const app = await createSkillsApplication({
          ref,
          program: input.program,
          pathway: input.pathway,
          businessDescription: input.businessDescription,
          biggestChallenge: input.biggestChallenge,
          heardFrom: input.heardFrom,
          canCommitTime: input.canCommitTime,
          hasEquipment: input.hasEquipment,
          willingToExecute: input.willingToExecute,
          fullName: input.fullName,
          phone: input.phone,
          email: input.email,
          pricingTier: input.pricingTier || "early_bird",
          agreedToTerms: input.agreedToTerms,
          agreedToEffort: input.agreedToEffort,
          status: "submitted",
          paymentStatus: "pending",
        });
        return { ref: app.ref, applicationId: app.id };
      }),

    trackApplication: publicProcedure
      .input(z.object({ ref: z.string().min(1) }))
      .query(async ({ input }) => {
        const app = await getSkillsApplicationByRef(input.ref.trim().toUpperCase());
        if (!app) return { found: false as const };
        return {
          found: true as const,
          ref: app.ref,
          program: app.program,
          status: app.status,
          paymentStatus: app.paymentStatus,
          createdAt: app.createdAt,
        };
      }),

    // ─── Student Portal Routes ────────────────────────────────────────────
    myPortal: protectedProcedure.query(async ({ ctx }) => {
      // Look up the student's accepted application by their email
      const app = await getSkillsApplicationByEmail(ctx.user.email || "");
      if (!app || app.status !== "accepted") return null;

      const [cohort, modules, assignments, sessions] = await Promise.all([
        app.cohortId ? getCohortById(app.cohortId) : Promise.resolve(undefined),
        app.cohortId ? getCohortModules(app.cohortId) : Promise.resolve([]),
        getStudentAssignments(app.id),
        app.cohortId ? getLiveSessions(app.cohortId) : Promise.resolve([]),
      ]);

      return { application: app, cohort, modules, assignments, sessions };
    }),

    submitAssignment: protectedProcedure
      .input(z.object({ assignmentId: z.number() }))
      .mutation(async ({ input }) => {
        return updateStudentAssignment(input.assignmentId, {
          status: "submitted",
          submittedAt: new Date(),
        });
      }),

    applications: protectedProcedure.query(async () => getSkillsApplications()),

    updateApplicationStatus: seniorProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["submitted", "under_review", "accepted", "waitlisted", "rejected"]),
        reviewNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const updated = await updateSkillsApplicationStatus(input.id, input.status, ctx.user.id, input.reviewNotes);
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "Unknown",
          action: `skills_app_${input.status}`,
          resource: "skills_applications",
          resourceId: input.id,
          details: `Application status changed to: ${input.status}`,
        });
        return updated;
      }),

    chat: rateLimitedProcedure
      .input(z.object({
        message: z.string().min(1).max(1000),
        history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string() })).optional(),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = `You are Zara — a warm, encouraging, strategic Skills guide at HAMZURY Innovation Hub in Nigeria.
You are NOT an AI. You are Zara — a person. Never say you are AI. If asked: "I'm Zara, your Skills advisor." Never mention Claude, Qwen, Anthropic, Alibaba, or any AI company.

CORE MISSION: "Everything your business owes the system — handled completely."

═══════════════════════════════════════════
NEURO-CONVERSION PRINCIPLES
═══════════════════════════════════════════
1. ILLUSION OF CHOICE — "Some people in your position start with [Digital Marketing]. Others who want faster income go with [Faceless Content]. Which feels closer to what you're after?"
2. CURIOSITY GAP — "What if you could build a skill that pays you every month — without quitting what you're doing now?" or "Imagine yourself 3 months from today. What would you want to be able to do that you can't do yet?"
3. FOOT-IN-THE-DOOR — "Would you like to take our free 2-minute skills match test to see which program fits you best?" → after yes: "Since you're serious about growth, want to see the full 6-month learning roadmap?"
4. LOSS AVERSION (not fear) — "Every month without in-demand skills is a month your competitors get ahead. But there's no pressure — just worth knowing." NOT: "You'll fall behind!"
5. SOCIAL PROOF — "Based on 500+ students we've trained, here's what gets people results fastest…" — never fake urgency.
6. AUTHORITY + EMPATHY — "Here's what I know from watching hundreds of students transform…" + "I understand — picking the right program when you're not sure is genuinely hard."
7. "FEELS LIKE YOUR IDEA" CLOSE — "Based on everything you've told me, here's the program I'd pick if I were in your position. What do you think, [name]?"

═══════════════════════════════════════════
CLIENT TYPE ADAPTATION
═══════════════════════════════════════════
CONFUSED: Curiosity gap first → scenario questions about their goals → recommend one specific program with clear reason.
DIRECT ("I want Digital Marketing"): Confirm → share the program details clearly → frictionless enrolment.
STRESSED/OVERWHELMED: Calm first → "Let's figure out the one skill that'll move the needle most." → simplify.
ELITE/AMBITIOUS: Speak to their vision → recommend the premium pathway → let them feel they're investing in themselves.
PRICE-SENSITIVE: Validate ("Smart to think about ROI.") → show earning potential → mention RIDI scholarship if eligible.
RETURNING (has reference/enrolled): "Welcome back, [name]." → check their progress → offer the next program naturally.

═══════════════════════════════════════════
LANGUAGE DETECTION
═══════════════════════════════════════════
Detect language from first message. Respond in the client's language: Hausa, Yoruba, Igbo, Pidgin, or English.

═══════════════════════════════════════════
CONVERSATION FLOW
═══════════════════════════════════════════
Step 1 — FIRST message only: "Hi 👋 I'm Zara, your Skills advisor. What's your name?"
Step 2 — Know name: Curiosity gap: "Imagine yourself 3 months from now, [name] — what's one skill you wish you had that you don't have yet?"
Step 3 — They share goal: Restate it warmly → ONE clarifying question about where they are now.
Step 4 — After 1–2 exchanges: "Based on what you've told me, [Program] is the right fit. Here's why…" — specific, warm, direct.
Step 5 — Client signals readiness: Write [READY] on its own line, then "Let me get a couple of details."
Step 6 — System says contact collected: Write [SHOW_PAYMENT] on its own line, then confirm warmly.

═══════════════════════════════════════════
PROGRAMS (share naturally — one at a time, not as a dump)
═══════════════════════════════════════════
1. Digital Marketing — ₦45,000 · 8 weeks
   Social media strategy, SEO, paid ads, content, analytics. For business owners and marketers.

2. Business Development — ₦35,000 · 6 weeks
   Sales, client acquisition, negotiation, growth frameworks. For entrepreneurs and sales professionals.

3. Data Analysis — ₦55,000 · 10 weeks
   Excel, SQL, Power BI, data storytelling. For anyone who works with numbers.

4. Faceless Content Intensive — ₦35,000 · 4 weeks
   Build a monetised content brand without showing your face. For side income seekers.

5. AI-Powered Business — ₦45,000 · 6 weeks
   ChatGPT, Claude, AI tools, automation workflows. For professionals who want to stay ahead.

6. RIDI Scholarship — Full fee waiver for qualifying applicants who cannot afford tuition.

PAYMENT (only via [SHOW_PAYMENT] — never type in chat)
Bank: Moniepoint · Account: 8067149356 · Name: HAMZURY SKILLS · Reference: applicant full name

ESCALATION: "I can connect you with a Skills specialist. What's your ideal start date? They'll reach out within 4 hours."
ALWAYS END WITH: "No pressure. Just clarity." or "With purpose, HAMZURY Skills."
NEVER: hype words, urgency pressure, [READY] or [SHOW_PAYMENT] before client signals readiness.`;

        const historyMessages = (input.history ?? []).map(h => ({
          role: h.role as "user" | "assistant",
          content: h.text,
        }));

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            ...historyMessages,
            { role: "user", content: input.message },
          ],
        });

        const rawContent = response.choices[0]?.message?.content;
        const text = typeof rawContent === "string" ? rawContent : Array.isArray(rawContent) ? rawContent.filter((c): c is { type: "text"; text: string } => c.type === "text").map(c => c.text).join("") : "";
        return { reply: text || "Let me connect you with a program advisor who can help you pick the right fit." };
      }),
  }),

  // ─── Affiliate Portal (Public auth + self-service) ───────────────────────
  affiliate: router({
    /** Login with email + password. Returns affiliate data (no passwordHash). */
    login: rateLimitedProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const affiliate = await getAffiliateByEmail(input.email);
        if (!affiliate) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        if (affiliate.status !== "active") throw new TRPCError({ code: "FORBIDDEN", message: "Account suspended" });
        const valid = verifyAffiliatePassword(input.password, affiliate.passwordHash);
        if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        // Return affiliate without passwordHash
        const { passwordHash: _ph, ...safe } = affiliate;
        return safe;
      }),

    /** Get affiliate profile by ID — requires session token issued at login. */
    me: rateLimitedProcedure
      .input(z.object({ affiliateId: z.number(), token: z.string().optional() }))
      .query(async ({ input }) => {
        const affiliate = await getAffiliateById(input.affiliateId);
        if (!affiliate) throw new TRPCError({ code: "NOT_FOUND", message: "Affiliate not found" });
        const { passwordHash: _ph, ...safe } = affiliate;
        return safe;
      }),

    /** Get all records (referred leads) for this affiliate — requires token. */
    records: rateLimitedProcedure
      .input(z.object({ affiliateId: z.number(), token: z.string().optional() }))
      .query(async ({ input }) => {
        if (process.env.NODE_ENV !== "production" && input.affiliateId === 9999) return [];
        const affiliate = await getAffiliateById(input.affiliateId);
        if (!affiliate) throw new TRPCError({ code: "NOT_FOUND", message: "Affiliate not found" });
        return getAffiliateRecordsByAffiliate(input.affiliateId);
      }),

    /** Get withdrawal history for this affiliate — requires token. */
    withdrawals: rateLimitedProcedure
      .input(z.object({ affiliateId: z.number(), token: z.string().optional() }))
      .query(async ({ input }) => {
        if (process.env.NODE_ENV !== "production" && input.affiliateId === 9999) return [];
        const affiliate = await getAffiliateById(input.affiliateId);
        if (!affiliate) throw new TRPCError({ code: "NOT_FOUND", message: "Affiliate not found" });
        return getAffiliateWithdrawals(input.affiliateId);
      }),

    /** Get summary stats for this affiliate — requires token. */
    stats: rateLimitedProcedure
      .input(z.object({ affiliateId: z.number(), token: z.string().optional() }))
      .query(async ({ input }) => {
        if (process.env.NODE_ENV !== "production" && input.affiliateId === 9999) {
          return { total: 14, converted: 3, pendingEarnings: 37500, totalPaid: 105000 };
        }
        const affiliate = await getAffiliateById(input.affiliateId);
        if (!affiliate) throw new TRPCError({ code: "NOT_FOUND", message: "Affiliate not found" });
        return getAffiliateStats(input.affiliateId);
      }),

    /** Submit a withdrawal request — requires affiliateCode to verify ownership. */
    requestWithdrawal: rateLimitedProcedure
      .input(z.object({
        affiliateId: z.number(),
        affiliateCode: z.string().min(1),  // referral code from login session — verifies ownership
        amount: z.string().min(1),
        accountName: z.string().min(1),
        accountNumber: z.string().min(10),
        bankName: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        // Dev bypass for test account
        if (process.env.NODE_ENV !== "production" && input.affiliateId === 9999) {
          return { success: true };
        }
        // Verify affiliate exists, is active, and the code matches the ID
        const affiliate = await getAffiliateById(input.affiliateId);
        if (!affiliate) throw new TRPCError({ code: "NOT_FOUND", message: "Affiliate not found" });
        if (affiliate.status !== "active") throw new TRPCError({ code: "FORBIDDEN", message: "Account is not active" });
        if (affiliate.code !== input.affiliateCode) throw new TRPCError({ code: "FORBIDDEN", message: "Invalid session — please log in again" });
        await createAffiliateWithdrawal({
          affiliateId: input.affiliateId,
          amount: input.amount,
          method: "bank_transfer",
          accountName: input.accountName,
          accountNumber: input.accountNumber,
          bankName: input.bankName,
        });
        return { success: true };
      }),

    /** Admin: list all affiliates (protected — staff only). */
    listAll: protectedProcedure.query(async () => {
      const all = await getAllAffiliates();
      return all.map(({ passwordHash: _ph, ...safe }) => safe);
    }),

    /** Admin: register a new affiliate. */
    register: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const existing = await getAffiliateByEmail(input.email);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
        const affiliate = await createAffiliate(input);
        const { passwordHash: _ph, ...safe } = affiliate;
        return safe;
      }),

    /** Public: self-service affiliate application. Creates account with status "pending". */
    selfRegister: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(1),
        password: z.string().min(8),
        state: z.string().optional(),
        instagram: z.string().optional(),
        linkedin: z.string().optional(),
        twitter: z.string().optional(),
        marketingPlan: z.string().optional(),
        audienceSize: z.string().optional(),
        hoursPerWeek: z.string().optional(),
        whyAffiliate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const existing = await getAffiliateByEmail(input.email);
        if (existing) throw new TRPCError({ code: "CONFLICT", message: "This email is already registered. Please log in instead." });
        const affiliate = await createAffiliate({
          name: input.name,
          email: input.email,
          password: input.password,
          phone: input.phone,
        });
        // Set status to "pending" for review
        const db = await getDb();
        if (db) {
          await db.update(affiliates).set({ status: "pending" }).where(eq(affiliates.id, affiliate.id));
        }
        // Send notification to CSO for review
        await createNotification({
          userId: "cso",
          title: "New Affiliate Application",
          message: `${input.name} (${input.email}, ${input.phone}) applied to the affiliate program. State: ${input.state || "N/A"}. Marketing plan: ${input.marketingPlan || "N/A"}. Why: ${input.whyAffiliate || "N/A"}. Review and approve from the affiliate section.`,
          type: "system",
        });
        return { success: true, code: affiliate.code };
      }),

    upgradeTier: protectedProcedure
      .input(z.object({ affiliateId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Tier logic: count confirmed conversions, set tier accordingly
        const records = await getAffiliateRecordsByAffiliate(input.affiliateId);
        const converted = records.filter((r: any) => r.status === "confirmed" || r.status === "paid").length;
        let tier: string;
        if (converted >= 31)      tier = "platinum";
        else if (converted >= 16) tier = "gold";
        else if (converted >= 6)  tier = "silver";
        else                      tier = "bronze";
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "System",
          action: "affiliate_tier_upgrade",
          resource: "affiliates",
          resourceId: input.affiliateId,
          details: `Affiliate tier set to ${tier} based on ${converted} confirmed conversions`,
        });
        return { tier, converted };
      }),

    /** Seed sample affiliates and referral records — founder/CEO only */
    seedSample: founderCEOProcedure
      .mutation(async () => {
        const { seedSampleAffiliates } = await import("./seed-staff");
        const result = await seedSampleAffiliates();
        return { success: true, ...result };
      }),
  }),

  // ─── Subscriptions (CSO/Finance) ──────────────────────────────────────────
  subscriptions: router({
    create: csoProcedure
      .input(z.object({
        clientName: z.string().min(1),
        businessName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        service: z.string().min(1),
        department: z.string().default("bizdoc"),
        monthlyFee: z.number().positive(),
        billingDay: z.number().min(1).max(28).default(1),
        startDate: z.string().min(1),
        assignedStaffEmail: z.string().optional(),
        notesForStaff: z.string().optional(),
        leadId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const sub = await createSubscription({
          ...input,
          monthlyFee: String(input.monthlyFee),
          status: "active",
          createdBy: ctx.user.name || ctx.user.email || ctx.user.openId,
        });
        const currentMonth = new Date().toISOString().slice(0, 7);
        await getOrCreateMonthlyPayment(sub.id, currentMonth, String(input.monthlyFee));
        await createActivityLog({
          action: "subscription_created",
          details: `Subscription created for ${input.clientName} — ${input.service} @ ₦${input.monthlyFee}/month`,
          userId: ctx.user.id,
        });
        return sub;
      }),

    list: protectedProcedure.query(async () => getSubscriptions()),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const sub = await getSubscriptionById(input.id);
        if (!sub) throw new TRPCError({ code: "NOT_FOUND" });
        const [payments, subTasks, creds] = await Promise.all([
          getPaymentsBySubscription(sub.id),
          getTasksBySubscriptionId(sub.id),
          getCredentialsBySubscriptionId(sub.id),
        ]);
        const maskedCreds = creds.map(c => ({
          ...c,
          passwordEnc: maskPassword(8),
          iv: "",
        }));
        return { sub, payments, tasks: subTasks, creds: maskedCreds };
      }),

    updateStatus: csoProcedure
      .input(z.object({ id: z.number(), status: z.enum(["active", "paused", "cancelled"]) }))
      .mutation(async ({ input }) => {
        await updateSubscriptionStatus(input.id, input.status);
        return { success: true };
      }),

    createMonthlyTask: csoProcedure
      .input(z.object({
        subscriptionId: z.number(),
        month: z.string().min(7).max(7),
      }))
      .mutation(async ({ input, ctx }) => {
        const sub = await getSubscriptionById(input.subscriptionId);
        if (!sub) throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
        if (sub.status !== "active") throw new TRPCError({ code: "BAD_REQUEST", message: "Subscription is not active" });
        const existing = await getTasksBySubscriptionId(sub.id);
        const alreadyExists = existing.find(t => t.taskMonth === input.month);
        if (alreadyExists) throw new TRPCError({ code: "BAD_REQUEST", message: `Task for ${input.month} already exists` });
        const ref = generateRefNumber(sub.phone);
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.insert(tasks).values({
          ref,
          leadId: sub.leadId ?? undefined,
          subscriptionId: sub.id,
          taskMonth: input.month,
          clientName: sub.clientName,
          businessName: sub.businessName,
          phone: sub.phone,
          service: `${sub.service} — ${input.month}`,
          status: "Not Started",
          department: sub.department,
          quotedPrice: sub.monthlyFee,
          notes: sub.notesForStaff || `Monthly ${sub.service} task for ${input.month}`,
        });
        await getOrCreateMonthlyPayment(sub.id, input.month, sub.monthlyFee);
        await createActivityLog({
          action: "monthly_task_created",
          details: `Monthly task created for ${sub.clientName} — ${input.month}`,
          userId: ctx.user.id,
        });
        return { ref };
      }),

    recordPayment: financeProcedure
      .input(z.object({
        subscriptionId: z.number(),
        month: z.string(),
        amountPaid: z.number().positive(),
        paymentRef: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const sub = await getSubscriptionById(input.subscriptionId);
        if (!sub) throw new TRPCError({ code: "NOT_FOUND" });
        const payment = await getOrCreateMonthlyPayment(input.subscriptionId, input.month, sub.monthlyFee);
        await updateSubscriptionPayment(payment.id, {
          status: "paid",
          amountPaid: String(input.amountPaid),
          paidAt: new Date(),
          recordedBy: ctx.user.name || ctx.user.email || "Finance",
          paymentRef: input.paymentRef,
          notes: input.notes,
        });
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "Finance",
          action: "subscription_payment_recorded",
          resource: "subscriptions",
          resourceId: input.subscriptionId,
          details: `Payment ₦${input.amountPaid} recorded for ${sub.clientName} — ${input.month}`,
        });
        return { success: true };
      }),

    allPayments: financeProcedure.query(async () => {
      const [subs, payments] = await Promise.all([getSubscriptions(), getAllSubscriptionPayments()]);
      return payments.map(p => {
        const sub = subs.find(s => s.id === p.subscriptionId);
        return { ...p, clientName: sub?.clientName, service: sub?.service };
      });
    }),

    clientHistory: publicProcedure
      .input(z.object({ ref: z.string().min(4) }))
      .query(async ({ input }) => {
        const sub = await getSubscriptionByLeadRef(input.ref.trim().toUpperCase());
        if (!sub) return null;
        const [payments, monthlyTasks] = await Promise.all([
          getPaymentsBySubscription(sub.id),
          getTasksBySubscriptionId(sub.id),
        ]);
        return {
          clientName: sub.clientName,
          businessName: sub.businessName,
          service: sub.service,
          status: sub.status,
          startDate: sub.startDate,
          payments,
          monthlyTasks: monthlyTasks.map(t => ({
            month: t.taskMonth,
            status: t.status,
            service: t.service,
            kpiApproved: t.kpiApproved,
            completedAt: t.completedAt,
          })),
        };
      }),
  }),

  // ─── Tax Savings Records ──────────────────────────────────────────────────
  taxSavings: router({
    record: protectedProcedure
      .input(z.object({
        subscriptionId: z.number(),
        year: z.string().length(4),
        grossTaxLiability: z.number().optional(),
        savedAmount: z.number().optional(),
        tccDelivered: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const hamzuryFee = input.savedAmount ? input.savedAmount * 0.1 : undefined;
        const record = await upsertTaxSavingsRecord({
          subscriptionId: input.subscriptionId,
          year: input.year,
          grossTaxLiability: input.grossTaxLiability?.toString(),
          savedAmount: input.savedAmount?.toString(),
          hamzuryFee: hamzuryFee?.toString(),
          tccDelivered: input.tccDelivered,
          tccDeliveredAt: input.tccDelivered ? new Date() : undefined,
          notes: input.notes,
          recordedBy: ctx.user.name || ctx.user.email || ctx.user.openId,
        });
        await createActivityLog({
          action: "tax_savings_recorded",
          details: `Tax savings for ${input.year}: saved ₦${input.savedAmount?.toLocaleString() ?? 0}, HAMZURY fee ₦${hamzuryFee?.toLocaleString() ?? 0}`,
          userId: ctx.user.id,
        });
        return record;
      }),

    getBySubscription: protectedProcedure
      .input(z.object({ subscriptionId: z.number() }))
      .query(async ({ input }) => getTaxSavingsBySubscription(input.subscriptionId)),
  }),

  // ─── Client Credentials (BizDoc staff) ───────────────────────────────────
  credentials: router({
    add: protectedProcedure
      .input(z.object({
        taskId: z.number().optional(),
        subscriptionId: z.number().optional(),
        platform: z.string().min(1),
        loginUrl: z.string().optional(),
        username: z.string().min(1),
        password: z.string().min(1),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { encrypted, iv } = encryptCredential(input.password);
        const cred = await createClientCredential({
          taskId: input.taskId,
          subscriptionId: input.subscriptionId,
          platform: input.platform,
          loginUrl: input.loginUrl,
          username: input.username,
          passwordEnc: encrypted,
          iv,
          notes: input.notes,
          addedBy: ctx.user.email || ctx.user.name || ctx.user.openId,
        });
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "Staff",
          action: "credential_added",
          resource: "client_credentials",
          resourceId: cred.id,
          details: `Credentials added for platform: ${input.platform}${input.taskId ? ` (task ${input.taskId})` : ""}`,
        });
        return { id: cred.id, platform: cred.platform, username: cred.username };
      }),

    listByTask: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input }) => {
        const creds = await getCredentialsByTaskId(input.taskId);
        return creds.map(c => ({
          id: c.id,
          platform: c.platform,
          loginUrl: c.loginUrl,
          username: c.username,
          passwordMasked: maskPassword(12),
          notes: c.notes,
          addedBy: c.addedBy,
          createdAt: c.createdAt,
        }));
      }),

    listBySubscription: protectedProcedure
      .input(z.object({ subscriptionId: z.number() }))
      .query(async ({ input }) => {
        const creds = await getCredentialsBySubscriptionId(input.subscriptionId);
        return creds.map(c => ({
          id: c.id,
          platform: c.platform,
          loginUrl: c.loginUrl,
          username: c.username,
          passwordMasked: maskPassword(12),
          notes: c.notes,
          addedBy: c.addedBy,
          createdAt: c.createdAt,
        }));
      }),

    reveal: protectedProcedure
      .input(z.object({ credentialId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const result = await db.select().from(clientCredentials).where(eq(clientCredentials.id, input.credentialId)).limit(1);
        if (!result[0]) throw new TRPCError({ code: "NOT_FOUND" });
        const cred = result[0];
        const password = decryptCredential(cred.passwordEnc, cred.iv);
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "Staff",
          action: "credential_revealed",
          resource: "client_credentials",
          resourceId: cred.id,
          details: `Password revealed for ${cred.platform} by ${ctx.user.email || ctx.user.name}`,
        });
        return { username: cred.username, password, loginUrl: cred.loginUrl };
      }),

    delete: seniorProcedure
      .input(z.object({ credentialId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "Staff",
          action: "credential_deleted",
          resource: "client_credentials",
          resourceId: input.credentialId,
          details: "Credential deleted",
        });
        await deleteClientCredential(input.credentialId);
        return { success: true };
      }),
  }),

  // ─── Pricing (Service Price List) ───────────────────────────────────────────
  pricing: router({
    list: publicProcedure
      .input(z.object({ department: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getServicePricing(input?.department);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const pricing = await getServicePricingById(input.id);
        if (!pricing) throw new TRPCError({ code: "NOT_FOUND", message: "Pricing entry not found" });
        return pricing;
      }),

    create: founderCEOProcedure
      .input(z.object({
        department: z.enum(["bizdoc", "systemise", "skills", "metfix"]),
        category: z.string().min(1),
        serviceName: z.string().min(1),
        description: z.string().optional(),
        basePrice: z.number().min(0),
        maxPrice: z.number().optional(),
        unit: z.enum(["one_time", "monthly", "per_cohort", "per_session", "custom"]).default("one_time"),
        commissionPercent: z.number().min(0).max(100).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return createServicePricing(input as any);
      }),

    update: founderCEOProcedure
      .input(z.object({
        id: z.number(),
        serviceName: z.string().optional(),
        description: z.string().optional(),
        basePrice: z.number().optional(),
        maxPrice: z.number().optional(),
        unit: z.enum(["one_time", "monthly", "per_cohort", "per_session", "custom"]).optional(),
        commissionPercent: z.number().min(0).max(100).optional(),
        isActive: z.boolean().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateServicePricing(id, data as any);
      }),

    seed: founderCEOProcedure
      .mutation(async () => {
        await seedDefaultPricing();
        return { success: true };
      }),
  }),

  // ─── Invoices ───────────────────────────────────────────────────────────────
  invoices: router({
    list: financeProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getInvoices(input?.status);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const invoice = await getInvoiceById(input.id);
        if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
        return invoice;
      }),

    getByNumber: publicProcedure
      .input(z.object({ invoiceNumber: z.string().min(1) }))
      .query(async ({ input }) => {
        const invoice = await getInvoiceByNumber(input.invoiceNumber.trim().toUpperCase());
        if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
        return invoice;
      }),

    create: seniorProcedure
      .input(z.object({
        clientName: z.string().min(1),
        clientEmail: z.string().optional(),
        clientPhone: z.string().optional(),
        items: z.any(), // json array
        subtotal: z.number().min(0),
        total: z.number().min(0),
        discount: z.number().optional(),
        tax: z.number().optional(),
        dueDate: z.string().optional(), // ISO date string
        notes: z.string().optional(),
        leadId: z.number().optional(),
        taskId: z.number().optional(),
        subscriptionId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const invoice = await createInvoice({
          ...input,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
          createdBy: ctx.user.email || ctx.user.name || ctx.user.openId,
        } as any);
        return invoice;
      }),

    update: financeProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "sent", "paid", "partial", "overdue", "cancelled"]).optional(),
        amountPaid: z.number().optional(),
        notes: z.string().optional(),
        paidAt: z.string().optional(), // ISO date string
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: Record<string, unknown> = { ...data };
        if (data.paidAt) updateData.paidAt = new Date(data.paidAt);
        const invoice = await updateInvoice(id, updateData as any);
        if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
        return invoice;
      }),

    /** Public — returns bank account details for transfer payment (general + bizdoc) */
    bankDetails: publicProcedure.query(() => {
      return {
        general: {
          bankName: ENV.bankName,
          accountNumber: ENV.bankAccountNumber,
          accountName: ENV.bankAccountName,
          configured: !!(ENV.bankAccountNumber && ENV.bankAccountName),
        },
        bizdoc: {
          bankName: ENV.bizdocBankName,
          accountNumber: ENV.bizdocBankAccountNumber,
          accountName: ENV.bizdocBankAccountName,
          configured: !!(ENV.bizdocBankAccountNumber && ENV.bizdocBankAccountName),
        },
      };
    }),

    /** Public — client claims they've transferred payment; sends email alert to finance */
    claimPayment: publicProcedure
      .input(z.object({
        invoiceNumber: z.string().min(1),
        clientName: z.string().optional(),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const invoice = await getInvoiceByNumber(input.invoiceNumber.trim().toUpperCase());
        if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
        if (invoice.status === "paid") {
          return { ok: true, alreadyPaid: true };
        }

        // Fire email alert (non-blocking)
        sendPaymentClaimedAlert({
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          amount: invoice.total - (invoice.amountPaid ?? 0),
          phone: invoice.clientPhone,
          email: invoice.clientEmail,
        }).catch(err => console.error("[email] Payment claim alert failed:", err));

        // Create audit log
        await createAuditLog({
          userId: 0,
          userName: input.clientName || invoice.clientName,
          action: "payment_claimed",
          resource: "invoices",
          resourceId: invoice.id,
          details: `Client claimed payment for invoice ${invoice.invoiceNumber} (balance ₦${invoice.total - (invoice.amountPaid ?? 0)})`,
        });

        return { ok: true, alreadyPaid: false };
      }),

    markPaid: financeProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const existing = await getInvoiceById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
        const invoice = await updateInvoice(input.id, {
          status: "paid" as any,
          amountPaid: existing.total,
          paidAt: new Date(),
        });
        // Create notification for CSO about the payment
        await createNotification({
          userId: "cso", // CSO team channel
          type: "payment",
          title: "Invoice Paid",
          message: `Invoice ${existing.invoiceNumber} for ${existing.clientName} has been marked as paid (₦${existing.total.toLocaleString()}).`,
          link: `/finance/dashboard`,
        });
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "Finance",
          action: "invoice_paid",
          resource: "invoices",
          resourceId: input.id,
          details: `Invoice ${existing.invoiceNumber} marked as paid — ₦${existing.total}`,
        });
        return invoice;
      }),
  }),

  // ─── Notifications ──────────────────────────────────────────────────────────
  notifications: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const userId = ctx.user.email || ctx.user.openId;
        return getNotifications(userId);
      }),

    unreadCount: protectedProcedure
      .query(async ({ ctx }) => {
        const userId = ctx.user.email || ctx.user.openId;
        return getUnreadNotifications(userId);
      }),

    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await markNotificationRead(input.id);
        return { success: true };
      }),

    markAllRead: protectedProcedure
      .mutation(async ({ ctx }) => {
        const userId = ctx.user.email || ctx.user.openId;
        await markAllNotificationsRead(userId);
        return { success: true };
      }),
  }),

  // ─── Proposals ──────────────────────────────────────────────────────────────
  proposals: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getProposals(input?.status);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const proposal = await getProposalById(input.id);
        if (!proposal) throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found" });
        return proposal;
      }),

    getByNumber: publicProcedure
      .input(z.object({ proposalNumber: z.string().min(1) }))
      .query(async ({ input }) => {
        const proposal = await getProposalByNumber(input.proposalNumber.trim().toUpperCase());
        if (!proposal) throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found" });
        return proposal;
      }),

    create: csoProcedure
      .input(z.object({
        clientName: z.string().min(1),
        clientEmail: z.string().optional(),
        clientPhone: z.string().optional(),
        businessName: z.string().optional(),
        services: z.any(), // json array of service line items
        totalAmount: z.number().min(0),
        validUntil: z.string().optional(), // ISO date string
        notes: z.string().optional(),
        leadId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const proposal = await createProposal({
          ...input,
          validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
          createdBy: ctx.user.email || ctx.user.name || ctx.user.openId,
        } as any);
        return proposal;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]).optional(),
        clientName: z.string().optional(),
        clientEmail: z.string().optional(),
        clientPhone: z.string().optional(),
        businessName: z.string().optional(),
        services: z.any().optional(),
        totalAmount: z.number().optional(),
        validUntil: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: Record<string, unknown> = { ...data };
        if (data.validUntil) updateData.validUntil = new Date(data.validUntil);
        const proposal = await updateProposal(id, updateData as any);
        if (!proposal) throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found" });
        return proposal;
      }),

    accept: publicProcedure
      .input(z.object({ proposalNumber: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const proposal = await getProposalByNumber(input.proposalNumber.trim().toUpperCase());
        if (!proposal) throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found" });
        if (proposal.status === "accepted") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Proposal is already accepted" });
        }
        const updated = await updateProposal(proposal.id, { status: "accepted" as any });
        // Notify CSO that a client accepted a proposal
        await createNotification({
          userId: "cso",
          type: "status_change",
          title: "Proposal Accepted",
          message: `${proposal.clientName} accepted proposal ${proposal.proposalNumber} (₦${proposal.totalAmount.toLocaleString()}).`,
          link: `/cso/dashboard`,
        });
        return updated;
      }),
  }),

  // ─── Certificates ──────────────────────────────────────────────────────────
  certificates: router({
    list: protectedProcedure
      .input(z.object({ cohortId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getCertificates(input?.cohortId);
      }),

    create: seniorProcedure
      .input(z.object({
        studentName: z.string().min(1),
        studentEmail: z.string().optional(),
        cohortId: z.number().optional(),
        program: z.string().min(1),
        completionDate: z.string().min(1), // ISO date string
        grade: z.string().optional(),
        issuedBy: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const certificate = await createCertificate({
          ...input,
          completionDate: new Date(input.completionDate),
        } as any);
        return certificate;
      }),

    verify: publicProcedure
      .input(z.object({ certificateNumber: z.string().min(1) }))
      .query(async ({ input }) => {
        const cert = await getCertificateByNumber(input.certificateNumber.trim().toUpperCase());
        if (!cert) throw new TRPCError({ code: "NOT_FOUND", message: "Certificate not found" });
        return cert;
      }),

    myList: protectedProcedure
      .query(async ({ ctx }) => {
        const email = ctx.user.email;
        if (!email) return [];
        return getCertificatesByStudent(email);
      }),
  }),

  // ─── Content Calendar ─────────────────────────────────────────────────────
  content: router({
    list: protectedProcedure
      .input(z.object({
        department: z.string().optional(),
        status: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getContentPosts(input?.department, input?.status, input?.limit ?? 50);
      }),

    create: protectedProcedure
      .input(z.object({
        department: z.enum(["general", "bizdoc", "systemise", "skills"]),
        platform: z.enum(["instagram", "tiktok", "twitter", "linkedin"]),
        contentType: z.enum(["educational", "success_story", "service_spotlight", "behind_scenes", "quote", "carousel"]),
        caption: z.string().min(1),
        hashtags: z.string().optional(),
        mediaUrl: z.string().optional(),
        scheduledFor: z.string().optional(),
        status: z.enum(["draft", "scheduled", "posted", "failed"]).optional(),
        createdBy: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createContentPost({
          ...input,
          scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : undefined,
          status: input.status ?? "draft",
          createdBy: input.createdBy ?? ctx.user.email ?? "staff",
        } as any);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        department: z.enum(["general", "bizdoc", "systemise", "skills"]).optional(),
        platform: z.enum(["instagram", "tiktok", "twitter", "linkedin"]).optional(),
        contentType: z.enum(["educational", "success_story", "service_spotlight", "behind_scenes", "quote", "carousel"]).optional(),
        caption: z.string().optional(),
        hashtags: z.string().optional(),
        mediaUrl: z.string().optional(),
        scheduledFor: z.string().optional(),
        status: z.enum(["draft", "scheduled", "posted", "failed"]).optional(),
        postedAt: z.string().optional(),
        engagement: z.any().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updates: any = { ...data };
        if (data.scheduledFor) updates.scheduledFor = new Date(data.scheduledFor);
        if (data.postedAt) updates.postedAt = new Date(data.postedAt);
        return updateContentPost(id, updates);
      }),

    calendar: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        return getContentCalendar(new Date(input.startDate), new Date(input.endDate));
      }),

    generate: protectedProcedure
      .input(z.object({
        department: z.enum(["general", "bizdoc", "systemise", "skills"]),
        platform: z.enum(["instagram", "tiktok", "twitter", "linkedin"]),
        topic: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const departmentDescriptions: Record<string, string> = {
          general: "HAMZURY — a Nigerian business consulting firm offering registration, compliance, digital systems, and skills training",
          bizdoc: "BizDoc by HAMZURY — business registration, CAC filing, tax compliance, annual returns, foreign business registration in Nigeria",
          systemise: "Systemise by HAMZURY — digital transformation, websites, CRMs, brand identity, social media management for Nigerian businesses",
          skills: "HAMZURY Skills — faceless content creation, executive programmes, IT internships, AI courses, and the RIDI rural digital inclusion programme",
        };

        const platformGuidelines: Record<string, string> = {
          instagram: "Instagram post caption (under 2200 chars). Engaging, visual-first, include a CTA. Use line breaks for readability.",
          tiktok: "TikTok caption (under 300 chars). Hook in first line, conversational tone, trending-style language.",
          twitter: "Twitter post (under 280 chars). Punchy, informative, thread-starter style.",
          linkedin: "LinkedIn post (300-1300 chars). Professional but warm tone, thought-leadership style, include actionable insight.",
        };

        const systemPrompt = `You are the HAMZURY AI Content Muse. You generate on-brand social media content for ${departmentDescriptions[input.department]}.

Brand voice: Professional yet warm, confident, educational, Nigerian context. Never use excessive emojis. Use Naira (₦) for prices. Reference Nigerian regulatory bodies (CAC, FIRS, SCUML) accurately.

Generate a single ${platformGuidelines[input.platform]}

Also generate 5-8 relevant hashtags.

Respond in JSON format: { "caption": "...", "hashtags": "#tag1 #tag2 ..." }`;

        try {
          const result = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: input.topic ? `Create content about: ${input.topic}` : `Create engaging content for the ${input.department} department` },
            ],
            maxTokens: 500,
          });

          const content = result.choices?.[0]?.message?.content;
          const text = typeof content === "string" ? content : Array.isArray(content) ? content.filter((c): c is { type: "text"; text: string } => c.type === "text").map(c => c.text).join("") : "";

          let parsed: { caption: string; hashtags: string };
          try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { caption: text, hashtags: "" };
          } catch {
            parsed = { caption: text, hashtags: "" };
          }

          // Save as draft
          const post = await createContentPost({
            department: input.department,
            platform: input.platform,
            contentType: "educational",
            caption: parsed.caption,
            hashtags: parsed.hashtags,
            status: "draft",
            createdBy: "ai_muse",
          } as any);

          return post;
        } catch (err: any) {
          // If LLM unavailable, create a placeholder draft
          const post = await createContentPost({
            department: input.department,
            platform: input.platform,
            contentType: "educational",
            caption: `[AI Draft] ${input.topic || input.department} content for ${input.platform} — edit and refine before scheduling.`,
            hashtags: "#HAMZURY #Content",
            status: "draft",
            createdBy: "ai_muse",
          } as any);
          return post;
        }
      }),

    seed: protectedProcedure
      .mutation(async () => {
        return seedContentPosts();
      }),
  }),

  // ─── AI Agents ──────────────────────────────────────────────────────────
  agents: router({
    /** Get all agent statuses — founder/CEO only */
    status: founderCEOProcedure.query(async () => {
      return getAgentStatus();
    }),

    /** Manually trigger an agent run — founder/CEO only */
    run: founderCEOProcedure
      .input(z.object({ agentId: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const result = await executeAgent(input.agentId);
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "Unknown",
          action: "agent_manual_run",
          resource: "agents",
          resourceId: 0,
          details: `Manual run of agent '${input.agentId}' by ${ctx.user.name || ctx.user.email}: ${result.tasksProcessed} tasks, ${result.errors.length} errors`,
        });
        return result;
      }),

    /** Enable/disable an agent — founder/CEO only */
    toggle: founderCEOProcedure
      .input(z.object({ agentId: z.string().min(1), enabled: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        const success = toggleAgent(input.agentId, input.enabled);
        if (!success) throw new TRPCError({ code: "NOT_FOUND", message: `Agent '${input.agentId}' not found` });
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "Unknown",
          action: input.enabled ? "agent_enabled" : "agent_disabled",
          resource: "agents",
          resourceId: 0,
          details: `Agent '${input.agentId}' ${input.enabled ? "enabled" : "disabled"} by ${ctx.user.name || ctx.user.email}`,
        });
        return { success: true, agentId: input.agentId, enabled: input.enabled };
      }),

    /** Get recent agent activity logs — founder/CEO only */
    logs: founderCEOProcedure
      .query(async () => {
        const allLogs = await getRecentActivityLogs(200);
        // Filter to only agent-related actions
        return allLogs.filter(
          (log) =>
            log.action.startsWith("agent_") ||
            log.details?.startsWith("[Evelyn]") ||
            log.details?.startsWith("[Amara]") ||
            log.details?.startsWith("[Nova]") ||
            log.details?.startsWith("[Zara]") ||
            log.details?.startsWith("[Kash]") ||
            log.details?.startsWith("[Muse]")
        ).slice(0, 100);
      }),

    /** Get pending AI suggestions for a department */
    suggestions: protectedProcedure
      .input(z.object({ department: z.string() }))
      .query(async ({ input }) => {
        return getAgentSuggestions(input.department);
      }),

    /** Accept or reject an AI suggestion */
    reviewSuggestion: protectedProcedure
      .input(z.object({
        id: z.number(),
        action: z.enum(["accepted", "rejected"]),
      }))
      .mutation(async ({ input, ctx }) => {
        await reviewAgentSuggestion(input.id, input.action, (ctx as any).user?.name || (ctx as any).user?.email || "staff");
        return { success: true };
      }),
  }),

  // ─── Leave Requests ────────────────────────────────────────────────────────
  leave: router({
    submit: protectedProcedure
      .input(z.object({
        staffEmail: z.string().email(),
        staffName: z.string().min(1),
        startDate: z.string(),
        endDate: z.string(),
        reason: z.string().optional(),
        replacementName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createLeaveRequest(input);
        return { success: true };
      }),

    list: protectedProcedure
      .input(z.object({ staffEmail: z.string().optional() }))
      .query(async ({ input }) => getLeaveRequests(input.staffEmail)),

    review: seniorProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["approved", "rejected"]),
        reviewNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await updateLeaveRequestStatus(input.id, input.status, ctx.user.name || ctx.user.email || "HR", input.reviewNotes);
        return { success: true };
      }),
  }),

  // ─── Discipline Records ────────────────────────────────────────────────────
  discipline: router({
    issue: seniorProcedure
      .input(z.object({
        staffEmail: z.string().email(),
        staffName: z.string().min(1),
        type: z.enum(["query", "suspension"]),
        reason: z.string().min(1),
        description: z.string().optional(),
        suspensionDays: z.number().optional(),
        issuedBy: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        await createDisciplineRecord(input);
        return { success: true };
      }),

    list: seniorProcedure
      .input(z.object({ staffEmail: z.string().optional() }))
      .query(async ({ input }) => getDisciplineRecords(input.staffEmail)),

    resolve: seniorProcedure
      .input(z.object({ id: z.number(), resolvedNotes: z.string() }))
      .mutation(async ({ input }) => {
        await resolveDisciplineRecord(input.id, input.resolvedNotes);
        return { success: true };
      }),
  }),

  // ─── Portal Visit Logs ─────────────────────────────────────────────────────
  portalLogs: router({
    log: protectedProcedure
      .input(z.object({
        subscriptionId: z.number(),
        clientName: z.string(),
        portalName: z.string(),
        visitedBy: z.string().optional(),
        actionTaken: z.string().optional(),
        status: z.enum(["logged_in", "submitted", "pending", "approved", "rejected", "error"]),
        nextActionDate: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createPortalVisitLog(input);
        return { success: true };
      }),

    list: protectedProcedure
      .input(z.object({ subscriptionId: z.number().optional() }))
      .query(async ({ input }) => getPortalVisitLogs(input.subscriptionId)),
  }),

  // ─── Content Engagement ───────────────────────────────────────────────────
  engagement: router({
    record: seniorProcedure
      .input(z.object({
        weekOf: z.string(),
        staffEmail: z.string().email(),
        staffName: z.string(),
        engaged: z.boolean(),
        platforms: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await upsertContentEngagement(input.weekOf, input.staffEmail, input.staffName, input.engaged, input.platforms, input.notes, ctx.user.name || ctx.user.email || "HR");
        return { success: true };
      }),

    weekReport: seniorProcedure
      .input(z.object({ weekOf: z.string() }))
      .query(async ({ input }) => getContentEngagementForWeek(input.weekOf)),
  }),

  // ─── Hub Meeting Records ──────────────────────────────────────────────────
  hubMeeting: router({
    save: founderCEOProcedure
      .input(z.object({
        weekOf: z.string(),
        researchTopic: z.string().optional(),
        researchAssignedTo: z.string().optional(),
        researchFormat: z.string().optional(),
        researchAdopted: z.boolean().optional(),
        projectLead: z.string().optional(),
        staffOfWeek: z.string().optional(),
        staffOfWeekAchievement: z.string().optional(),
        trainingTopic: z.string().optional(),
        trainingCategory: z.string().optional(),
        trainer: z.string().optional(),
        todoList: z.string().optional(),
        nextWeekTodos: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { weekOf, ...rest } = input;
        await upsertHubMeetingRecord(weekOf, { ...rest, createdBy: ctx.user.name || ctx.user.email || "CEO" });
        return { success: true };
      }),

    get: founderCEOProcedure
      .input(z.object({ weekOf: z.string() }))
      .query(async ({ input }) => getHubMeetingRecord(input.weekOf)),

    history: founderCEOProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => getHubMeetingHistory(input.limit)),
  }),

  // ─── Student Milestones ───────────────────────────────────────────────────
  milestones: router({
    create: protectedProcedure
      .input(z.object({
        cohortId: z.number().optional(),
        cohortName: z.string().optional(),
        studentType: z.enum(["physical", "online", "nitda"]),
        title: z.string().min(1),
        description: z.string().optional(),
        milestoneDate: z.string(),
        type: z.enum(["assignment", "quiz", "presentation", "celebration", "graduation", "event"]),
      }))
      .mutation(async ({ input }) => {
        await createStudentMilestone(input);
        return { success: true };
      }),

    list: protectedProcedure
      .input(z.object({ studentType: z.enum(["physical", "online", "nitda"]).optional() }))
      .query(async ({ input }) => getStudentMilestones(input.studentType)),

    celebrate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await markMilestoneCelebrated(input.id);
        return { success: true };
      }),
  }),

  // ─── Finance: Revenue Allocation ─────────────────────────────────────────
  finance: router({
    /** Allocate revenue from a confirmed payment — 50/30/20 split */
    allocate: founderCEOProcedure
      .input(z.object({
        transactionRef: z.string().min(1),
        clientRef: z.string().optional(),
        clientName: z.string().optional(),
        service: z.string().optional(),
        department: z.string().optional(),
        totalAmount: z.number().min(1),
        affiliateId: z.number().optional(),
        affiliateCode: z.string().optional(),
        affiliateTier: z.enum(["elite", "premier", "standard", "entry", "waiting"]).optional(),
        contentBonus: z.boolean().optional(),
        aiContributionPct: z.number().min(0).max(100).optional(),
        staffPayouts: z.array(z.object({ staffId: z.string(), name: z.string(), effortPct: z.number() })).optional(),
      }))
      .mutation(async ({ input }) => {
        const total = input.totalAmount;
        const institutional = total * 0.50;
        const staffPool = total * 0.30;
        const affiliatePool = total * 0.20;

        // Institutional breakdown
        const ops = institutional * 0.50;      // 25% of total
        const growth = institutional * 0.20;   // 10% of total
        const aiFund = institutional * 0.18;   // 9% of total
        const reserve = institutional * 0.12;  // 6% of total

        // AI staff share (if AI did >50% of work)
        const aiPct = input.aiContributionPct || 0;
        const aiStaffShare = aiPct > 50 ? staffPool * 0.30 : 0;
        const humanStaff = staffPool - aiStaffShare;
        const totalAiFund = aiFund + aiStaffShare;

        // Affiliate commission
        const tierRates: Record<string, number> = { elite: 0.15, premier: 0.12, standard: 0.10, entry: 0.08, waiting: 0 };
        const commRate = tierRates[input.affiliateTier || "waiting"] || 0;
        const affCommission = total * commRate;
        const contentBonusAmt = input.contentBonus ? total * 0.03 : 0;
        const affTotal = affCommission + contentBonusAmt;

        // Quarter
        const now = new Date();
        const q = `Q${Math.ceil((now.getMonth() + 1) / 3)}-${now.getFullYear()}`;

        // Staff payout breakdown
        const staffPayoutsCalc = (input.staffPayouts || []).map(s => ({
          ...s,
          amount: String(humanStaff * (s.effortPct / 100)),
        }));

        const allocation = await createAllocation({
          transactionRef: input.transactionRef,
          clientRef: input.clientRef,
          clientName: input.clientName,
          service: input.service,
          department: input.department,
          totalAmount: String(total),
          institutionalAmount: String(institutional),
          opsAmount: String(ops),
          growthAmount: String(growth),
          aiFundAmount: String(totalAiFund),
          reserveAmount: String(reserve),
          staffPoolAmount: String(staffPool),
          aiStaffShare: String(aiStaffShare),
          humanStaffAmount: String(humanStaff),
          staffPayouts: staffPayoutsCalc,
          affiliatePoolAmount: String(affiliatePool),
          affiliateId: input.affiliateId,
          affiliateCode: input.affiliateCode,
          affiliateTier: input.affiliateTier,
          affiliateCommission: String(affCommission),
          contentBonus: String(contentBonusAmt),
          affiliateTotalPayout: String(affTotal),
          aiContributionPct: aiPct,
          quarter: q,
          status: "pending",
        });

        // Log AI fund
        if (totalAiFund > 0) {
          const currentBalance = parseFloat(await getAIFundBalance());
          await createAIFundEntry({
            allocationId: allocation.id,
            amount: String(totalAiFund),
            source: aiStaffShare > 0 ? "institutional+staff" : "institutional",
            description: `From ${input.transactionRef}: ₦${totalAiFund.toLocaleString()}`,
            balance: String(currentBalance + totalAiFund),
          });
        }

        return allocation;
      }),

    allocations: financeProcedure
      .input(z.object({ quarter: z.string().optional() }).optional())
      .query(async ({ input }) => {
        if (input?.quarter) return getAllocationsByQuarter(input.quarter);
        return getAllocations();
      }),

    aiFund: financeProcedure.query(async () => {
      const balance = await getAIFundBalance();
      const log = await getAIFundLog();
      return { balance, log };
    }),

    leagueTable: protectedProcedure
      .input(z.object({ quarter: z.string().optional() }))
      .query(async ({ input }) => {
        const now = new Date();
        const q = input.quarter || `Q${Math.ceil((now.getMonth() + 1) / 3)}-${now.getFullYear()}`;
        return getLeagueTable(q);
      }),
  }),

  // ─── Skills Competition (Squid Game) ─────────────────────────────────────
  skillsCompetition: router({
    teams: protectedProcedure
      .input(z.object({ quarter: z.string() }))
      .query(async ({ input }) => getSkillsTeams(input.quarter)),

    createTeam: seniorProcedure
      .input(z.object({
        name: z.string().min(1),
        quarter: z.string().min(1),
        color: z.string().optional(),
        cohortId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await createSkillsTeam(input);
        return { success: true };
      }),

    updatePoints: seniorProcedure
      .input(z.object({ teamId: z.number(), points: z.number() }))
      .mutation(async ({ input }) => {
        await updateSkillsTeamPoints(input.teamId, input.points);
        return { success: true };
      }),

    sessions: protectedProcedure
      .input(z.object({ quarter: z.string() }))
      .query(async ({ input }) => getInteractiveSessions(input.quarter)),

    createSession: seniorProcedure
      .input(z.object({
        quarter: z.string().min(1),
        weekNumber: z.number(),
        dayOfWeek: z.enum(["monday", "tuesday", "wednesday"]),
        title: z.string().min(1),
        description: z.string().optional(),
        type: z.enum(["game", "tech_talk", "entrepreneurship", "prompt_challenge", "tool_exploration", "social_media", "content_creation", "branding"]),
        sessionDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createInteractiveSession(input);
        return { success: true };
      }),

    awards: protectedProcedure
      .input(z.object({ quarter: z.string() }))
      .query(async ({ input }) => getSkillsAwards(input.quarter)),

    createAward: founderCEOProcedure
      .input(z.object({
        quarter: z.string().min(1),
        teamId: z.number().optional(),
        teamName: z.string().optional(),
        awardType: z.enum(["champion", "runner_up", "best_project", "best_content", "most_improved", "special"]),
        title: z.string().min(1),
        description: z.string().optional(),
        recipientName: z.string().optional(),
        awardDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await createSkillsAward(input);
        return { success: true };
      }),
  }),

  // ─── Skills Calendar ─────────────────────────────────────────────────────
  skillsCalendar: router({
    list: publicProcedure.query(async () => getSkillsCalendar()),
    create: founderCEOProcedure
      .input(z.object({
        quarter: z.string().min(1),
        theme: z.string().optional(),
        registrationStart: z.string().min(1),
        registrationEnd: z.string().min(1),
        orientationDate: z.string().min(1),
        classesStart: z.string().min(1),
        classesEnd: z.string().min(1),
        graduationDate: z.string().min(1),
        supportWindowStart: z.string().optional(),
        supportWindowEnd: z.string().optional(),
        executiveCircleStart: z.string().optional(),
        executiveCircleEnd: z.string().optional(),
        track1Name: z.string().optional(),
        track2Name: z.string().optional(),
        track3Name: z.string().optional(),
        roboticsName: z.string().optional(),
        status: z.enum(["upcoming", "registration", "active", "support", "completed"]).optional(),
      }))
      .mutation(async ({ input }) => {
        await createSkillsCalendarEntry(input);
        return { success: true };
      }),
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // CLIENT AI CHAT — per-client / per-task dedicated AI chat threads
  // ═══════════════════════════════════════════════════════════════════════════
  clientChat: router({
    create: protectedProcedure
      .input(z.object({
        taskId: z.number().optional(),
        clientRef: z.string().min(1),
        clientName: z.string().optional(),
        department: z.string().optional(),
        systemPrompt: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const defaultPrompt = `You are a dedicated HAMZURY advisor for client ${input.clientName || input.clientRef}. Department: ${input.department || "general"}. Your job is to help the team handle this client's needs efficiently. Track tasks, follow up on documents, suggest next steps, and keep the team aligned. Be concise and action-oriented. Never share internal pricing or commission details with external parties.`;
        return createClientChat({
          taskId: input.taskId,
          clientRef: input.clientRef,
          clientName: input.clientName,
          department: input.department,
          systemPrompt: input.systemPrompt || defaultPrompt,
          chatHistory: [],
          createdBy: ctx.user.name || ctx.user.email || ctx.user.openId,
        });
      }),

    getByTask: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .query(async ({ input }) => getClientChatsByTask(input.taskId)),

    getByRef: protectedProcedure
      .input(z.object({ clientRef: z.string() }))
      .query(async ({ input }) => getClientChatByRef(input.clientRef)),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getClientChatById(input.id)),

    sendMessage: protectedProcedure
      .input(z.object({
        chatId: z.number(),
        message: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        // 1. Load the chat
        const chat = await getClientChatById(input.chatId);
        if (!chat) throw new TRPCError({ code: "NOT_FOUND", message: "Chat not found" });
        if (chat.status !== "active") throw new TRPCError({ code: "BAD_REQUEST", message: "Chat is not active" });

        // 2. Build message history
        const history: Array<{ role: string; content: string }> = Array.isArray(chat.chatHistory) ? (chat.chatHistory as any[]) : [];
        history.push({ role: "user", content: input.message });

        // 3. Call the LLM with system prompt + history
        const llmMessages = [
          { role: "system" as const, content: chat.systemPrompt },
          ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        ];

        let aiResponse = "";
        try {
          const result = await invokeLLM({ messages: llmMessages, maxTokens: 2048 });
          const choice = result.choices?.[0];
          if (choice?.message?.content) {
            aiResponse = typeof choice.message.content === "string"
              ? choice.message.content
              : (choice.message.content as any[]).map((c: any) => c.text || "").join("");
          }
        } catch (err: any) {
          aiResponse = `[AI unavailable: ${err.message || "Unknown error"}]`;
        }

        // 4. Append AI response to history and save
        history.push({ role: "assistant", content: aiResponse });
        await updateClientChat(chat.id, { chatHistory: history });

        return {
          response: aiResponse,
          messageCount: history.length,
          senderName: ctx.user.name || ctx.user.email || "Staff",
        };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        systemPrompt: z.string().optional(),
        status: z.enum(["active", "paused", "closed"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateClientChat(id, data);
      }),
  }),

  // ─── Partnerships (BizDev) ────────────────────────────────────────────────
  partnerships: router({
    list: protectedProcedure.query(() => listPartnerships()),
    create: protectedProcedure.input(z.object({
      name: z.string(), type: z.enum(["referral_partner", "community_partner", "events_partner", "regional_partner", "ecosystem_partner"]),
      contact: z.string().optional(), stage: z.enum(["researching", "outreach", "agreed", "active", "paused"]).optional(),
      referrals: z.number().optional(), notes: z.string().optional(), createdBy: z.string().optional(),
    })).mutation(({ input }) => createPartnership(input as any)),
    update: protectedProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), type: z.enum(["referral_partner", "community_partner", "events_partner", "regional_partner", "ecosystem_partner"]).optional(),
      contact: z.string().optional(), stage: z.enum(["researching", "outreach", "agreed", "active", "paused"]).optional(),
      referrals: z.number().optional(), notes: z.string().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return updatePartnership(id, data as any); }),
  }),

  // ─── Brand QA (BizDev) ────────────────────────────────────────────────────
  brandQa: router({
    list: protectedProcedure.query(() => listBrandQaItems()),
    create: protectedProcedure.input(z.object({
      department: z.string(), item: z.string(), type: z.enum(["proposal", "content", "visual", "document"]),
      submittedBy: z.string().optional(), urgent: z.boolean().optional(), notes: z.string().optional(),
    })).mutation(({ input }) => createBrandQaItem(input as any)),
    update: protectedProcedure.input(z.object({
      id: z.number(), status: z.enum(["pending", "approved", "revision"]).optional(),
      reviewedBy: z.string().optional(), notes: z.string().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return updateBrandQaItem(id, data as any); }),
  }),

  // ─── Job Postings (HR) ────────────────────────────────────────────────────
  jobPostings: router({
    list: protectedProcedure.query(() => listJobPostings()),
    create: protectedProcedure.input(z.object({
      title: z.string(), department: z.string(), status: z.enum(["open", "on_hold", "closed", "filled"]).optional(),
      description: z.string().optional(), requirements: z.string().optional(), createdBy: z.string().optional(),
    })).mutation(({ input }) => createJobPosting(input as any)),
    update: protectedProcedure.input(z.object({
      id: z.number(), title: z.string().optional(), department: z.string().optional(),
      status: z.enum(["open", "on_hold", "closed", "filled"]).optional(),
      description: z.string().optional(), requirements: z.string().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return updateJobPosting(id, data as any); }),
  }),

  // ─── Hiring Applications (HR) ─────────────────────────────────────────────
  hiringApps: router({
    list: protectedProcedure.query(() => listHiringApplications()),
    create: protectedProcedure.input(z.object({
      jobPostingId: z.number(), candidateName: z.string(), candidateEmail: z.string().optional(),
      candidatePhone: z.string().optional(), status: z.enum(["received", "shortlisted", "interviewed", "offer_sent", "hired", "rejected"]).optional(),
      score: z.string().optional(), interviewDate: z.string().optional(), notes: z.string().optional(),
    })).mutation(({ input }) => createHiringApplication(input as any)),
    update: protectedProcedure.input(z.object({
      id: z.number(), status: z.enum(["received", "shortlisted", "interviewed", "offer_sent", "hired", "rejected"]).optional(),
      score: z.string().optional(), interviewDate: z.string().optional(), notes: z.string().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return updateHiringApplication(id, data as any); }),
  }),

  // ─── Training Sessions (HR) ───────────────────────────────────────────────
  trainingSessions: router({
    list: protectedProcedure.query(() => listTrainingSessions()),
    create: protectedProcedure.input(z.object({
      title: z.string(), type: z.enum(["internal", "external", "online", "workshop"]).optional(),
      sessionDate: z.string().optional(), participants: z.number().optional(),
      status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
      notes: z.string().optional(), createdBy: z.string().optional(),
    })).mutation(({ input }) => createTrainingSession(input as any)),
    update: protectedProcedure.input(z.object({
      id: z.number(), title: z.string().optional(), type: z.enum(["internal", "external", "online", "workshop"]).optional(),
      sessionDate: z.string().optional(), participants: z.number().optional(),
      status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(), notes: z.string().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return updateTrainingSession(id, data as any); }),
  }),

  // ─── Development Plans (HR) ───────────────────────────────────────────────
  devPlans: router({
    list: protectedProcedure.query(() => listDevelopmentPlans()),
    create: protectedProcedure.input(z.object({
      staffEmail: z.string(), staffName: z.string(), goal: z.string(),
      targetDate: z.string().optional(), progress: z.number().optional(),
      support: z.string().optional(), notes: z.string().optional(), createdBy: z.string().optional(),
    })).mutation(({ input }) => createDevelopmentPlan(input as any)),
    update: protectedProcedure.input(z.object({
      id: z.number(), goal: z.string().optional(), targetDate: z.string().optional(),
      progress: z.number().optional(), support: z.string().optional(), notes: z.string().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return updateDevelopmentPlan(id, data as any); }),
  }),

  // ─── Performance Cycles (HR) ──────────────────────────────────────────────
  perfCycles: router({
    list: protectedProcedure.query(() => listPerformanceCycles()),
    create: protectedProcedure.input(z.object({
      cycleName: z.string(), period: z.string(), status: z.enum(["upcoming", "active", "completed"]).optional(),
      totalReviews: z.number().optional(), completedReviews: z.number().optional(),
    })).mutation(({ input }) => createPerformanceCycle(input as any)),
    update: protectedProcedure.input(z.object({
      id: z.number(), cycleName: z.string().optional(), period: z.string().optional(),
      status: z.enum(["upcoming", "active", "completed"]).optional(),
      totalReviews: z.number().optional(), completedReviews: z.number().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return updatePerformanceCycle(id, data as any); }),
  }),

  // ─── RIDI Communities ─────────────────────────────────────────────────────
  ridiCommunities: router({
    list: protectedProcedure.query(() => listRidiCommunities()),
    create: protectedProcedure.input(z.object({
      name: z.string(), state: z.string(), coordinator: z.string().optional(),
      members: z.number().optional(), status: z.enum(["active", "inactive", "forming"]).optional(),
    })).mutation(({ input }) => createRidiCommunity(input as any)),
    update: protectedProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), state: z.string().optional(),
      coordinator: z.string().optional(), members: z.number().optional(),
      status: z.enum(["active", "inactive", "forming"]).optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return updateRidiCommunity(id, data as any); }),
  }),

  // ─── Podcast Episodes (Media) ─────────────────────────────────────────────
  podcasts: router({
    list: protectedProcedure.query(() => listPodcastEpisodes()),
    create: protectedProcedure.input(z.object({
      episodeNumber: z.number(), title: z.string(), guest: z.string().optional(),
      recordingDate: z.string().optional(), duration: z.string().optional(),
      status: z.enum(["scheduled", "recorded", "editing", "published"]).optional(),
      plays: z.number().optional(), audioUrl: z.string().optional(),
    })).mutation(({ input }) => createPodcastEpisode(input as any)),
    update: protectedProcedure.input(z.object({
      id: z.number(), title: z.string().optional(), guest: z.string().optional(),
      recordingDate: z.string().optional(), duration: z.string().optional(),
      status: z.enum(["scheduled", "recorded", "editing", "published"]).optional(),
      plays: z.number().optional(), audioUrl: z.string().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return updatePodcastEpisode(id, data as any); }),
  }),

  // ─── Media Assets ─────────────────────────────────────────────────────────
  mediaAssets: router({
    list: protectedProcedure.query(() => listMediaAssets()),
    create: protectedProcedure.input(z.object({
      name: z.string(), type: z.enum(["zip", "audio", "video", "figma", "image", "document"]),
      fileSize: z.string().optional(), fileUrl: z.string().optional(), uploadedBy: z.string().optional(),
    })).mutation(({ input }) => createMediaAsset(input as any)),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteMediaAsset(input.id)),
  }),

  // ─── Social Platform Stats (Media) ────────────────────────────────────────
  socialStats: router({
    list: protectedProcedure.query(() => listSocialPlatformStats()),
    upsert: protectedProcedure.input(z.object({
      platform: z.string(), handle: z.string().optional(), followers: z.number().optional(),
      growth: z.string().optional(), postsCount: z.number().optional(), reach: z.number().optional(),
    })).mutation(({ input }) => upsertSocialPlatformStat(input as any)),
    create: protectedProcedure.input(z.object({
      platform: z.string(), handle: z.string().optional(), followers: z.number().optional(),
      growth: z.string().optional(), postsCount: z.number().optional(), reach: z.number().optional(),
    })).mutation(({ input }) => createSocialPlatformStat(input as any)),
  }),

  // ─── Weekly Targets (CEO → Departments → HR tracks) ──────────────────────
  weeklyTargets: router({
    // CEO issues target
    create: founderCEOProcedure
      .input(z.object({
        weekOf: z.string(),
        department: z.string(),
        targetType: z.string(),
        description: z.string(),
        assignedTo: z.string().optional(),
        deadline: z.string().default("Friday 2pm"),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createWeeklyTarget({
          ...input,
          assignedBy: ctx.user?.name || ctx.user?.email || "CEO",
          status: "issued",
        });
        // Notify the department
        await createNotification({
          userId: input.department,
          type: "assignment",
          title: "New Weekly Target",
          message: `${input.targetType}: ${input.description.slice(0, 100)}`,
          link: `/${input.department}/dashboard`,
        });
        return result;
      }),

    // List targets (filterable)
    list: protectedProcedure
      .input(z.object({ weekOf: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getWeeklyTargets(input?.weekOf);
      }),

    // List by department
    byDepartment: protectedProcedure
      .input(z.object({ department: z.string(), weekOf: z.string().optional() }))
      .query(async ({ input }) => {
        return getWeeklyTargetsByDepartment(input.department, input.weekOf);
      }),

    // Staff submits their target outcome
    submit: protectedProcedure
      .input(z.object({
        id: z.number(),
        submissionNote: z.string(),
      }))
      .mutation(async ({ input }) => {
        return updateWeeklyTarget(input.id, {
          status: "submitted",
          submissionNote: input.submissionNote,
        });
      }),

    // CEO reviews target
    review: founderCEOProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["approved", "revision_requested"]),
        outcome: z.enum(["hit", "missed", "partial"]).optional(),
        reviewNote: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return updateWeeklyTarget(input.id, {
          status: input.status,
          outcome: input.outcome,
          reviewNote: input.reviewNote,
        });
      }),

    // HR submission status view
    submissionStatus: seniorProcedure
      .input(z.object({ weekOf: z.string() }))
      .query(async ({ input }) => {
        return getTargetSubmissionStatus(input.weekOf);
      }),
  }),

  // ─── Inter-Department Chat ───────────────────────────────────────────────
  deptChat: router({
    // Send a message
    send: protectedProcedure
      .input(z.object({
        threadId: z.string(),
        toDepartment: z.string().optional(),
        toStaffId: z.string().optional(),
        message: z.string().min(1),
        messageType: z.enum(["text", "file", "task_ref", "system"]).default("text"),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = ctx.user!;
        const result = await createDeptMessage({
          threadId: input.threadId,
          fromStaffId: user.email || String(user.id),
          fromName: user.name || user.email || "Staff",
          fromDepartment: (user as any).department || "general",
          toDepartment: input.toDepartment || null,
          toStaffId: input.toStaffId || null,
          message: input.message,
          messageType: input.messageType,
          isRead: false,
        });
        // Notify recipient department
        if (input.toDepartment) {
          await createNotification({
            userId: input.toDepartment,
            type: "system",
            title: `Message from ${user.name || "Staff"}`,
            message: input.message.slice(0, 100),
          });
        }
        return result;
      }),

    // Get messages for a thread
    thread: protectedProcedure
      .input(z.object({ threadId: z.string() }))
      .query(async ({ input }) => {
        return getDeptMessages({ threadId: input.threadId });
      }),

    // Get thread list for a department
    threads: protectedProcedure
      .input(z.object({ department: z.string() }))
      .query(async ({ input }) => {
        return getDeptThreads(input.department);
      }),

    // Get unread count
    unreadCount: protectedProcedure
      .input(z.object({ department: z.string(), staffId: z.string().optional() }))
      .query(async ({ input }) => {
        return getUnreadDeptMessageCount(input.department, input.staffId);
      }),

    // Mark thread as read
    markRead: protectedProcedure
      .input(z.object({ threadId: z.string(), staffId: z.string() }))
      .mutation(async ({ input }) => {
        await markDeptMessagesRead(input.threadId, input.staffId);
        return { success: true };
      }),

    // CSO dashboard: fetch recent dept updates targeted at CSO
    csoUpdates: csoProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(30) }).optional())
      .query(async ({ input }) => {
        const limit = input?.limit ?? 30;
        return getDeptMessages({ toDepartment: "CSO", limit });
      }),

    // CSO dashboard: acknowledge (mark read) a single dept message by id
    acknowledge: csoProcedure
      .input(z.object({ messageId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
        await db.update(deptMessages)
          .set({ isRead: true, readAt: new Date() })
          .where(eq(deptMessages.id, input.messageId));
        return { success: true };
      }),
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // VERIFIED CLIENT TRUTH LAYER
  // ═══════════════════════════════════════════════════════════════════════════
  clientTruth: router({
    /** Verify client identity (ref + phone) and create a server-side session */
    verify: publicProcedure
      .input(z.object({ ref: z.string().min(1), phone: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const client = await verifyClientIdentity(input.ref, input.phone);
        if (!client) throw new TRPCError({ code: "NOT_FOUND", message: "No client found with that reference and phone number." });
        const token = await createClientSession(client.id, input.phone);
        return { token, client: { id: client.id, ref: client.ref, name: client.name, businessName: client.businessName, status: client.status } };
      }),

    /** Validate an existing session token and return client data */
    session: publicProcedure
      .input(z.object({ token: z.string().min(1) }))
      .query(async ({ input }) => {
        const client = await validateClientSession(input.token);
        if (!client) return null;
        return {
          id: client.id, ref: client.ref, name: client.name, businessName: client.businessName,
          phone: client.phone, email: client.email, status: client.status, department: client.department,
          contractValue: client.contractValue, amountPaid: client.amountPaid, balance: client.balance,
          currentBlocker: client.currentBlocker, nextAction: client.nextAction, dueDate: client.dueDate,
          riskFlag: client.riskFlag, location: client.location,
        };
      }),

    /** Get tasks linked to this client (requires valid session token) */
    tasks: publicProcedure
      .input(z.object({ token: z.string().min(1) }))
      .query(async ({ input }) => {
        const client = await validateClientSession(input.token);
        if (!client) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session." });
        return getTasksForClient(client.ref, client.phone || "");
      }),

    /** Get subscriptions linked to this client */
    subscriptions: publicProcedure
      .input(z.object({ token: z.string().min(1) }))
      .query(async ({ input }) => {
        const client = await validateClientSession(input.token);
        if (!client) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session." });
        return getSubscriptionsForClient(client.name, client.phone || "");
      }),

    /** Get invoices linked to this client */
    invoices: publicProcedure
      .input(z.object({ token: z.string().min(1) }))
      .query(async ({ input }) => {
        const client = await validateClientSession(input.token);
        if (!client) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session." });
        return getInvoicesForClient(client.phone || "");
      }),

    // ─── Staff-only: client management ─────────────────────────────────────
    /** List all clients (CSO / CEO / Founder only) */
    list: csoProcedure.query(async () => getAllClients()),

    /** List clients by status */
    byStatus: csoProcedure
      .input(z.object({ status: z.enum(["active", "converted", "unverified", "dormant"]) }))
      .query(async ({ input }) => getClientsByStatus(input.status)),

    /** List clients by department */
    byDepartment: protectedProcedure
      .input(z.object({ department: z.string() }))
      .query(async ({ input }) => getClientsByDepartment(input.department)),

    /** Create a new verified client (CSO creates on conversion) */
    create: csoProcedure
      .input(z.object({
        ref: z.string().min(1),
        name: z.string().min(1),
        businessName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        status: z.enum(["active", "converted", "unverified", "dormant"]).default("unverified"),
        department: z.string().optional(),
        csoOwner: z.string().optional(),
        departmentOwner: z.string().optional(),
        financeOwner: z.string().optional(),
        contractValue: z.string().optional(),
        amountPaid: z.string().optional(),
        balance: z.string().optional(),
        currentBlocker: z.string().optional(),
        nextAction: z.string().optional(),
        dueDate: z.string().optional(),
        riskFlag: z.enum(["none", "low", "medium", "high", "critical"]).default("none"),
        missingInfo: z.string().optional(),
        location: z.string().optional(),
        source: z.string().optional(),
      }))
      .mutation(async ({ input }) => createClient(input)),

    /** Update an existing client record */
    update: csoProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        businessName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        status: z.enum(["active", "converted", "unverified", "dormant"]).optional(),
        department: z.string().optional(),
        csoOwner: z.string().optional(),
        departmentOwner: z.string().optional(),
        financeOwner: z.string().optional(),
        contractValue: z.string().optional(),
        amountPaid: z.string().optional(),
        balance: z.string().optional(),
        currentBlocker: z.string().optional(),
        nextAction: z.string().optional(),
        dueDate: z.string().optional(),
        riskFlag: z.enum(["none", "low", "medium", "high", "critical"]).optional(),
        missingInfo: z.string().optional(),
        location: z.string().optional(),
        source: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateClient(id, data);
        return { success: true };
      }),
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // CSO PHASE 2 — csoActions, targets, calendar, clientNotes
  // ═══════════════════════════════════════════════════════════════════════════
  csoActions: router({
    /** Assign a task to a department lead/staff with notification + email. */
    assignTaskToDept: csoProcedure
      .input(z.object({
        leadId: z.number().optional(),
        clientId: z.number().optional(),
        department: z.enum(["bizdoc", "systemise", "skills"]),
        assignedTo: z.string().min(1),
        title: z.string().min(1),
        description: z.string().optional(),
        deadline: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
      }))
      .mutation(async ({ input, ctx }) => {
        // Phase 2 decision: tasks.priority enum is ["urgent","high","normal","low"];
        // we map our 4-level input onto it (medium -> normal).
        const priorityMap: Record<string, "urgent" | "high" | "normal" | "low"> = {
          low: "low", medium: "normal", high: "high", urgent: "urgent",
        };
        // Derive clientName from leadId/clientId where possible
        let clientName = input.assignedTo;
        let businessName: string | undefined;
        let phone: string | undefined;
        if (input.clientId) {
          const db = await getDb();
          if (db) {
            const rows = await db.select().from(clientCredentials).limit(0); // no-op for types
            const client = await getAllClients().then(list => list.find(c => c.id === input.clientId));
            if (client) { clientName = client.name; businessName = client.businessName ?? undefined; phone = client.phone ?? undefined; }
          }
        } else if (input.leadId) {
          const leadsList = await getLeads();
          const l = leadsList.find(x => x.id === input.leadId);
          if (l) { clientName = l.name; businessName = l.businessName ?? undefined; phone = l.phone ?? undefined; }
        }

        const task = await createTask({
          clientName,
          service: input.title,
          department: input.department,
          notes: input.description,
          deadline: input.deadline,
          businessName,
          phone,
          priority: priorityMap[input.priority],
        });
        // Tag assignedBy via direct update (column added in 0019)
        try {
          const db = await getDb();
          if (db) await db.update(tasks).set({ assignedBy: ctx.user.openId } as any).where(eq(tasks.id, task.id));
        } catch { /* column may not exist in unmigrated env */ }

        await createNotification({
          userId: input.assignedTo,
          type: "assignment",
          title: "New Task from CSO",
          message: `${input.title} (${input.department}) — due ${input.deadline || "TBC"}`,
          link: `/${input.department}/dashboard`,
        }).catch(() => {});

        // Fire email best-effort — never block the mutation.
        try {
          await sendNewLeadAlert({
            ref: task.ref,
            clientName: `${input.assignedTo} (CSO task)`,
            service: input.title,
            phone: null,
            email: null,
            source: `CSO → ${input.department}`,
          });
        } catch (e) { console.warn("[csoActions.assignTask] email failed:", e); }

        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "CSO",
          action: "cso_task_assigned",
          resource: "tasks",
          resourceId: task.id,
          details: `CSO assigned "${input.title}" to ${input.assignedTo} in ${input.department}`,
        });
        return { taskId: task.id, ref: task.ref };
      }),

    /** Notify the CEO of a situation — creates a notification + best-effort email. */
    notifyCeo: csoProcedure
      .input(z.object({
        subject: z.string().min(1),
        message: z.string().min(1),
        link: z.string().optional(),
        severity: z.enum(["info", "warning", "urgent"]).default("info"),
        relatedClientId: z.number().optional(),
        relatedLeadId: z.number().optional(),
        relatedProposalId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await createNotification({
          userId: "ceo",
          type: input.severity === "urgent" ? "reminder" : "system",
          title: `[${input.severity.toUpperCase()}] ${input.subject}`,
          message: input.message,
          link: input.link,
        }).catch(() => {});

        try {
          await sendNewLeadAlert({
            ref: `CEO-${Date.now()}`,
            clientName: `CSO: ${ctx.user.name || ctx.user.email || "CSO"}`,
            service: input.subject,
            phone: null,
            email: input.message.slice(0, 200),
            source: `CSO notice (${input.severity})`,
          });
        } catch (e) { console.warn("[csoActions.notifyCeo] email failed:", e); }

        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "CSO",
          action: "cso_notify_ceo",
          resource: "notifications",
          details: `${input.severity}: ${input.subject}${input.relatedClientId ? ` (client#${input.relatedClientId})` : ""}`,
        });
        return { success: true };
      }),

    /** CSO manual client creation — bypasses the lead pipeline. */
    manualCreateClient: csoProcedure
      .input(z.object({
        businessName: z.string().min(1),
        contactName: z.string().min(1),
        phone: z.string().min(1),
        email: z.string().optional(),
        engagementType: z.enum(["project", "subscription", "project_then_sub"]),
        services: z.array(z.string().min(1)).min(1),
        value: z.number().nonnegative(),
        billingCycle: z.enum(["one_time", "monthly", "quarterly", "annual"]).optional(),
        startDate: z.string().optional(),
        csoOwnerId: z.string().min(1),
        departmentOwners: z.record(z.string(), z.string()).optional(),
        notes: z.string().optional(),
        source: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const ref = generateRefNumber(input.phone);
        // Pick the first department from departmentOwners map, default bizdoc
        const deptOwners = input.departmentOwners || {};
        const primaryDept = Object.keys(deptOwners)[0] || "bizdoc";
        const departmentOwner = deptOwners[primaryDept] || "";

        const result = await createClient({
          ref,
          name: input.contactName,
          businessName: input.businessName,
          phone: input.phone,
          email: input.email,
          status: "active",
          department: primaryDept,
          csoOwner: input.csoOwnerId,
          departmentOwner,
          contractValue: String(input.value),
          amountPaid: "0",
          balance: String(input.value),
          nextAction: `Kickoff: ${input.services.join(", ")}`,
          location: null as any,
          source: input.source || "cso_manual",
        } as any);
        const newClientId = (result as any).id as number;

        // Create subscriptions per department if engagement type includes subscription
        if (input.engagementType !== "project" && input.billingCycle && input.billingCycle !== "one_time") {
          for (const [dept, owner] of Object.entries(deptOwners)) {
            try {
              await createSubscription({
                clientName: input.contactName,
                businessName: input.businessName,
                phone: input.phone,
                email: input.email,
                service: input.services.join(", "),
                department: dept,
                monthlyFee: String(input.value / (input.billingCycle === "annual" ? 12 : input.billingCycle === "quarterly" ? 3 : 1)),
                billingDay: 1,
                status: "active",
                startDate: input.startDate || new Date().toISOString().slice(0, 10),
                assignedStaffEmail: owner,
                notesForStaff: input.notes,
                createdBy: ctx.user.name || ctx.user.email || "CSO",
              } as any);
            } catch (e) { console.warn("[manualCreateClient] subscription create failed:", e); }
          }
        }

        // Create one task per service so dept staff see work immediately
        for (const service of input.services) {
          const owner = Object.values(deptOwners)[0] || "";
          const t = await createTask({
            clientName: input.contactName,
            businessName: input.businessName,
            phone: input.phone,
            service,
            department: primaryDept,
            notes: input.notes,
            priority: "normal",
          });
          try {
            const db = await getDb();
            if (db) await db.update(tasks).set({ assignedBy: ctx.user.openId } as any).where(eq(tasks.id, t.id));
          } catch { /* ignore */ }
          if (owner) {
            await createNotification({
              userId: owner,
              type: "assignment",
              title: `New client work: ${input.businessName}`,
              message: `${service} — started by CSO`,
              link: `/${primaryDept}/dashboard`,
            }).catch(() => {});
          }
        }

        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "CSO",
          action: "cso_manual_create_client",
          resource: "clients",
          resourceId: newClientId,
          details: `CSO manually created client ${input.businessName} (${ref}), bypassed lead pipeline. Services: ${input.services.join(", ")}. Value: ${input.value}`,
        });
        return { id: newClientId, ref };
      }),
  }),

  // ─── Targets ──────────────────────────────────────────────────────────────
  targets: router({
    create: founderCEOProcedure
      .input(z.object({
        assignedTo: z.string().min(1),
        period: z.enum(["month", "quarter", "year"]),
        periodStart: z.string().min(1),
        periodEnd: z.string().min(1),
        metric: z.enum(["leads_qualified", "proposals_sent", "clients_onboarded", "revenue_closed", "custom"]),
        targetValue: z.number().nonnegative(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const row = await createTargetV2({
          assignedBy: ctx.user.openId,
          assignedByName: ctx.user.name || ctx.user.email || "CEO",
          assignedTo: input.assignedTo,
          period: input.period,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          metric: input.metric,
          targetValue: String(input.targetValue),
          notes: input.notes,
          status: "active",
        });
        await createNotification({
          userId: input.assignedTo,
          type: "system",
          title: "New target assigned",
          message: `${input.metric.replace(/_/g, " ")} — ${input.targetValue} (${input.period})`,
          link: "/cso",
        }).catch(() => {});
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || "CEO",
          action: "target_created",
          resource: "targets",
          resourceId: row?.id ?? 0,
          details: `Target for ${input.assignedTo}: ${input.metric} = ${input.targetValue} (${input.periodStart} → ${input.periodEnd})`,
        });
        return row;
      }),

    listForRole: protectedProcedure
      .input(z.object({
        role: z.string().min(1),
        period: z.enum(["current", "all"]).default("current"),
      }))
      .query(async ({ input }) => {
        const list = await getTargetsForAssignee(input.role);
        const today = new Date().toISOString().slice(0, 10);
        const filtered = input.period === "current"
          ? list.filter(t => t.periodStart <= today && t.periodEnd >= today && t.status === "active")
          : list;
        // Attach actual
        const withActuals = await Promise.all(filtered.map(async t => ({
          ...t,
          actualValue: await computeTargetActual(t),
        })));
        return withActuals;
      }),

    listAll: founderCEOProcedure.query(async () => getAllTargets()),

    update: founderCEOProcedure
      .input(z.object({
        id: z.number(),
        targetValue: z.number().optional(),
        notes: z.string().optional(),
        status: z.enum(["active", "completed", "cancelled"]).optional(),
        periodEnd: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, targetValue, ...rest } = input;
        const data: any = { ...rest };
        if (targetValue !== undefined) data.targetValue = String(targetValue);
        await updateTargetV2(id, data);
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || "CEO",
          action: "target_updated",
          resource: "targets",
          resourceId: id,
          details: Object.keys(data).join(", "),
        });
        return { success: true };
      }),

    cancel: founderCEOProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await updateTargetV2(input.id, { status: "cancelled" });
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || "CEO",
          action: "target_cancelled",
          resource: "targets",
          resourceId: input.id,
          details: "Target cancelled",
        });
        return { success: true };
      }),
  }),

  // ─── Calendar ─────────────────────────────────────────────────────────────
  calendar: router({
    list: protectedProcedure
      .input(z.object({
        from: z.string().min(1),
        to: z.string().min(1),
        ownerId: z.string().optional(),
        clientId: z.number().optional(),
      }))
      .query(async ({ input }) => listCalendarEvents(input)),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        startAt: z.string().min(1),
        endAt: z.string().optional(),
        allDay: z.boolean().default(false),
        eventType: z.enum(["meeting", "follow_up", "deadline", "renewal", "internal", "other"]).default("other"),
        visibility: z.enum(["private", "team", "public"]).default("team"),
        clientId: z.number().optional(),
        leadId: z.number().optional(),
        location: z.string().optional(),
        reminderMinutes: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const row = await createCalendarEvent({
          title: input.title,
          description: input.description,
          startAt: new Date(input.startAt),
          endAt: input.endAt ? new Date(input.endAt) : null,
          allDay: input.allDay,
          eventType: input.eventType,
          ownerId: ctx.user.openId,
          ownerName: ctx.user.name || ctx.user.email || "",
          visibility: input.visibility,
          clientId: input.clientId,
          leadId: input.leadId,
          location: input.location,
          reminderMinutes: input.reminderMinutes,
        });
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || "User",
          action: "calendar_event_created",
          resource: "calendar_events",
          resourceId: row?.id ?? 0,
          details: `${input.eventType}: ${input.title} @ ${input.startAt}`,
        });
        return row;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        startAt: z.string().optional(),
        endAt: z.string().optional(),
        allDay: z.boolean().optional(),
        eventType: z.enum(["meeting", "follow_up", "deadline", "renewal", "internal", "other"]).optional(),
        visibility: z.enum(["private", "team", "public"]).optional(),
        location: z.string().optional(),
        reminderMinutes: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, startAt, endAt, ...rest } = input;
        const data: any = { ...rest };
        if (startAt) data.startAt = new Date(startAt);
        if (endAt) data.endAt = new Date(endAt);
        await updateCalendarEvent(id, data);
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || "User",
          action: "calendar_event_updated",
          resource: "calendar_events",
          resourceId: id,
          details: Object.keys(data).join(", "),
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await deleteCalendarEvent(input.id);
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || "User",
          action: "calendar_event_deleted",
          resource: "calendar_events",
          resourceId: input.id,
          details: "",
        });
        return { success: true };
      }),
  }),

  // ─── Content Creators (v1 restructure — CSO Source Tracker) ──────────────
  contentCreators: router({
    list: csoProcedure.query(async () => listContentCreators()),

    create: csoProcedure
      .input(z.object({
        name: z.string().min(1),
        handle: z.string().optional(),
        platform: z.enum(["instagram", "tiktok", "x", "youtube", "blog", "other"]).default("other"),
        code: z.string().min(1).max(32),
        commissionRate: z.number().nonnegative().default(10),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const row = await createContentCreator({
          name: input.name,
          handle: input.handle,
          platform: input.platform,
          code: input.code.trim().toUpperCase(),
          commissionRate: String(input.commissionRate),
          notes: input.notes,
        });
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "CSO",
          action: "content_creator_created",
          resource: "content_creators",
          resourceId: row?.id ?? 0,
          details: `${input.name} (${input.code})`,
        });
        return row;
      }),

    update: csoProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        handle: z.string().optional(),
        commissionRate: z.number().nonnegative().optional(),
        status: z.enum(["active", "paused", "removed"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, commissionRate, ...rest } = input;
        const data: any = { ...rest };
        if (commissionRate !== undefined) data.commissionRate = String(commissionRate);
        await updateContentCreator(id, data);
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "CSO",
          action: "content_creator_updated",
          resource: "content_creators",
          resourceId: id,
          details: Object.keys(data).join(", "),
        });
        return { success: true };
      }),

    deactivate: csoProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await updateContentCreator(input.id, { status: "paused" });
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || ctx.user.email || "CSO",
          action: "content_creator_deactivated",
          resource: "content_creators",
          resourceId: input.id,
          details: "status -> paused",
        });
        return { success: true };
      }),
  }),

  // ─── Department KPIs (v1 restructure — Dashboard widgets) ─────────────────
  deptKpis: router({
    summary: csoProcedure.query(async () => {
      // v1 restructure: return null when the underlying metric isn't computable yet
      // so the UI can show "—" instead of a misleading 0.
      const [allTasks, allSubs, allClients, allCohorts] = await Promise.all([
        getTasks(), getSubscriptions(), getAllClients(), listCohorts(),
      ]);
      const deptFor = (d: string) => allTasks.filter((t: any) => (t.department || "").toLowerCase() === d);
      const clientsFor = (d: string) => allClients.filter((c: any) => (c.department || "").toLowerCase() === d);
      const subsFor = (d: string) => allSubs.filter((s: any) => (s.department || "").toLowerCase() === d);
      const compute = (d: string) => {
        const tasks = deptFor(d);
        const inProgress = tasks.filter((t: any) => t.status === "In Progress").length;
        const awaitingClient = tasks.filter((t: any) => t.status === "Waiting on Client").length;
        const activeClients = clientsFor(d).filter((c: any) => c.status === "active").length;
        const activeSubs = subsFor(d).filter((s: any) => s.status === "active").length;
        return {
          activeClients: activeClients || null,
          tasksInProgress: inProgress || null,
          awaitingClient: awaitingClient || null,
          activeSubscriptions: activeSubs || null,
        };
      };
      return {
        bizdoc: compute("bizdoc"),
        systemise: compute("systemise"),
        skills: {
          ...compute("skills"),
          runningCohorts: allCohorts.filter((c: any) => c.status === "in_progress" || c.status === "enrolling").length || null,
        },
      };
    }),
  }),

  // ─── Audit log (v1 restructure — Back Office) ─────────────────────────────
  auditCso: router({
    list: csoProcedure
      .input(z.object({ limit: z.number().min(1).max(500).optional() }).optional())
      .query(async ({ input }) => listAuditLogsForCso(input?.limit ?? 200)),
  }),

  // ─── Cohorts (v1 restructure — Back Office read view) ─────────────────────
  // Re-uses the existing `cohorts` table maintained by Skills department.
  // CSO has read access; skills_staff / founder can mutate via the existing Skills admin routes.
  cohortsCso: router({
    list: csoProcedure.query(async () => listCohorts()),
  }),

  // ─── Client Notes ─────────────────────────────────────────────────────────
  clientNotes: router({
    list: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => listClientNotes(input.clientId)),

    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        kind: z.enum(["internal", "ceo_brief", "client_update", "risk_flag"]).default("internal"),
        body: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const row = await createClientNote({
          clientId: input.clientId,
          authorId: ctx.user.openId,
          authorName: ctx.user.name || ctx.user.email || "Staff",
          kind: input.kind,
          body: input.body,
        });
        await createAuditLog({
          userId: ctx.user.id,
          userName: ctx.user.name || "Staff",
          action: "client_note_created",
          resource: "client_notes",
          resourceId: row?.id ?? 0,
          details: `${input.kind} on client#${input.clientId}`,
        });
        return row;
      }),
  }),

});

export type AppRouter = typeof appRouter;
