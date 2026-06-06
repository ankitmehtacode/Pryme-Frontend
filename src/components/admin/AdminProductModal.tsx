import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingMatrixBuilder } from "@/components/admin/PricingMatrixBuilder";

export interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  banks: any[]; // The active partner banks
}

/* ── Reusable Field Components ──────────────────────────────────────── */

const FieldInput = ({ label, required, ...props }: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-2">
    <label className="text-[11px] font-semibold text-slate-400">{label}{required && " *"}</label>
    <input
      {...props}
      required={required}
      className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
    />
  </div>
);

const FieldSelect = ({ label, required, options, ...props }: { label: string; required?: boolean; options: { value: string; label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="space-y-2">
    <label className="text-[11px] font-semibold text-slate-400">{label}{required && " *"}</label>
    <select
      {...props}
      required={required}
      className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const FieldTextarea = ({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <div className="space-y-2">
    <label className="text-[11px] font-semibold text-slate-400">{label}</label>
    <textarea
      {...props}
      className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 min-h-[72px] resize-y"
    />
  </div>
);

const SectionHeading = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <h3 className={`text-sm font-semibold uppercase tracking-widest ${color} border-b border-[#103783]/20 pb-2`}>{children}</h3>
);

/* ── Default form state (all 48 LoanProduct fields) ──────────────────── */

const DEFAULTS: Record<string, any> = {
  // Core Identity
  productCode: "",
  productName: "",
  campaignName: "",
  loanType: "HOME_LOAN",
  lenderId: "",
  lenderName: "",
  interestType: "REDUCING",
  active: true,

  // Matrix Thresholds
  minCibil: 650,
  maxCibil: 900,
  maxEmiNmiRatio: 65, // UI percentage
  minLoanAmount: 100000,
  maxLoanAmount: 50000000,
  minTenureMonths: 12,
  maxTenureMonths: 240,
  ltv: "",

  // Pricing & Fees
  roi: 10.5,
  processingFee: 1.0,
  prepaymentCharges: "",
  foreclosureCharges: "",
  loginFees: "",
  legalTechnicalCharges: "",
  otherExpense: "",
  insuranceCharges: "",
  stampDuties: "",
  roiComputationLogic: "",

  // Documentation
  kycRequirement: "",
  incomeProof: "",
  bankStatementMonths: "",
  itrRequirementYears: "",
  salarySlipMonths: "",
  gstRequiredMonths: "",
  residenceProfile: "",
  additionalDocs: "",

  // Risk & Ratios
  obligationTreatment: "",
  dpdAllowed: false,
  writeOffAllowed: false,
  settlementAllowed: false,
  riskCategory: "",

  // Applicant Profile
  occupation: "",
  employerType: "",
  natureOfBusiness: "",
  industry: "",

  // Restrictions
  pincodeRestrictions: "",
  rejectionCodes: "",
  autoRejectConditions: "",

  // Campaign & Offers
  offerType: "",
  offerDetails: "",
  notes: "",
};

/* ── Main Modal ─────────────────────────────────────────────────────── */

export const AdminProductModal: React.FC<AdminProductModalProps> = ({ isOpen, onClose, onSubmit, initialData, banks }) => {
  const [formData, setFormData] = useState<any>({ ...DEFAULTS });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const matchingBank = banks.find(b => b.lenderCode === initialData.lenderId)
          || banks.find(b => b.bankName.toLowerCase().trim() === (initialData.lenderName || "").toLowerCase().trim());
        setFormData({
          ...DEFAULTS,
          ...initialData,
          lenderId: matchingBank ? matchingBank.id : (initialData.lenderId || ""),
          // Expand fractional database ratio (0.65) back to UI percentage (65)
          maxEmiNmiRatio: initialData.maxEmiNmiRatio ? Number((initialData.maxEmiNmiRatio * 100).toFixed(2)) : 65,
        });
      } else {
        setFormData({ ...DEFAULTS });
      }
    }
  }, [isOpen, initialData, banks]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    // Auto-sync lenderName when lenderId changes
    if (name === "lenderId") {
      const selectedBank = banks.find(b => String(b.id) === value);
      setFormData((prev: any) => ({
        ...prev,
        lenderId: value,
        lenderName: selectedBank ? selectedBank.bankName : ""
      }));
      return;
    }

    // Handle booleans
    if (name === "active" || name === "dpdAllowed" || name === "writeOffAllowed" || name === "settlementAllowed") {
      setFormData((prev: any) => ({ ...prev, [name]: value === "true" }));
      return;
    }

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : parseFloat(value)) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedBank = banks.find(b => String(b.id) === String(formData.lenderId));
    if (!selectedBank) return;

    const payload = {
      ...formData,
      lenderId: selectedBank.lenderCode,
      lenderName: selectedBank.bankName,
      // Scale FOIR from UI % to database decimal
      maxEmiNmiRatio: formData.maxEmiNmiRatio !== "" ? Number((formData.maxEmiNmiRatio / 100).toFixed(4)) : null,
    };

    onSubmit(payload);
  };

  const boolOptions = [
    { value: "false", label: "❌ No" },
    { value: "true", label: "✅ Yes" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#13131a] border border-[#103783]/20 rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#103783]/20 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {initialData ? "Edit Product (Full Matrix)" : "Add New Product — All 48 Fields"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">Every field from the <code className="text-purple-400">loan_products</code> table. Immediate impact on Matrix engine routing.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-8">

            {/* ═══════════════════════════════════════════════════════════
               SECTION 1: Core Identity & Partner
            ═══════════════════════════════════════════════════════════ */}
            <div className="space-y-4">
              <SectionHeading color="text-blue-500">1 — Core Identity & Partner</SectionHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">Partner Bank / Lender *</label>
                  <select required name="lenderId" value={formData.lenderId} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-4 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50">
                    <option value="" disabled>-- Select Active Partner --</option>
                    {banks.map((b) => (
                      <option key={b.id} value={b.id}>{b.bankName}</option>
                    ))}
                  </select>
                </div>
                <FieldInput label="Policy Code (Unique)" required type="text" name="productCode" value={formData.productCode} onChange={handleChange} maxLength={20} placeholder="e.g. HDFC_BL_001" pattern="^[A-Z0-9_]+$" title="Only uppercase letters, numbers, and underscores" />
                <FieldInput label="Friendly Product Name" required type="text" name="productName" value={formData.productName} onChange={handleChange} maxLength={200} placeholder="e.g. Business Loan Top Up" />
                <FieldInput label="Campaign / Display Name" type="text" name="campaignName" value={formData.campaignName} onChange={handleChange} maxLength={100} placeholder="e.g. HDFC Diwali Mega Offer" />
                <FieldSelect label="Standard Loan Type" required name="loanType" value={formData.loanType} onChange={handleChange} options={[
                  { value: "HOME_LOAN", label: "Home Loan (HL)" },
                  { value: "LOAN_AGAINST_PROPERTY", label: "Loan Against Property (LAP)" },
                  { value: "BUSINESS_LOAN", label: "Business Loan (BL)" },
                  { value: "PERSONAL_LOAN", label: "Personal Loan (PL)" },
                ]} />
                <FieldSelect label="Entity Status" name="active" value={formData.active ? "true" : "false"} onChange={handleChange} options={[
                  { value: "true", label: "● Active" },
                  { value: "false", label: "● Inactive / Draft" },
                ]} />
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
               SECTION 2: Matrix Policy Thresholds
            ═══════════════════════════════════════════════════════════ */}
            <div className="space-y-4">
              <SectionHeading color="text-amber-500">2 — Matrix Policy Thresholds</SectionHeading>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/30 p-4 border border-[#103783]/20 rounded-xl">
                <FieldInput label="Min CIBIL Score" required type="number" name="minCibil" value={formData.minCibil} onChange={handleChange} min={-1} max={900} />
                <FieldInput label="Max CIBIL Score" required type="number" name="maxCibil" value={formData.maxCibil} onChange={handleChange} min={-1} max={900} />
                <FieldInput label="Max FOIR / EMI ratio (%)" required type="number" name="maxEmiNmiRatio" value={formData.maxEmiNmiRatio} onChange={handleChange} min={10} max={100} step="0.5" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldInput label="Min Loan Amount (₹)" required type="number" name="minLoanAmount" value={formData.minLoanAmount} onChange={handleChange} />
                <FieldInput label="Max Loan Amount (₹)" required type="number" name="maxLoanAmount" value={formData.maxLoanAmount} onChange={handleChange} />
                <FieldInput label="Min Tenure (Months)" required type="number" name="minTenureMonths" value={formData.minTenureMonths} onChange={handleChange} />
                <FieldInput label="Max Tenure (Months)" required type="number" name="maxTenureMonths" value={formData.maxTenureMonths} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldInput label="Loan-to-Value / LTV (%)" type="number" name="ltv" value={formData.ltv} onChange={handleChange} step="0.01" placeholder="e.g. 0.75 for 75%" />
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
               SECTION 3: Pricing & Fees (Existing + 7 New)
            ═══════════════════════════════════════════════════════════ */}
            <div className="space-y-4">
              <SectionHeading color="text-emerald-500">3 — Pricing, Margins & Fees</SectionHeading>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FieldInput label="Base ROI (%)" required type="number" step="0.01" name="roi" value={formData.roi} onChange={handleChange} />
                <FieldInput label="Processing Fee (%)" required type="number" step="0.01" name="processingFee" value={formData.processingFee} onChange={handleChange} />
                <FieldSelect label="Interest Type" name="interestType" value={formData.interestType} onChange={handleChange} options={[
                  { value: "REDUCING", label: "Reducing" },
                  { value: "FLAT", label: "Flat" },
                ]} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/30 p-4 border border-[#103783]/20 rounded-xl">
                <FieldInput label="Prepayment Charges (%)" type="number" step="0.01" name="prepaymentCharges" value={formData.prepaymentCharges} onChange={handleChange} placeholder="e.g. 0.02" />
                <FieldInput label="Foreclosure Charges (%)" type="number" step="0.01" name="foreclosureCharges" value={formData.foreclosureCharges} onChange={handleChange} placeholder="e.g. 0.04" />
                <FieldInput label="Login Fees (₹)" type="number" name="loginFees" value={formData.loginFees} onChange={handleChange} placeholder="e.g. 5000" />
                <FieldInput label="Legal/Technical (₹)" type="number" name="legalTechnicalCharges" value={formData.legalTechnicalCharges} onChange={handleChange} placeholder="e.g. 15000" />
                <FieldInput label="Stamp Duties (₹)" type="number" name="stampDuties" value={formData.stampDuties} onChange={handleChange} placeholder="e.g. 1000" />
                <FieldInput label="Other Expense (₹)" type="number" name="otherExpense" value={formData.otherExpense} onChange={handleChange} placeholder="Optional" />
                <FieldInput label="Insurance Charges" type="text" name="insuranceCharges" value={formData.insuranceCharges} onChange={handleChange} placeholder="e.g. 0.5% or ₹5000" />
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
               SECTION 4: Documentation & Verification (8 NEW fields)
            ═══════════════════════════════════════════════════════════ */}
            <div className="space-y-4">
              <SectionHeading color="text-cyan-500">4 — Documentation & Verification</SectionHeading>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FieldInput label="KYC Requirement" type="text" name="kycRequirement" value={formData.kycRequirement} onChange={handleChange} placeholder="e.g. Aadhaar + PAN" />
                <FieldInput label="Income Proof" type="text" name="incomeProof" value={formData.incomeProof} onChange={handleChange} placeholder="e.g. Salary Slip + Form 16" />
                <FieldInput label="Bank Statement (Months)" type="number" name="bankStatementMonths" value={formData.bankStatementMonths} onChange={handleChange} placeholder="e.g. 6" />
                <FieldInput label="ITR Required (Years)" type="number" name="itrRequirementYears" value={formData.itrRequirementYears} onChange={handleChange} placeholder="e.g. 2" />
                <FieldInput label="Salary Slips (Months)" type="number" name="salarySlipMonths" value={formData.salarySlipMonths} onChange={handleChange} placeholder="e.g. 3" />
                <FieldInput label="GST Required (Months)" type="number" name="gstRequiredMonths" value={formData.gstRequiredMonths} onChange={handleChange} placeholder="e.g. 12" />
                <FieldInput label="Residence Profile" type="text" name="residenceProfile" value={formData.residenceProfile} onChange={handleChange} placeholder="e.g. OWNED, RENTED" />
                <FieldInput label="Additional Docs" type="text" name="additionalDocs" value={formData.additionalDocs} onChange={handleChange} placeholder="e.g. Rent Agreement" />
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
               SECTION 5: Risk, Ratios & Restrictions (13 NEW fields)
            ═══════════════════════════════════════════════════════════ */}
            <div className="space-y-4">
              <SectionHeading color="text-red-500">5 — Risk, Ratios & Restrictions</SectionHeading>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FieldInput label="Obligation Treatment" type="text" name="obligationTreatment" value={formData.obligationTreatment} onChange={handleChange} placeholder="e.g. 50% of EMI" />
                <FieldSelect label="DPD Allowed" name="dpdAllowed" value={String(formData.dpdAllowed)} onChange={handleChange} options={boolOptions} />
                <FieldSelect label="Write-Off Allowed" name="writeOffAllowed" value={String(formData.writeOffAllowed)} onChange={handleChange} options={boolOptions} />
                <FieldSelect label="Settlement Allowed" name="settlementAllowed" value={String(formData.settlementAllowed)} onChange={handleChange} options={boolOptions} />
                <FieldInput label="Risk Category" type="text" name="riskCategory" value={formData.riskCategory} onChange={handleChange} placeholder="e.g. LOW, MEDIUM, HIGH" />
              </div>

              <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider pt-2">Applicant Profile Constraints</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FieldInput label="Occupation" type="text" name="occupation" value={formData.occupation} onChange={handleChange} placeholder="e.g. Salaried, Business" />
                <FieldInput label="Employer Type" type="text" name="employerType" value={formData.employerType} onChange={handleChange} placeholder="e.g. MNC, Govt, PSU" />
                <FieldInput label="Nature of Business" type="text" name="natureOfBusiness" value={formData.natureOfBusiness} onChange={handleChange} placeholder="e.g. Manufacturing" />
                <FieldInput label="Industry" type="text" name="industry" value={formData.industry} onChange={handleChange} placeholder="e.g. IT, FMCG" />
              </div>

              <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider pt-2">Deny-Lists & Auto-Reject</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FieldTextarea label="Pincode Restrictions" name="pincodeRestrictions" value={formData.pincodeRestrictions} onChange={handleChange} placeholder="Comma-separated or JSON list" />
                <FieldTextarea label="Rejection Codes" name="rejectionCodes" value={formData.rejectionCodes} onChange={handleChange} placeholder="e.g. LOW_CIBIL, HIGH_EMI" />
                <FieldTextarea label="Auto-Reject Conditions" name="autoRejectConditions" value={formData.autoRejectConditions} onChange={handleChange} placeholder="e.g. CIBIL < 500 AND DPD > 90" />
              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════
               SECTION 6: Campaign & Offers (3 NEW fields)
            ═══════════════════════════════════════════════════════════ */}
            <div className="space-y-4">
              <SectionHeading color="text-purple-500">6 — Campaign, Offers & Internal Notes</SectionHeading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldInput label="Offer Type" type="text" name="offerType" value={formData.offerType} onChange={handleChange} placeholder="e.g. FESTIVE, TOPUP, BALANCE_TRANSFER" />
                <FieldTextarea label="Offer Details" name="offerDetails" value={formData.offerDetails} onChange={handleChange} placeholder="Full description of the offer terms" />
              </div>
              <FieldTextarea label="Internal Notes / Memos" name="notes" value={formData.notes} onChange={handleChange} placeholder="Notes visible only to admins (not shown to customers)" />
            </div>

            {/* ═══════════════════════════════════════════════════════════
               Dynamic ROI Pricing Matrix (Optional)
            ═══════════════════════════════════════════════════════════ */}
            <div className="space-y-4">
              <SectionHeading color="text-cyan-500">Dynamic ROI Matrix (Optional)</SectionHeading>
              <p className="text-[11px] text-slate-500 -mt-2">
                Define tiered interest rates based on CIBIL, employment, and loan amount. When configured, this overrides the static Base ROI above.
              </p>
              <PricingMatrixBuilder
                value={formData.roiComputationLogic || ""}
                onChange={(spel) => setFormData((prev: any) => ({ ...prev, roiComputationLogic: spel }))}
                baseRate={formData.roi}
              />
            </div>

            <div className="bg-blue-900/10 border border-blue-900/30 p-3 rounded-lg flex gap-3 text-blue-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs">
                Saving this profile will immediately activate it within the Policy Matrix engine.
                Any leads matching <code className="text-purple-400">{formData.productCode || 'this code'}</code> parameters will be eligible for routing to <code className="text-purple-400">{formData.lenderName || 'the assigned partner'}</code>.
              </p>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#103783]/20 bg-slate-900/50 flex justify-end gap-3 rounded-b-xl">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">Cancel</Button>
          <Button type="submit" form="product-form" className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-none">
            <Save className="w-4 h-4 mr-2" />
            {initialData ? "Save Changes" : "Create Entity"}
          </Button>
        </div>
      </div>
    </div>
  );
};
