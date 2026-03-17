// src/lib/api.ts

// 🧠 ARCHITECTURE FIX: Hardcoded localhost fallback for local Spring Boot development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

/**
 * 🧠 SECURE FETCH ENGINE (PRODUCTION GRADE)
 */
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("pryme_session_token") || localStorage.getItem("pryme_token");
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("pryme_session_token");
      localStorage.removeItem("pryme_token");
      localStorage.removeItem("pryme_user_data");
      window.dispatchEvent(new Event("pryme_auth_expired"));
      throw new Error("Session expired. Please sign in again.");
    }

    if (!response.ok) {
      // 🧠 DIAGNOSTIC ENGINE: Rips the exact Java Exception out of the Spring Boot 500 response
      let errorMessage = `API Request failed (${response.status})`;
      try {
        const errorData = await response.json();
        console.error(`🚨 Spring Boot Backend Error on ${endpoint}:`, errorData);
        errorMessage = errorData.message || errorData.error || errorData.errors?.[0]?.defaultMessage || errorMessage;
      } catch (e) {
        const rawText = await response.text();
        console.error(`🚨 Critical Java Crash on ${endpoint}:`, rawText);
        errorMessage = "The server experienced a critical internal crash. Check your terminal.";
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) return null; 
    return await response.json();

  } catch (error: any) {
    if (error.message.includes("Failed to fetch")) {
      throw new Error("Network offline: Could not connect to the PRYME secure server.");
    }
    throw error;
  }
};

export const PrymeAPI = {

  // ==========================================
  // IDENTITY & ACCESS MANAGEMENT (IAM)
  // ==========================================
  
  signup: async (...args: any[]) => {
    let fullName = "Pryme Client";
    let email, password;

    // 🧠 UNIVERSAL POLYMORPHIC PARSER
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

    // 🧠 STRICT DTO: Bare minimum to prevent Unknown Property Exceptions, plus the DB role failsafe.
    const payload = { 
      fullName: fullName,
      email: email, 
      password: password,
      role: "USER" 
    };

    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let msg = "Registration failed";
      try { 
        const err = await res.json(); 
        console.error("🚨 Java Registration Error:", err);
        msg = err.message || err.error || msg; 
      } catch(e){}
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

    // 🧠 STRICT DTO: Stripped back to standard credentials
    const payload = { 
      email: email,
      password: password
    };

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let msg = "Invalid credentials";
      try { 
        const err = await res.json(); 
        console.error("🚨 Java Login Error:", err);
        msg = err.message || err.error || msg; 
      } catch(e){}
      throw new Error(msg);
    }
    return res.json();
  },

  logout: async () => {
    return fetchWithAuth("/auth/logout", { method: "POST" });
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

    const res = await fetch(`${API_BASE_URL}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let msg = "Failed to submit application to the server.";
      try { const err = await res.json(); msg = err.message || msg; } catch(e){}
      throw new Error(msg);
    }
    return res.json();
  },

  elevateLead: async (leadId: string, userId: string) => fetchWithAuth(`/leads/${leadId}/elevate`, { method: "POST", body: JSON.stringify({ userId }) }),
  getApplications: async () => fetchWithAuth("/admin/applications", { method: "GET" }),
  updateStatus: async (applicationId: string, status: string) => fetchWithAuth(`/admin/applications/${applicationId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  assignLead: async (applicationId: string, assigneeId: string) => fetchWithAuth(`/admin/applications/${applicationId}/assign`, { method: "PATCH", body: JSON.stringify({ assigneeId }) }),
  verifyIdentityNumber: async (applicationId: string, idType: "PAN" | "AADHAR", idNumber: string) => fetchWithAuth("/documents/verify-id", { method: "POST", body: JSON.stringify({ applicationId, idType, idNumber }) }),
  
  uploadDocument: async (applicationId: string, docType: string, file: File) => {
    const formData = new FormData();
    formData.append("applicationId", applicationId);
    formData.append("docType", docType);
    formData.append("file", file);
    return fetchWithAuth(`/documents/upload/${applicationId}`, { method: "POST", body: formData });
  },

  getMyApplications: async () => fetchWithAuth("/applications/me", { method: "GET" }),
};

const api = {
  get: async (url: string) => ({ data: await fetchWithAuth(url, { method: "GET" }) }),
  post: async (url: string, body?: any) => ({ data: await fetchWithAuth(url, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }) }),
  patch: async (url: string, body?: any) => ({ data: await fetchWithAuth(url, { method: "PATCH", body: body instanceof FormData ? body : JSON.stringify(body) }) }),
  delete: async (url: string) => ({ data: await fetchWithAuth(url, { method: "DELETE" }) })
};

export default api;