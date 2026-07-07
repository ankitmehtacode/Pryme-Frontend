// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 PRYME PROGRESSIVE PROFILING ENGINE — TYPE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════
// Domain-accurate TypeScript interfaces modelling Indian banking/NBFC loan
// application funnels. Every type maps to a real underwriting data-point.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── LOAN PRODUCT TAXONOMY ───────────────────────────────────────────────────

export type LoanType =
  | 'PERSONAL_LOAN'
  | 'HOME_LOAN'
  | 'LAP'              // Loan Against Property
  | 'BUSINESS_LOAN'
  | 'AUTO_LOAN'
  | 'BT_TOP_UP';

// ─── EMPLOYMENT HIERARCHY (The Critical Pivot Point) ─────────────────────────
// Level 1: Category
// Level 2: Sub-type (determines document matrix + financial fields)

export type EmploymentCategory = 'SALARIED' | 'PROFESSIONAL' | 'SELF_EMPLOYED';

export type SalariedSubType = 'PRIVATE' | 'GOVERNMENT';

export type ProfessionalSubType = 'CA' | 'CS' | 'DOCTOR' | 'LAWYER';

/** Business underwriting programs — each has a different doc matrix */
export type BusinessProgram =
  | 'ITR_BASED'         // Standard: 2-3yr ITR + P&L + Balance Sheet
  | 'GST_BASED'         // GST returns as primary income proof
  | 'BANKING_PROGRAM'   // Average Bank Balance (ABB) tiers — no ITR needed
  | 'CASH_FLOW_PROGRAM'; // Bank statement analysis — no financials needed

/** ABB tier thresholds in lakhs (as used by banks for Banking Program) */
export type ABBTierLakhs = 5 | 10 | 20 | 25;

// ─── FORM STEP PROGRESSION ──────────────────────────────────────────────────

export type FormStep =
  | 'BASIC_KYC'           // Always first: name, phone, email, DOB, location, employment
  | 'EMPLOYMENT_DETAILS'  // Dynamic: fields change based on employment category + sub-type
  | 'LOAN_REQUIREMENTS'   // Product-specific: amount, tenure, purpose, property details
  | 'DOCUMENT_CHECKLIST'  // Dynamic: checklist adapts to employment + loan type
  | 'REVIEW_SUBMIT';      // Final review & consent

// ─── BASIC KYC (Step 1 — Always Collected) ──────────────────────────────────

export interface BasicKYC {
  fullName: string;           // Legal name as per PAN
  mobileNumber: string;       // 10-digit Indian mobile
  mobileVerified: boolean;    // OTP verification status
  email: string;
  dateOfBirth: string;        // ISO date string (YYYY-MM-DD)
  panNumber: string;          // Format: ABCDE1234F

  // Location
  state: string;
  city: string;
  pinCode: string;            // 6-digit PIN

  // Employment pivot (determines entire downstream flow)
  employmentCategory: EmploymentCategory | null;
}

// ─── SALARIED EMPLOYEE DATA (Step 2 — Salaried Path) ────────────────────────

export interface SalariedData {
  subType: SalariedSubType;
  companyName: string;
  designation: string;
  officialEmail: string;
  workExperienceYears: number;     // Total years of experience
  currentCompanyYears: number;     // Tenure at current employer
  netMonthlyIncome: number;        // Take-home salary
  hasExistingLoans: boolean;
  existingEMI: number;             // Total existing monthly EMI obligations
}

// ─── PROFESSIONAL DATA (Step 2 — Professional Path) ─────────────────────────

export interface ProfessionalData {
  subType: ProfessionalSubType;
  registrationNumber: string;      // Bar Council / ICAI / MCI / ICSI registration
  practiceName: string;            // Firm/clinic/practice name
  practiceYears: number;           // Years of active practice
  practiceAddress: string;
  annualTurnover: number;          // Annual professional income
  netMonthlyIncome: number;        // Average monthly draw
  hasExistingLoans: boolean;
  existingEMI: number;
}

// ─── SELF-EMPLOYED / BUSINESS DATA (Step 2 — Business Path) ─────────────────

export interface BusinessData {
  businessProgram: BusinessProgram;         // Determines doc matrix
  businessName: string;
  businessType: 'PROPRIETORSHIP' | 'PARTNERSHIP' | 'LLP' | 'PRIVATE_LIMITED' | 'OPC';
  industryType: string;
  businessVintageYears: number;             // How old is the business
  gstRegistrationDate?: string;             // GST Registration Date YYYY-MM-DD
  businessAddress: string;

  // ── ITR-Based Fields ──
  annualTurnover?: number;                  // From ITR / P&L
  netProfit?: number;                       // Net profit after tax
  itrFiledYears?: number;                   // Number of years ITR filed (2-3 required)

  // ── GST-Based Fields ──
  gstNumber?: string;                       // 15-digit GSTIN
  gstMonthlyTurnover?: number;              // Average monthly GST turnover
  gstFilingMonths?: number;                 // Months of continuous GST filing

  // ── Banking Program Fields ──
  abbTier?: ABBTierLakhs;                   // Average Bank Balance tier in lakhs
  primaryBankName?: string;
  accountHeldMonths?: number;               // How long the account has been active

  // ── Cash Flow Program Fields ──
  averageMonthlyCredits?: number;           // Average monthly bank credits
  bankStatementMonths?: number;             // Months of statements available (6-12)

  // Common across all programs
  netMonthlyIncome: number;
  hasExistingLoans: boolean;
  existingEMI: number;
}

// ─── LOAN REQUIREMENT DATA (Step 3 — Product-Specific) ──────────────────────

export interface LoanRequirements {
  loanType: LoanType;
  loanAmount: number;
  loanTenure: number;                       // In years
  purpose: string;

  // Home Loan / LAP specific
  propertyIdentified?: boolean;
  propertyType?: 'FLAT' | 'HOUSE' | 'PLOT' | 'COMMERCIAL';
  propertyValue?: number;
  propertyCity?: string;

  // Business Loan specific
  endUse?: string;                          // What the loan proceeds will be used for

  cibilScore: number;                       // 300-900
}

// ─── DOCUMENT MATRIX (Step 4) ───────────────────────────────────────────────
// Documents are dynamically determined by { employmentCategory, subType, businessProgram, loanType }

export type DocumentStatus = 'NOT_UPLOADED' | 'UPLOADING' | 'UPLOADED' | 'VERIFIED' | 'REJECTED';

export interface DocumentItem {
  id: string;
  label: string;
  description: string;
  required: boolean;
  status: DocumentStatus;
  fileUrl?: string;
  fileName?: string;
}

// ─── APPLICATION META ───────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'DRAFT'
  | 'KYC_PENDING'
  | 'UNDER_REVIEW'
  | 'DOCUMENTS_PENDING'
  | 'SANCTIONED'
  | 'REJECTED'
  | 'DISBURSED';

// ─── COMPLETE APPLICATION STATE (Root Interface) ────────────────────────────
// This is the single source of truth persisted in sessionStorage.

export interface ApplicationState {
  // Meta
  applicationId: string;               // UUID generated on creation
  status: ApplicationStatus;
  currentStep: FormStep;
  completedSteps: FormStep[];
  createdAt: string;                    // ISO timestamp
  lastUpdatedAt: string;               // ISO timestamp

  // Step 1: Basic KYC (always populated)
  basicKYC: BasicKYC;

  // Step 2: Employment — ONE of these will be populated based on employmentCategory
  salariedData: SalariedData | null;
  professionalData: ProfessionalData | null;
  businessData: BusinessData | null;

  // Step 3: Loan Requirements
  loanRequirements: LoanRequirements;

  // Step 4: Documents (dynamically computed, stored for progress tracking)
  documents: DocumentItem[];

  // Consent & declarations
  consentTCAccepted: boolean;
  consentCIBILPull: boolean;
  consentDataSharing: boolean;
}

// ─── FORM STEP CONFIGURATION MAP ────────────────────────────────────────────
// Used by the UI to know which steps are available and in what order

export interface StepConfig {
  id: FormStep;
  label: string;
  description: string;
  icon: string;                         // Lucide icon name
  isAccessible: (state: ApplicationState) => boolean;
}

// ─── ACTION TYPES (for the state management dispatch) ───────────────────────

export type ApplicationAction =
  | { type: 'SET_BASIC_KYC'; payload: Partial<BasicKYC> }
  | { type: 'SET_SALARIED_DATA'; payload: Partial<SalariedData> }
  | { type: 'SET_PROFESSIONAL_DATA'; payload: Partial<ProfessionalData> }
  | { type: 'SET_BUSINESS_DATA'; payload: Partial<BusinessData> }
  | { type: 'SET_LOAN_REQUIREMENTS'; payload: Partial<LoanRequirements> }
  | { type: 'SET_DOCUMENT_STATUS'; payload: { documentId: string; status: DocumentStatus; fileUrl?: string; fileName?: string } }
  | { type: 'SET_CONSENT'; payload: { field: 'consentTCAccepted' | 'consentCIBILPull' | 'consentDataSharing'; value: boolean } }
  | { type: 'GO_TO_STEP'; payload: FormStep }
  | { type: 'COMPLETE_STEP'; payload: FormStep }
  | { type: 'RESET_APPLICATION' }
  | { type: 'HYDRATE'; payload: ApplicationState };
