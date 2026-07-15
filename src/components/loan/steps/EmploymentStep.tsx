import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, Building2, Landmark, IndianRupee, Calendar, 
  CreditCard, GraduationCap, Stethoscope, Scale, 
  BriefcaseBusiness, FileText, Check, Home, AlertCircle 
} from "lucide-react";
import { SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useApplicationStore } from "@/store/applicationStore";
import { cn } from "@/lib/utils";
import { ValidatedInput, StyledSelect, PillSelector } from "../shared/FormComponents";
import { EMPLOYMENT_OPTIONS } from "../shared/constants";
import type { 
  EmploymentType, SalariedSubType, ProfessionalSubType, 
  BusinessSubType, HomePropertyType, CommercialPropertyType, IndustrialPropertyType, PropertyType
} from "@/lib/applicationTypes";

// Mirrors SurrogateIncomeResolver.resolveGst()'s default margin table on the
// backend: monthly income = turnover * margin / 12, not turnover / 12 alone.
// Also mirrored in LoanApplicationForm.tsx's businessSubType heuristic.
const GST_MARGIN_BY_INDUSTRY: Record<string, number> = {
  Service: 0.10,
  Retail: 0.12,
  Wholesale: 0.08,
  Manufacturing: 0.04,
};

const calculateVintageYears = (dateStr: string): number => {
  if (!dateStr) return 0;
  const regDate = new Date(dateStr);
  if (isNaN(regDate.getTime())) return 0;
  const diffTime = Date.now() - regDate.getTime();
  if (diffTime < 0) return 0;
  const diffYears = diffTime / (365.25 * 24 * 60 * 60 * 1000);
  return Math.floor(diffYears);
};

interface EmploymentStepProps {
  cardCn: string;
}

export const EmploymentStep: React.FC<EmploymentStepProps> = ({ cardCn }) => {
  const rawStore = useApplicationStore();
  
  const getInputValue = (val: any) => {
    if (val === undefined || val === null) return "";
    return val;
  };

  // Wrap rawStore to guarantee nested objects exist during early hydration phases
  const store = {
    ...rawStore,
    basicKYC: rawStore.basicKYC || {
      fullName: '',
      mobileNumber: '',
      mobileVerified: false,
      email: '',
      dateOfBirth: '',
      panNumber: '',
      state: '',
      city: '',
      pinCode: '',
      employmentType: null,
    },
    financialDetails: rawStore.financialDetails || { path: null, data: {} },
    loanRequirements: rawStore.loanRequirements || {
      loanType: 'PERSONAL_LOAN' as any,
      loanAmount: 500000,
      tenureYears: 5,
      purpose: '',
      cibilScore: 750,
    },
    validationErrors: rawStore.validationErrors || {},
  };

  const errors = store.validationErrors;
  const setErrors = store.setValidationErrors || (() => {});
  
  return (
    <div id="section-employment" className={cn(cardCn, 'transition-all duration-500')}>
      <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-[#0d1829] border border-border dark:border-white/[0.06] flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary dark:text-[#103783]" />
          </div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">Employment & Income</h3>
        </div>

        <div className="space-y-6 relative z-10">
          <PillSelector<EmploymentType>
            label="What describes you best?"
            icon={Briefcase}
            options={EMPLOYMENT_OPTIONS}
            value={store.basicKYC.employmentType}
            onChange={(v) => {
              store.updateBasicKYC({ employmentType: v });
              setErrors({});
            }}
          />
          {errors.employmentType && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 font-medium ml-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.employmentType}
            </motion.p>
          )}

          {/* ─── DYNAMIC BRANCHING ─────────────────────────────────── */}
          <AnimatePresence mode="wait">

            {/* ── SALARIED PATH ──────────────────────────────────── */}
            {store.basicKYC.employmentType === "SALARIED" && (
              <motion.div
                key="salaried"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="space-y-5 overflow-hidden"
              >
                <div className="h-px bg-gradient-to-r from-transparent via-border dark:via-white/[0.06] to-transparent" />

                <PillSelector<SalariedSubType>
                  label="Employer Type"
                  options={[
                    { value: "PRIVATE", label: "Private Sector", icon: Building2 },
                    { value: "GOVERNMENT", label: "Government / PSU", icon: Landmark },
                  ]}
                  value={store.financialDetails.path === "SALARIED" ? store.financialDetails.data.subType : null}
                  onChange={(v) => store.updateSalariedDetails({ subType: v })}
                />

                {store.financialDetails.path === "SALARIED" && store.financialDetails.data.subType === "PRIVATE" && (
                  <div className="mb-5">
                    <StyledSelect
                      label="Company Entity Type"
                      icon={Building2}
                      value={store.financialDetails.data.companyType || ""}
                      onValueChange={(v) => store.updateSalariedDetails({ companyType: v as any })}
                      placeholder="Select Company Type"
                      error={errors.companyType}
                    >
                      <SelectItem value="PRIVATE_LIMITED">Private Limited</SelectItem>
                      <SelectItem value="PUBLIC_LIMITED_LISTED">Public Limited (Listed)</SelectItem>
                      <SelectItem value="PUBLIC_LIMITED_UNLISTED">Public Limited (Unlisted)</SelectItem>
                      <SelectItem value="LLP">Limited Liability Partnership (LLP)</SelectItem>
                      <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                      <SelectItem value="PROPRIETORSHIP">Proprietorship</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </StyledSelect>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ValidatedInput
                    label="Company Name"
                    placeholder="Tata Consultancy Services"
                    icon={Building2}
                    value={store.financialDetails.path === "SALARIED" ? store.financialDetails.data.companyName : ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateSalariedDetails({ companyName: e.target.value })}
                    isValid={(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.companyName || "" : "").length >= 2}
                    error={errors.companyName}
                  />
                  <ValidatedInput
                    label="Designation"
                    placeholder="Software Engineer"
                    icon={Briefcase}
                    value={store.financialDetails.path === "SALARIED" ? store.financialDetails.data.designation : ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateSalariedDetails({ designation: e.target.value })}
                    isValid={(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.designation || "" : "").length >= 2}
                    error={errors.designation}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <ValidatedInput
                    label="Gross Monthly Income (₹)"
                    type="number"
                    placeholder="100000"
                    icon={IndianRupee}
                    value={store.financialDetails.path === "SALARIED" ? (store.financialDetails.data.grossSalary || "") : ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateSalariedDetails({ grossSalary: Number(e.target.value) })}
                    isValid={(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.grossSalary : 0) >= 10000}
                  />
                  <ValidatedInput
                    label="Net Monthly Income (₹)"
                    type="number"
                    placeholder="85000"
                    icon={IndianRupee}
                    value={store.financialDetails.path === "SALARIED" ? (store.financialDetails.data.netMonthlySalary || "") : ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateSalariedDetails({ netMonthlySalary: Number(e.target.value) })}
                    isValid={(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.netMonthlySalary : 0) >= 10000}
                    error={errors.netMonthlySalary}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ValidatedInput
                    label="Total Experience (Years)"
                    type="number"
                    placeholder="5"
                    icon={Calendar}
                    value={store.financialDetails.path === "SALARIED" ? (store.financialDetails.data.totalExperienceYears || "") : ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateSalariedDetails({ totalExperienceYears: Number(e.target.value) })}
                    isValid={(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.totalExperienceYears : 0) > 0}
                    error={errors.totalExperienceYears}
                  />
                  <ValidatedInput
                    label="Current Experience (Years)"
                    type="number"
                    placeholder="2"
                    icon={Calendar}
                    value={store.financialDetails.path === "SALARIED" ? (store.financialDetails.data.currentCompanyYears || "") : ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateSalariedDetails({ currentCompanyYears: Number(e.target.value) })}
                    isValid={(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.currentCompanyYears : 0) > 0}
                    error={errors.currentCompanyYears}
                  />
                </div>

                {/* ── EMI Disclosure (Step A + conditional Step B) ── */}
                <div className="h-px bg-gradient-to-r from-transparent via-border dark:via-white/[0.06] to-transparent" />

                <ValidatedInput
                  label="Total Monthly EMI across all loans (₹)"
                  type="number"
                  placeholder="e.g. 45000"
                  icon={CreditCard}
                  value={getInputValue(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.existingEMI : null)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateSalariedDetails({ existingEMI: e.target.value === "" ? undefined : Number(e.target.value) })}
                  isValid={(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.existingEMI : -1) >= 0}
                />

                <AnimatePresence>
                  {store.financialDetails.path === "SALARIED" && (store.financialDetails.data.existingEMI ?? 0) > 0 && (
                    <motion.div
                      key="salaried-maturity"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 dark:bg-[#103783]/10">
                        <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                          <IndianRupee className="w-3.5 h-3.5 text-primary dark:text-[#103783]" />
                          Are any of these loans finishing in the next 12 months? If yes, enter the EMI of those specific loans.
                        </p>
                        <ValidatedInput
                          label="EMI of loans closing in next 12 months (₹)"
                          type="number"
                          placeholder="e.g. 15000 (or 0 if none)"
                          icon={IndianRupee}
                          value={getInputValue(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.maturingLoanEMI : null)}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateSalariedDetails({ maturingLoanEMI: e.target.value === "" ? undefined : Number(e.target.value) })}
                          isValid={(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.maturingLoanEMI ?? 0 : 0) >= 0}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── PROFESSIONAL PATH ──────────────────────────────── */}
            {store.basicKYC.employmentType === "PROFESSIONAL" && (
              <motion.div
                key="professional"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="space-y-5 overflow-hidden"
              >
                <div className="h-px bg-gradient-to-r from-transparent via-border dark:via-white/[0.06] to-transparent" />

                <PillSelector<ProfessionalSubType>
                  label="Profession"
                  options={[
                    { value: "CA", label: "Chartered Accountant", icon: GraduationCap },
                    { value: "CS", label: "Company Secretary", icon: GraduationCap },
                    { value: "DOCTOR", label: "Doctor", icon: Stethoscope },
                    { value: "LAWYER", label: "Lawyer", icon: Scale },
                  ]}
                  value={store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.subType : null}
                  onChange={(v) => store.updateProfessionalDetails({ subType: v })}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ValidatedInput
                    label="Practice / Firm Name"
                    placeholder="Sharma & Associates"
                    icon={Building2}
                    value={store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.practiceName : ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateProfessionalDetails({ practiceName: e.target.value })}
                    isValid={(store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.practiceName || "" : "").length >= 2}
                    error={errors.practiceName}
                  />
                </div>

                {/* ── Practice Vintage — split into total + current firm ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ValidatedInput
                    label="Total Practice Vintage (Years)"
                    type="number"
                    placeholder="e.g. 12"
                    icon={Calendar}
                    value={store.financialDetails.path === "PROFESSIONAL" ? (store.financialDetails.data.totalPracticeYears || "") : ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const v = Number(e.target.value);
                      store.updateProfessionalDetails({ totalPracticeYears: v, practiceYears: v });
                    }}
                    isValid={(store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.totalPracticeYears : 0) > 0}
                    error={errors.practiceYears}
                  />
                  <ValidatedInput
                    label="Years in Current Firm"
                    type="number"
                    placeholder="e.g. 4"
                    icon={Briefcase}
                    value={store.financialDetails.path === "PROFESSIONAL" ? (store.financialDetails.data.yearsInCurrentFirm || "") : ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateProfessionalDetails({ yearsInCurrentFirm: Number(e.target.value) })}
                    isValid={(store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.yearsInCurrentFirm : 0) > 0}
                  />
                </div>

                {/* ── Income fields ──────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ValidatedInput
                    label="Annual Gross Receipts (Yearly, ₹ as per itr)"
                    type="number"
                    placeholder="e.g. 3600000"
                    icon={IndianRupee}
                    value={store.financialDetails.path === "PROFESSIONAL" ? (store.financialDetails.data.annualGrossReceipts || "") : ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateProfessionalDetails({ annualGrossReceipts: Number(e.target.value) })}
                    isValid={(store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.annualGrossReceipts : 0) > 0}
                  />
                  <ValidatedInput
                    label="Professional Income as per ITR (Yearly, ₹)"
                    type="number"
                    placeholder="e.g. 500000"
                    icon={IndianRupee}
                    value={store.financialDetails.path === "PROFESSIONAL" ? (store.financialDetails.data.netProfit || "") : ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const val = Number(e.target.value);
                      store.updateProfessionalDetails({
                        netProfit: val,
                        netMonthlyIncome: Math.round(val / 12),
                      });
                    }}
                    isValid={(store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.netProfit || 0 : 0) >= 10000}
                    error={errors.netMonthlyIncome}
                  />
                  <StyledSelect
                    label="ITR Filing (Years)"
                    icon={Calendar}
                    value={store.financialDetails.path === "PROFESSIONAL" && store.financialDetails.data.itrFiledYears !== undefined && store.financialDetails.data.itrFiledYears !== null ? store.financialDetails.data.itrFiledYears.toString() : undefined}
                    onValueChange={(v) => store.updateProfessionalDetails({ itrFiledYears: Number(v) })}
                    placeholder="Select years of ITR filed"
                  >
                    <SelectItem value="0">Not Filed</SelectItem>
                    <SelectItem value="1">1 Year</SelectItem>
                    <SelectItem value="2">2 Years</SelectItem>
                    <SelectItem value="3">3+ Years</SelectItem>
                  </StyledSelect>
                  <ValidatedInput
                    label="Last 12 Months GST Turnover (₹)"
                    type="number"
                    placeholder="e.g. 6000000"
                    icon={IndianRupee}
                    value={store.financialDetails.path === "PROFESSIONAL" ? (store.financialDetails.data.last12MonthsGstTurnover ?? "") : ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.value === "" ? undefined : Math.max(0, Number(e.target.value));
                      // Professionals are always the "Service" GST margin bucket (see
                      // Apply.tsx's hardcoded businessType: "Service" for the SEP path).
                      store.updateProfessionalDetails({
                        last12MonthsGstTurnover: val,
                        netMonthlyIncome: val !== undefined ? Math.round((val * GST_MARGIN_BY_INDUSTRY.Service) / 12) : 0,
                      });
                    }}
                    isValid={(store.financialDetails.path === "PROFESSIONAL" ? (store.financialDetails.data.last12MonthsGstTurnover ?? -1) : -1) >= 0}
                  />
                </div>

                {store.loanRequirements?.loanType === 'LAP' || store.loanRequirements?.loanType === 'HOME_LOAN' ? (
                  <div className="mt-6 p-4 rounded-xl border border-[#DDA35D]/30 bg-[#FDFBF7] dark:bg-[#DDA35D]/5 space-y-4">
                    <h4 className="text-xs font-bold text-[#DDA35D] uppercase tracking-widest flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5" /> P&L Normalisation (Property Loan)
                    </h4>
                    
                    <ValidatedInput
                      label="Annual Depreciation Add-back (₹)"
                      type="number"
                      placeholder="e.g. 240000 — from P&L / Balance Sheet"
                      icon={IndianRupee}
                      value={store.financialDetails.path === "PROFESSIONAL" && store.financialDetails.data.annualDepreciation !== undefined ? store.financialDetails.data.annualDepreciation : ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateProfessionalDetails({ annualDepreciation: e.target.value === "" ? undefined : Number(e.target.value) })}
                      isValid={(store.financialDetails.path === "PROFESSIONAL" ? (store.financialDetails.data.annualDepreciation || 0) : 0) >= 0}
                    />

                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 bg-background/50">
                      <Checkbox 
                        id="ca-certified-professional"
                        checked={store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.caCertifiedAccounts : false}
                        onCheckedChange={(checked) => store.updateProfessionalDetails({ caCertifiedAccounts: checked === true })}
                        className="mt-1"
                      />
                      <div className="space-y-1 leading-none">
                        <label
                          htmlFor="ca-certified-professional"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Accounts are CA-Certified / Audited
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Declaring CA-certified accounts improves creditworthiness assessment and may unlock better rates.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}


                {/* ── EMI Disclosure (Step A + conditional Step B) ── */}
                <div className="h-px bg-gradient-to-r from-transparent via-border dark:via-white/[0.06] to-transparent" />

                <ValidatedInput
                  label="Total Monthly EMI across all loans (₹)"
                  type="number"
                  placeholder="e.g. 45000"
                  icon={CreditCard}
                  value={getInputValue(store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.existingEMI : null)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateProfessionalDetails({ existingEMI: e.target.value === "" ? undefined : Number(e.target.value) })}
                  isValid={(store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.existingEMI : -1) >= 0}
                />

                <AnimatePresence>
                  {store.financialDetails.path === "PROFESSIONAL" && (store.financialDetails.data.existingEMI ?? 0) > 0 && (
                    <motion.div
                      key="professional-maturity"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 dark:bg-[#103783]/10">
                        <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                          <IndianRupee className="w-3.5 h-3.5 text-primary dark:text-[#103783]" />
                          Are any of these loans finishing in the next 12 months? If yes, enter the EMI of those specific loans.
                        </p>
                        <ValidatedInput
                          label="EMI of loans closing in next 12 months (₹)"
                          type="number"
                          placeholder="e.g. 15000 (or 0 if none)"
                          icon={IndianRupee}
                          value={getInputValue(store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.maturingLoanEMI : null)}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateProfessionalDetails({ maturingLoanEMI: e.target.value === "" ? undefined : Number(e.target.value) })}
                          isValid={(store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.maturingLoanEMI ?? 0 : 0) >= 0}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── SELF-EMPLOYED / BUSINESS PATH ──────────────────── */}
            {store.basicKYC.employmentType === "SELF_EMPLOYED" && (
              <motion.div
                key="business"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="space-y-5 overflow-hidden"
              >
                <div className="h-px bg-gradient-to-r from-transparent via-border dark:via-white/[0.06] to-transparent" />

                {/* Sub-section: Core Business Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span className="w-1.5 h-3.5 rounded-full bg-primary dark:bg-blue-500" />
                    Core Business Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ValidatedInput
                      label="Business Name"
                      placeholder="Sharma Enterprises"
                      icon={BriefcaseBusiness}
                      value={store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.businessName : ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBusinessDetails({ businessName: e.target.value })}
                      isValid={(store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.businessName || "" : "").length >= 2}
                      error={errors.businessName}
                    />
                    <ValidatedInput
                      label="GST Registration Date (Optional)"
                      type="date"
                      icon={Calendar}
                      value={store.financialDetails.path === "SELF_EMPLOYED" ? (store.financialDetails.data.gstRegistrationDate || "") : ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const dateVal = e.target.value;
                        const years = calculateVintageYears(dateVal);
                        store.updateBusinessDetails({
                          gstRegistrationDate: dateVal,
                          vintageYears: years
                        });
                      }}
                      isValid={(() => {
                        const regDateStr = store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.gstRegistrationDate : "";
                        if (!regDateStr) return true; // optional — blank is valid
                        const regDate = new Date(regDateStr);
                        return !isNaN(regDate.getTime()) && regDate.getTime() <= Date.now();
                      })()}
                      error={errors.gstRegistrationDate}
                    />
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-white/[0.04]" />

                {/* Sub-section: GST Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span className="w-1.5 h-3.5 rounded-full bg-primary dark:bg-blue-500" />
                    GST Filing Details <span className="text-xs font-normal text-slate-400 dark:text-slate-500">(Optional if not registered)</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ValidatedInput
                      label="Last 12 Months GST Turnover (₹)"
                      type="number"
                      placeholder="e.g. 6000000"
                      icon={IndianRupee}
                      value={store.financialDetails.path === "SELF_EMPLOYED" ? (store.financialDetails.data.last12MonthsGstTurnover || "") : ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const val = Number(e.target.value);
                        const industry = store.financialDetails.path === "SELF_EMPLOYED" ? (store.financialDetails.data.industryType || "Service") : "Service";
                        const margin = GST_MARGIN_BY_INDUSTRY[industry] ?? GST_MARGIN_BY_INDUSTRY.Service;
                        store.updateBusinessDetails({
                          last12MonthsGstTurnover: val,
                          monthlyGSTTurnover: Math.round(val / 12),
                          netMonthlyIncome: Math.round((val * margin) / 12),
                          subType: val > 0 ? "GST_BASED" : "ITR_BASED"
                        });
                      }}
                      isValid={(store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.last12MonthsGstTurnover || 0 : 0) >= 0}
                    />
                    <StyledSelect
                      label="Business Industry Type"
                      icon={Briefcase}
                      value={store.financialDetails.path === "SELF_EMPLOYED" ? (store.financialDetails.data.industryType || "Service") : undefined}
                      onValueChange={(v) => {
                        const turnover = store.financialDetails.path === "SELF_EMPLOYED" ? (store.financialDetails.data.last12MonthsGstTurnover || 0) : 0;
                        const margin = GST_MARGIN_BY_INDUSTRY[v] ?? GST_MARGIN_BY_INDUSTRY.Service;
                        store.updateBusinessDetails({
                          industryType: v,
                          // Re-derive income from turnover when the industry (and thus margin)
                          // changes after turnover was already entered -- otherwise it stays
                          // stale at whatever margin was in effect when turnover was typed.
                          ...(turnover > 0 ? { netMonthlyIncome: Math.round((turnover * margin) / 12) } : {}),
                        });
                      }}
                      placeholder="Select industry type"
                    >
                      <SelectItem value="Service">Service</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Wholesale">Wholesale</SelectItem>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    </StyledSelect>
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-white/[0.04]" />

                {/* Sub-section: ITR Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span className="w-1.5 h-3.5 rounded-full bg-primary dark:bg-blue-500" />
                    ITR Filing &amp; Income Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ValidatedInput
                      label="Annual Turnover (Yearly, ₹)"
                      type="number"
                      placeholder="5000000"
                      icon={IndianRupee}
                      value={store.financialDetails.path === "SELF_EMPLOYED" ? (store.financialDetails.data.annualTurnover || "") : ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const val = Number(e.target.value);
                        store.updateBusinessDetails({
                          annualTurnover: val,
                          subType: "ITR_BASED"
                        });
                      }}
                      isValid={(store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.annualTurnover || 0 : 0) >= 0}
                    />
                    <ValidatedInput
                      label="Business Income as per ITR (Yearly, ₹)"
                      type="number"
                      placeholder="e.g. 500000"
                      icon={IndianRupee}
                      value={store.financialDetails.path === "SELF_EMPLOYED" ? (store.financialDetails.data.netProfit || "") : ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const val = Number(e.target.value);
                        store.updateBusinessDetails({
                          netProfit: val,
                          netMonthlyIncome: Math.round(val / 12),
                          subType: "ITR_BASED"
                        });
                      }}
                      isValid={(store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.netProfit || 0 : 0) >= 10000}
                      error={errors.netMonthlyIncome}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <StyledSelect
                      label="ITR Filing (Years)"
                      icon={FileText}
                      value={store.financialDetails.path === "SELF_EMPLOYED" && store.financialDetails.data.itrFiledYears !== undefined && store.financialDetails.data.itrFiledYears !== null ? store.financialDetails.data.itrFiledYears.toString() : undefined}
                      onValueChange={(v) => {
                        const val = Number(v);
                        store.updateBusinessDetails({
                          itrFiledYears: val,
                          subType: "ITR_BASED"
                        });
                      }}
                      placeholder="Select years of ITR filed"
                    >
                      <SelectItem value="0">Not Filed</SelectItem>
                      <SelectItem value="1">1 Year</SelectItem>
                      <SelectItem value="2">2 Years</SelectItem>
                      <SelectItem value="3">3 or more Years</SelectItem>
                    </StyledSelect>
                  </div>

                  {/* Depreciation add-back — only relevant for property-collateral loans */}
                  <AnimatePresence>
                    {store.loanRequirements.loanType === "AUTO_LOAN" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <ValidatedInput
                          label="On Road Price of Vehicle (₹)"
                          type="number"
                          placeholder="1050000"
                          icon={IndianRupee}
                          value={store.loanRequirements.vehicleOnRoadPrice || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateLoanRequirements({ vehicleOnRoadPrice: Number(e.target.value) })}
                          isValid={(store.loanRequirements.vehicleOnRoadPrice || 0) > 100000}
                        />
                        <ValidatedInput
                          label="Quotation of Vehicle (₹)"
                          type="number"
                          placeholder="850000"
                          icon={IndianRupee}
                          value={store.loanRequirements.vehicleQuotationPrice || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateLoanRequirements({ vehicleQuotationPrice: Number(e.target.value) })}
                          isValid={(store.loanRequirements.vehicleQuotationPrice || 0) > 100000}
                        />
                      </div>
                    )}
                    
                    {(store.loanRequirements.loanType === "HOME_LOAN" || store.loanRequirements.loanType === "LAP") && (
                      <motion.div
                        key="depreciation-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-1.5">
                            <IndianRupee className="w-3.5 h-3.5" />
                            P&amp;L Normalisation (Property Loan)
                          </p>
                          <ValidatedInput
                            label="Annual Depreciation Add-back (₹)"
                            type="number"
                            placeholder="e.g. 240000 — from P&L / Balance Sheet"
                            icon={IndianRupee}
                            value={store.financialDetails.path === "SELF_EMPLOYED" ? (store.financialDetails.data.depreciation || "") : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBusinessDetails({ depreciation: Number(e.target.value) })}
                            isValid={(store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.depreciation || 0 : 0) >= 0}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── CA Certification toggle — universal signal for all SELF_EMPLOYED ── */}
                <div className="flex items-start gap-4 p-4 rounded-xl border border-border dark:border-white/[0.06] bg-secondary/30 dark:bg-white/[0.02]">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={!!(store.financialDetails.path === "SELF_EMPLOYED" && store.financialDetails.data.isCaCertifiedOrAudited)}
                    onClick={() => {
                      const current = store.financialDetails.path === "SELF_EMPLOYED" ? !!store.financialDetails.data.isCaCertifiedOrAudited : false;
                      store.updateBusinessDetails({ isCaCertifiedOrAudited: !current });
                    }}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                      store.financialDetails.path === "SELF_EMPLOYED" && store.financialDetails.data.isCaCertifiedOrAudited
                        ? "bg-primary border-primary dark:bg-[#103783] dark:border-[#103783]"
                        : "border-border dark:border-white/20 bg-transparent"
                    }`}
                  >
                    {store.financialDetails.path === "SELF_EMPLOYED" && store.financialDetails.data.isCaCertifiedOrAudited && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      Accounts are CA-Certified / Audited
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      Declaring CA-certified accounts improves creditworthiness assessment and may unlock better rates.
                    </p>
                  </div>
                </div>

                {/* ── EMI Disclosure (Step A + conditional Step B) ── */}
                <div className="h-px bg-gradient-to-r from-transparent via-border dark:via-white/[0.06] to-transparent" />

                <ValidatedInput
                  label="Total Monthly EMI across all loans (₹)"
                  type="number"
                  placeholder="e.g. 45000"
                  icon={CreditCard}
                  value={getInputValue(store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.existingEMI : null)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBusinessDetails({ existingEMI: e.target.value === "" ? undefined : Number(e.target.value) })}
                  isValid={(store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.existingEMI : -1) >= 0}
                />

                <AnimatePresence>
                  {store.financialDetails.path === "SELF_EMPLOYED" && (store.financialDetails.data.existingEMI ?? 0) > 0 && (
                    <motion.div
                      key="business-maturity"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 dark:bg-[#103783]/10">
                        <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                          <IndianRupee className="w-3.5 h-3.5 text-primary dark:text-[#103783]" />
                          Are any of these loans finishing in the next 12 months? If yes, enter the EMI of those specific loans.
                        </p>
                        <ValidatedInput
                          label="EMI of loans closing in next 12 months (₹)"
                          type="number"
                          placeholder="e.g. 15000 (or 0 if none)"
                          icon={IndianRupee}
                          value={getInputValue(store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.maturingLoanEMI : null)}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBusinessDetails({ maturingLoanEMI: e.target.value === "" ? undefined : Number(e.target.value) })}
                          isValid={(store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.maturingLoanEMI ?? 0 : 0) >= 0}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Conditional Property Selectors based on Loan Type (Moved to Stage 2) ── */}
          <AnimatePresence mode="popLayout">
            {(store.loanRequirements.loanType === "HOME_LOAN" || store.loanRequirements.loanType === "LAP" || store.loanRequirements.loanType === "BUSINESS_LOAN") && (
              <motion.div
                key="property-selectors"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
                className="p-5 rounded-2xl border border-primary/10 bg-primary/5 dark:bg-[#103783]/10 overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Home className="w-4 h-4 text-primary dark:text-[#103783]" />
                  <h4 className="text-sm font-bold text-foreground">Property Type Selection</h4>
                </div>
                <div className="space-y-4">
                  {store.loanRequirements.loanType === "LAP" && (
                    <StyledSelect
                      label="Type of Property"
                      value={store.loanRequirements.propertyCategory || ""}
                      onValueChange={(v) => store.updateLoanRequirements({ propertyCategory: v as 'RESIDENTIAL' | 'COMMERCIAL_INDUSTRIAL', propertyType: undefined, businessPropertyCategory: undefined })}
                      placeholder="Select category"
                    >
                      <SelectItem value="RESIDENTIAL" className="cursor-pointer">Residential</SelectItem>
                      <SelectItem value="COMMERCIAL_INDUSTRIAL" className="cursor-pointer">Commercial & Industrial</SelectItem>
                    </StyledSelect>
                  )}

                  {(store.loanRequirements.loanType === "HOME_LOAN" || (store.loanRequirements.loanType === "LAP" && store.loanRequirements.propertyCategory === "RESIDENTIAL")) && (
                    <StyledSelect
                      label="Property"
                      value={store.loanRequirements.propertyType || ""}
                      onValueChange={(v) => store.updateLoanRequirements({ propertyType: v as Extract<PropertyType, HomePropertyType> })}
                      placeholder="Select property type"
                    >
                      <SelectItem value="FLAT" className="cursor-pointer">Flat / Apartment</SelectItem>
                      <SelectItem value="HOME" className="cursor-pointer">Independent House / Villa</SelectItem>
                      <SelectItem value="PLOT" className="cursor-pointer">Plot / Land</SelectItem>
                    </StyledSelect>
                  )}

                  {((store.loanRequirements.loanType === "LAP" && store.loanRequirements.propertyCategory === "COMMERCIAL_INDUSTRIAL") || store.loanRequirements.loanType === "BUSINESS_LOAN") && (
                    <>
                      <StyledSelect
                        label={store.loanRequirements.loanType === "BUSINESS_LOAN" ? "Type of Property" : "Business Property Category"}
                        value={store.loanRequirements.businessPropertyCategory || ""}
                        onValueChange={(v) => store.updateLoanRequirements({ businessPropertyCategory: v as 'COMMERCIAL' | 'INDUSTRIAL', propertyType: undefined })}
                        placeholder="Select category"
                      >
                        <SelectItem value="COMMERCIAL" className="cursor-pointer">Commercial</SelectItem>
                        <SelectItem value="INDUSTRIAL" className="cursor-pointer">Industrial</SelectItem>
                      </StyledSelect>

                      {store.loanRequirements.businessPropertyCategory === "COMMERCIAL" && (
                        <StyledSelect
                          label="Commercial Property"
                          value={store.loanRequirements.propertyType || ""}
                          onValueChange={(v) => store.updateLoanRequirements({ propertyType: v as Extract<PropertyType, CommercialPropertyType> })}
                          placeholder="Select commercial property"
                        >
                          <SelectItem value="HOSPITAL" className="cursor-pointer">Hospital</SelectItem>
                          <SelectItem value="HOSTEL" className="cursor-pointer">Hostel</SelectItem>
                          <SelectItem value="RESTAURANTS" className="cursor-pointer">Restaurants</SelectItem>
                          <SelectItem value="HOTEL" className="cursor-pointer">Hotel</SelectItem>
                          <SelectItem value="MARRIAGE_GARDEN" className="cursor-pointer">Marriage Garden</SelectItem>
                          <SelectItem value="SCHOOL" className="cursor-pointer">School</SelectItem>
                          <SelectItem value="SHOP" className="cursor-pointer">Shop</SelectItem>
                          <SelectItem value="WAREHOUSE" className="cursor-pointer">Warehouse</SelectItem>
                          <SelectItem value="GODOWN" className="cursor-pointer">Godown</SelectItem>
                        </StyledSelect>
                      )}

                      {store.loanRequirements.businessPropertyCategory === "INDUSTRIAL" && (
                        <StyledSelect
                          label="Industrial Property"
                          value={store.loanRequirements.propertyType || ""}
                          onValueChange={(v) => store.updateLoanRequirements({ propertyType: v as Extract<PropertyType, IndustrialPropertyType> })}
                          placeholder="Select industrial property"
                        >
                          <SelectItem value="FACTORIES" className="cursor-pointer">Factories</SelectItem>
                          <SelectItem value="WAREHOUSES" className="cursor-pointer">Warehouses</SelectItem>
                          <SelectItem value="DISTRIBUTION_CENTER" className="cursor-pointer">Distribution Center</SelectItem>
                          <SelectItem value="R_AND_D_FACILITY" className="cursor-pointer">R&D Facility</SelectItem>
                          <SelectItem value="FLEX_SPACES" className="cursor-pointer">Flex Spaces</SelectItem>
                        </StyledSelect>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
  );
};
