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
  const { isAuthenticated, user, hasPermission, isLoading } = useAuth();

  if (isLoading) {
    // Elegant fallback while background auth finishes.
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#050508]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

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
