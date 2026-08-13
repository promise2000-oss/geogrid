import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { MarketingLayout } from "@/layouts/MarketingLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { ConsoleLayout } from "@/layouts/ConsoleLayout";
import { ADMIN_SLUG } from "@/lib/config";

function PageFallback() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

const lazyPage = (loader: () => Promise<{ default: React.ComponentType }>) => {
  const Component = lazy(loader);
  return (
    <Suspense fallback={<PageFallback />}>
      <Component />
    </Suspense>
  );
};

export default function App() {
  const consoleBase = `/${ADMIN_SLUG}`;

  return (
    <Routes>
      {/* Marketing */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={lazyPage(() => import("@/pages/marketing/Home"))} />
        <Route path="/about" element={lazyPage(() => import("@/pages/marketing/About"))} />
        <Route path="/pricing" element={lazyPage(() => import("@/pages/marketing/Pricing"))} />
        <Route path="/contact" element={lazyPage(() => import("@/pages/marketing/Contact"))} />
        <Route path="/privacy" element={lazyPage(() => import("@/pages/marketing/Privacy"))} />
        <Route path="/terms" element={lazyPage(() => import("@/pages/marketing/Terms"))} />
        <Route path="/cookies" element={lazyPage(() => import("@/pages/marketing/Cookies"))} />
        <Route path="/acceptable-use" element={lazyPage(() => import("@/pages/marketing/AcceptableUse"))} />
      </Route>

      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={lazyPage(() => import("@/pages/auth/Login"))} />
        <Route path="/register" element={lazyPage(() => import("@/pages/auth/Register"))} />
        <Route path="/verify-email" element={lazyPage(() => import("@/pages/auth/VerifyEmail"))} />
        <Route path="/forgot-password" element={lazyPage(() => import("@/pages/auth/ForgotPassword"))} />
        <Route path="/reset-password" element={lazyPage(() => import("@/pages/auth/ResetPassword"))} />
      </Route>

      {/* Student / tutor app */}
      <Route path="/app" element={<AppLayout />}>
        <Route path="dashboard" element={lazyPage(() => import("@/pages/app/Dashboard"))} />
        <Route path="assignments" element={lazyPage(() => import("@/pages/app/Assignments"))} />
        <Route path="assignments/:id" element={lazyPage(() => import("@/pages/app/AssignmentDetail"))} />
        <Route path="grades" element={lazyPage(() => import("@/pages/app/Grades"))} />
        <Route path="payments" element={lazyPage(() => import("@/pages/app/Payments"))} />
        <Route path="notifications" element={lazyPage(() => import("@/pages/app/Notifications"))} />
        <Route path="calendar" element={lazyPage(() => import("@/pages/app/Calendar"))} />
        <Route path="settings/profile" element={lazyPage(() => import("@/pages/app/settings/Profile"))} />
        <Route path="settings/account" element={lazyPage(() => import("@/pages/app/settings/Account"))} />
        <Route path="settings/security" element={lazyPage(() => import("@/pages/app/settings/Security"))} />
      </Route>

      {/* Admin console — isolated shell and slug */}
      <Route path={`${consoleBase}/access`} element={lazyPage(() => import("@/pages/console/ConsoleAccess"))} />
      <Route path={consoleBase} element={<ConsoleLayout />}>
        <Route path="dashboard" element={lazyPage(() => import("@/pages/console/ConsoleDashboard"))} />
        <Route path="students" element={lazyPage(() => import("@/pages/console/ConsoleStudents"))} />
        <Route path="assignments" element={lazyPage(() => import("@/pages/console/ConsoleAssignments"))} />
        <Route path="submissions" element={lazyPage(() => import("@/pages/console/ConsoleSubmissions"))} />
        <Route path="payments" element={lazyPage(() => import("@/pages/console/ConsolePayments"))} />
        <Route path="users" element={lazyPage(() => import("@/pages/console/ConsoleUsers"))} />
        <Route path="content" element={lazyPage(() => import("@/pages/console/ConsoleContent"))} />
        <Route path="reports" element={lazyPage(() => import("@/pages/console/ConsoleReports"))} />
        <Route path="audit-log" element={lazyPage(() => import("@/pages/console/ConsoleAuditLog"))} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={lazyPage(() => import("@/pages/marketing/NotFound"))} />
    </Routes>
  );
}