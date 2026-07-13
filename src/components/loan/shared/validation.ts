// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 PRYME VALIDATION ENGINE — SHARED CROSS-STAGE VALIDATORS
// ═══════════════════════════════════════════════════════════════════════════════
// Centralized validation rules consumed by both the orchestrator
// (LoanApplicationForm.tsx) and individual step components.
// ═══════════════════════════════════════════════════════════════════════════════

import { useApplicationStore } from "@/store/applicationStore";
import { STATE_PIN_PREFIXES, CITY_PIN_PREFIXES } from "./constants";

type StoreSnapshot = ReturnType<typeof useApplicationStore.getState>;
export type ValidationErrors = Record<string, string>;

// ── Stage 1: Identity & KYC ─────────────────────────────────────────────────

export function validateStage1(store: StoreSnapshot): ValidationErrors {
  const k = store.basicKYC || {};
  const errors: ValidationErrors = {};
  if (!k.fullName || k.fullName.trim().length < 3) errors.fullName = "Name must be at least 3 characters";
  if (!k.mobileNumber || !/^[6-9]\d{9}$/.test(k.mobileNumber)) errors.mobileNumber = "Enter a valid 10-digit mobile number";
  if (!k.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
  if (!k.state) errors.state = "Select your state";
  if (!k.city) errors.city = "Select your city";
  
  if (!k.pinCode || !/^\d{6}$/.test(k.pinCode)) {
    errors.pinCode = "Enter a valid 6-digit PIN code";
  } else if (k.city && CITY_PIN_PREFIXES[k.city]) {
    const validPrefixes = CITY_PIN_PREFIXES[k.city];
    if (!validPrefixes.some(prefix => k.pinCode.startsWith(prefix))) {
      errors.pinCode = `PIN code for ${k.city} must start with ${validPrefixes.join(' or ')}`;
    }
  } else if (k.state && STATE_PIN_PREFIXES[k.state]) {
    const validPrefixes = STATE_PIN_PREFIXES[k.state];
    if (!validPrefixes.some(prefix => k.pinCode.startsWith(prefix))) {
      errors.pinCode = `Invalid PIN code for ${k.state} (must start with ${validPrefixes.join(', ')})`;
    }
  }

  return errors;
}

// ── Stage 2: Employment & Income ────────────────────────────────────────────

export function validateStage2(store: StoreSnapshot): ValidationErrors {
  const errors: ValidationErrors = {};
  const emp = store.basicKYC?.employmentType;
  if (!emp) { errors.employmentType = "Select your employment type"; return errors; }

  const fin = store.financialDetails || {};

  if (emp === "SALARIED" && fin.path === "SALARIED") {
    const d = fin.data;
    if (!d.subType) errors.subType = "Select private or government";
    if (d.subType === "PRIVATE" && !d.companyType) errors.companyType = "Select company type";
    if (!d.companyName || d.companyName.trim().length < 2) errors.companyName = "Enter your company name";
    if (!d.designation || d.designation.trim().length < 2) errors.designation = "Enter your designation";
    if (!d.netMonthlySalary || d.netMonthlySalary < 10000) errors.netMonthlySalary = "Minimum salary is ₹10,000";
    if (typeof d.totalExperienceYears !== 'number' || d.totalExperienceYears < 0) errors.totalExperienceYears = "Enter valid experience";
    if (typeof d.currentCompanyYears !== 'number' || d.currentCompanyYears < 0) errors.currentCompanyYears = "Enter valid current experience";
  }

  if (emp === "PROFESSIONAL" && fin.path === "PROFESSIONAL") {
    const d = fin.data;
    if (!d.subType) errors.subType = "Select your profession";
    if (!d.practiceName || d.practiceName.trim().length < 2) errors.practiceName = "Enter your practice/firm name";
    if (d.practiceYears < 0) errors.practiceYears = "Enter valid practice vintage";
    if (!d.netMonthlyIncome || d.netMonthlyIncome < 10000) errors.netMonthlyIncome = "Minimum income is ₹10,000";
  }

  if (emp === "SELF_EMPLOYED" && fin.path === "SELF_EMPLOYED") {
    const d = fin.data;
    if (!d.businessName || d.businessName.trim().length < 2) errors.businessName = "Enter your business name";
    if (d.gstRegistrationDate) {
      const regDate = new Date(d.gstRegistrationDate);
      if (isNaN(regDate.getTime())) {
        errors.gstRegistrationDate = "Enter a valid registration date";
      } else if (regDate.getTime() > Date.now()) {
        errors.gstRegistrationDate = "Registration date cannot be in the future";
      }
    }
    if (!d.netMonthlyIncome || d.netMonthlyIncome < 10000) errors.netMonthlyIncome = "Minimum income is ₹10,000";
  }

  const lr = store.loanRequirements || {};
  if (lr.loanType === 'HOME_LOAN' || lr.loanType === 'LAP') {
    if (!lr.propertyType) errors.propertyType = "Select a property type";
    if (lr.loanType === 'LAP' && !lr.propertyCategory) {
      errors.propertyCategory = "Select a property category";
    }
  }

  if (lr.loanType === 'BUSINESS_LOAN' || (lr.loanType === 'LAP' && lr.propertyCategory === 'COMMERCIAL_INDUSTRIAL')) {
    if (lr.loanType === 'BUSINESS_LOAN' && !lr.propertyType) errors.propertyType = "Select a property type";
    if (!lr.businessPropertyCategory) errors.businessPropertyCategory = "Select a business property category";
  }

  return errors;
}

// ── Stage 3: Loan Details ───────────────────────────────────────────────────

export function validateStage3(store: StoreSnapshot): ValidationErrors {
  const errors: ValidationErrors = {};
  const lr = store.loanRequirements || {};
  if (!lr.loanType) errors.loanType = "Select a loan product";
  if (!lr.loanAmount || lr.loanAmount < 50000) errors.loanAmount = "Minimum loan amount is ₹50,000";
  if (!lr.tenureYears || lr.tenureYears < 1) errors.tenure = "Select a tenure";

  // Property-backed loans require property value for accurate LTV calculation
  if (lr.loanType === 'HOME_LOAN' || lr.loanType === 'LAP') {
    if (!lr.propertyValue || lr.propertyValue <= 0) {
      errors.propertyValue = "Property value is required for Home Loan / LAP";
    } else if (lr.propertyValue < lr.loanAmount) {
      errors.propertyValue = "Property value must be ≥ loan amount";
    }
  }

  return errors;
}

// ── Stage 4: Financial Footprint (currently no-op) ──────────────────────────

export function validateStage4(_store: StoreSnapshot): ValidationErrors {
  return {};
}

// ── Aggregate All Stages ────────────────────────────────────────────────────
// Returns errors from all stages merged, with stage3 (visual top) first.

export function validateAllStages(store: StoreSnapshot): ValidationErrors {
  const stage3Errors = validateStage3(store);
  const stage1Errors = validateStage1(store);
  const stage2Errors = validateStage2(store);
  return { ...stage3Errors, ...stage1Errors, ...stage2Errors };
}

// ── Error-to-Section Mapping ────────────────────────────────────────────────
// Maps error field keys → the DOM section id that contains them

export const ERROR_SECTION_MAP: Record<string, string> = {
  // Stage 3 — Loan Details
  loanType: 'section-loan-details',
  loanAmount: 'section-loan-details',
  tenure: 'section-loan-details',
  propertyValue: 'section-loan-details',
  // Stage 1 — Identity
  fullName: 'section-identity',
  mobileNumber: 'section-identity',
  email: 'section-identity',
  dateOfBirth: 'section-identity',
  state: 'section-identity',
  city: 'section-identity',
  pinCode: 'section-identity',
  religion: 'section-identity',
  // Stage 2 — Employment
  employmentType: 'section-employment',
  subType: 'section-employment',
  companyType: 'section-employment',
  companyName: 'section-employment',
  designation: 'section-employment',
  netMonthlySalary: 'section-employment',
  totalExperienceYears: 'section-employment',
  currentCompanyYears: 'section-employment',
  practiceName: 'section-employment',
  practiceYears: 'section-employment',
  netMonthlyIncome: 'section-employment',
  businessName: 'section-employment',
  vintageYears: 'section-employment',
  gstRegistrationDate: 'section-employment',
  propertyType: 'section-employment',
  propertyCategory: 'section-employment',
  businessPropertyCategory: 'section-employment',
};

export const STAGE_LABELS_FRIENDLY: Record<string, string> = {
  'section-loan-details': 'Loan Details',
  'section-identity': 'Identity & KYC',
  'section-employment': 'Employment & Income',
};
