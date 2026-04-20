// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 DOCUMENT MATRIX RESOLVER
// ═══════════════════════════════════════════════════════════════════════════════
// Deterministic function that takes the current ApplicationState and returns
// the exact list of documents required.
//
// The matrix is built from real Indian banking/NBFC underwriting requirements:
//   Axis = { employmentCategory, subType/businessProgram } × loanType
// ═══════════════════════════════════════════════════════════════════════════════

import type { ApplicationState, DocumentItem } from '@/types/application';

// ─── HELPER: Create a DocumentItem with defaults ────────────────────────────

function doc(id: string, label: string, description: string, required = true): DocumentItem {
  return { id, label, description, required, status: 'NOT_UPLOADED' };
}

// ─── UNIVERSAL DOCUMENTS (Always required regardless of path) ───────────────

const UNIVERSAL_DOCS: DocumentItem[] = [
  doc('pan_card', 'PAN Card', 'Clear copy of PAN card (front)'),
  doc('aadhaar_card', 'Aadhaar Card', 'Aadhaar card (front & back) or Aadhaar e-copy'),
  doc('photo', 'Passport Size Photo', 'Recent passport-size photograph'),
  doc('address_proof', 'Address Proof', 'Utility bill / Rent agreement / Passport (within 3 months)'),
];

// ─── SALARIED DOCUMENTS ─────────────────────────────────────────────────────

function getSalariedDocs(state: ApplicationState): DocumentItem[] {
  const sub = state.salariedData?.subType;
  const docs: DocumentItem[] = [
    doc('salary_slips', 'Salary Slips (3 months)', 'Last 3 months salary slips from employer'),
    doc('bank_stmt_6m', 'Bank Statement (6 months)', 'Salary account bank statement for last 6 months'),
    doc('form16', 'Form 16 / ITR', 'Latest Form 16 or Income Tax Return acknowledgement'),
    doc('emp_id', 'Employee ID Card', 'Company-issued employee identity card'),
  ];

  if (sub === 'PRIVATE') {
    docs.push(
      doc('offer_letter', 'Offer / Appointment Letter', 'Current employer offer letter or appointment letter'),
    );
  }

  if (sub === 'GOVERNMENT') {
    docs.push(
      doc('govt_service_proof', 'Government Service Proof', 'Service certificate / deputation order / govt ID'),
    );
  }

  // Home Loan / LAP — additional property docs
  if (['HOME_LOAN', 'LAP'].includes(state.loanRequirements.loanType)) {
    docs.push(
      doc('property_docs', 'Property Documents', 'Sale deed / Agreement to sell / Allotment letter'),
      doc('property_valuation', 'Property Valuation Report', 'Bank-empanelled valuer report (if available)', false),
      doc('approved_plan', 'Approved Building Plan', 'Builder-approved plan and NOC', false),
    );
  }

  return docs;
}

// ─── PROFESSIONAL DOCUMENTS ─────────────────────────────────────────────────

function getProfessionalDocs(state: ApplicationState): DocumentItem[] {
  const sub = state.professionalData?.subType;
  const docs: DocumentItem[] = [
    doc('itr_3yr', 'ITR (3 years)', 'Income Tax Returns with computation for last 3 financial years'),
    doc('bank_stmt_12m', 'Bank Statement (12 months)', 'Primary bank account statement for last 12 months'),
    doc('pnl_statement', 'Profit & Loss Statement', 'CA-certified P&L statement for last 2 years'),
    doc('balance_sheet', 'Balance Sheet', 'CA-certified Balance Sheet for last 2 years'),
  ];

  // Registration proof specific to profession
  switch (sub) {
    case 'CA':
      docs.push(doc('icai_cert', 'ICAI Membership Certificate', 'Institute of Chartered Accountants of India membership'));
      break;
    case 'CS':
      docs.push(doc('icsi_cert', 'ICSI Membership Certificate', 'Institute of Company Secretaries of India membership'));
      break;
    case 'DOCTOR':
      docs.push(
        doc('mci_reg', 'MCI / NMC Registration', 'Medical Council of India / National Medical Commission registration'),
        doc('clinic_proof', 'Clinic Establishment Proof', 'Clinic license / hospital employment letter'),
      );
      break;
    case 'LAWYER':
      docs.push(doc('bar_council', 'Bar Council Registration', 'State Bar Council enrolment certificate'));
      break;
  }

  docs.push(
    doc('practice_proof', 'Practice Proof', 'Office rent agreement / visiting card / letterhead'),
  );

  // Home Loan / LAP extras
  if (['HOME_LOAN', 'LAP'].includes(state.loanRequirements.loanType)) {
    docs.push(
      doc('property_docs', 'Property Documents', 'Sale deed / Agreement to sell / Allotment letter'),
      doc('property_valuation', 'Property Valuation Report', 'Bank-empanelled valuer report (if available)', false),
    );
  }

  return docs;
}

// ─── BUSINESS DOCUMENTS ─────────────────────────────────────────────────────

function getBusinessDocs(state: ApplicationState): DocumentItem[] {
  const program = state.businessData?.businessProgram;
  const docs: DocumentItem[] = [
    doc('business_proof', 'Business Registration', 'GST certificate / Shop Act license / Udyam registration / Certificate of Incorporation'),
    doc('business_address_proof', 'Business Address Proof', 'Utility bill of business premises / Lease agreement'),
  ];

  switch (program) {
    // ── ITR-BASED: Full financial trail ─────────────────────────────────
    case 'ITR_BASED':
      docs.push(
        doc('itr_2yr', 'ITR (2-3 years)', 'Income Tax Returns with computation for last 2-3 financial years'),
        doc('pnl_2yr', 'Profit & Loss Statement', 'CA-certified P&L for last 2 years'),
        doc('bs_2yr', 'Balance Sheet', 'CA-certified Balance Sheet for last 2 years'),
        doc('bank_stmt_12m', 'Bank Statement (12 months)', 'Primary business bank account for last 12 months'),
      );
      break;

    // ── GST-BASED: GST returns as primary income proof ──────────────────
    case 'GST_BASED':
      docs.push(
        doc('gst_cert', 'GST Registration Certificate', '15-digit GSTIN registration certificate'),
        doc('gst_returns', 'GST Returns (12-24 months)', 'GSTR-1 and GSTR-3B for last 12-24 months'),
        doc('bank_stmt_12m', 'Bank Statement (12 months)', 'Business bank account statement for last 12 months'),
        doc('itr_latest', 'Latest ITR (if available)', 'Most recent ITR filing (strengthens profile)', false),
      );
      break;

    // ── BANKING PROGRAM: ABB-tier based, no ITR needed ──────────────────
    case 'BANKING_PROGRAM':
      docs.push(
        doc('bank_stmt_12m', 'Bank Statement (12 months)', 'Primary business bank account — ABB is calculated from this'),
        doc('abb_declaration', 'ABB Declaration', `Self-declaration of Average Bank Balance tier: ₹${state.businessData?.abbTier || '?'}L+`),
        doc('cheque', 'Cancelled Cheque', 'Cancelled cheque of the primary business bank account'),
      );
      break;

    // ── CASH FLOW PROGRAM: Pure bank statement analysis ─────────────────
    case 'CASH_FLOW_PROGRAM':
      docs.push(
        doc('bank_stmt_12m', 'Bank Statement (12 months)', 'Primary bank account — used for cash flow analysis'),
        doc('bank_stmt_secondary', 'Secondary Bank Statement (if any)', 'Additional bank account statement (if multi-bank)', false),
        doc('cheque', 'Cancelled Cheque', 'Cancelled cheque of the primary business bank account'),
      );
      break;
  }

  // Home Loan / LAP — property documents
  if (['HOME_LOAN', 'LAP'].includes(state.loanRequirements.loanType)) {
    docs.push(
      doc('property_docs', 'Property Documents', 'Sale deed / Agreement to sell / Allotment letter'),
      doc('property_valuation', 'Property Valuation Report', 'Bank-empanelled valuer report', false),
      doc('approved_plan', 'Approved Building Plan', 'Builder-approved plan and NOC', false),
    );
  }

  return docs;
}

// ─── MASTER RESOLVER ────────────────────────────────────────────────────────

export function resolveDocumentMatrix(state: ApplicationState): DocumentItem[] {
  const result: DocumentItem[] = [...UNIVERSAL_DOCS];
  const employmentCategory = state.basicKYC.employmentCategory;
  const loanType = state.loanRequirements.loanType;

  // Add employment-path-specific documents
  switch (employmentCategory) {
    case 'SALARIED':
      result.push(...getSalariedDocs(state));
      break;
    case 'PROFESSIONAL':
      result.push(...getProfessionalDocs(state));
      break;
    case 'SELF_EMPLOYED':
      result.push(...getBusinessDocs(state));
      break;
    default:
      // No employment selected yet — return only universal docs
      break;
  }

  return result;
}
