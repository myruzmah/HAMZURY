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
import CEOPortal from "./pages/CEOPortal";
import BizDevPortal from "./pages/BizDevPortal";
import SystemisePortal from "./pages/SystemisePortal";
import SkillsPortal from "./pages/SkillsPortal";
import SkillsPrograms from "./pages/SkillsPrograms";
import SkillsBlueprint from "./pages/SkillsBlueprint";
import SkillsStudent from "./pages/SkillsStudent";
import FounderPage from "./pages/FounderPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ConsultantPage from "./pages/ConsultantPage";
import AffiliatePage from "./pages/AffiliatePage";
import PricingPage from "./pages/PricingPage";
import CTOPublicPage from "./pages/CTOPublicPage";
import ClientDashboard from "./pages/ClientDashboard";
import AlumniPage from "./pages/AlumniPage";
import RIDIPage from "./pages/RIDIPage";
import BizDocBlueprint from "./pages/BizDocBlueprint";
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
 * CSO is currently the only active staff dashboard. Other department
 * dashboards were removed 2026-04 and will be added back one at a time
 * once CSO is proven stable.
 */
const ROLE_ACCESS: Record<string, string[]> = {
  "/cso": ["cso", "cso_staff"],
  "/ceo": ["ceo", "founder"],
  "/bizdev": ["bizdev", "bizdev_staff", "ceo", "founder"],
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

      {/* Systemise Department Portal */}
      <Route path={"/systemise"} component={SystemisePortal} />

      {/* Skills Department Portal */}
      <Route path={"/skills"} component={SkillsPortal} />
      <Route path={"/skills/programs"} component={SkillsPrograms} />
      <Route path={"/skills/blueprint"} component={SkillsBlueprint} />
      <Route path={"/skills/student"} component={SkillsStudent} />
      <Route path={"/skills/milestones"} component={SkillsMilestones} />
      <Route path={"/skills/startups"} component={SkillsStartups} />
      <Route path={"/skills/alumni"} component={SkillsAlumni} />
      <Route path={"/skills/hals"} component={SkillsHALS} />

      {/* Staff Dashboards — CSO is the only active one */}
      <Route path={"/cso"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/cso"]}>
          <CSOPortal />
        </RoleGuard>
      </Route>
      {/* Legacy /hub/cso redirect → /cso */}
      <Route path={"/hub/cso"}>{() => { window.location.href = "/cso"; return null; }}</Route>

      {/* CEO Executive Portal */}
      <Route path={"/ceo"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/ceo"]}>
          <CEOPortal />
        </RoleGuard>
      </Route>
      <Route path={"/hub/ceo"}>{() => { window.location.href = "/ceo"; return null; }}</Route>

      {/* BizDev Growth Portal */}
      <Route path={"/bizdev"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/bizdev"]}>
          <BizDevPortal />
        </RoleGuard>
      </Route>

      {/* Deprecated staff dashboards — redirect to home (2026-04 cleanup) */}
      <Route path={"/hub/finance"}>{() => { window.location.href = "/"; return null; }}</Route>
      <Route path={"/hub/hr"}>{() => { window.location.href = "/"; return null; }}</Route>
      <Route path={"/hub/bizdev"}>{() => { window.location.href = "/bizdev"; return null; }}</Route>
      <Route path={"/hub/workspace"}>{() => { window.location.href = "/"; return null; }}</Route>
      <Route path={"/bizdoc/dashboard"}>{() => { window.location.href = "/"; return null; }}</Route>
      <Route path={"/systemise/dashboard"}>{() => { window.location.href = "/"; return null; }}</Route>
      <Route path={"/systemise/cto"}>{() => { window.location.href = "/"; return null; }}</Route>
      <Route path={"/skills/admin"}>{() => { window.location.href = "/"; return null; }}</Route>
      <Route path={"/skills/ceo"}>{() => { window.location.href = "/"; return null; }}</Route>
      <Route path={"/ridi/dashboard"}>{() => { window.location.href = "/"; return null; }}</Route>
      <Route path={"/media/dashboard"}>{() => { window.location.href = "/"; return null; }}</Route>
      <Route path={"/affiliate/dashboard"}>{() => { window.location.href = "/"; return null; }}</Route>

      {/* Client Onboarding Form — public, ref-based (wildcard for refs with slashes like HMZ-26/4-5623) */}
      <Route path="/start/*" component={ClientOnboarding} />

      {/* Client Portal — dashboard only, clients enter ref via Track section */}
      <Route path={"/client/dashboard"} component={ClientDashboard} />
      <Route path={"/client"}>{() => { window.location.href = "/"; return null; }}</Route>

      {/* Affiliate Portal — public landing only */}
      <Route path={"/affiliate"} component={AffiliatePage} />

      {/* Public CTO Page */}
      <Route path={"/cto"} component={CTOPublicPage} />

      {/* Community / Public Pages */}
      <Route path={"/alumni"} component={AlumniPage} />
      <Route path={"/ridi"} component={RIDIPage} />
      <Route path={"/team"} component={TeamPage} />

      {/* Info Pages */}
      <Route path={"/founder"} component={FounderPage} />
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
