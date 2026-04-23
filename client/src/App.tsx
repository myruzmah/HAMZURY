import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";

import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

/* ── Public marketing pages (rebrand) ── */
import Home from "./pages/Home";
import BizdocPage from "./pages/BizdocPage";
import ScalarPage from "./pages/ScalarPage";
import MedialyPage from "./pages/MedialyPage";
import HubPage from "./pages/HubPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

/* ── Division assessment forms (CSO shares via WhatsApp) ── */
import BizdocAssessment from "./pages/BizdocAssessment";
import ScalarAssessment from "./pages/ScalarAssessment";
import MedialyAssessment from "./pages/MedialyAssessment";
import HubEnroll from "./pages/HubEnroll";

/* ── Staff portals (kept in legacy green/gold) ── */
import CSOPortal from "./pages/CSOPortal";
import CEOPortal from "./pages/CEOPortal";
import BizDevPortal from "./pages/BizDevPortal";
import FinancePortal from "./pages/FinancePortal";
import HRPortal from "./pages/HRPortal";
import BizdocOpsPortal from "./pages/BizdocOpsPortal";
import HubAdminPortal from "./pages/HubAdminPortal";

/* ── Public/client surfaces ── */
import ClientDashboard from "./pages/ClientDashboard";
import ClientOnboarding from "./pages/ClientOnboarding";
import PricingPage from "./pages/PricingPage";
import FounderPage from "./pages/FounderPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

import CookieBanner from "./components/CookieBanner";
import ChatWidget from "./components/ChatWidget";
import { trpc } from "./lib/trpc";

/**
 * ROLE_ACCESS — protected internal portal routes.
 * Staff portals stay in legacy green/gold — public is rebranded to navy/brown/cream.
 */
const ROLE_ACCESS: Record<string, string[]> = {
  "/cso":     ["cso", "cso_staff"],
  "/ceo":     ["ceo", "founder"],
  "/bizdev":  ["bizdev", "bizdev_staff", "ceo", "founder"],
  "/finance":    ["finance", "ceo", "founder"],
  "/hr":         ["hr", "ceo", "founder"],
  "/bizdoc/ops": ["compliance_staff", "bizdev", "ceo", "founder"],
  "/hub/admin":  ["skills_staff", "ceo", "founder"],
};

function RoleGuard({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) {
  const me = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });

  if (me.isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F5F5F4]">
        <div className="w-6 h-6 rounded-full border-2 border-[#1E3A8A] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!me.data) {
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

/** Tiny inline redirect helper — used for deprecated paths. */
function Redirect({ to }: { to: string }) {
  useEffect(() => { window.location.href = to; }, [to]);
  return null;
}

function Router() {
  return (
    <Switch>
      {/* ═══ Public marketing ═══ */}
      <Route path="/"          component={Home} />
      <Route path="/bizdoc"    component={BizdocPage} />
      <Route path="/scalar"    component={ScalarPage} />
      <Route path="/medialy"   component={MedialyPage} />
      <Route path="/hub"       component={HubPage} />
      <Route path="/about"     component={AboutPage} />
      <Route path="/contact"   component={ContactPage} />

      {/* ═══ Division assessment forms (share via WhatsApp) ═══ */}
      <Route path="/bizdoc/assessment"  component={BizdocAssessment} />
      <Route path="/scalar/assessment"  component={ScalarAssessment} />
      <Route path="/medialy/assessment" component={MedialyAssessment} />
      <Route path="/hub/enroll"         component={HubEnroll} />

      {/* ═══ Legacy public redirects (old division names) ═══ */}
      <Route path="/systemise">{() => <Redirect to="/scalar" />}</Route>
      <Route path="/systemise/:rest*">{() => <Redirect to="/scalar" />}</Route>
      <Route path="/skills">{() => <Redirect to="/hub" />}</Route>
      <Route path="/skills/:rest*">{() => <Redirect to="/hub" />}</Route>
      <Route path="/media">{() => <Redirect to="/medialy" />}</Route>
      <Route path="/media/:rest*">{() => <Redirect to="/medialy" />}</Route>
      <Route path="/bizdoc/blueprint">{() => <Redirect to="/bizdoc" />}</Route>
      <Route path="/team">{() => <Redirect to="/about" />}</Route>
      <Route path="/consultant">{() => <Redirect to="/about" />}</Route>
      <Route path="/alumni">{() => <Redirect to="/hub" />}</Route>
      <Route path="/ridi">{() => <Redirect to="/hub" />}</Route>
      <Route path="/cto">{() => <Redirect to="/scalar" />}</Route>
      <Route path="/metfix">{() => <Redirect to="/hub" />}</Route>
      <Route path="/templates">{() => <Redirect to="/medialy" />}</Route>
      <Route path="/training/:dept">{() => <Redirect to="/hub" />}</Route>
      <Route path="/training">{() => <Redirect to="/hub" />}</Route>
      <Route path="/affiliate">{() => <Redirect to="/about" />}</Route>

      {/* ═══ Staff dashboards ═══ */}
      <Route path="/cso">
        <RoleGuard allowedRoles={ROLE_ACCESS["/cso"]}><CSOPortal /></RoleGuard>
      </Route>
      <Route path="/ceo">
        <RoleGuard allowedRoles={ROLE_ACCESS["/ceo"]}><CEOPortal /></RoleGuard>
      </Route>
      <Route path="/bizdev">
        <RoleGuard allowedRoles={ROLE_ACCESS["/bizdev"]}><BizDevPortal /></RoleGuard>
      </Route>
      <Route path="/finance">
        <RoleGuard allowedRoles={ROLE_ACCESS["/finance"]}><FinancePortal /></RoleGuard>
      </Route>
      <Route path="/hr">
        <RoleGuard allowedRoles={ROLE_ACCESS["/hr"]}><HRPortal /></RoleGuard>
      </Route>
      <Route path="/bizdoc/ops">
        <RoleGuard allowedRoles={ROLE_ACCESS["/bizdoc/ops"]}><BizdocOpsPortal /></RoleGuard>
      </Route>
      <Route path="/hub/admin">
        <RoleGuard allowedRoles={ROLE_ACCESS["/hub/admin"]}><HubAdminPortal /></RoleGuard>
      </Route>

      {/* ═══ Legacy staff redirects ═══ */}
      <Route path="/hub/cso">{() => <Redirect to="/cso" />}</Route>
      <Route path="/hub/ceo">{() => <Redirect to="/ceo" />}</Route>
      <Route path="/hub/bizdev">{() => <Redirect to="/bizdev" />}</Route>
      <Route path="/hub/finance">{() => <Redirect to="/finance" />}</Route>
      <Route path="/hub/hr">{() => <Redirect to="/hr" />}</Route>
      <Route path="/hub/workspace">{() => <Redirect to="/" />}</Route>
      <Route path="/bizdoc/dashboard">{() => <Redirect to="/" />}</Route>
      <Route path="/ridi/dashboard">{() => <Redirect to="/" />}</Route>
      <Route path="/media/dashboard">{() => <Redirect to="/" />}</Route>
      <Route path="/affiliate/dashboard">{() => <Redirect to="/" />}</Route>

      {/* ═══ Client portal ═══ */}
      <Route path="/start/*"          component={ClientOnboarding} />
      <Route path="/client/dashboard" component={ClientDashboard} />
      <Route path="/client">{() => <Redirect to="/" />}</Route>

      {/* ═══ Info / legal ═══ */}
      <Route path="/founder" component={FounderPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms"   component={TermsOfService} />
      <Route path="/login">{() => <Redirect to="/" />}</Route>

      {/* ═══ Fallback ═══ */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location]);
  return null;
}

/** Floating chat for select public + staff pages (no chat on minimal marketing pages). */
function FloatingChat() {
  const [location] = useLocation();
  if (location === "/privacy" || location === "/terms") return null;

  // HUB intentionally excluded — founder preference: no AI chat on /hub,
  // clients reach HUB via WhatsApp/phone from the contact buttons instead.
  const chatRoutes: { prefix: string; dept: "bizdoc" | "systemise" | "skills" | "general"; exact?: boolean }[] = [
    { prefix: "/bizdoc",  dept: "bizdoc" },
    { prefix: "/scalar",  dept: "systemise" },
    { prefix: "/medialy", dept: "general" },
    { prefix: "/cso",     dept: "bizdoc" },
    { prefix: "/contact", dept: "general" },
    { prefix: "/founder", dept: "general" },
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
