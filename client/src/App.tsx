import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";

import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import BizDocPortal from "./pages/BizDocPortal";
import CSOPortal from "./pages/CSOPortal";
import FinanceDashboard from "./pages/FinanceDashboard";
import CEODashboard from "./pages/CEODashboard";
import BizDevDashboard from "./pages/BizDevDashboard";
import HRDashboard from "./pages/HRDashboard";
import SystemisePortal from "./pages/SystemisePortal";
import SkillsPortal from "./pages/SkillsPortal";
import SkillsPrograms from "./pages/SkillsPrograms";
import SkillsBlueprint from "./pages/SkillsBlueprint";
import SkillsStudent from "./pages/SkillsStudent";
import SkillsAdmin from "./pages/SkillsAdmin";
import FounderPage from "./pages/FounderPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ConsultantPage from "./pages/ConsultantPage";
import AffiliatePage from "./pages/AffiliatePage";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import PricingPage from "./pages/PricingPage";
import StaffWorkspace from "./pages/StaffWorkspace";
import SkillsCEOPage from "./pages/SkillsCEOPage";
import CTOPage from "./pages/CTOPage";
import CTOPublicPage from "./pages/CTOPublicPage";
import ClientDashboard from "./pages/ClientDashboard";
import AlumniPage from "./pages/AlumniPage";
import RIDIPage from "./pages/RIDIPage";
import RIDIDashboard from "./pages/RIDIDashboard";
import MediaDashboard from "./pages/MediaDashboard";
import BizDocLeadDashboard from "./pages/BizDocLeadDashboard";
import BizDocBlueprint from "./pages/BizDocBlueprint";
import SystemiseLeadDashboard from "./pages/SystemiseLeadDashboard";
import TeamPage from "./pages/TeamPage";
import MetFixPage from "./pages/MetFixPage";
import SocialTemplates from "./pages/SocialTemplates";
import TrainingPage from "./pages/TrainingPage";
import SkillsMilestones from "./pages/SkillsMilestones";
import SkillsStartups from "./pages/SkillsStartups";
import SkillsAlumni from "./pages/SkillsAlumni";
import SkillsHALS from "./pages/SkillsHALS";
import ClientOnboarding from "./pages/ClientOnboarding";

import CookieBanner from "./components/CookieBanner";
import ChatWidget from "./components/ChatWidget";
import { trpc } from "./lib/trpc";

// Strict role access — each person only sees their own dashboard
// Only the founder has cross-dashboard visibility
/**
 * ROLE_ACCESS — protected internal portal routes.
 *
 * Each entry below is a CURRENT internal route. The new portal architecture
 * will move these to portal subdomains (same codebase, separate route groups):
 *
 *   /hub/ceo              → ceoportal.hamzury.com
 *   /cso                  → csoportal.hamzury.com  (LIVE — replaced /hub/cso)
 *   /bizdoc/dashboard     → bizdocportal.hamzury.com
 *   /systemise/dashboard  → systemiseportal.hamzury.com
 *   /skills/admin + /ridi → innovationhubportal.hamzury.com
 *   /hub/bizdev           → bizdevportal.hamzury.com
 *   /hub/finance          → financeportal.hamzury.com
 *   /hub/hr               → hrportal.hamzury.com
 *
 * Do not add new legacy-style dashboards under /hub/*. Build new portal
 * pages into the portal subdomains above when they are introduced.
 */
const ROLE_ACCESS: Record<string, string[]> = {
  // FOUNDER POLICY (2026-04): founder has NO cross-dashboard access.
  // Each role only sees their own. If founder wants to inspect another
  // department, they log in under that role's credentials. No bypass.
  "/hub/ceo":             ["ceo"],
  "/cso":                 ["cso", "cso_staff"],
  "/hub/finance":         ["finance"],
  "/hub/hr":              ["hr"],
  "/hub/bizdev":          ["bizdev"],
  "/hub/workspace":       ["bizdev_staff", "compliance_staff", "security_staff", "department_staff"],
  "/bizdoc/dashboard":    ["cso", "bizdev", "bizdoc_lead"],
  "/skills/admin":        ["skills_staff"],
  "/ridi/dashboard":      ["skills_staff"],
  "/media/dashboard":     ["media"],
  "/skills/ceo":          ["ceo"],
  "/systemise/cto":       ["ceo", "systemise_head", "tech_lead", "media"],
  "/systemise/dashboard": ["ceo", "systemise_head", "tech_lead"],
};

/** Wrapper that enforces hamzuryRole-based access on /hub/* and sensitive routes */
function RoleGuard({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) {
  const [location] = useLocation();
  const me = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });

  if (me.isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#1A1A1A]">
        <div className="w-6 h-6 rounded-full border-2 border-[#B48C4C] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!me.data) {
    // Not authenticated — redirect to home (staff login is in Track section)
    window.location.href = "/";
    return null;
  }

  const role = me.data.hamzuryRole || "";
  if (!allowedRoles.includes(role)) {
    window.location.href = "/";
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* HAMZURY Main Hub */}
      <Route path={"/"} component={Home} />

      {/* BizDoc Department Portal */}
      <Route path={"/bizdoc"} component={BizDocPortal} />
      <Route path={"/bizdoc/blueprint"} component={BizDocBlueprint} />
      <Route path={"/bizdoc/dashboard"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/bizdoc/dashboard"]}>
          <BizDocLeadDashboard />
        </RoleGuard>
      </Route>

      {/* Systemise Department Portal */}
      <Route path={"/systemise"} component={SystemisePortal} />
      <Route path={"/systemise/dashboard"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/systemise/dashboard"]}>
          <SystemiseLeadDashboard />
        </RoleGuard>
      </Route>

      {/* Skills Department Portal */}
      <Route path={"/skills"} component={SkillsPortal} />
      <Route path={"/skills/programs"} component={SkillsPrograms} />
      <Route path={"/skills/blueprint"} component={SkillsBlueprint} />
      <Route path={"/skills/student"} component={SkillsStudent} />
      <Route path={"/skills/milestones"} component={SkillsMilestones} />
      <Route path={"/skills/startups"} component={SkillsStartups} />
      <Route path={"/skills/alumni"} component={SkillsAlumni} />
      <Route path={"/skills/hals"} component={SkillsHALS} />
      <Route path={"/skills/admin"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/skills/admin"]}>
          <SkillsAdmin />
        </RoleGuard>
      </Route>

      {/* Staff Dashboards — role-protected */}
      <Route path={"/hub/ceo"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/hub/ceo"]}>
          <CEODashboard />
        </RoleGuard>
      </Route>
      {/* CSO Portal — new portal architecture (csoportal.hamzury.com).
          Replaced legacy /hub/cso + CSODashboard.tsx. */}
      <Route path={"/cso"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/cso"]}>
          <CSOPortal />
        </RoleGuard>
      </Route>
      {/* Legacy /hub/cso redirect → /cso (so any old bookmarks still land) */}
      <Route path={"/hub/cso"}>{() => { window.location.href = "/cso"; return null; }}</Route>
      <Route path={"/hub/finance"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/hub/finance"]}>
          <FinanceDashboard />
        </RoleGuard>
      </Route>
      <Route path={"/hub/bizdev"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/hub/bizdev"]}>
          <BizDevDashboard />
        </RoleGuard>
      </Route>
      <Route path={"/hub/hr"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/hub/hr"]}>
          <HRDashboard />
        </RoleGuard>
      </Route>
      <Route path={"/hub/workspace"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/hub/workspace"]}>
          <StaffWorkspace />
        </RoleGuard>
      </Route>
      {/* Client Onboarding Form — public, ref-based (wildcard for refs with slashes like HMZ-26/4-5623) */}
      <Route path="/start/*" component={ClientOnboarding} />

      {/* Client Showcase Pages */}
      {/* HAMZURY Client Portals — Verified Client Sites */}

      {/* Client Portal — dashboard only, clients enter ref via Track section */}
      <Route path={"/client/dashboard"} component={ClientDashboard} />
      <Route path={"/client"}>{() => { window.location.href = "/"; return null; }}</Route>

      {/* Affiliate Portal */}
      <Route path={"/affiliate"} component={AffiliatePage} />
      <Route path={"/affiliate/dashboard"} component={AffiliateDashboard} />

      {/* Leadership Pages */}
      <Route path={"/skills/ceo"} component={SkillsCEOPage} />
      <Route path={"/cto"} component={CTOPublicPage} />
      <Route path={"/systemise/cto"} component={CTOPage} />

      {/* Community / Public Pages */}
      <Route path={"/alumni"} component={AlumniPage} />
      <Route path={"/ridi"} component={RIDIPage} />
      <Route path={"/ridi/dashboard"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/ridi/dashboard"]}>
          <RIDIDashboard />
        </RoleGuard>
      </Route>
      <Route path={"/media/dashboard"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/media/dashboard"]}>
          <MediaDashboard />
        </RoleGuard>
      </Route>
      <Route path={"/team"} component={TeamPage} />

      {/* Info Pages */}
      <Route path={"/founder"} component={FounderPage} />
      {/* /founder/dashboard removed — FounderDashboard moved to _legacy.
          Founder-level visibility will be folded into the CEO Portal
          (ceoportal.hamzury.com) once that portal is built. */}
      <Route path={"/privacy"} component={PrivacyPolicy} />
      <Route path={"/terms"} component={TermsOfService} />
      <Route path={"/consultant"} component={ConsultantPage} />
      <Route path={"/pricing"} component={PricingPage} />
      <Route path={"/metfix"} component={MetFixPage} />
      <Route path={"/templates"} component={SocialTemplates} />
      <Route path={"/training/:dept"} component={TrainingPage} />
      <Route path={"/training"} component={TrainingPage} />
      <Route path={"/login"}>{() => { window.location.href = "/"; return null; }}</Route>

      {/* Fallback */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    // Skip scroll reset for hash links (in-page anchors)
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}

/** Show chat on public pages, department portals, client dashboard, and staff dashboards */
function FloatingChat() {
  const [location] = useLocation();

  // Exclude legal pages
  if (location === "/privacy" || location === "/terms") return null;

  // Chat on department portals, CSO dashboard, and pages with chat CTAs
  const chatRoutes: { prefix: string; dept: "bizdoc" | "systemise" | "skills" | "general"; exact?: boolean }[] = [
    { prefix: "/bizdoc",    dept: "bizdoc" },
    { prefix: "/systemise", dept: "systemise" },
    { prefix: "/skills",    dept: "skills" },
    { prefix: "/cso",       dept: "bizdoc" },
    { prefix: "/pricing",   dept: "general" },
    { prefix: "/founder",   dept: "general" },
    { prefix: "/team",      dept: "general" },
    { prefix: "/ridi",      dept: "skills" },
    { prefix: "/cto",       dept: "systemise" },
    { prefix: "/affiliate", dept: "general" },
  ];

  const match = chatRoutes.find(r =>
    r.exact ? location === r.prefix : (location === r.prefix || location.startsWith(r.prefix + "/"))
  );
  if (!match) return null;

  return <ChatWidget department={match.dept} />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <Router />
          <FloatingChat />
          <CookieBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
