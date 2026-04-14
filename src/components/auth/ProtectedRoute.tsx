import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Permission } from "@/types/auth.types";

interface ProtectedRouteProps {
  /** Legacy support: role-based gating */
  allowedRoles?: string[];
  /** Zero-Trust: permission-based gating (preferred) */
  requiredPermissions?: Permission[];
}

/**
 * 🧠 ZERO-TRUST ROUTE GUARD
 * 
 * Reads identity exclusively from the useAuth() hook (React Query cache).
 * ZERO localStorage. The backend's HttpOnly cookie is the sole session proof.
 * 
 * Gating priority:
 * 1. Not authenticated → /auth
 * 2. Missing required permissions → /dashboard
 * 3. Missing allowed role → /dashboard
 * 4. All checks pass → render Outlet
 */
export const ProtectedRoute = ({ allowedRoles, requiredPermissions }: ProtectedRouteProps) => {
  const { isAuthenticated, user, hasPermission } = useAuth();

  // Rule 1: No valid session → redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  // Rule 2: Permission-based gating (Zero-Trust — preferred)
  if (requiredPermissions?.length) {
    const hasAllPermissions = requiredPermissions.every((p) => hasPermission(p));
    if (!hasAllPermissions) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Rule 3: Legacy role-based gating (backward compatibility)
  if (allowedRoles?.length) {
    const userRole = user.role?.toUpperCase();
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Clearance granted
  return <Outlet />;
};
