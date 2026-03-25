import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import BizDocPortal from "./pages/BizDocPortal";
import Dashboard from "./pages/Dashboard";
import CSODashboard from "./pages/CSODashboard";
import FinanceDashboard from "./pages/FinanceDashboard";
import FederalHub from "./pages/FederalHub";
import CEODashboard from "./pages/CEODashboard";
import BizDevDashboard from "./pages/BizDevDashboard";
import HRDashboard from "./pages/HRDashboard";
import SystemisePortal from "./pages/SystemisePortal";
import SkillsPortal from "./pages/SkillsPortal";
import SkillsStudent from "./pages/SkillsStudent";
import SkillsAdmin from "./pages/SkillsAdmin";
import FounderPage from "./pages/FounderPage";
import FounderDashboard from "./pages/FounderDashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ConsultantPage from "./pages/ConsultantPage";
import TrackPage from "./pages/TrackPage";
import AskMePage from "./pages/AskMePage";
import AffiliatePage from "./pages/AffiliatePage";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import PricingPage from "./pages/PricingPage";
import SkillsCEOPage from "./pages/SkillsCEOPage";
import CTOPage from "./pages/CTOPage";
import ClientDashboard from "./pages/ClientDashboard";
import CookieBanner from "./components/CookieBanner";
import { lazy, Suspense } from "react";
const DevLogin = lazy(() => import("./pages/DevLogin"));
import { trpc } from "./lib/trpc";
import { getLoginUrl } from "./const";

// Role hierarchy — who can access which /hub/* route
const ROLE_ACCESS: Record<string, string[]> = {
  "/founder/dashboard": ["founder"],
  "/hub/ceo":           ["founder", "ceo"],
  "/hub/cso":           ["founder", "ceo", "cso"],
  "/hub/finance":       ["founder", "ceo", "finance"],
  "/hub/hr":            ["founder", "ceo", "hr"],
  "/hub/bizdev":        ["founder", "ceo", "bizdev"],
  "/hub/federal":       ["founder", "ceo", "cso", "finance", "hr", "bizdev"],
  "/bizdoc/dashboard":  ["founder", "ceo", "cso", "department_staff"],
  "/skills/admin":      ["founder", "ceo", "department_staff"],
  "/skills/ceo":        ["founder", "ceo"],
  "/systemise/cto":     ["founder", "ceo"],
};

/** Wrapper that enforces hamzuryRole-based access on /hub/* and sensitive routes */
function RoleGuard({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) {
  const [location] = useLocation();
  const me = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });

  if (me.isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0A1F1C]">
        <div className="w-6 h-6 rounded-full border-2 border-[#C9A97E] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!me.data) {
    // Not authenticated — redirect to login
    window.location.href = import.meta.env.DEV ? "/dev-login" : getLoginUrl();
    return null;
  }

  const role = me.data.hamzuryRole || "";
  if (!allowedRoles.includes(role)) {
    // Authenticated but wrong role — show access denied
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F8F5EE]">
        <div className="text-center max-w-sm px-6">
          <p className="text-[32px] font-bold text-[#0A1F1C] mb-2">Access Denied</p>
          <p className="text-[14px] text-[#0A1F1C] opacity-50 mb-6">
            Your role ({role || "unassigned"}) does not have access to this section.
          </p>
          <a href="/" className="text-[13px] font-semibold text-[#C9A97E] underline">← Return to Home</a>
        </div>
      </div>
    );
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
      <Route path={"/bizdoc/dashboard"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/bizdoc/dashboard"]}>
          <Dashboard />
        </RoleGuard>
      </Route>

      {/* Systemise Department Portal */}
      <Route path={"/systemise"} component={SystemisePortal} />

      {/* Skills Department Portal */}
      <Route path={"/skills"} component={SkillsPortal} />
      <Route path={"/skills/student"} component={SkillsStudent} />
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
      <Route path={"/hub/cso"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/hub/cso"]}>
          <CSODashboard />
        </RoleGuard>
      </Route>
      <Route path={"/hub/finance"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/hub/finance"]}>
          <FinanceDashboard />
        </RoleGuard>
      </Route>
      <Route path={"/hub/federal"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/hub/federal"]}>
          <FederalHub />
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

      {/* Client Dashboard */}
      <Route path={"/client/dashboard"} component={ClientDashboard} />

      {/* Public Tracking */}
      <Route path={"/track"} component={TrackPage} />

      {/* Affiliate Portal */}
      <Route path={"/affiliate"} component={AffiliatePage} />
      <Route path={"/affiliate/dashboard"} component={AffiliateDashboard} />

      {/* Leadership Pages */}
      <Route path={"/skills/ceo"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/skills/ceo"]}>
          <SkillsCEOPage />
        </RoleGuard>
      </Route>
      <Route path={"/systemise/cto"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/systemise/cto"]}>
          <CTOPage />
        </RoleGuard>
      </Route>

      {/* Info Pages */}
      <Route path={"/founder"} component={FounderPage} />
      <Route path={"/founder/dashboard"}>
        <RoleGuard allowedRoles={ROLE_ACCESS["/founder/dashboard"]}>
          <FounderDashboard />
        </RoleGuard>
      </Route>
      <Route path={"/privacy"} component={PrivacyPolicy} />
      <Route path={"/terms"} component={TermsOfService} />
      <Route path={"/consultant"} component={ConsultantPage} />
      <Route path={"/ask"} component={AskMePage} />
      <Route path={"/pricing"} component={PricingPage} />

      {/* Dev Login (development only — excluded from production bundle) */}
      {import.meta.env.DEV && (
        <Route path={"/dev-login"}>
          <Suspense fallback={null}><DevLogin /></Suspense>
        </Route>
      )}

      {/* Fallback */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <CookieBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
