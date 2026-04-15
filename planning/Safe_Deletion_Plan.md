# Safe Deletion Plan

Last updated: 2026-04-10
Principle: Delete only what is dead, duplicated, misleading, or a security risk. Never delete what has no replacement yet.

---

## TIER 1: SAFE TO DELETE NOW

These files are either security risks, fully mock, or architecturally misleading. Removing them improves the codebase immediately with zero functional loss.

| File | Route | Reason | Risk of Deletion |
|------|-------|--------|-----------------|
| `dashboardStore.ts` | (imported by dashboards) | Shared mock data store. Dashboards that import it show fabricated numbers. Should show empty states instead. | **LOW** — dashboards that import it will fall back to empty/undefined. Each dashboard must handle empty state gracefully. Verify imports before deleting. |
| `TilzSpaFounderDashboard.tsx` | `/clients/tilz-spa/dashboard/founder` | 100% mock data. Hardcoded credentials (`TilzSpa@2026`) in client bundle. Security risk. | **NONE** — demo deliverable. Tilz Spa client can still access portal, founder page, and delivery page. |
| `TilzSpaFinanceDashboard.tsx` | `/clients/tilz-spa/dashboard/finance` | Same — fully mock, hardcoded creds. | **NONE** |
| `TilzSpaReceptionistDashboard.tsx` | `/clients/tilz-spa/dashboard/receptionist` | Same — fully mock, hardcoded creds. | **NONE** |
| `TilzSpaWhatsApp.tsx` | `/clients/tilz-spa/dashboard/whatsapp` | Mock log, setup guide content, no API integration. Content can be preserved as a document if needed. | **NONE** |

### Deletion Steps for Tier 1
1. Remove `dashboardStore.ts` import from all dashboard files that reference it
2. In each affected dashboard, replace mock fallback with empty array/object + empty state UI
3. Delete `dashboardStore.ts`
4. Delete the 4 TilzSpa dashboard files
5. Remove their route entries from `App.tsx`
6. Remove their lazy imports from `App.tsx`
7. Verify TypeScript compilation passes
8. Test that remaining Tilz Spa pages still work: `/clients/tilz-spa`, `/clients/tilz-spa/founder`, `/clients/tilz-spa/delivery`

---

## TIER 2: DELETE AFTER DECISION

These require a founder decision before deletion. They are candidates for deletion but have dependencies.

| File | Route | Waiting On | What Happens If Deleted |
|------|-------|-----------|----------------------|
| `FounderDashboard.tsx` | `/founder/dashboard` | Decision: merge Founder into CEO dashboard or keep separate | If deleted, Founder uses CEO dashboard (already has access via RoleGuard). No functional loss if CEO dashboard is adequate. |

### Deletion Steps for Tier 2
1. Get Founder decision on merge vs separate
2. If merge: audit CEO dashboard to ensure it covers Founder's needs
3. If merge: delete FounderDashboard.tsx, remove route, remove import
4. If keep separate: move to REWORK list instead

---

## TIER 3: ISOLATE FIRST, DELETE LATER

These should not be deleted yet because they serve active users or have no replacement. But they contain mock data or architectural issues that must be addressed.

| File | Issue | Action Now | Delete When |
|------|-------|-----------|-------------|
| `CSODashboard.tsx` | Contains MOCK_HELPERS and MOCK_APPOINTMENTS inline | Remove mock arrays. Replace with empty state + "No data yet" UI. Keep the rest. | Never — rework, don't delete |
| `FounderDashboard.tsx` (if kept) | Contains 4 MOCK_* arrays | Remove all mock arrays. Replace with empty states. | Only if merged into CEO |
| `RIDIDashboard.tsx` | Contains MOCK_COHORT_STUDENTS | Remove mock array. Replace with empty state. | Only if RIDI unit is discontinued |
| `ClientDashboard.tsx` | All data hardcoded (SERVICE_DETAILS, SERVICE_STEPS, etc.) | Do NOT delete. Preserve ProgressLine + SubLine UI. Data layer must be rebuilt underneath. | Never — rework, don't delete |

### Isolation Steps for Tier 3
1. In CSODashboard.tsx: delete MOCK_HELPERS and MOCK_APPOINTMENTS arrays. Replace references with `[]`. Add empty state messaging.
2. In FounderDashboard.tsx: delete all MOCK_* arrays. Replace with `[]`. Add empty states.
3. In RIDIDashboard.tsx: delete MOCK_COHORT_STUDENTS. Replace with `[]`.
4. These are safe code changes that reduce mock surface without breaking functionality.

---

## TIER 4: DO NOT DELETE

These must stay. They are either working correctly, have active users, or are architecturally necessary.

| File | Reason to Keep |
|------|---------------|
| `CEODashboard.tsx` | Real data, active user (CEO), sound architecture |
| `CSODashboard.tsx` | Core to operations (after mock removal) |
| `FinanceDashboard.tsx` | Clean, real data, matches operations truth |
| `HRDashboard.tsx` | Real data, will be needed when HR Lead is assigned |
| `BizDevDashboard.tsx` | Real data, may need scope adjustment vs CSO |
| `BizDocLeadDashboard.tsx` | Clean, real data, active lead assigned |
| `SystemiseLeadDashboard.tsx` | Clean, real data, ready when lead is assigned |
| `MediaDashboard.tsx` | Real data, needs tightening but not deletion |
| `SkillsAdmin.tsx` | Functional, active lead assigned |
| `StaffWorkspace.tsx` | Needs rework into personal dashboard, not deletion |
| `ClientDashboard.tsx` | UI innovation must be preserved. Data layer needs rebuild. |
| `AffiliateDashboard.tsx` | Functional, tRPC-based, can defer |
| `TilzSpaPortal.tsx` | Public client site — live deliverable |
| `TilzSpaFounder.tsx` | Public founder page — live deliverable |
| `TilzSpaDelivery.tsx` | Delivery showcase — live deliverable (update download links after Tilz dashboard deletion) |

---

## SAFE DELETION SEQUENCE (Recommended Order)

```
Step 1: Remove dashboardStore.ts mock imports from all dashboards
Step 2: Add empty state handling where mock fallbacks were used
Step 3: Delete dashboardStore.ts
Step 4: Delete TilzSpaFounderDashboard.tsx
Step 5: Delete TilzSpaFinanceDashboard.tsx
Step 6: Delete TilzSpaReceptionistDashboard.tsx
Step 7: Delete TilzSpaWhatsApp.tsx
Step 8: Remove all 4 Tilz dashboard routes from App.tsx
Step 9: Update TilzSpaDelivery.tsx to remove/disable links to deleted dashboards
Step 10: Remove inline mock arrays from CSODashboard, FounderDashboard, RIDIDashboard
Step 11: Verify TypeScript compilation
Step 12: Test all remaining routes
Step 13: Commit with clear message: "Remove mock dashboards and shared mock store"
```

### What This Achieves
- Removes 5 files and 1 shared mock store
- Eliminates hardcoded credentials from client bundle
- Eliminates fabricated data from operational dashboards
- Reduces dashboard surface from 16 files to 11 files
- Every remaining dashboard either uses real tRPC data or shows honest empty states
- Zero functional loss for any active HAMZURY user

---

## RISKS OF NOT DELETING

1. Hardcoded `TilzSpa@2026` password remains in the deployed client bundle — anyone can find it
2. Dashboards continue to show mock data that looks real — misleading for CEO/Founder when reviewing
3. New developers or staff may mistake mock data for real operational data
4. dashboardStore.ts shared fallback masks data gaps instead of surfacing them
