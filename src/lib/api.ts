// src/lib/api.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

/**
 * Authenticated fetch wrapper.
 * Injects Bearer token from localStorage, handles session expiry evictions,
 * and natively supports both JSON and Multipart FormData payloads.
 */
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("pryme_session_token");
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  // 🧠 CRITICAL: Let the browser set Content-Type (with strict boundary) for file uploads
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    // Zero-Trust Eviction Protocol
    localStorage.removeItem("pryme_session_token");
    localStorage.removeItem("pryme_user_data");
    window.dispatchEvent(new Event("pryme_auth_expired"));
    throw new Error("Session expired. Please sign in again.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Request failed (${response.status})`);
  }

  if (response.status === 204) return null; // Handle empty responses gracefully
  return response.json();
};

export const PrymeAPI = {

  // ==========================================
  // IDENTITY & ACCESS MANAGEMENT (IAM)
  // ==========================================
  login: async (email: string, password: string, deviceId: string = "web") => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, deviceId }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Invalid credentials");
    }
    return res.json();
  },

  logout: async () => {
    return fetchWithAuth("/auth/logout", { method: "POST" });
  },

  // ==========================================
  // PUBLIC LEAD ACQUISITION
  // ==========================================
  submitLead: async (formData: any) => {
    // 🧠 PAYLOAD TRANSLATOR: Maps rich frontend form to strict backend DTO
    const payload = {
      userName: formData.fullName,
      phone: formData.phone,
      loanAmount: formData.loanAmount,
      loanType: formData.productType,
      metadata: {
        email: formData.email,
        panCard: formData.panCard,
        cibilScore: formData.cibilScore,
        monthlyIncome: formData.monthlyIncome,
        occupation: formData.occupation,
        city: formData.city,
        state: formData.state
      }
    };

    const res = await fetch(`${API_BASE_URL}/public/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 🧠 IDEMPOTENCY LOCK: Prevents duplicate insertions on network retries
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to submit application to the server.");
    }
    return res.json();
  },

  // ==========================================
  // PIPELINE ELEVATION (THE MISSING LINK)
  // ==========================================
  /**
   * 🧠 ELEVATION ENGINE
   * Fuses a public Lead UUID to a secure User UUID, generating a formal LoanApplication
   */
  elevateLead: async (leadId: string, userId: string) => {
    return fetchWithAuth("/applications/elevate", {
      method: "POST",
      body: JSON.stringify({ leadId, userId }),
    });
  },

  // ==========================================
  // SILICON-GRADE ADMIN CRM
  // ==========================================
  getApplications: async () => {
    return fetchWithAuth("/admin/applications", { method: "GET" });
  },

  updateStatus: async (applicationId: string, status: string) => {
    return fetchWithAuth(`/admin/applications/${applicationId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  assignLead: async (applicationId: string, assigneeId: string) => {
    // 🧠 assigneeId is now an official User UUID mapped to the PostgreSQL/H2 Database
    return fetchWithAuth(`/admin/applications/${applicationId}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ assigneeId }),
    });
  },

  // ==========================================
  // SMART VAULT (DOCUMENT ENGINE)
  // ==========================================
  verifyIdentityNumber: async (applicationId: string, idType: "PAN" | "AADHAR", idNumber: string) => {
    return fetchWithAuth("/documents/verify-id", {
      method: "POST",
      body: JSON.stringify({ applicationId, idType, idNumber }),
    });
  },

  uploadDocument: async (applicationId: string, docType: string, file: File) => {
    const formData = new FormData();
    formData.append("applicationId", applicationId);
    formData.append("docType", docType);
    formData.append("file", file);

    return fetchWithAuth("/documents/upload", {
      method: "POST",
      body: formData, // fetchWithAuth will correctly handle the multipart boundary
    });
  },

  // ==========================================
  // CLIENT PORTAL
  // ==========================================
  getMyApplications: async () => {
    return fetchWithAuth("/applications/me", { method: "GET" });
  },
};