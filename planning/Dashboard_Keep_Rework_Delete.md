# Dashboard Keep / Rework / Delete Classification

Last updated: 2026-04-10
Rule: If dashboard code conflicts with the HAMZURY operations source of truth, the source of truth wins.

---

## CLASSIFICATION TABLE

### HAMZURY INTERNAL DASHBOARDS

| File | Route | Current Purpose | Verdict | Reason |
|------|-------|----------------|---------|--------|
| **CEODashboard.tsx** | `/hub/ceo` | CEO operations view — 8 sections, real tRPC data, cross-department | **REWORK** | Architecturally sound. Uses real data. Needs audit against operations truth for section relevance. Hub meeting, targets, escalations are valid. May absorb FounderDashboard functions. |
| **FounderDashboard.tsx** | `/founder/dashboard` | Founder superset view — 10 sections, mixed real + mock | **DELETE (defer)** | Operations truth does not clearly separate Founder from CEO. Currently duplicates CEO dashboard with mock fallbacks added. Decision required: merge into CEO or keep as oversight-only view. Until decided, mark for deletion. |
| **CSODashboard.tsx** | `/hub/cso` | CSO lead gateway — 15 sections, mixed real + mock | **REWORK** | Core to operations truth. CSO is the only client gateway. Too many sections (15 is excessive). Mock helpers and mock appointments must be removed. Needs tightening to: discovery, pipeline, assign, review, subscriptions. |
| **FinanceDashboard.tsx** | `/hub/finance` | Finance tracking — 7 sections, real tRPC data | **KEEP** | Clean. Uses real data. Matches operations truth. May need subscription billing verification added. |
| **HRDashboard.tsx** | `/hub/hr` | HR management — 12 sections, real data | **REWORK** | Uses real data but has 12 sections which is too many for a role with no named lead. Needs tightening. HR Lead assignment is a prerequisite before this dashboard is useful. |
| **BizDevDashboard.tsx** | `/hub/bizdev` | BizDev leads and partnerships — 6 sections, real data | **REWORK** | Operations truth places lead management under CSO. BizDev overlap with CSO needs resolution. Partnerships and affiliate management may be valid here. Brand QA section unclear. |
| **BizDocLeadDashboard.tsx** | `/bizdoc/dashboard` | BizDoc compliance queue — 6 sections, real data | **KEEP** | Matches operations truth. Abdullahi Musa is the assigned lead. Clean department dashboard pattern. |
| **SystemiseLeadDashboard.tsx** | `/systemise/dashboard` | Systemise project management — 7 sections, real data | **KEEP (blocked)** | Dashboard structure is sound but no one is assigned as Systemise Head. Usable once role is filled. No code changes needed — operational gap, not technical gap. |
| **MediaDashboard.tsx** | `/media/dashboard` | Media content management — 9 sections, real data | **REWORK** | 9 sections is heavy. No clear Media Lead. Some sections (AI Twin, Podcast) may be premature. Needs tightening to active functions only. |
| **RIDIDashboard.tsx** | `/ridi/dashboard` | RIDI incubation management — 5 sections, mixed data | **REWORK** | Uses skills_staff role, not its own role. Mock cohort data for testing. RIDI needs its own governance definition before dashboard can be validated. |
| **StaffWorkspace.tsx** | `/hub/workspace` | Generic staff task view — multi-role | **REWORK** | Correct concept but too generic. Needs to become a proper Staff Personal Dashboard showing: my tasks, my KPIs, my commission, my attendance. Currently a catch-all. |
| **SkillsAdmin.tsx** | `/skills/admin` | Skills department admin panel | **KEEP** | Matches operations truth. Abdulmalik Musa is the assigned lead. |

### CLIENT-FACING DASHBOARDS

| File | Route | Current Purpose | Verdict | Reason |
|------|-------|----------------|---------|--------|
| **ClientDashboard.tsx** | `/client/dashboard` | Client project progress view — ProgressLine, SubLine, chat | **REWORK (major)** | UI innovation (ProgressLine/SubLine) is strong and should be preserved. But ALL data is hardcoded. No server-side session validation. Service states are not database-driven. Chat is localStorage-only. Needs full data layer rebuild while preserving the UI concept. |
| **AffiliateDashboard.tsx** | `/affiliate/dashboard` | Affiliate referral tracking | **KEEP (defer)** | Works with tRPC. But Affiliate Premier League is not active yet. Can stay as-is until affiliate program launches. Low priority for rebuild. |

### TILZ SPA CLIENT DASHBOARDS

| File | Route | Current Purpose | Verdict | Reason |
|------|-------|----------------|---------|--------|
| **TilzSpaFounderDashboard.tsx** | `/clients/tilz-spa/dashboard/founder` | Demo dashboard for Tilz Spa client | **DELETE** | 100% mock data. Hardcoded credentials in source code. Not connected to spa database tables. Security risk. Should be rebuilt as a real client-portal using the 8 spa tables when Tilz Spa is ready for live operations. |
| **TilzSpaFinanceDashboard.tsx** | `/clients/tilz-spa/dashboard/finance` | Demo finance view for Tilz Spa | **DELETE** | Same as above — fully mock, hardcoded creds, not connected to database. |
| **TilzSpaReceptionistDashboard.tsx** | `/clients/tilz-spa/dashboard/receptionist` | Demo receptionist view for Tilz Spa | **DELETE** | Same as above. |
| **TilzSpaWhatsApp.tsx** | `/clients/tilz-spa/dashboard/whatsapp` | WhatsApp setup guide for Tilz Spa | **DELETE** | Setup guide content with mock log. No actual API integration. Content can be moved to a document. |

### SHARED FILES

| File | Current Purpose | Verdict | Reason |
|------|----------------|---------|--------|
| **dashboardStore.ts** | Shared mock tasks + finance summary fallback | **DELETE** | Mock data store. Any dashboard importing this shows fabricated numbers when real data is empty. This is misleading. Dashboards should show empty states, not fake data. |

---

## SUMMARY COUNTS

| Verdict | Count | Files |
|---------|-------|-------|
| **KEEP** | 4 | FinanceDashboard, BizDocLeadDashboard, SystemiseLeadDashboard (blocked), SkillsAdmin |
| **KEEP (defer)** | 1 | AffiliateDashboard |
| **REWORK** | 7 | CEODashboard, CSODashboard, HRDashboard, BizDevDashboard, MediaDashboard, RIDIDashboard, StaffWorkspace |
| **REWORK (major)** | 1 | ClientDashboard |
| **DELETE** | 5 | FounderDashboard, TilzSpaFounderDashboard, TilzSpaFinanceDashboard, TilzSpaReceptionistDashboard, TilzSpaWhatsApp |
| **DELETE** | 1 | dashboardStore.ts |

**Total: 4 keep, 1 defer, 8 rework, 6 delete.**

---

## KEY DECISIONS REQUIRED BEFORE REBUILD

1. **Founder vs CEO Dashboard** — Merge or keep separate? Operations truth suggests merge. Founder currently gets cross-visibility via RoleGuard anyway.
2. **BizDev vs CSO lead ownership** — Who owns lead management? Operations truth says CSO. BizDev may focus on partnerships/affiliates only.
3. **HR Lead assignment** — HRDashboard exists but no one is named. Assign or merge HR functions into CEO dashboard.
4. **Media Lead assignment** — MediaDashboard has 9 sections but no confirmed lead.
5. **RIDI governance** — Needs its own lead and revenue model before dashboard can be validated.
6. **Tilz Spa: rebuild or deliver as-is?** — Current dashboards are demo quality. Real operations require database connection. Is this in scope for the current rebuild or deferred to Tilz Spa Phase 2?
