// src/lib/api.ts
const API_BASE_URL = "/api/v1";

export const PrymeAPI = {
  // 1. Auth Module
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Invalid credentials");
    return res.json();
  },

  // 2. CRM Module (Admin Data Fetch)
  getApplications: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/applications`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch applications");
    return res.json();
  },

  // 🧠 NEW: CRM Status Update Route
  updateStatus: async (applicationId: string, status: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
  },

  // 🧠 NEW: CRM Lead Assignment Route
  assignLead: async (applicationId: string, assigneeId: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigneeId }),
    });
    if (!res.ok) throw new Error("Failed to assign lead");
    return res.json();
  },

  // 3. Lead Generation (Public)
  submitApplication: async (loanType: string, requestedAmount: number, cibilScore: number) => {
    const res = await fetch(`${API_BASE_URL}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loanType, requestedAmount, cibilScore }),
    });
    if (!res.ok) throw new Error("Failed to submit application");
    return res.json();
  }
};