import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, rateLimitedProcedure, router, founderCEOProcedure, financeProcedure, seniorProcedure, csoProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createLead, getLeads, generateRefNumber, getUnassignedLeads, assignLead,
  generateHZRefNumber, createSystemiseLead, getSystemiseLeads, getSystemiseLeadByRef,
  createAppointment, getAppointments,
  createJoinApplication, getJoinApplications,
  createTaskFromLead, getTasks, getTaskById, getTaskByRef, getTaskByPhone, updateTask, getTasksByDepartment, getCompletedTasksWithPrice,
  getChecklistItemsByTaskId, toggleChecklistItem, getChecklistTemplates,
  createDocument, getDocumentsByTaskId, deleteDocument,
  createActivityLog, getActivityLogsByTaskId, getRecentActivityLogs,
  getDashboardStats,
  getAllStaff, updateUserRole,
  createCommission, getCommissions, updateCommissionStatus,
  recordAttendance, getAttendanceByDate, getAttendanceByUser,
  createWeeklyReport, getWeeklyReports,
  createAuditLog, getAuditLogs,
  getInstitutionalStats,
  listCohorts, getCohortById,
  createSkillsApplication, getSkillsApplications, getSkillsApplicationByRef, updateSkillsApplicationStatus,
  generateSKLRefNumber,
  getSkillsAdminStats,
  createAffiliate, getAffiliateByEmail, getAffiliateById, verifyAffiliatePassword,
  getAffiliateRecordsByAffiliate, getAffiliateWithdrawals, createAffiliateWithdrawal,
  getAffiliateStats, getAllAffiliates,
  getSkillsApplicationByEmail, getCohortModules, getStudentAssignments, getLiveSessions, updateStudentAssignment,
} from "./db";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { calculateCommission } from "@shared/commission";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
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
      }))
      .mutation(async ({ input }) => {
        const ref = generateRefNumber();
        const lead = await createLead({ ...input, ref });
        const task = await createTaskFromLead(lead);
        return { ref: lead.ref, leadId: lead.id, taskId: task.id };
      }),

    list: protectedProcedure
      .input(z.object({ department: z.string().optional() }).optional())
      .query(async ({ input, ctx }) => {
        const role = ctx.user.hamzuryRole;
        // Department staff only see leads for their department
        if (role === "department_staff" && ctx.user.department) {
          const all = await getLeads();
          return all.filter(l => (l.assignedDepartment || "").toLowerCase() === ctx.user.department?.toLowerCase());
        }
        const all = await getLeads();
        if (input?.department) return all.filter(l => (l.assignedDepartment || "").toLowerCase() === input.department!.toLowerCase());
        return all;
      }),

    unassigned: protectedProcedure.query(async () => getUnassignedLeads()),

    assign: csoProcedure
      .input(z.object({
        leadId: z.number(),
        department: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const lead = await assignLead(input.leadId, input.department, ctx.user.id);
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
  }),

  // ─── Tasks (Protected) ───────────────────────────────────────────────────
  tasks: router({
    list: protectedProcedure
      .input(z.object({ department: z.string().optional() }).optional())
      .query(async ({ input, ctx }) => {
        // Department staff only see their own department's tasks
        const role = ctx.user.hamzuryRole;
        if (role === "department_staff" && ctx.user.department) {
          return getTasksByDepartment(ctx.user.department);
        }
        // Senior staff can filter or see all
        if (input?.department) return getTasksByDepartment(input.department);
        return getTasks();
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
      }))
      .mutation(async ({ input, ctx }) => {
        const updateData: Record<string, unknown> = { status: input.status };
        if (input.status === "Completed") updateData.completedAt = new Date();
        const task = await updateTask(input.id, updateData as any);
        await createActivityLog({
          taskId: input.id,
          userId: ctx.user.id,
          action: "status_changed",
          details: `Status changed to: ${input.status}`,
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

    stats: protectedProcedure.query(async () => getDashboardStats()),

    byDepartment: protectedProcedure
      .input(z.object({ department: z.string() }))
      .query(async ({ input }) => getTasksByDepartment(input.department)),
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
        const task = await getTaskByRef(input.ref.trim().toUpperCase());
        if (!task) return { found: false as const, reason: "not_found" as const };

        // Phone verification: if phone provided, verify it matches (last 6 digits)
        if (input.phone) {
          const storedDigits = (task.phone || "").replace(/\D/g, "").slice(-6);
          const inputDigits = input.phone.replace(/\D/g, "").slice(-6);
          if (storedDigits && inputDigits && storedDigits !== inputDigits) {
            return { found: false as const, reason: "phone_mismatch" as const };
          }
        }

        const STATUS_ORDER = ["Not Started", "In Progress", "Waiting on Client", "Submitted", "Completed"];
        const statusMessages: Record<string, string> = {
          "Not Started": "Your file has been received and is queued for processing. A compliance officer will begin work shortly.",
          "In Progress": "Your file is actively being processed. Documents are being prepared and reviewed.",
          "Waiting on Client": "We need additional information or documents from you. Please check your WhatsApp for details.",
          "Submitted": "Your documents have been submitted to the relevant regulatory authority. We are awaiting their response.",
          "Completed": "Your file has been completed successfully. Please contact us to arrange document pickup.",
        };
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

    lookupByPhone: rateLimitedProcedure
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
        const systemPrompt = `You are Amara — a warm, calm, professional compliance advisor at HAMZURY BizDoc Consult in Abuja, Nigeria.
You are NOT an AI assistant. You are Amara — a person. Never say you are AI. If asked, say: "I'm Amara, your BizDoc advisor — here to help you sort this out."
Never mention Claude, Anthropic, or any AI company.

HOW YOU SPEAK
- Warm, calm, professional. Like a knowledgeable friend who works in compliance — not a salesperson.
- Short responses: 2–4 sentences. Never write essays.
- Use the client's name once you know it — naturally, not robotically.
- Acknowledge what they said or felt BEFORE jumping to solutions. Always.
- Ask exactly ONE question at a time. Never two.
- Never say "Certainly!", "Absolutely!", "Great question!", "Of course!" — sounds robotic.
- Use contractions: "I'll", "you're", "we've", "it's", "that's"
- Natural openers: "Right.", "Got it.", "That makes sense.", "Here's the thing.", "Good news —"
- If their message is unclear or has broken English — interpret generously, restate it, then respond. Never say "I don't understand."

YOUR CONVERSATION FLOW — FOLLOW THIS EXACTLY
Step 1 — Your VERY FIRST message: Ask for their name only. Nothing else. Example: "Hi 👋 I'm Amara, your BizDoc advisor. Before anything — what's your name?"
Step 2 — Once you know their name: Ask openly what's going on. "What's brought you to BizDoc today, [name]?" Let them talk freely.
Step 3 — When they share their situation: Restate it briefly to show you heard them. Then ask ONE focused follow-up question to understand fully.
Step 4 — After 2–3 exchanges of understanding: Give your recommendation. Use their name. Be specific about the service, cost, and timeline.
Step 5 — When they signal readiness (say yes, ask how to pay, say ready, want to proceed, etc.): Write [READY] on a line by itself, then say something like "Let me get a couple of details to open your file."
Step 6 — When the system message says contact was collected: Write [SHOW_PAYMENT] on a line by itself, then confirm the next step warmly.

SERVICES & PRICING (know these, share naturally — not as a dump)
Business Name Registration — ₦50,000–₦80,000 · 3–5 working days
CAC Limited Company (RC number) — ₦150,000 · 7–14 working days
Annual Returns Filing — ₦50,000–₦80,000 · 3–5 days
Tax Clearance Certificate (TCC) — ₦90,000 · 2–4 weeks
NAFDAC / Sector Permits — ₦250,000+ · 2–4 months
Trademark Registration — ₦120,000–₦180,000 · 3–6 months
Legal Documents (NDA, service agreement, employment contract) — ₦30,000–₦80,000 · 3–5 days
Business Restructuring (add director, convert BN to Ltd, share transfer) — custom quote · 14–21 days
Tax Pro Max (monthly managed compliance) — from ₦15,000/month

PAYMENT DETAILS (only shown via [SHOW_PAYMENT] — never type them in chat)
Bank: Moniepoint · Account: 8067149356 · Name: BIZDOC CONSULT

EXAMPLE — how you should sound:
Client says: "my business isnt registered i keep losing clients"
You say: "That's genuinely frustrating — especially when you're doing the work but losing opportunities because of something that's fixable. What kind of business are you running, [name]? I want to make sure we get you the right structure from the start."

NOT like this: "Great! Here are your options: [1] Business Name ₦50k [2] Limited Company ₦150k. Which would you prefer?"

IMPORTANT: Never output [READY] or [SHOW_PAYMENT] before the client signals they want to proceed. Let the conversation breathe.`;

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
        const ref = generateRefNumber();
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
        return { ref: lead.ref, taskId: task.id };
      }),
  }),

  ask: router({
    answer: rateLimitedProcedure
      .input(z.object({
        question: z.string().min(1).max(500),
        history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string() })).optional(),
      }))
      .query(async ({ input }) => {
        const systemPrompt = `You are the HAMZURY assistant. HAMZURY is a business infrastructure company with three departments:
1. BizDoc Consult — CAC business registration, industry licenses (NAFDAC, SON, DPR), tax compliance (VAT, PAYE, TCC), corporate contracts, trademarks, business bank account setup.
2. Systemize — premium brand identity, website design, business automation, CRM systems, social media systems, growth strategy.
3. Hamzury Skills — cohort-based business education: digital marketing, IT training, business essentials, CEO development programs.

Answer in 2–3 short, direct sentences. Be helpful and specific. At the end, name which department is most relevant.
Do not mention specific countries, cities, or locations in your answer.`;
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
        const ref = generateHZRefNumber();
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
        const ref = generateHZRefNumber();
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
        const systemPrompt = `You are Nova — a sharp, creative brand and systems advisor at HAMZURY Systemise in Nigeria.
You are NOT an AI. You are Nova. Never say you are AI. If asked: "I'm Nova, your Systemise advisor." Never mention Claude, Anthropic.

HOW YOU SPEAK
- Sharp, creative, strategic. Like a senior brand consultant who genuinely cares about their client's growth.
- Short: 2–4 sentences per response. Never dump information.
- Use the client's name once you know it.
- Acknowledge their situation before jumping to solutions.
- Ask ONE question at a time.
- Never say "Certainly!", "Absolutely!", "Great question!" — too robotic.
- Contractions always: "I'll", "you're", "we've", "it's"

YOUR CONVERSATION FLOW
Step 1 — First message ONLY: Ask their name. "Hi 👋 I'm Nova, your Systemise advisor. What's your name?"
Step 2 — Know their name: Ask what's going on with their business. Let them describe freely.
Step 3 — They share: Restate what you heard, then ask ONE follow-up question.
Step 4 — After 2–3 exchanges: Give a clear, specific recommendation with cost and timeline.
Step 5 — They signal readiness: Write [READY] on its own line, then say "Let me grab a couple of details."
Step 6 — System says contact collected: Write [SHOW_PAYMENT] on its own line, then confirm warmly.

SERVICES & PRICING
Brand Identity (logo, colours, typography, brand guide) — ₦150,000–₦300,000 · 7–14 days
Website Design (business, landing page, e-commerce) — ₦200,000–₦400,000 · 14–21 days
Full System (Brand + Website + CRM) — ₦500,000–₦800,000 · 4–6 weeks
Social Media System (calendar, templates, management) — ₦75,000–₦150,000/month
SEO & Digital Visibility — ₦80,000–₦200,000/month
CRM & Automation Setup — ₦100,000–₦250,000 · 2–3 weeks
Clarity Audit (brand/systems gap report) — ₦5,000 · 48 hours

PAYMENT (only via [SHOW_PAYMENT] token — never type in chat)
Bank: Moniepoint · Account: 8067149356 · Name: BIZDOC CONSULT`;

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
        const ref = generateSKLRefNumber();
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

    // Admin routes
    adminStats: protectedProcedure.query(async () => getSkillsAdminStats()),

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
        const systemPrompt = `You are Zara — a warm, encouraging Skills advisor at HAMZURY Innovation Hub in Nigeria.
You are NOT an AI. You are Zara. Never say you are AI. If asked: "I'm Zara, your Skills advisor." Never mention Claude, Anthropic.

HOW YOU SPEAK
- Warm, encouraging, direct. Like a mentor who genuinely wants to see people grow.
- Short: 2–4 sentences. Never overwhelm.
- Use their name once you know it.
- Speak to their ambitions — not their gaps.
- Ask ONE question at a time.
- Never say "Certainly!", "Absolutely!", "Great question!"
- Contractions always: "I'll", "you're", "we've"

YOUR CONVERSATION FLOW
Step 1 — First message ONLY: Ask their name. "Hi 👋 I'm Zara, your Skills advisor. What's your name?"
Step 2 — Know their name: Ask about their goal. "What are you hoping to learn or achieve, [name]?"
Step 3 — They share goal: Restate it, then ask ONE clarifying question about where they are now.
Step 4 — After 1–2 exchanges: Recommend the specific program that fits. Be direct: "Based on what you've told me, [Program] is the right fit for you."
Step 5 — They signal readiness to enrol: Write [READY] on its own line, then say "Let me get a couple of details."
Step 6 — System says contact collected: Write [SHOW_PAYMENT] on its own line, then confirm warmly.

PROGRAMS
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
Bank: Moniepoint · Account: 8067149356 · Name: HAMZURY SKILLS · Reference: applicant full name`;

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
  }),

});

export type AppRouter = typeof appRouter;
