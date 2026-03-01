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

  // 2. CRM Module (Admin)
  getApplications: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/applications`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  // 3. Lead Generation (Public)
  submitApplication: async (loanType: string, requestedAmount: number, cibilScore: number) => {
    const res = await fetch(`${API_BASE_URL}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loanType, requestedAmount, cibilScore }),
    });
    return res.json();
  }
};