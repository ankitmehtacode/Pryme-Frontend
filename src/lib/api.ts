// src/lib/api.ts
import { generateSafeUUID } from "@/lib/utils";
import type { MeResponse, DictionaryMap } from "@/types/auth.types";


// ARCHITECTURE FIX: Rely strictly on environment variables. 
// In dev, this uses Vite proxy (/api/v1). In prod, it uses the actual domain.
const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  console.error("CRITICAL: VITE_API_URL is not defined in environment variables.");
}

/**
 * 🧠 SECURE FETCH ENGINE (PRODUCTION GRADE — ZERO-TRUST)
 * 
 * 1. credentials: "include" on every request (HttpOnly cookie transport)
 * 2. Auto-injects Idempotency-Key header on all mutating methods (POST/PUT/PATCH/DELETE)
 * 3. Global 401/403 interceptor dispatches session expiry event (no localStorage)
 * 4. Global 429 interceptor for rate limiting
 */
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  
  // URL Normalizer — prevents slash bleeds like /api/v1applications
  const normalizedUrl = endpoint.startsWith("http") 
      ? endpoint 
      : `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  const isFormData = options.body instanceof FormData;
  const method = (options.method || "GET").toUpperCase();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // NEVER set Content-Type for FormData. The browser MUST generate the WebKit boundary dynamically.
  if (!isFormData && options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // 🧠 ZERO-TRUST IDEMPOTENCY: Auto-inject Idempotency-Key for all mutating methods.
  // The backend's IdempotencyFilter will deduplicate based on this key.
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && !headers["Idempotency-Key"]) {
    headers["Idempotency-Key"] = generateSafeUUID();
  }

  try {
    const response = await fetch(normalizedUrl, { ...options, headers, credentials: "include", mode: "cors" });

    // 🧠 GLOBAL INTERCEPTOR: The "Dead Session" Guillotine
    // ZERO localStorage. We dispatch a custom event that useAuth listens to.
    if (response.status === 401 || response.status === 403) {
      window.dispatchEvent(new Event("pryme_auth_expired"));
      throw new Error("Session expired. Please sign in again.");
    }

    // 🧠 GLOBAL INTERCEPTOR: The Rate Limit Shield (Bucket4j Integration)
    if (response.status === 429) {
      window.dispatchEvent(new Event("pryme_rate_limited"));
      throw new Error("Security Matrix: Rate limit exceeded. Please wait a moment before trying again.");
    }

    if (!response.ok) {
      let errorMessage = `API Request failed (${response.status})`;
      try {
        const errorData = await response.json();
        console.error(`🚨 Spring Boot Backend Error on ${endpoint}:`, errorData);
        // Maps to our GlobalExceptionHandler's exact JSON structure
        errorMessage = errorData.message || errorData.error || errorData.errors?.[Object.keys(errorData.errors)[0]] || errorMessage;
      } catch (e) {
        const rawText = await response.text();
        console.error(`🚨 Critical Java Crash on ${endpoint}:`, rawText);
        errorMessage = "The server experienced a critical internal crash. Check your terminal.";
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) return null; 

    // Binary Content Inspector — PDF/Image from Document Vault
    const contentType = response.headers.get("content-type");
    if (contentType && (contentType.includes("application/pdf") || contentType.includes("image/"))) {
        const blob = await response.blob();
        return window.URL.createObjectURL(blob);
    }

    return await response.json();

  } catch (error: any) {
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network offline: Could not connect to the PRYME secure server.");
    }
    throw error;
  }
};

// Safe null/undefined checking to prevent malformed payloads
const prepareBody = (body: any) => body == null ? undefined : (body instanceof FormData ? body : JSON.stringify(body));

export const PrymeAPI = {

  // ==========================================
  // IDENTITY & ACCESS MANAGEMENT (IAM)
  // ==========================================
  
  /**
   * 🧠 THE HYDRATION ENDPOINT — The "God Object" Fetcher.
   * Called on every cold boot by AppInitializer.
   * Returns the user's identity, role, and permissions array.
   * If the cookie is invalid/expired, the backend returns 401 → interceptor fires.
   */
  getMe: async (): Promise<MeResponse> => {
    return fetchWithAuth("/auth/me", { method: "GET" });
  },

  signup: async (...args: any[]) => {
    let fullName = "Pryme Client";
    let email, password;

    if (args.length >= 2 && typeof args[0] === 'string') {
      if (args.length === 3) {
        fullName = args[0]; email = args[1]; password = args[2];
      } else {
        email = args[0]; password = args[1];
      }
    } else if (args.length === 1 && typeof args[0] === 'object') {
      const obj = args[0];
      fullName = obj.fullName || obj.name || "Pryme Client";
      email = obj.email || obj.username;
      password = obj.password || obj.securityKey || obj.key;
    }

    if (!email || !password) throw new Error("Validation Error: Email and Security Key are required.");

    const payload = { fullName, email, password, role: "USER" };

    const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/auth/register`, {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let msg = "Registration failed";
      try { const err = await res.json(); msg = err.message || err.error || msg; } catch(e){}
      throw new Error(msg);
    }
    return res.json();
  },

  login: async (...args: any[]) => {
    let email, password;

    if (args.length >= 2 && typeof args[0] === 'string') {
      email = args[0]; password = args[1];
    } else if (args.length === 1 && typeof args[0] === 'object') {
      const obj = args[0];
      email = obj.email || obj.username;
      password = obj.password || obj.securityKey || obj.key;
    }

    if (!email || !password) throw new Error("Validation Error: Email and Security Key are required.");

    const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/auth/login`, {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let msg = "Invalid credentials";
      try { const err = await res.json(); msg = err.message || err.error || msg; } catch(e){}
      throw new Error(msg);
    }
    return res.json();
  },

  logout: async () => fetchWithAuth("/auth/logout", { method: "POST" }),

  // ==========================================
  // CONFIG & DICTIONARY HYDRATION
  // ==========================================

  /**
   * Fetches all backend-managed dictionaries (loan types, banks, etc.)
   * The frontend NEVER hardcodes these lists.
   */
  getDictionaries: async (): Promise<DictionaryMap> => {
    return fetchWithAuth("/config/dictionaries", { method: "GET" });
  },

  /**
   * Fetches field definitions for a given entity type.
   * Used by the DynamicFormFactory / PolicyFieldEditor to render type-safe inputs.
   */
  getFieldDefinitions: async (entityType: string) => {
    return fetchWithAuth(`/config/field-definitions?entityType=${entityType}`, { method: "GET" });
  },

  // ==========================================
  // CRM & ELEVATION MATRIX
  // ==========================================

  submitLead: async (formData: any) => {
    const payload = {
      userName: formData.fullName || formData.userName,
      phone: formData.phone,
      loanAmount: formData.loanAmount,
      loanType: formData.productType || formData.loanType,
      cibilScore: formData.cibilScore,
      monthlyIncome: formData.monthlyIncome,
      metadata: {
        email: formData.email,
        panCard: formData.panCard,
        occupation: formData.occupation,
        city: formData.city,
        state: formData.state
      }
    };

    // 🧠 CLOSED-LOOP FIX: Backend's PublicLeadController lives at /api/v1/public/leads
    // NOT /api/v1/leads. The SecurityConfig permits /api/v1/public/** without auth.
    // Idempotency-Key is auto-injected by fetchWithAuth for all POST requests.
    return fetchWithAuth(`/public/leads`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // 🧠 CLOSED-LOOP FIX: Backend ElevationController is at /api/v1/applications/elevate
  elevateLead: async (leadId: string, userId: string) => fetchWithAuth(`/applications/elevate`, { method: "POST", body: JSON.stringify({ leadId, userId }) }),
  getApplications: async () => fetchWithAuth("/admin/applications", { method: "GET" }),
  updateStatus: async (applicationId: string, status: string) => fetchWithAuth(`/admin/applications/${applicationId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  assignLead: async (applicationId: string, assigneeId: string) => fetchWithAuth(`/admin/applications/${applicationId}/assign`, { method: "PATCH", body: JSON.stringify({ assigneeId }) }),
  verifyIdentityNumber: async (applicationId: string, idType: "PAN" | "AADHAR", idNumber: string) => fetchWithAuth("/documents/verify-id", { method: "POST", body: JSON.stringify({ applicationId, idType, idNumber }) }),
  
  // DOCUMENT VAULT: Upload
  // 🧠 CLOSED-LOOP FIX: Backend DocumentVaultController uses /documents/initiate-upload
  uploadApplicationDocument: async (applicationId: string, docType: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append("applicationId", applicationId);
      formData.append("docType", docType);
      formData.append("file", file);
      
      const data = await fetchWithAuth(`/documents/initiate-upload`, {
        method: "POST",
        body: formData 
      });
      return { data, error: null };
    } catch (error: any) {
      console.error("Document vault encryption failed:", error);
      return { data: null, error: { message: error.message || "Network stream disrupted." } };
    }
  },

  // 🧠 CLOSED-LOOP FIX: Backend uses /download, not /view
  viewDocument: async (documentId: string) => fetchWithAuth(`/documents/${documentId}/download`, { method: "GET" }),

  getMyApplications: async () => fetchWithAuth("/applications/me", { method: "GET" }),
  
  // POLICY ENGINE LAYER
  getPolicyValue: async (entityId: string, fieldKey: string) => {
    return fetchWithAuth(`/policies/value?entityId=${entityId}&fieldKey=${fieldKey}`, {
      method: "GET",
    });
  },
  
  patchPolicy: async (payload: any) => {
    return fetchWithAuth("/policies", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }
};

// Standard REST Export Map
const api = {
  get: async (url: string, config?: any) => ({ data: await fetchWithAuth(url, { method: "GET", signal: config?.signal }) }),
  post: async (url: string, body?: any) => ({ data: await fetchWithAuth(url, { method: "POST", body: prepareBody(body) }) }),
  patch: async (url: string, body?: any) => ({ data: await fetchWithAuth(url, { method: "PATCH", body: prepareBody(body) }) }),
  delete: async (url: string) => ({ data: await fetchWithAuth(url, { method: "DELETE" }) })
};

export default api;