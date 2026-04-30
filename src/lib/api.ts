// src/lib/api.ts
import { generateSafeUUID } from "@/lib/utils";
import type { MeResponse, DictionaryMap } from "@/types/auth.types";


// ARCHITECTURE: VITE_API_URL = "/api/v1" in dev (Vite proxy handles routing).
// In production, set to the actual API domain (e.g., https://crm.pryme.in/api/v1).
// Fallback to /api/v1 guarantees the app never breaks — it just uses the proxy.
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

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
    // 🧠 TIMEOUT GUARD: Prevents indefinite hangs when the backend is unreachable.
    // Without this, a connection timeout on api.gopryme.tech:443 causes fetch to hang
    // forever → React Query's isLoading never transitions → infinite spinners.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s max

    const response = await fetch(normalizedUrl, {
      ...options,
      headers,
      credentials: "include",
      mode: "cors",
      signal: options.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    // 🧠 GLOBAL INTERCEPTOR: The "Dead Session" Guillotine
    // ZERO localStorage. We dispatch a custom event that useAuth listens to.
    // CRITICAL: Do NOT fire on boot-sequence endpoints. A 401 on /auth/me or
    // /config/dictionaries during initial load is EXPECTED (user not logged in).
    // Firing pryme_auth_expired here causes a deadlock: useAuth wipes queries
    // mid-hydration, and the AppInitializer never resolves.
    if (response.status === 401 || response.status === 403) {
      const isBootEndpoint = endpoint.includes("/auth/me") || endpoint.includes("/config/");
      if (!isBootEndpoint) {
        window.dispatchEvent(new Event("pryme_auth_expired"));
      }
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
        // Clone BEFORE reading — body stream can only be consumed once
        const errorData = await response.clone().json();
        console.error(`🚨 Spring Boot Backend Error on ${endpoint}:`, errorData);
        errorMessage = errorData.message || errorData.error || errorData.errors?.[Object.keys(errorData.errors)[0]] || errorMessage;
      } catch (e) {
        try {
          const rawText = await response.text();
          console.error(`🚨 Critical Java Crash on ${endpoint}:`, rawText.substring(0, 500));
        } catch (_) {
          // Body already consumed — nothing to log
        }
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
    if (error.name === "AbortError") {
      throw new Error("Request timed out: The PRYME server did not respond in time. Please try again.");
    }
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

    // 🧠 Uses fetchWithAuth to get idempotency headers + global error handling.
    // Registration is permitAll in SecurityConfig, so the missing cookie is fine.
    return fetchWithAuth("/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password, role: "USER" }),
    });
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

    // 🧠 Uses fetchWithAuth for consistent error handling + idempotency.
    // Login is permitAll in SecurityConfig. The response Set-Cookie header
    // plants the PRYME_SID HttpOnly cookie — the sole session proof.
    return fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async () => fetchWithAuth("/auth/logout", { method: "POST" }),

  /**
   * 🧠 GOOGLE OAUTH — Server-Side Token Verification
   * Sends the Google Identity Services credential (ID token) to the backend.
   * The backend verifies with Google, JIT-provisions the user, and returns
   * a session cookie + LoginResponse identical to password login.
   */
  googleSignIn: async (idToken: string) => {
    return fetchWithAuth("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
  },

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
  
  evaluateEligibility: async (payload: any) => {
    return fetchWithAuth("/public/eligibility/evaluate", { method: "POST", body: JSON.stringify(payload) });
  },

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
  elevateLead: async (leadId: string, userId: string, selectedBank?: string) => fetchWithAuth(`/applications/elevate`, { method: "POST", body: JSON.stringify({ leadId, userId, selectedBank }) }),
  getApplications: async () => fetchWithAuth("/admin/applications", { method: "GET" }),
  updateStatus: async (applicationId: string, status: string) => fetchWithAuth(`/admin/applications/${applicationId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  assignLead: async (applicationId: string, assigneeId: string) => fetchWithAuth(`/admin/applications/${applicationId}/assign`, { method: "PATCH", body: JSON.stringify({ assigneeId }) }),
  
  // 🧠 USER PROFILE MANAGEMENT
  getProfile: async () => fetchWithAuth("/users/profile", { method: "GET" }),
  updateProfile: async (data: any) => fetchWithAuth("/users/profile", { method: "PUT", body: JSON.stringify(data) }),
  initiateAvatarUpload: async (contentType: string) => fetchWithAuth("/users/profile/avatar/initiate-upload", { method: "POST", body: JSON.stringify({ contentType }) }),

  verifyIdentityNumber: async (applicationId: string, idType: "PAN" | "AADHAR", idNumber: string) => fetchWithAuth("/documents/verify-id", { method: "POST", body: JSON.stringify({ applicationId, idType, idNumber }) }),
  
  // DOCUMENT VAULT: Upload
  // 🧠 EDGE-ENFORCED S3 POST POLICY: Creates a DB record, gets a signed POST policy,
  // then streams directly to S3 with cryptographic content-length-range enforcement.
  // If the file exceeds 5MB, AWS S3 rejects it AT THE EDGE — our backend never sees it.
  uploadApplicationDocument: async (applicationId: string, docType: string, file: File) => {
    try {
      // 1. Initialize Document metadata matrix
      const payload = {
        applicationId,
        docType,
        contentType: file.type,
        filename: file.name,
        fileSize: file.size
      };
      
      // 🧠 POST Policy endpoint — returns { endpoint, fields, documentId, expiresAt }
      const policyResponse = await fetchWithAuth(`/documents/initiate-secure-upload`, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      // 2. Build FormData with all signed policy fields — file MUST be LAST (AWS S3 POST requirement)
      const formData = new FormData();
      for (const [key, value] of Object.entries(policyResponse.fields as Record<string, string>)) {
        formData.append(key, value);
      }
      formData.append("file", file); // 🧠 CRITICAL: file is always the LAST field

      // 3. POST directly to S3 — content-length-range enforced at the AWS edge
      const s3Response = await fetch(policyResponse.endpoint, {
        method: "POST",
        body: formData
        // 🧠 NO Content-Type header — the browser auto-generates the multipart boundary
      });

      if (!s3Response.ok) {
         const errorText = await s3Response.text().catch(() => "Unknown S3 error");
         console.error("S3 POST policy upload rejected:", s3Response.status, errorText);
         throw new Error("Upload rejected by secure vault. File may exceed 5MB limit.");
      }

      return { data: { documentId: policyResponse.documentId }, error: null };
    } catch (error: any) {
      console.error("Document vault encryption failed:", error);
      return { data: null, error: { message: error.message || "Network stream disrupted." } };
    }
  },

  // 🧠 CLOSED-LOOP FIX: Backend uses /download, not /view
  viewDocument: async (documentId: string) => fetchWithAuth(`/documents/${documentId}/download`, { method: "GET" }),

  // 🧠 DOCUMENT VAULT: List all docs for an application
  getApplicationDocuments: async (applicationId: string) => fetchWithAuth(`/applications/${applicationId}/documents`, { method: "GET" }),
  deleteApplicationDocument: async (applicationId: string, docType: string) => fetchWithAuth(`/documents/${applicationId}/${docType}`, { method: "DELETE" }),

  getMyApplications: async () => fetchWithAuth("/applications/me", { method: "GET" }),
  
  // POLICY ENGINE LAYER
  // NOTE: These GET endpoints return graceful fallbacks since the backend
  // PolicyAdminController currently only exposes PATCH /{entityId}/patch.
  getPolicyEntities: async () => {
    try { return await fetchWithAuth(`/admin/policies/entities`, { method: "GET" }); }
    catch { return []; }
  },
  
  getPolicyValue: async (entityId: string, fieldKey: string) => {
    try { return await fetchWithAuth(`/admin/policies/value?entityId=${entityId}&fieldKey=${fieldKey}`, { method: "GET" }); }
    catch { return { data: { value: null } }; }
  },
  
  patchPolicy: async (payload: any) => {
    return fetchWithAuth(`/admin/policies/${payload.entityId}/patch`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // ==========================================
  // PUBLIC DATA ENDPOINTS (No auth required — /public/** is permitAll)
  // ==========================================

  /** Active partner banks for the marquee — GET /api/v1/public/banks/partners */
  getPartnerBanks: async () => fetchWithAuth("/public/banks/partners", { method: "GET" }),

  /** Product card grid for Index page — GET /api/v1/public/products */
  getPublicProducts: async () => fetchWithAuth("/public/products", { method: "GET" }),

  /** Hero offer data — GET /api/v1/public/offers/hero */
  getHeroOffers: async () => fetchWithAuth("/public/offers/hero", { method: "GET" }),

  /** Bank recommendation engine — GET /api/v1/public/banks/recommendation */
  getBankRecommendation: async (params: { cibilScore: number; loanAmount: number; loanType: string; monthlyIncome?: number }) => {
    const qs = new URLSearchParams({
      cibilScore: String(params.cibilScore),
      loanAmount: String(params.loanAmount),
      loanType: params.loanType,
      ...(params.monthlyIncome ? { monthlyIncome: String(params.monthlyIncome) } : {}),
    }).toString();
    return fetchWithAuth(`/public/banks/recommendation?${qs}`, { method: "GET" });
  },

  /** Public testimonials/reviews — GET /api/v1/public/reviews */
  getPublicReviews: async () => fetchWithAuth("/public/reviews", { method: "GET" }),

  // ==========================================
  // ADMIN CRM ENDPOINTS
  // ==========================================

  /** Admin: List all raw leads — GET /api/v1/admin/leads */
  getAdminLeads: async () => fetchWithAuth("/admin/leads", { method: "GET" }),

  /** Admin: Bank CRUD — /api/v1/admin/banks */
  getAdminBanks: async () => fetchWithAuth("/admin/banks", { method: "GET" }),
  createAdminBank: async (data: { bankName: string; logoUrl: string; isActive: boolean }) =>
    fetchWithAuth("/admin/banks", { method: "POST", body: JSON.stringify(data) }),
  updateAdminBank: async (id: string, data: { bankName: string; logoUrl: string; isActive: boolean }) =>
    fetchWithAuth(`/admin/banks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  toggleBankVisibility: async (id: string, active: boolean) =>
    fetchWithAuth(`/admin/banks/${id}/visibility`, { method: "PATCH", body: JSON.stringify({ active }) }),
  deleteAdminBank: async (id: string) => fetchWithAuth(`/admin/banks/${id}`, { method: "DELETE" }),

  /** Admin: Product (Offer) CRUD — /api/v1/admin/products */
  getAdminProducts: async () => fetchWithAuth("/admin/products", { method: "GET" }),
  createAdminProduct: async (data: any) =>
    fetchWithAuth("/admin/products", { method: "POST", body: JSON.stringify(data) }),
  updateAdminProduct: async (id: string, data: any) =>
    fetchWithAuth(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAdminProduct: async (id: string) => fetchWithAuth(`/admin/products/${id}`, { method: "DELETE" }),

  /** Admin: Testimonial CRUD — /api/v1/admin/reviews */
  getAdminReviews: async () => fetchWithAuth("/admin/reviews", { method: "GET" }),
  
  /** Admin: User Directory — GET /api/v1/admin/users */
  getAdminUsers: async () => fetchWithAuth("/admin/users", { method: "GET" }),

  /** Admin: Update user role — PATCH /api/v1/admin/users/{userId}/role (SUPER_ADMIN only) */
  updateUserRole: async (userId: string, role: string) =>
    fetchWithAuth(`/admin/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
  createAdminReview: async (data: any) =>
    fetchWithAuth("/admin/reviews", { method: "POST", body: JSON.stringify(data) }),
  updateAdminReview: async (id: string, data: any) =>
    fetchWithAuth(`/admin/reviews/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAdminReview: async (id: string) => fetchWithAuth(`/admin/reviews/${id}`, { method: "DELETE" }),

  /** Admin: List active sessions for a user — GET /api/v1/auth/sessions/{userId} */
  getActiveSessions: async (userId: string) => fetchWithAuth(`/auth/sessions/${userId}`, { method: "GET" }),

  /** Admin: Eligibility Engine Rules CRUD — /api/v1/admin/eligibility-rules */
  getEligibilityRules: async () => fetchWithAuth("/admin/eligibility-rules", { method: "GET" }),
  createEligibilityRule: async (data: any) =>
    fetchWithAuth("/admin/eligibility-rules", { method: "POST", body: JSON.stringify(data) }),
  updateEligibilityRule: async (id: string | number, data: any) =>
    fetchWithAuth(`/admin/eligibility-rules/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteEligibilityRule: async (id: string | number) =>
    fetchWithAuth(`/admin/eligibility-rules/${id}`, { method: "DELETE" }),
};

// Standard REST Export Map
const api = {
  get: async (url: string, config?: any) => ({ data: await fetchWithAuth(url, { method: "GET", signal: config?.signal }) }),
  post: async (url: string, body?: any) => ({ data: await fetchWithAuth(url, { method: "POST", body: prepareBody(body) }) }),
  patch: async (url: string, body?: any) => ({ data: await fetchWithAuth(url, { method: "PATCH", body: prepareBody(body) }) }),
  delete: async (url: string) => ({ data: await fetchWithAuth(url, { method: "DELETE" }) })
};

export default api;