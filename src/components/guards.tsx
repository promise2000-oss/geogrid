import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth/auth-context";
import { useAdminAuth } from "@/lib/auth/admin-auth-context";
import { ADMIN_ACCESS_PATH } from "@/lib/config";

export function RequireSession({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const location = useLocation();
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

export function RequireAdminSession({ children }: { children: React.ReactNode }) {
  const { adminSession } = useAdminAuth();
  if (!adminSession) {
    return <Navigate to={ADMIN_ACCESS_PATH} replace />;
  }
  return <>{children}</>;
}