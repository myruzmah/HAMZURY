import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// ─── In-memory rate limiter ───────────────────────────────────────────────────
// Limits public mutation endpoints to 5 submissions per IP per 10 minutes.
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT = 5;
const rateLimitMap = new Map<string, number[]>();

function getClientIp(req: TrpcContext["req"]): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.ip || req.socket?.remoteAddress || "unknown";
}

const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  const ip = getClientIp(ctx.req);
  const now = Date.now();
  const hits = (rateLimitMap.get(ip) || []).filter(ts => now - ts < RATE_WINDOW_MS);
  if (hits.length >= RATE_LIMIT) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please wait a few minutes before trying again.",
    });
  }
  hits.push(now);
  rateLimitMap.set(ip, hits);
  return next();
});

/** Public procedure with rate limiting — use for all public mutations. */
export const rateLimitedProcedure = t.procedure.use(rateLimitMiddleware);

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

// ─── Role-based procedures ─────────────────────────────────────────────────────
// Checks hamzuryRole, which is the institutional hierarchy (not the system 'role' field).

/** Founder or CEO only — for role management, org-level overrides, strategic decisions */
export const founderCEOProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    const allowed = ["founder", "ceo"];
    if (!ctx.user.hamzuryRole || !allowed.includes(ctx.user.hamzuryRole)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only Founder or CEO can perform this action." });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

/** Finance, CEO, or Founder — for commission approvals and financial operations */
export const financeProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    const allowed = ["founder", "ceo", "finance"];
    if (!ctx.user.hamzuryRole || !allowed.includes(ctx.user.hamzuryRole)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only Finance, CEO, or Founder can perform this action." });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

/** Any senior staff (all roles above department_staff) */
export const seniorProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    const allowed = ["founder", "ceo", "cso", "finance", "hr", "bizdev"];
    if (!ctx.user.hamzuryRole || !allowed.includes(ctx.user.hamzuryRole)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only senior staff can perform this action." });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

/** CSO, CEO, or Founder — for lead assignment and client ops */
export const csoProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    const allowed = ["founder", "ceo", "cso", "cso_staff"];
    if (!ctx.user.hamzuryRole || !allowed.includes(ctx.user.hamzuryRole)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only CSO, CEO, or Founder can perform this action." });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);
