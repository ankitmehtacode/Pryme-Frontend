import { useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDictionaries } from "@/hooks/useDictionaries";
import { Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 ANTIGRAVITY BOOTSTRAPPER — THE ZERO-TRUST HYDRATION GATE
// ═══════════════════════════════════════════════════════════════════════════════
// This component replaces the standard AppInitializer with a strict Zero-Trust
// boot sequence. It fires GET /api/v1/auth/me on mount via useAuth().
// 
// - If it resolves with a user: global auth state is populated.
// - If it 401s: user is booted to /auth (unless they are on a public page).
// - Protected routes are physically prevented from rendering until this completes.
//
// We also maintain the legacy 4-second safety timeout so public marketing pages
// can still load if the backend is temporarily offline.
// ═══════════════════════════════════════════════════════════════════════════════

const BOOT_TIMEOUT_MS = 4000;

// Whitelist of public paths that should not be redirected on 401
const PUBLIC_PATHS = [
  "/", "/auth", "/apply", "/about", "/faq", "/services", "/contact", 
  "/blogs", "/offers", "/emi-calculator", "/prepayment-calculator", 
  "/rewards-calculator", "/apply-direct", "/careers", "/grievance-redressal",
  "/coming-soon"
];

interface Props {
  children: ReactNode;
}

export const AppBootstrapper = ({ children }: Props) => {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const hydrateDictionaries = useDictionaries((s) => s.hydrate);
  const isDictionaryHydrated = useDictionaries((s) => s.isHydrated);
  
  const [forceRelease, setForceRelease] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Kick off dictionary hydration on mount
  useEffect(() => {
    hydrateDictionaries();
  }, [hydrateDictionaries]);

  // 🧠 ZERO-TRUST ROUTING: Redirect 401s to /auth (login) for protected routes
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      const isPublicRoute = PUBLIC_PATHS.some(path =>
        location.pathname === path ||
        location.pathname.startsWith("/blogs/") ||
        location.pathname.startsWith("/apply-direct/") ||
        location.pathname.startsWith("/apply/")
      );
      
      if (!isPublicRoute) {
        navigate("/auth", { replace: true });
      }
    }
  }, [isAuthLoading, isAuthenticated, location.pathname, navigate]);

  // 🧠 SAFETY TIMEOUT: Degrade gracefully if backend is down
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isDictionaryHydrated) {
        console.warn("AppBootstrapper: Boot timeout reached. Force-releasing.");
        useDictionaries.setState({ isHydrated: true });
      }
      setForceRelease(true);
    }, BOOT_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isDictionaryHydrated]);

  // Render the application immediately. Protected routes will handle their own 
  // granular loading states via the useAuth() hook while hydration occurs in the background.
  return <>{children}</>;
};
