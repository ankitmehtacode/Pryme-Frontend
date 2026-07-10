import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a UUIDv4. 
 * Safely falls back to a Math.random polyfill if crypto.randomUUID is unavailable 
 * (e.g., testing on local network IPs over HTTP).
 */
export function generateSafeUUID(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  
  // Fallback for insecure contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Cleanly maps form data to a CRM-friendly metadata object based on the user's financial path.
 * Ensures no unused or falsy fields (like business details for salaried users) pollute the CRM.
 */
export function buildCleanMetadata(formData: any): Record<string, any> {
  const rawPath = String(formData.financialPath || formData.employmentType || "SALARIED").toUpperCase();
  
  let path = "SALARIED";
  if (rawPath.includes("NON PROFESSIONAL") || rawPath === "SELF_EMPLOYED") {
    path = "SELF_EMPLOYED";
  } else if (rawPath.includes("PROFESSIONAL")) {
    path = "PROFESSIONAL";
  } else if (rawPath === "SALARIED") {
    path = "SALARIED";
  }
  
  // Calculate combined income (Applicant + Co-applicant)
  const applicantIncome = Number(formData.monthlyIncome) || 0;
  const coApplicantIncome = formData.hasCoApplicant && formData.coApplicantDetails?.netMonthlySalary 
    ? Number(formData.coApplicantDetails.netMonthlySalary) 
    : 0;
  
  const base = {
    // Core identity
    email: formData.email || formData.officialEmail,
    panNumber: formData.panCard || formData.panNumber,
    dob: formData.dob,
    city: formData.city || formData.currentCity,
    state: formData.state,
    pinCode: formData.pinCode,

    // Employment Identity
    employmentType: formData.employmentType,
    occupation: formData.occupation,
    financialPath: path,

    // Financials
    cibilScore: formData.cibilScore,
    monthlyIncome: applicantIncome + coApplicantIncome, // Adds co-applicant income perfectly
    monthlyEMI: formData.eligibleExistingEmi || formData.monthlyEMI || 0,
    hasCoApplicant: formData.hasCoApplicant ? "Yes" : "No",
    coApplicantIncome: coApplicantIncome > 0 ? coApplicantIncome : undefined,
    
    // Loan details
    loanPurpose: formData.loanPurpose,
    propertyType: formData.propertyType,
    propertyValue: formData.estimatedPropertyValue || formData.propertyValue || undefined,
    propertyIdentified: formData.propertyIdentified ? "Yes" : "No",
    existingBank: formData.existingBank,
  };

  const specific: Record<string, any> = {};

  if (path === "SALARIED") {
    Object.assign(specific, {
      companyName: formData.companyName,
      designation: formData.designation,
      grossSalary: formData.grossSalary,
      workExperience: formData.totalExperienceYears || formData.workExperience,
      officialEmail: formData.officialEmail,
    });
  } else if (path === "SELF_EMPLOYED") {
    Object.assign(specific, {
      businessIndustryType: formData.businessIndustryType,
      businessSubType: formData.businessSubType,
      businessVintageYears: formData.businessVintageYears,
      netProfit: formData.netProfit,
      depreciation: formData.depreciation,
      last12MonthsGstTurnover: formData.last12MonthsGstTurnover,
      averageBankBalance: formData.averageBankBalance,
      itrYearsAvailable: formData.itrYearsAvailable,
      isCaCertifiedOrAudited: formData.isCaCertifiedOrAudited ? "Yes" : "No",
    });
  } else if (path === "PROFESSIONAL") {
    Object.assign(specific, {
      professionalSubType: formData.professionalSubType,
      annualGrossReceipts: formData.annualGrossReceipts,
      totalPracticeYears: formData.totalPracticeYears || formData.totalExperienceYears || formData.workExperience,
    });
  }

  // Filter out undefined, null, or empty string values perfectly
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries({ ...base, ...specific })) {
    if (val !== undefined && val !== null && val !== "") {
      result[key] = val;
    }
  }

  return result;
}
