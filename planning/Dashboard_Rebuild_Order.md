# Dashboard Rebuild Order

Last updated: 2026-04-10
Principle: Build from the outside in. Verify client-facing truth first, then staff, then leadership.

---

## PHASE 1: VERIFIED CLIENT DASHBOARD

**Priority: HIGHEST — this is what paying clients see.**

### Purpose
Allow an active HAMZURY client to log in with their reference number and phone, and see the real status of their project — what's delivered, what's in progress, what's next, and communicate with HAMZURY.

### Required Truth / Data
- Server-verified client session (tRPC endpoint that validates ref + phone against database)
- Client record in database with: ref, name, phone, email, services, department, contract value, paid amount, balance
- Task records linked to client ref with real statuses (not hardcoded)
- Chat history stored server-side (not localStorage)

### What It Must Show
- Client name and reference number
- Project progress (ProgressLine concept — preserve this UI)
- Per-service status with sub-steps (SubLine concept — preserve this UI)
- Deliverables with actual download links (when ready)
- Subscription status and payment history (for subscription clients)
- Chat with HAMZURY (server-persisted)
- Next action and expected delivery date

### What It Must Not Show
- Staff names or internal assignment details
- Commission or internal pricing
- Other clients' data
- Mock or hardcoded service states
- Internal department structure

### Dependencies
- Client records must exist in the database (currently they are only in seed file)
- Task records must be linked to client refs
- A tRPC `client.verify` or `client.session` endpoint must exist
- Chat must have a server-side persistence layer

### Build Readiness
**NOT READY.** Client data is not in the database. Task-to-client linking does not exist. Server-side session verification does not exist. The UI layer (ProgressLine, SubLine) is ready to reuse. The data layer must be built first.

---

## PHASE 2: STAFF PERSONAL DASHBOARD

**Priority: HIGH — every staff member needs to see their own work.**

### Purpose
Give each of the 18 staff members a personal view of: my assigned tasks, my KPIs, my commission earned, my attendance, and my department updates.

### Required Truth / Data
- Authenticated staff session (tRPC — already exists)
- Tasks assigned to this staff member
- Commission records for this staff member
- Attendance records
- Department membership

### What It Must Show
- My tasks (assigned, in progress, completed)
- My commission this month vs threshold (₦30K)
- My attendance record
- My department's latest updates
- My KPI score (tasks completed, leads generated, punctuality)

### What It Must Not Show
- Other staff members' commission details
- Client financial data (contract values, balances)
- Cross-department data (unless CEO/Founder)
- Internal governance decisions

### Dependencies
- Task assignment must include staff ID (exists in schema)
- Commission calculation logic must be in place (tRPC `commissions` router exists)
- Attendance tracking must be functional

### Build Readiness
**PARTIALLY READY.** StaffWorkspace.tsx exists as a generic multi-role view. tRPC auth and task queries work. Commission router exists. Needs rework from generic workspace into personal dashboard. Moderate effort.

---

## PHASE 3: DEPARTMENT DASHBOARD

**Priority: MEDIUM — department leads need their queue view.**

### Purpose
Give each Department Lead a view of their department's task queue, project statuses, staff performance within their department, and client delivery pipeline.

### Required Truth / Data
- Department-filtered task list
- Staff members assigned to this department
- Client projects tagged to this department
- Delivery timeline per project

### What It Must Show
- Department task queue (pending, in progress, completed)
- Staff assigned to this department and their current load
- Client projects in this department with status
- Delivery deadlines and blockers
- Escalation path to CEO

### What It Must Not Show
- Other departments' data
- Global financial data (that's Finance dashboard)
- Commission details of individual staff (that's their personal dashboard)

### Dependencies
- Department Lead role assignment (BizDoc: assigned, Systemise: NOT assigned, Skills: assigned, RIDI: NOT assigned, Media: unclear)
- Tasks tagged with department field (exists in schema)

### Build Readiness
**PARTIALLY READY.** BizDocLeadDashboard and SystemiseLeadDashboard already follow this pattern and use real tRPC data. These are the cleanest dashboards in the codebase. Model can be replicated. Blocked for Systemise and RIDI by missing lead assignments.

Existing department dashboards to preserve as templates:
- BizDocLeadDashboard.tsx — cleanest example
- SystemiseLeadDashboard.tsx — good structure, blocked by missing lead
- SkillsAdmin.tsx — functional

---

## PHASE 4: CEO DASHBOARD

**Priority: MEDIUM — CEO needs cross-department oversight.**

### Purpose
Give the CEO (Idris Ibrahim) a single view across all departments: task status, revenue snapshot, staff performance, escalations, and weekly hub meeting management.

### Required Truth / Data
- Cross-department task aggregation
- Revenue summary from Finance data
- Staff attendance and KPI aggregation
- Escalation queue from all departments
- Hub meeting agenda and to-do tracking

### What It Must Show
- All departments at a glance (task counts, blockers, deadlines)
- Weekly targets and progress
- Revenue snapshot (high-level, not detailed — that's Finance)
- Escalations requiring CEO decision
- Hub meeting management (agenda, last week's review, next week's plan)
- Task assignment capability (assign to department or staff)
- Calendar

### What It Must Not Show
- Raw financial transaction details (that's Finance)
- Individual client chat content (that's CSO)
- Detailed commission breakdowns (that's Finance)

### Dependencies
- All department dashboards must be feeding real data
- Institutional stats tRPC endpoint (exists and works)
- Hub meeting management (tRPC router exists)

### Build Readiness
**MOSTLY READY.** CEODashboard.tsx already uses real tRPC data with no mock fallbacks. Structure is sound. Needs audit for section relevance and possible merger with FounderDashboard functions. Lowest rework effort of all leadership dashboards.

---

## PHASE 5: FOUNDER DASHBOARD (only if still needed)

**Priority: LOW — may not be needed at all.**

### Purpose
If kept separate from CEO: a read-only strategic oversight view for the Founder. Vision alignment, not daily operations.

### Required Truth / Data
- Same data as CEO but read-only
- No task assignment capability
- Long-term metrics (quarterly, annual)

### What It Must Show
- Institutional health snapshot
- Revenue trajectory (not daily — monthly/quarterly)
- Department performance trends
- Strategic alerts only (not operational noise)

### What It Must Not Show
- Daily task details (that's CEO)
- Individual staff issues (that's HR/CEO)

### Dependencies
- CEO Dashboard must be complete first
- Founder must decide if this is needed or if CEO dashboard with founder cross-visibility is sufficient

### Build Readiness
**NOT NEEDED YET.** Current FounderDashboard.tsx duplicates CEO dashboard with added mock fallbacks. The Founder already has cross-visibility to all dashboards via RoleGuard. A separate Founder dashboard may be unnecessary. Decision required from Founder.

---

## REBUILD SEQUENCE SUMMARY

```
Phase 1: Client Dashboard        ← data layer must be built (HIGH effort)
Phase 2: Staff Personal Dashboard ← rework StaffWorkspace (MEDIUM effort)
Phase 3: Department Dashboards    ← preserve BizDoc/Systemise pattern (LOW-MEDIUM effort)
Phase 4: CEO Dashboard            ← audit + tighten existing (LOW effort)
Phase 5: Founder Dashboard        ← decision required (may be ZERO effort if merged)
```

### Supporting Work Required Before Phase 1
1. Seed real client data into database (not just seed file)
2. Link tasks to client refs in database
3. Build tRPC `client.verify` endpoint for server-side session
4. Build tRPC `client.projects` endpoint for real service status
5. Migrate chat to server-side storage

### Supporting Work Required Before Phase 2
1. Ensure staff-to-task assignment is in database
2. Ensure commission records are per-staff

### No Blocking Work for Phases 3-4
- Department dashboards and CEO dashboard already use real tRPC data
- These phases are mostly audit and tightening, not rebuilding
