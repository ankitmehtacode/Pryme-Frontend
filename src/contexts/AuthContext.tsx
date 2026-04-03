import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { PrymeAPI } from "@/lib/api";
import { generateSafeUUID } from "@/lib/utils";


// Strictly mapping to the com.pryme.Backend.iam.Role enum
export type AppRole = "USER" | "EMPLOYEE" | "ADMIN" | "SUPER_ADMIN";

// Eradicating Supabase dependencies; Defining our deterministic User payload
export interface AuthUser {
  name: string;
  role: AppRole;
  expiresAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (userData: any) => Promise<{ error: Error | null }>; // 🧠 RESTORED: Now handles the Auto-Login Chain
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("Critical Fault: useAuth must be executed within an AuthProvider spatial boundary.");
  }
  return context;
};

/**
 * Generates and persists a localized cryptographic footprint.
 * Feeds the backend's ConcurrentHashMap for active session tracking per device.
 */
const getSecureDeviceId = (): string => {
  let deviceId = localStorage.getItem("pryme_device_fingerprint");
  if (!deviceId) {
    deviceId = generateSafeUUID();
    localStorage.setItem("pryme_device_fingerprint", deviceId);
  }
  return deviceId;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 🧠 MEMORY LEAK FIX: Wrapped in useCallback to prevent infinite useEffect loops
  const nukeSession = useCallback(() => {
    localStorage.removeItem("pryme_session_token");
    localStorage.removeItem("pryme_user_data");
    setUser(null);
  }, []);

  // Core verification engine: Validates token presence and mathematical expiry
  const verifyState = useCallback(() => {
    const token = localStorage.getItem("pryme_session_token");
    const rawData = localStorage.getItem("pryme_user_data");

    if (token && rawData) {
      try {
        const parsedUser: AuthUser = JSON.parse(rawData);
        const expiryTime = new Date(parsedUser.expiresAt).getTime();
        
        // Mathematical eviction if TTL is breached before backend request
        if (expiryTime > Date.now()) {
          setUser(parsedUser);
        } else {
          nukeSession();
        }
      } catch (e) {
        nukeSession(); // Corrupt payload protocol
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [nukeSession]);

  useEffect(() => {
    // Initial boot sequence validation
    verifyState();

    // Event Listener for the Interceptor Fallback (from api.ts)
    // Automatically catches 401/403 responses and syncs UI state instantly
    const handleForceEviction = () => {
      nukeSession();
      setIsLoading(false);
    };

    window.addEventListener("pryme_auth_expired", handleForceEviction);
    return () => window.removeEventListener("pryme_auth_expired", handleForceEviction);
  }, [verifyState, nukeSession]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const deviceId = getSecureDeviceId();
      
      // 🧠 POLYMORPHIC COMPATIBILITY: Passing as a strict object to match the API parser
      const response = await PrymeAPI.login({ email, password, deviceId });
      
      // Base64Url Token issued via SecureRandom
      localStorage.setItem("pryme_session_token", response.token);
      
      const userData: AuthUser = {
        name: response.name || "Pryme Client",
        // 🧠 UPPERCASE NORMALIZATION: Prevents case-sensitive RBAC routing failures
        role: (response.role?.toUpperCase() || "USER") as AppRole,
        expiresAt: response.expiresAt,
      };
      
      localStorage.setItem("pryme_user_data", JSON.stringify(userData));
      setUser(userData);
      
      return { error: null };
    } catch (err) {
      nukeSession();
      return { error: err as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // 🧠 THE AUTO-LOGIN CHAIN
  // Registers the user and immediately logs them in to fetch the JWT token
  const signUp = async (userData: any) => {
    try {
      setIsLoading(true);
      
      // 1. Provision the user in the database
      await PrymeAPI.signup(userData);
      
      // 2. Extract credentials regardless of UI variable names
      const email = userData.email || userData.username;
      const password = userData.password || userData.securityKey || userData.key;
      
      // 3. Immediately exchange credentials for a JWT Session Token
      return await signIn(email, password);
      
    } catch (err) {
      return { error: err as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      // Graceful server-side invalidation
      await PrymeAPI.logout();
    } catch (error) {
      console.warn("Backend session already ghosted or network unreachable. Executing local wipe.");
    } finally {
      nukeSession();
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    // Granting admin UI privileges strictly to Top-Tier roles
    isAdmin: user?.role === "ADMIN" || user?.role === "SUPER_ADMIN",
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};