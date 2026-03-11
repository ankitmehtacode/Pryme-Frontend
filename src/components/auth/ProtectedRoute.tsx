import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

/**
 * Route guard that checks for a valid session token and optional role-based access.
 * Unauthenticated users are redirected to /auth.
 * Users without the required role are sent to /dashboard.
 */
export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const token = localStorage.getItem("pryme_token");
    const role = localStorage.getItem("pryme_role");

    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    if (allowedRoles?.length && (!role || !allowedRoles.includes(role))) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
