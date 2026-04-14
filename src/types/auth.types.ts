// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 PRYME ZERO-TRUST AUTH TYPE CONTRACTS
// ═══════════════════════════════════════════════════════════════════════════════
// Maps 1:1 to Spring Boot backend DTOs. These are the ONLY types the frontend
// uses to determine identity, permissions, and session state.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Strictly maps to com.pryme.Backend.iam.Role enum.
 * DO NOT add client-side-only roles. The backend is the source of truth.
 */
export type AppRole = "USER" | "EMPLOYEE" | "ADMIN" | "SUPER_ADMIN";

/**
 * Granular permission tokens returned by the backend's /auth/me endpoint.
 * The frontend never invents permissions — it only checks for their presence.
 */
export type Permission =
  | "VIEW_CRM"
  | "MANAGE_LEADS"
  | "MANAGE_APPLICATIONS"
  | "MANAGE_POLICIES"
  | "VIEW_ANALYTICS"
  | "MANAGE_USERS"
  | "MANAGE_PARTNERS"
  | "VIEW_AUDIT_LOG"
  | "UPLOAD_DOCUMENTS"
  | "VERIFY_IDENTITY";

/**
 * The "God Object" returned by GET /api/v1/auth/me.
 * This single response hydrates the entire frontend identity layer.
 */
export interface MeResponse {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  permissions: Permission[];
}

/**
 * Backend-provided dictionaries that replace ALL hardcoded arrays.
 * Fetched once on boot from GET /api/v1/config/dictionaries.
 */
export interface DictionaryMap {
  loanTypes: DictionaryItem[];
  bankList: DictionaryItem[];
  employmentCategories: DictionaryItem[];
  documentTypes: DictionaryItem[];
  states: DictionaryItem[];
  propertyTypes: DictionaryItem[];
}

export interface DictionaryItem {
  value: string;   // Machine key: "HOME_LOAN", "HDFC"
  label: string;   // Display label: "Home Loan", "HDFC Bank"
}
