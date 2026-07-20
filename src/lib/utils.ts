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
/**
 * Formats a rupee amount for display using Indian Lakh/Crore notation
 * (e.g. 4000000 -> "₹40 L", 12500000 -> "₹1.25 Cr"), rounding away any
 * paise so loan-amount figures never render with stray decimals.
 */
// All timestamps in the admin CRM and elsewhere on the site are shown in
// IST regardless of the viewer's own machine/browser timezone -- previously
// bare `.toLocaleString()`/`.toLocaleDateString()` calls rendered in
// whichever timezone the browser was set to, so two admins in different
// timezones would see different times for the same event.
const IST_TIMEZONE = "Asia/Kolkata";

/** Full date + time in IST, e.g. "18/07/2026, 16:33:24". */
export function formatISTDateTime(value: string | number | Date): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/** Short date in IST, e.g. "18 Jul 2026". */
export function formatISTDate(value: string | number | Date): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    timeZone: IST_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatIndianCurrency(value: number): string {
  if (value == null || isNaN(value)) return "₹0";
  const rounded = Math.round(value);
  const abs = Math.abs(rounded);
  if (abs >= 10000000) return `₹${(rounded / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (abs >= 100000) return `₹${(rounded / 100000).toFixed(2).replace(/\.?0+$/, "")} L`;
  return `₹${rounded.toLocaleString("en-IN")}`;
}

/**
 * Formats a rupee amount with Indian digit grouping for display inside an
 * input while the user types (e.g. 2000000 -> "20,00,000").
 */
export function formatIndianCommas(value: number): string {
  if (value == null || isNaN(value)) return "";
  return new Intl.NumberFormat("en-IN").format(Math.round(value));
}

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigitWords(n: number): string {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : "");
}

function threeDigitWords(n: number): string {
  if (n >= 100) {
    return `${ONES[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${twoDigitWords(n % 100)}` : ""}`;
  }
  return twoDigitWords(n);
}

/**
 * Converts a rupee amount to its Indian numbering-system words (Lakh/Crore),
 * e.g. 2000000 -> "Twenty Lakh", 12500000 -> "One Crore Twenty Five Lakh".
 * Returns "" for zero/invalid so callers can hide the caption entirely.
 */
export function numberToIndianWords(value: number): string {
  if (value == null || isNaN(value) || value <= 0) return "";
  let num = Math.round(Math.abs(value));

  const crore = Math.floor(num / 1e7);
  num %= 1e7;
  const lakh = Math.floor(num / 1e5);
  num %= 1e5;
  const thousand = Math.floor(num / 1e3);
  num %= 1e3;
  const hundred = num;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigitWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigitWords(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigitWords(thousand)} Thousand`);
  if (hundred) parts.push(threeDigitWords(hundred));

  return parts.join(" ");
}

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
    // Lead origin — lets the CRM flag callbacks that came from a rejected
    // offer instead of a fresh inquiry (see Offers.tsx zero-offer screen).
    source: formData.source,
    rejectionReason: formData.rejectionReason,

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
    maturingLoanEmi: formData.maturingLoanEmi || undefined,
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
