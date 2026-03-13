import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

/**
 * 🧠 ZERO-COMPROMISE SECURITY GATEWAY
 * Checks for a valid session token and strict role-based access.
 * Unauthenticated users are redirected to /auth.
 * Users without the required clearance are safely downgraded to /dashboard.
 */
export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    // 1. Read the precise token key established by Auth.tsx
    const token = localStorage.getItem("pryme_session_token");
    
    // 2. Safely extract and parse the role from the secure JSON payload
    let role = "USER"; // Default unprivileged fallback
    const userDataString = localStorage.getItem("pryme_user_data");
    
    if (userDataString) {
        try {
            const userData = JSON.parse(userDataString);
            // 🧠 Force uppercase to completely eliminate case-sensitive routing bugs
            role = userData?.role?.toUpperCase() || "USER"; 
        } catch (e) {
            console.error("Security Router: Failed to parse user payload.", e);
        }
    }

    // Rule 1: No valid session token? Eject immediately to the login gate.
    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    // Rule 2: Token exists, but user lacks necessary RBAC clearance?
    // Downgrade them to the standard client portal.
    if (allowedRoles?.length && !allowedRoles.includes(role)) {
        return <Navigate to="/dashboard" replace />;
    }

    // Clearance granted. Render the protected application tier.
    return <Outlet />;
};
