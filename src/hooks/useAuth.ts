import { useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PrymeAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { MeResponse, Permission } from "@/types/auth.types";

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 ZERO-TRUST AUTH HOOK
// ═══════════════════════════════════════════════════════════════════════════════
// The ONLY source of identity truth in the frontend.
// - NO localStorage.
// - Session state lives exclusively in the React Query cache,
//   backed by the backend's HttpOnly secure cookie.
// ═══════════════════════════════════════════════════════════════════════════════

const AUTH_QUERY_KEY = ["auth", "me"] as const;

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ─── THE HYDRATION QUERY ──────────────────────────────────────────────────
  // On mount, this calls GET /auth/me.
  // If the HttpOnly cookie is valid → backend returns MeResponse → user is authenticated.
  // If the cookie is expired/absent → backend returns 401 → interceptor fires → error state.
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery<MeResponse>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: PrymeAPI.getMe,
    staleTime: 1000 * 60 * 5, // 5 minutes — don't re-call /me on every route change
    gcTime: 1000 * 60 * 15,   // 15 minutes — keep in GC for tab switches
    retry: false,              // Do NOT retry 401s. If it fails, the session is dead.
    refetchOnWindowFocus: false,
  });

  const isAuthenticated = !!user && !isError;

  // ─── PERMISSION GATE ──────────────────────────────────────────────────────
  // O(1) lookup from the permissions array returned by the backend.
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user?.permissions) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  // ─── SIGN IN ──────────────────────────────────────────────────────────────
  // Calls the login endpoint, then invalidates the auth query to re-hydrate.
  // The backend sets the HttpOnly cookie on successful login.
  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: Error | null }> => {
      try {
        await PrymeAPI.login({ email, password });
        // Re-hydrate the identity from the freshly-set cookie
        await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
        return { error: null };
      } catch (err) {
        return { error: err as Error };
      }
    },
    [queryClient]
  );

  // ─── SIGN UP + AUTO-LOGIN ─────────────────────────────────────────────────
  const signUp = useCallback(
    async (userData: any): Promise<{ error: Error | null }> => {
      try {
        await PrymeAPI.signup(userData);
        const email = userData.email || userData.username;
        const password = userData.password || userData.securityKey || userData.key;
        return await signIn(email, password);
      } catch (err) {
        return { error: err as Error };
      }
    },
    [signIn]
  );

  // ─── SIGN OUT ─────────────────────────────────────────────────────────────
  // Calls the backend to invalidate the server-side session,
  // then nukes the React Query cache. Zero localStorage involved.
  const signOut = useCallback(async () => {
    try {
      await PrymeAPI.logout();
    } catch (error) {
      console.warn("Backend session already ghosted or network unreachable. Executing local wipe.");
    } finally {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
      navigate("/auth", { replace: true });
    }
  }, [queryClient, navigate]);

  // ─── GLOBAL SESSION EXPIRY LISTENER ───────────────────────────────────────
  // The api.ts interceptor fires 'pryme_auth_expired' on 401/403.
  // We listen here to synchronize the React state and redirect.
  useEffect(() => {
    const handleExpiry = () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
      toast({
        title: "Session Expired",
        description: "Your secure session has ended. Please sign in again.",
        variant: "destructive",
      });
      navigate("/auth", { replace: true });
    };

    window.addEventListener("pryme_auth_expired", handleExpiry);
    return () => window.removeEventListener("pryme_auth_expired", handleExpiry);
  }, [queryClient, navigate]);

  // ─── SSE KILL SWITCH LISTENER ─────────────────────────────────────────────
  // 🧠 DIRECTIVE 3: Connects to the backend's SSE stream when authenticated.
  // If an admin revokes this user's session, the backend pushes SESSION_TERMINATED
  // down this pipe, and we immediately wipe the UI — defeating zombie state.
  //
  // EventSource auto-reconnects on disconnect (built-in browser behavior),
  // which re-validates the HttpOnly cookie on each reconnection attempt.
  useEffect(() => {
    if (!isAuthenticated) return;

    // 🧠 CLOSED-LOOP FIX: VITE_API_URL is '/api/v1', so we append '/stream/system-events'
    // relative to that base. Without this fix, the URL was '/api/v1/api/v1/stream/...' → 404
    const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
    const eventSource = new EventSource(
      `${apiBase}/stream/system-events`,
      { withCredentials: true }
    );

    eventSource.addEventListener("SESSION_TERMINATED", () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY });
      toast({
        title: "Session Terminated",
        description: "Your session was terminated by an administrator. Please sign in again.",
        variant: "destructive",
      });
      navigate("/auth", { replace: true });
      eventSource.close();
    });

    eventSource.onerror = () => {
      // EventSource will auto-reconnect. If the session is truly dead,
      // the reconnection will fail with 401, and the api.ts interceptor
      // will fire pryme_auth_expired — which is already handled above.
    };

    return () => eventSource.close();
  }, [isAuthenticated, queryClient, navigate]);

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated,
    isAdmin: user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
    hasPermission,
    signIn,
    signUp,
    signOut,
  };
};
