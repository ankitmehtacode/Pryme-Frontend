// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 PRYME PROGRESSIVE PROFILING ENGINE — APPLICATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════
// Domain-grade TypeScript type system modelling Indian banking/NBFC loan
// application funnels. Every union type maps to a real underwriting pathway.
//
// Architecture: Discriminated unions + conditional type narrowing ensures
// that ONLY the relevant financial branch is populated based on user selection.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── LOAN PRODUCT TAXONOMY ───────────────────────────────────────────────────

export type LoanType =
  | 'HOME_LOAN'
  | 'LAP'                  // Loan Against Property
  | 'BUSINESS_LOAN'
  | 'PERSONAL_LOAN'
  | 'AUTO_LOAN';

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  HOME_LOAN: 'Home Loan',
  LAP: 'Loan Against Property',
  BUSINESS_LOAN: 'Business Loan',
  PERSONAL_LOAN: 'Personal Loan',
  AUTO_LOAN: 'Auto Loan',
};

// ─── EMPLOYMENT HIERARCHY (The Critical Pivot Point) ─────────────────────────
// Level 1 → Category  (what are you?)
// Level 2 → Sub-type  (determines doc matrix + fields downstream)

export type EmploymentType = 'SALARIED' | 'PROFESSIONAL' | 'SELF_EMPLOYED';

export type SalariedSubType = 'PRIVATE' | 'GOVERNMENT';

export type ProfessionalSubType = 'CA' | 'CS' | 'DOCTOR' | 'LAWYER';

/** Business underwriting programs — each has a fundamentally different doc matrix */
export type BusinessSubType =
  | 'ITR_BASED'             // Standard: 2-3yr ITR + P&L + Balance Sheet
  | 'GST_BASED'             // GST returns as primary income proof
  | 'BANKING_PROGRAM'       // Average Bank Balance tiers (₹5L/10L/20L/25L) — no ITR
  | 'CASH_FLOW_PROGRAM';    // Bank statement analysis — no financials needed

/** ABB tier thresholds in lakhs (Banking Program qualification tiers) */
export type ABBTierLakhs = 5 | 10 | 20 | 25;

export const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  SALARIED: 'Salaried',
  PROFESSIONAL: 'Professional',
  SELF_EMPLOYED: 'Self Employed / Business',
};

export const SALARIED_LABELS: Record<SalariedSubType, string> = {
  PRIVATE: 'Private Sector',
  GOVERNMENT: 'Government / PSU',
};

export const PROFESSIONAL_LABELS: Record<ProfessionalSubType, string> = {
  CA: 'Chartered Accountant',
  CS: 'Company Secretary',
  DOCTOR: 'Doctor / Medical Practitioner',
  LAWYER: 'Advocate / Lawyer',
};

export const BUSINESS_LABELS: Record<BusinessSubType, string> = {
  ITR_BASED: 'ITR Based (Standard)',
  GST_BASED: 'GST Based',
  BANKING_PROGRAM: 'Banking Program (ABB)',
  CASH_FLOW_PROGRAM: 'Cash Flow Program',
};

// ─── FORM STAGE PROGRESSION ─────────────────────────────────────────────────

export const STAGES = {
  BASIC_KYC: 1,
  EMPLOYMENT_DETAILS: 2,
  LOAN_REQUIREMENTS: 3,
  DOCUMENT_CHECKLIST: 4,
  REVIEW_SUBMIT: 5,
} as const;

export type StageNumber = typeof STAGES[keyof typeof STAGES];

export const STAGE_LABELS: Record<StageNumber, string> = {
  1: 'Identity & KYC',
  2: 'Employment & Income',
  3: 'Loan Requirements',
  4: 'Financial Footprint',
  5: 'Review & Submit',
};

// ─── BASIC KYC (Stage 1 — Always Collected) ─────────────────────────────────

export interface BasicKYC {
  fullName: string;
  mobileNumber: string;
  mobileVerified: boolean;
  email: string;
  dateOfBirth: string;           // YYYY-MM-DD
  panNumber: string;             // ABCDE1234F

  // Location
  state: string;
  city: string;
  pinCode: string;               // 6-digit

  // Religion
  religion: string;

  // Employment pivot — this single field determines the entire downstream flow
  employmentType: EmploymentType | null;
}

// ─── SALARIED EMPLOYEE FINANCIALS ───────────────────────────────────────────

export type CompanyType = 'PROPRIETORSHIP' | 'PARTNERSHIP' | 'LLP' | 'PRIVATE_LIMITED' | 'PUBLIC_LIMITED_LISTED' | 'PUBLIC_LIMITED_UNLISTED' | 'OTHER';

export interface SalariedDetails {
  subType: SalariedSubType;
  companyType?: CompanyType;
  companyName: string;
  designation: string;
  officialEmail: string;
  totalExperienceYears: number;
  currentCompanyYears: number;

  grossSalary: number;           // Pre-tax
  netMonthlySalary: number;      // Take-home
  hasExistingLoans: boolean;
  existingEMI?: number;           // Total monthly EMI burden (Step A)
  maturingLoanEMI?: number;      // EMI of loans finishing in next 12 months (Step B)
}

// ─── PROFESSIONAL FINANCIALS ────────────────────────────────────────────────

export interface ProfessionalDetails {
  subType: ProfessionalSubType;
  registrationNumber: string;    // ICAI / ICSI / MCI / Bar Council
  practiceName: string;
  /** @deprecated use totalPracticeYears — kept for session hydration compat */
  practiceYears: number;
  totalPracticeYears: number;    // Total years in profession (underwriting: seasoning)
  yearsInCurrentFirm: number;   // Years at current practice/firm (stability signal)
  practiceAddress: string;
  annualGrossReceipts: number;   // Gross professional receipts (pre-expense)
  netMonthlyIncome: number;
  hasExistingLoans: boolean;
  existingEMI?: number;           // Total monthly EMI burden (Step A)
  maturingLoanEMI?: number;      // EMI of loans finishing in next 12 months (Step B)
}

// ─── SELF-EMPLOYED / BUSINESS FINANCIALS ────────────────────────────────────

export interface BusinessDetails {
  subType: BusinessSubType;
  businessName: string;
  entityType: 'PROPRIETORSHIP' | 'PARTNERSHIP' | 'LLP' | 'PVT_LTD' | 'OPC';
  industryType: string;
  vintageYears: number;          // Business age
  gstRegistrationDate?: string;  // GST Registration Date YYYY-MM-DD
  businessAddress: string;

  // ── ITR-Based ──
  annualTurnover?: number;
  netProfit?: number;
  itrFiledYears?: number;        // 2-3 required
  /** Depreciation add-back for P&L normalisation — shown for HOME_LOAN / LAP only */
  depreciation?: number;

  // ── GST-Based ──
  gstNumber?: string;            // 15-digit GSTIN
  /** @deprecated use last12MonthsGstTurnover for new captures */
  monthlyGSTTurnover?: number;
  /** Aggregate GST turnover for last 12 months (primary income proxy for GST program) */
  last12MonthsGstTurnover?: number;
  gstFilingMonths?: number;

  // ── Banking Program ──
  abbTier?: ABBTierLakhs;
  primaryBankName?: string;
  accountHeldMonths?: number;

  // ── Cash Flow Program ──
  avgMonthlyCredits?: number;
  bankStatementMonths?: number;

  // ── Compliance ──
  /** Whether accounts are CA-certified or audited — boosts creditworthiness for SELF_EMPLOYED */
  isCaCertifiedOrAudited?: boolean;

  // Common
  netMonthlyIncome: number;
  hasExistingLoans: boolean;
  existingEMI?: number;           // Total monthly EMI burden (Step A)
  maturingLoanEMI?: number;      // EMI of loans finishing in next 12 months (Step B)
}

// ─── DISCRIMINATED FINANCIAL DETAILS UNION ──────────────────────────────────
// This is the key architectural decision: only ONE branch is ever populated,
// determined by basicKYC.employmentType. The UI renders conditionally.

export type FinancialDetails =
  | { path: 'SALARIED'; data: SalariedDetails }
  | { path: 'PROFESSIONAL'; data: ProfessionalDetails }
  | { path: 'SELF_EMPLOYED'; data: BusinessDetails }
  | { path: null; data: Partial<SalariedDetails & ProfessionalDetails & BusinessDetails> };

// ─── LOAN REQUIREMENT DATA ──────────────────────────────────────────────────

export type HomePropertyType = 'FLAT' | 'HOME' | 'PLOT';

export type CommercialPropertyType = 'HOSPITAL' | 'HOSTEL' | 'RESTAURANTS' | 'HOTEL' | 'MARRIAGE_GARDEN' | 'SCHOOL' | 'SHOP' | 'WAREHOUSE' | 'GODOWN';
export type IndustrialPropertyType = 'FACTORIES' | 'WAREHOUSES' | 'DISTRIBUTION_CENTER' | 'R_AND_D_FACILITY' | 'FLEX_SPACES';

export type PropertyType = HomePropertyType | CommercialPropertyType | IndustrialPropertyType;

export interface LoanRequirements {
  loanType: LoanType;
  loanAmount: number;
  tenureYears: number;
  purpose: string;
  cibilScore: number;            // 300-900

  // Home Loan / LAP
  propertyIdentified?: boolean;
  propertyType?: PropertyType;
  propertyCategory?: 'RESIDENTIAL' | 'COMMERCIAL_INDUSTRIAL'; // for LAP
  propertyValue?: number;
  propertyCity?: string;

  // Auto Loan
  vehicleOnRoadPrice?: number;    // On-road price of vehicle (ex-showroom + RTO + insurance)
  vehicleQuotationPrice?: number; // Dealer quotation / proforma invoice price
}

export interface CoApplicantDetails {
  fullName: string;
  mobileNumber: string;
  email: string;
  dateOfBirth: string;
  pinCode: string;
  employmentType: EmploymentType | null;
  companyName: string;
  netMonthlySalary: string | number;
}

// ─── FINANCIAL FOOTPRINT (Stage 4 — Universal + Conditional Overrides) ──────

export interface FinancialFootprint {
  // Universal fields
  panNumber: string;              // ABCDE1234F (moved here from Stage 1 for lower friction)
  totalExistingEMI: number;       // Total monthly EMI obligations across all loans
  primaryBankName: string;        // Primary salary/business bank account
  hasCoApplicant: boolean;        // Whether a co-applicant is being added
  coApplicantDetails?: CoApplicantDetails; // Sub-profile for co-applicant details

  // HOME_LOAN / LAP conditional
  propertyIdentified: boolean;    // Has the user identified a property?
  estimatedPropertyValue: number; // If propertyIdentified === true

  // BUSINESS_LOAN conditional
  isAbove50Lakhs: boolean;        // Is the requested limit above ₹50 Lakhs?
}

// ─── DOCUMENT TRACKING ─────────────────────────────────────────────────────

export type DocumentStatus = 'PENDING' | 'UPLOADING' | 'UPLOADED' | 'VERIFIED' | 'REJECTED';

export interface DocumentItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
  status: DocumentStatus;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

// ─── ROOT APPLICATION STATE ─────────────────────────────────────────────────
// Single source of truth. Zustand persist serializes this to sessionStorage.

export interface ApplicationState {
  // Meta
  applicationId: string;
  currentStage: StageNumber;
  completedStages: StageNumber[];
  createdAt: string;
  lastModifiedAt: string;

  // Stage 1
  basicKYC: BasicKYC;

  // Stage 2 — Discriminated union: only one path active at a time
  financialDetails: FinancialDetails;

  // Stage 3
  loanRequirements: LoanRequirements;

  // Stage 4
  financialFootprint: FinancialFootprint;

  // Stage 4
  documents: DocumentItem[];

  // Stage 5
  consent: {
    termsAccepted: boolean;
    cibilPullAuthorized: boolean;
    dataSharingAuthorized: boolean;
  };

  // Global validation state
  validationErrors: Record<string, string>;
}

// ─── STORE ACTIONS (Zustand interface) ──────────────────────────────────────

export interface ApplicationActions {
  // Navigation
  setStage: (stage: StageNumber) => void;
  completeStage: (stage: StageNumber) => void;

  // Data mutators
  updateBasicKYC: (data: Partial<BasicKYC>) => void;
  updateFinancialDetails: (details: FinancialDetails) => void;
  updateSalariedDetails: (data: Partial<SalariedDetails>) => void;
  updateProfessionalDetails: (data: Partial<ProfessionalDetails>) => void;
  updateBusinessDetails: (data: Partial<BusinessDetails>) => void;
  updateLoanRequirements: (data: Partial<LoanRequirements>) => void;
  updateFinancialFootprint: (data: Partial<FinancialFootprint>) => void;
  updateCoApplicantDetails: (data: Partial<CoApplicantDetails>) => void;
  updateDocuments: (docs: DocumentItem[]) => void;
  setDocumentStatus: (docId: string, status: DocumentStatus, fileUrl?: string, fileName?: string) => void;
  setConsent: (field: keyof ApplicationState['consent'], value: boolean) => void;

  // Validation
  setValidationErrors: (errors: Record<string, string>) => void;
  setValidationError: (field: string, error: string | null) => void;
  clearValidationErrors: () => void;

  // Lifecycle
  resetApplication: () => void;

  // Computed helpers (pure getters, no state mutation)
  getActiveEmploymentPath: () => EmploymentType | null;
  getProgress: () => number;
  isStageAccessible: (stage: StageNumber) => boolean;
}

// Combined type for the Zustand store
export type ApplicationStore = ApplicationState & ApplicationActions;
