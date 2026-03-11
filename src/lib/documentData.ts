/* ══════════════════════════════════════════════════════
   documentData.ts
   Single Source of Truth — Document Requirements per
   Loan Type × Employment Category
   ══════════════════════════════════════════════════════ */

export type ProductType = "Home Loan" | "LAP" | "Business Loan" | "Personal Loan";

export type EmploymentType = "Salaried" | "SEP" | "SENP";

export type DocumentCategory =
  | "KYC"
  | "Income"
  | "Property"
  | "Financial"
  | "Business Proof"
  | "Additional";

export interface DocumentItem {
  id: string;
  label: string;
  category: DocumentCategory;
  /** If true, this document is optional / conditional */
  optional?: boolean;
}

/* ──────────────────────────────────────────────────────
   Helper: build the exact document list based on
   product type + employment type
   ────────────────────────────────────────────────────── */

export const getDocumentsForLoanType = (
  product: ProductType,
  empType: EmploymentType
): DocumentItem[] => {
  switch (product) {
    case "Home Loan":
      return buildHomeLoanDocs(empType);
    case "LAP":
      return buildLAPDocs(empType);
    case "Business Loan":
      return buildBusinessLoanDocs();
    case "Personal Loan":
      return buildPersonalLoanDocs(empType);
    default:
      return [];
  }
};

/* ══════════════════════════════════════════════════════
   1. HOME LOAN
   ══════════════════════════════════════════════════════ */

const buildHomeLoanDocs = (empType: EmploymentType): DocumentItem[] => {
  const docs: DocumentItem[] = [];

  // ── KYC (common for all) ──
  docs.push(
    { id: "hl_pan", label: "PAN Card", category: "KYC" },
    { id: "hl_aadhar", label: "Aadhaar Card / Passport / Voter ID / Driving License", category: "KYC" },
    { id: "hl_photo", label: "Passport size photographs", category: "KYC" }
  );

  // ── Income (varies by employment) ──
  if (empType === "Salaried") {
    docs.push(
      { id: "hl_sal_slips", label: "Last 3 months salary slips", category: "Income" },
      { id: "hl_sal_bank", label: "Last 6 months bank statement (salary account)", category: "Income" },
      { id: "hl_form16", label: "Form 16 (last 2 years)", category: "Income" },
      { id: "hl_sal_itr", label: "ITR (last 2 years)", category: "Income", optional: true }
    );
  } else {
    // SEP & SENP
    docs.push(
      { id: "hl_se_itr", label: "ITR (last 2–3 years) with computation", category: "Income" },
      { id: "hl_se_bspl", label: "Balance Sheet & P&L (CA certified)", category: "Income" },
      { id: "hl_se_bizproof", label: "Business proof (GST / Shop Act / MSME Registration)", category: "Income" },
      { id: "hl_se_bank", label: "Last 6–12 months bank statements (business + personal)", category: "Income" }
    );
  }

  // ── Property (common for all) ──
  docs.push(
    { id: "hl_ats", label: "Agreement to Sell", category: "Property" },
    { id: "hl_sale_deed", label: "Sale Deed (if resale property)", category: "Property", optional: true },
    { id: "hl_title", label: "Title chain documents (20–30 years)", category: "Property" },
    { id: "hl_bldg_plan", label: "Approved building plan", category: "Property" },
    { id: "hl_noc", label: "NOC from builder / society", category: "Property" },
    { id: "hl_allotment", label: "Allotment letter (for under-construction)", category: "Property", optional: true },
    { id: "hl_receipts", label: "Payment receipts", category: "Property" }
  );

  return docs;
};

/* ══════════════════════════════════════════════════════
   2. LOAN AGAINST PROPERTY (LAP)
   ══════════════════════════════════════════════════════ */

const buildLAPDocs = (empType: EmploymentType): DocumentItem[] => {
  const docs: DocumentItem[] = [];

  // ── KYC ──
  docs.push(
    { id: "lap_pan", label: "PAN Card", category: "KYC" },
    { id: "lap_aadhar", label: "Aadhaar Card / Address Proof", category: "KYC" },
    { id: "lap_photo", label: "Passport size photographs", category: "KYC" }
  );

  // ── Income ──
  if (empType === "Salaried") {
    docs.push(
      { id: "lap_sal_slips", label: "Last 3 months salary slips", category: "Income" },
      { id: "lap_sal_bank", label: "Last 6 months bank statement (salary account)", category: "Income" },
      { id: "lap_form16", label: "Form 16 (last 2 years)", category: "Income" },
      { id: "lap_sal_itr", label: "ITR (last 2 years)", category: "Income", optional: true }
    );
  } else {
    docs.push(
      { id: "lap_se_itr", label: "ITR (last 2–3 years)", category: "Income" },
      { id: "lap_se_bspl", label: "Balance Sheet & P&L", category: "Income" },
      { id: "lap_se_bank", label: "Bank statements (6–12 months)", category: "Income" }
    );
  }

  // ── Property ──
  docs.push(
    { id: "lap_sale_deed", label: "Original Property Sale Deed", category: "Property" },
    { id: "lap_title", label: "Title chain documents (20–30 years)", category: "Property" },
    { id: "lap_bldg_plan", label: "Approved building plan", category: "Property" },
    { id: "lap_tax", label: "Property tax receipt", category: "Property" },
    { id: "lap_elec", label: "Electricity bill", category: "Property" },
    { id: "lap_occ", label: "Occupancy certificate", category: "Property", optional: true }
  );

  // ── Business Proof (only for SEP / SENP) ──
  if (empType !== "Salaried") {
    docs.push(
      { id: "lap_gst", label: "GST Certificate", category: "Business Proof" },
      { id: "lap_udyam", label: "Udyam Registration / Shop Act", category: "Business Proof" },
      { id: "lap_partnership", label: "Partnership Deed / MOA-AOA", category: "Business Proof", optional: true }
    );
  }

  return docs;
};

/* ══════════════════════════════════════════════════════
   3. BUSINESS LOAN
   ══════════════════════════════════════════════════════ */

const buildBusinessLoanDocs = (): DocumentItem[] => {
  const docs: DocumentItem[] = [];

  // ── KYC ──
  docs.push(
    { id: "bl_pan", label: "PAN Card (Individual + Business)", category: "KYC" },
    { id: "bl_aadhar", label: "Aadhaar Card", category: "KYC" },
    { id: "bl_photo", label: "Passport size photographs", category: "KYC" }
  );

  // ── Financial Documents ──
  docs.push(
    { id: "bl_itr", label: "ITR (last 2–3 years)", category: "Financial" },
    { id: "bl_bspl", label: "Balance Sheet & P&L", category: "Financial" },
    { id: "bl_gst_returns", label: "GST Returns (last 6–12 months)", category: "Financial" },
    { id: "bl_bank", label: "Bank statements (6–12 months)", category: "Financial" }
  );

  // ── Business Proof ──
  docs.push(
    { id: "bl_gst_cert", label: "GST Certificate", category: "Business Proof" },
    { id: "bl_shop_est", label: "Shop & Establishment Certificate", category: "Business Proof" },
    { id: "bl_udyam", label: "Udyam Registration", category: "Business Proof" },
    { id: "bl_partnership", label: "Partnership Deed / MOA-AOA", category: "Business Proof", optional: true }
  );

  // ── Additional (for higher limits) ──
  docs.push(
    { id: "bl_debtors", label: "Debtors & Creditors list", category: "Additional", optional: true },
    { id: "bl_cma", label: "CMA data", category: "Additional", optional: true },
    { id: "bl_provisional", label: "Provisional financials", category: "Additional", optional: true }
  );

  return docs;
};

/* ══════════════════════════════════════════════════════
   4. PERSONAL LOAN
   ══════════════════════════════════════════════════════ */

const buildPersonalLoanDocs = (empType: EmploymentType): DocumentItem[] => {
  const docs: DocumentItem[] = [];

  // ── KYC ──
  docs.push(
    { id: "pl_pan", label: "PAN Card", category: "KYC" },
    { id: "pl_aadhar", label: "Aadhaar Card", category: "KYC" },
    { id: "pl_photo", label: "Passport size photographs", category: "KYC" }
  );

  // ── Income (varies by employment) ──
  if (empType === "Salaried") {
    docs.push(
      { id: "pl_sal_slips", label: "Last 3 months salary slips", category: "Income" },
      { id: "pl_sal_bank", label: "Last 6 months bank statements", category: "Income" },
      { id: "pl_emp_id", label: "Employment ID card", category: "Income" },
      { id: "pl_form16", label: "Form 16", category: "Income", optional: true }
    );
  } else {
    // SEP & SENP
    docs.push(
      { id: "pl_se_itr", label: "ITR (last 1–2 years)", category: "Income" },
      { id: "pl_se_bank", label: "Bank statements (6 months)", category: "Income" },
      { id: "pl_se_gst", label: "GST Certificate", category: "Income", optional: true }
    );
  }

  // ── Additional (common) ──
  docs.push(
    { id: "pl_existing_loan", label: "Existing loan statements (if any)", category: "Additional", optional: true },
    { id: "pl_cc_stmt", label: "Credit card statements (if required)", category: "Additional", optional: true }
  );

  return docs;
};

/* ══════════════════════════════════════════════════════
   Category Metadata — icons & display names
   ══════════════════════════════════════════════════════ */

export const CATEGORY_ORDER: DocumentCategory[] = [
  "KYC",
  "Income",
  "Financial",
  "Property",
  "Business Proof",
  "Additional",
];

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  KYC: "Identity Documents",
  Income: "Income Documents",
  Financial: "Financial Documents",
  Property: "Property Documents",
  "Business Proof": "Business Proof",
  Additional: "Additional Documents",
};

/* ──────────────────────────────────────────────────────
   Utility: groups a flat document list into
   ordered categories (only non-empty ones)
   ────────────────────────────────────────────────────── */

export interface DocumentGroup {
  category: DocumentCategory;
  displayName: string;
  docs: DocumentItem[];
}

export const groupDocumentsByCategory = (docs: DocumentItem[]): DocumentGroup[] => {
  return CATEGORY_ORDER
    .map((cat) => ({
      category: cat,
      displayName: CATEGORY_LABELS[cat],
      docs: docs.filter((d) => d.category === cat),
    }))
    .filter((g) => g.docs.length > 0);
};
