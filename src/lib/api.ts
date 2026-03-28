// src/lib/api.ts

// 🧠 ARCHITECTURE FIX: Hardcoded localhost fallback for local Spring Boot development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

/**
 * 🧠 SECURE FETCH ENGINE (PRODUCTION GRADE)
 * Strictly handles standard JSON-based REST calls AND Multipart Binary Streams.
 */
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("pryme_session_token") || localStorage.getItem("pryme_token");
  
  // 🧠 160 IQ FIX 1: URL Normalizer (Prevents slash bleeds like /api/v1applications)
  const normalizedUrl = endpoint.startsWith("http") 
      ? endpoint 
      : `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  // NEVER set Content-Type for FormData. The browser MUST generate the WebKit boundary dynamically.
  if (!isFormData && options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(normalizedUrl, { ...options, headers });

    // 🧠 GLOBAL INTERCEPTOR: The "Dead Session" Guillotine
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("pryme_session_token");
      localStorage.removeItem("pryme_token");
      localStorage.removeItem("pryme_user_data");
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

    // 🧠 160 IQ FIX 2: The Binary Content Inspector
    // If the Java backend serves a PDF or Image from the Document Vault, 
    // do NOT parse it as JSON. Convert it to a secure local Object URL!
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

// 🧠 160 IQ FIX 3: Safe null/undefined checking to prevent malformed payloads
const prepareBody = (body: any) => body == null ? undefined : (body instanceof FormData ? body : JSON.stringify(body));

export const PrymeAPI = {

  // ==========================================
  // IDENTITY & ACCESS MANAGEMENT (IAM)
  // ==========================================
  
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

    return fetchWithAuth(`/leads`, {
      method: "POST",
      headers: { "Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify(payload),
    });
  },

  elevateLead: async (leadId: string, userId: string) => fetchWithAuth(`/leads/${leadId}/elevate`, { method: "POST", body: JSON.stringify({ userId }) }),
  getApplications: async () => fetchWithAuth("/admin/applications", { method: "GET" }),
  updateStatus: async (applicationId: string, status: string) => fetchWithAuth(`/admin/applications/${applicationId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  assignLead: async (applicationId: string, assigneeId: string) => fetchWithAuth(`/admin/applications/${applicationId}/assign`, { method: "PATCH", body: JSON.stringify({ assigneeId }) }),
  verifyIdentityNumber: async (applicationId: string, idType: "PAN" | "AADHAR", idNumber: string) => fetchWithAuth("/documents/verify-id", { method: "POST", body: JSON.stringify({ applicationId, idType, idNumber }) }),
  
  // DOCUMENT VAULT: Upload
  uploadApplicationDocument: async (applicationId: string, docType: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append("docType", docType);
      formData.append("file", file);
      
      const data = await fetchWithAuth(`/applications/${applicationId}/documents`, {
        method: "POST",
        body: formData 
      });
      return { data, error: null };
    } catch (error: any) {
      console.error("Document vault encryption failed:", error);
      return { data: null, error: { message: error.message || "Network stream disrupted." } };
    }
  },

  // 🧠 160 IQ NEW FEATURE: View Vault Document
  // This allows you to render <img src={url} /> or <a href={url} download> securely using JWTs
  viewDocument: async (documentId: string) => fetchWithAuth(`/documents/${documentId}/view`, { method: "GET" }),

  getMyApplications: async () => fetchWithAuth("/applications/me", { method: "GET" }),
};

// Standard REST Export Map
const api = {
  get: async (url: string, config?: any) => ({ data: await fetchWithAuth(url, { method: "GET", signal: config?.signal }) }),
  post: async (url: string, body?: any) => ({ data: await fetchWithAuth(url, { method: "POST", body: prepareBody(body) }) }),
  patch: async (url: string, body?: any) => ({ data: await fetchWithAuth(url, { method: "PATCH", body: prepareBody(body) }) }),
  delete: async (url: string) => ({ data: await fetchWithAuth(url, { method: "DELETE" }) })
};

export default api;