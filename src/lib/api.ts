// src/lib/api.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

/**
 * Authenticated fetch wrapper.
 * Injects Bearer token from localStorage, handles session expiry,
 * and supports both JSON and FormData payloads.
 */
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("pryme_session_token");
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  // Let the browser set Content-Type (with boundary) for multipart uploads
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("pryme_session_token");
    localStorage.removeItem("pryme_user_data");
    window.dispatchEvent(new Event("pryme_auth_expired"));
    throw new Error("Session expired. Please sign in again.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed (${response.status})`);
  }

  if (response.status === 204) return null;
  return response.json();
};

export const PrymeAPI = {

  // Auth
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

  // Admin CRM
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
    return fetchWithAuth(`/admin/applications/${applicationId}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ assigneeId }),
    });
  },

  // Public lead capture
  submitApplication: async (loanType: string, requestedAmount: number, cibilScore: number) => {
    const res = await fetch(`${API_BASE_URL}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loanType, requestedAmount, cibilScore }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to submit application");
    }
    return res.json();
  },

  // Document verification
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
      body: formData,
    });
  },

  // User portal
  getMyApplications: async () => {
    return fetchWithAuth("/applications/me", { method: "GET" });
  },
};