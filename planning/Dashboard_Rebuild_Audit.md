# Dashboard Rebuild Audit

Last updated: 2026-04-10
Purpose: Document the current state of every dashboard in the codebase before rebuild decisions.

---

## 1. CURRENT DASHBOARD ROUTES

### HAMZURY Internal (tRPC-authenticated, RoleGuard-protected)

| Route | Component | Allowed Roles |
|-------|-----------|---------------|
| `/hub/ceo` | CEODashboard.tsx | founder, ceo |
| `/hub/cso` | CSODashboard.tsx | founder, cso |
| `/hub/finance` | FinanceDashboard.tsx | founder, finance |
| `/hub/bizdev` | BizDevDashboard.tsx | founder, bizdev |
| `/hub/hr` | HRDashboard.tsx | founder, hr |
| `/hub/workspace` | StaffWorkspace.tsx | founder, bizdev_staff, compliance_staff, security_staff, department_staff |
| `/bizdoc/dashboard` | BizDocLeadDashboard.tsx | founder, cso, bizdev, bizdoc_lead |
| `/systemise/dashboard` | SystemiseLeadDashboard.tsx | founder, ceo, systemise_head, tech_lead |
| `/skills/admin` | SkillsAdmin.tsx | founder, skills_staff |
| `/ridi/dashboard` | RIDIDashboard.tsx | founder, skills_staff |
| `/media/dashboard` | MediaDashboard.tsx | founder, media |
| `/founder/dashboard` | FounderDashboard.tsx | founder |
| `/affiliate/dashboard` | AffiliateDashboard.tsx | affiliate (email-based session) |

### Client-Facing (localStorage-authenticated, no RoleGuard)

| Route | Component | Auth Method |
|-------|-----------|-------------|
| `/client/dashboard` | ClientDashboard.tsx | localStorage `hamzury-client-session` (ref + phone + expiresAt) |

### Tilz Spa Client Deliverable (hardcoded credentials, no RoleGuard)

| Route | Component | Auth Method |
|-------|-----------|-------------|
| `/clients/tilz-spa/dashboard/founder` | TilzSpaFounderDashboard.tsx | localStorage `tilz-spa-auth` — hardcoded `founder@tilzspa.com` / `TilzSpa@2026` |
| `/clients/tilz-spa/dashboard/finance` | TilzSpaFinanceDashboard.tsx | localStorage `tilz-spa-auth` — hardcoded `finance@tilzspa.com` / `TilzSpa@2026` |
| `/clients/tilz-spa/dashboard/receptionist` | TilzSpaReceptionistDashboard.tsx | localStorage `tilz-spa-auth` — hardcoded `reception@tilzspa.com` / `TilzSpa@2026` |
| `/clients/tilz-spa/dashboard/whatsapp` | TilzSpaWhatsApp.tsx | localStorage `tilz-spa-auth` — hardcoded founder creds |

---

## 2. CURRENT DASHBOARD COMPONENTS

### 15 dashboard files total:

| File | Lines (est.) | Complexity |
|------|-------------|------------|
| CEODashboard.tsx | ~800+ | High — 8 sections, real tRPC data, cross-department views |
| FounderDashboard.tsx | ~900+ | High — 10 sections, mixed tRPC + mock fallbacks |
| CSODashboard.tsx | ~1000+ | Very high — 15 sections, mixed tRPC + mock fallbacks |
| FinanceDashboard.tsx | ~600+ | Medium — 7 sections, real tRPC data |
| HRDashboard.tsx | ~700+ | Medium — 12 sections, real tRPC data |
| BizDevDashboard.tsx | ~500+ | Medium — 6 sections, real data only |
| BizDocLeadDashboard.tsx | ~500+ | Medium — 6 sections, real tRPC data |
| SystemiseLeadDashboard.tsx | ~500+ | Medium — 7 sections, real tRPC data |
| MediaDashboard.tsx | ~600+ | Medium — 9 sections, real tRPC data |
| RIDIDashboard.tsx | ~400+ | Low-medium — 5 sections, mixed tRPC + mock toggle |
| StaffWorkspace.tsx | ~400+ | Low-medium — multi-role general workspace |
| ClientDashboard.tsx | ~800+ | High — ProgressLine system, SubLine, hardcoded service data |
| AffiliateDashboard.tsx | ~400+ | Low-medium — stats, referrals, earnings |
| TilzSpaFounderDashboard.tsx | ~700+ | Medium — 8 sections, fully mock data |
| TilzSpaFinanceDashboard.tsx | ~500+ | Medium — 5 sections, fully mock data |
| TilzSpaReceptionistDashboard.tsx | ~600+ | Medium — 6 sections, fully mock data |
| TilzSpaWhatsApp.tsx | ~400+ | Low — 5 sections, setup guide + mock log |

Also: `dashboardStore.ts` — shared mock tasks + finance summary used as fallback across dashboards.

---

## 3. CURRENT ROLE ASSUMPTIONS

| Dashboard | Assumes Role | Matches Operations Truth? |
|-----------|-------------|--------------------------|
| CEODashboard | CEO runs operations, sees all departments | YES |
| FounderDashboard | Founder has separate superset view | UNCERTAIN — operations docs don't clearly separate Founder vs CEO dashboard needs |
| CSODashboard | CSO is the only client gateway | YES |
| FinanceDashboard | Finance tracks revenue, commissions, subscriptions | YES |
| HRDashboard | HR manages staff, attendance, discipline, training | YES (but no named HR lead) |
| BizDevDashboard | BizDev manages leads, partnerships, affiliates, brand QA | PARTIALLY — operations docs place lead management under CSO, not BizDev |
| BizDocLeadDashboard | BizDoc Lead manages compliance task queue | YES |
| SystemiseLeadDashboard | Systemise Head manages tech projects | YES (but no one is assigned this role) |
| StaffWorkspace | Generic staff see their tasks | YES |
| MediaDashboard | Media staff manages content, social, podcast | YES (but no clear Media Lead) |
| RIDIDashboard | RIDI managed by skills_staff | UNCERTAIN — should RIDI have its own lead? |
| ClientDashboard | External client sees project progress | YES (concept correct, implementation incomplete) |
| AffiliateDashboard | External affiliate tracks referrals and earnings | YES |
| TilzSpa dashboards | Client-specific dashboards for Tilz Spa business | SEPARATE — this is a deliverable for a client, not part of HAMZURY internal operations |

---

## 4. CURRENT CLIENT ASSUMPTIONS

| Assumption in Code | Reality |
|-------------------|---------|
| ClientDashboard uses localStorage session with ref + phone | No server-side verification exists — any ref/phone combo is accepted |
| Client services are determined by `mapServiceToItems()` which pattern-matches on task service strings | Service mapping is heuristic, not database-driven |
| 29 services are hardcoded in SERVICE_DETAILS object | These are business catalog items, not client-specific data |
| Client can see ProgressLine with delivered/in_progress/pending states | States are derived from hardcoded `activeItems` mapping, not from real task status in database |
| Client chat persists in localStorage | No server-side chat history — lost on browser clear |
| Client can see SubLine process steps (e.g., CAC: Name Search → Documents → Filing → Certificate) | Process steps are hardcoded in SERVICE_STEPS — not connected to actual task progress |
| Subscription clients see monthly activity breakdown | Monthly data is hardcoded, not from subscription payment records |

---

## 5. CURRENT DATA ASSUMPTIONS

| Dashboard | Data Source | Issue |
|-----------|-----------|-------|
| CEODashboard | tRPC: institutional.stats, activity.recent, commissions, leads, revenueStats, escalations, deptStats | GOOD — real data, no mock fallback |
| FounderDashboard | tRPC + MOCK_REVENUE, MOCK_LEAD_SOURCES, MOCK_DEPT_PERFORMANCE, MOCK_ESCALATIONS | MIXED — uses mock when tRPC returns empty |
| CSODashboard | tRPC + MOCK_HELPERS (8 fake staff), MOCK_APPOINTMENTS (6 fake bookings) | MIXED — mock fallbacks noted as "acceptable for now" |
| FinanceDashboard | tRPC: commissions, institutional.stats, tasks, subscriptions | GOOD — real data |
| HRDashboard | tRPC: real staff from DB | GOOD — no mock fallback |
| BizDevDashboard | tRPC: real leads only, real affiliates only | GOOD — explicitly no mock |
| BizDocLeadDashboard | tRPC queries | GOOD |
| SystemiseLeadDashboard | tRPC queries | GOOD |
| MediaDashboard | tRPC queries | GOOD |
| RIDIDashboard | tRPC + MOCK_COHORT_STUDENTS (toggle for testing) | MIXED — mock used for RIDI flag testing |
| StaffWorkspace | tRPC | GOOD |
| ClientDashboard | localStorage + hardcoded SERVICE_DETAILS/SERVICE_STEPS/SERVICE_FOLDERS | ALL HARDCODED — zero tRPC integration |
| AffiliateDashboard | tRPC affiliate session OR localStorage fallback | MIXED |
| dashboardStore.ts | SHARED_TASKS (8 fake tasks), FINANCE_SUMMARY | SHARED MOCK — imported by multiple dashboards as fallback |
| TilzSpa (all 4) | Fully hardcoded arrays — appointments, clients, staff, transactions, expenses | ALL MOCK — client deliverable showcase |

---

## 6. CURRENT RISKS

### Security Risks
1. **Hardcoded passwords in source code** — TilzSpa dashboards ship `TilzSpa@2026` in client bundle. Anyone viewing source can log in.
2. **Client session not server-validated** — ClientDashboard accepts any localStorage ref without tRPC verification. A user can fabricate a session.
3. **Tilz Spa auth is client-side only** — localStorage gate with no server check. 8-hour expiry is client-controlled.
4. **dashboardStore.ts shared mock data** — if any dashboard falls back to this, it shows fabricated numbers, not empty states.

### Data Integrity Risks
5. **Client data is not in the database** — 17 clients exist only in seed-real-clients.ts and memory notes. If seed isn't run, clients don't exist.
6. **13 out of 17 clients have no financial data** — dashboards that show revenue/pipeline are showing incomplete pictures.
7. **ProgressLine states are not database-driven** — client sees hardcoded states, not real task progress.
8. **Subscription payments not verified** — April billing status unknown for both active subscriptions.

### Architectural Risks
9. **Founder vs CEO dashboard overlap** — both see cross-department data. Unclear why both exist.
10. **BizDev vs CSO overlap** — BizDevDashboard manages leads, but operations truth says CSO is the lead gateway.
11. **15 dashboard files + 1 shared store** — large surface area to maintain. Some dashboards may not have active users.
12. **No "Staff Personal Dashboard"** — StaffWorkspace exists but is multi-role generic. No individual staff view for "my tasks, my commission, my KPIs."

### Operational Risks
13. **Systemise has no department lead** — SystemiseLeadDashboard exists but no one can log into it with authority.
14. **Tilz Spa dashboards are not connected to spa database tables** — 8 spa tables exist in schema but zero tRPC routes serve them.

---

## 7. CURRENT MOCK/HARDCODED AREAS (Complete List)

| Location | Type | Items |
|----------|------|-------|
| `dashboardStore.ts` | Shared fallback | SHARED_TASKS (8 tasks), FINANCE_SUMMARY |
| `FounderDashboard.tsx` | Inline fallback | MOCK_REVENUE, MOCK_LEAD_SOURCES, MOCK_DEPT_PERFORMANCE, MOCK_ESCALATIONS |
| `CSODashboard.tsx` | Inline fallback | MOCK_HELPERS (8 staff), MOCK_APPOINTMENTS (6 bookings) |
| `RIDIDashboard.tsx` | Test toggle | MOCK_COHORT_STUDENTS (8 students) |
| `ClientDashboard.tsx` | Core data | SERVICE_DETAILS (29 services), SERVICE_FOLDERS (29), SERVICE_STEPS (30+ process maps), activeItems mapping |
| `TilzSpaFounderDashboard.tsx` | Full mock | APPOINTMENTS (8), CLIENTS (8), STAFF_LIST (5), RECENT_TRANSACTIONS |
| `TilzSpaFinanceDashboard.tsx` | Full mock | TRANSACTIONS (12), EXPENSES (10) |
| `TilzSpaReceptionistDashboard.tsx` | Full mock | TODAYS_APPOINTMENTS (10), CLIENT_DATABASE (6), WHATSAPP_MESSAGES (5) |
| `TilzSpaWhatsApp.tsx` | Full mock | MOCK_LOG (10 entries), DEFAULT_TEMPLATES (5), DEFAULT_RULES (6) |
