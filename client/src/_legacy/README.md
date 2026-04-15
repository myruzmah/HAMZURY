# Legacy Dashboard Code

This folder holds dashboard pages that were part of the old dashboard layer.
They are **not imported** by the active app. They are kept here only for
reference patterns (layout, chart integrations, tRPC usage) while the new
portal architecture is being built.

**Do not import from this folder in the active app.**

## What's here

### `FounderDashboard.tsx`
- Was routed at `/founder/dashboard`
- Planning doc verdict: **DELETE** (founder + CEO dashboards to be merged)
- Still contains dashboardStore-era code patterns replaced with empty states
- Keep for reference until Founder/CEO merge decision is finalized
- After the CEO Portal absorbs founder-level visibility, delete this file

## New portal architecture replacing these

| Old route               | New portal subdomain               |
|-------------------------|------------------------------------|
| /hub/ceo                | ceoportal.hamzury.com              |
| /hub/cso                | csoportal.hamzury.com              |
| /bizdoc/dashboard       | bizdocportal.hamzury.com           |
| /systemise/dashboard    | systemiseportal.hamzury.com        |
| /skills/admin + /ridi   | innovationhubportal.hamzury.com    |
| /hub/bizdev             | bizdevportal.hamzury.com           |
| /hub/finance            | financeportal.hamzury.com          |
| /hub/hr                 | hrportal.hamzury.com               |

Each portal: same codebase, same auth, same design system,
same permission model — separate protected route group.
