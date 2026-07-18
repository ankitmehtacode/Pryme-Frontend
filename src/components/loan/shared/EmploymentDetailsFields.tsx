import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Building2, Landmark, IndianRupee, Calendar,
  CreditCard, GraduationCap, Stethoscope, Scale, PenTool,
  BriefcaseBusiness, FileText, Check
} from "lucide-react";
import { SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ValidatedInput, StyledSelect, PillSelector } from "./FormComponents";
import type {
  EmploymentType, SalariedSubType, ProfessionalSubType,
  FinancialDetails, SalariedDetails, ProfessionalDetails, BusinessDetails,
  LoanType, LoanRequirements
} from "@/lib/applicationTypes";

// Mirrors SurrogateIncomeResolver.resolveGst()'s default margin table on the
// backend: monthly income = turnover * margin / 12, not turnover / 12 alone.
// Also mirrored in LoanApplicationForm.tsx's businessSubType heuristic.
export const GST_MARGIN_BY_INDUSTRY: Record<string, number> = {
  Service: 0.10,
  Retail: 0.12,
  Wholesale: 0.08,
  Manufacturing: 0.04,
};

const getInputValue = (val: any) => {
  if (val === undefined || val === null) return "";
  return val;
};

interface EmploymentDetailsFieldsProps {
  employmentType: EmploymentType | null;
  financialDetails: FinancialDetails;
  onUpdateSalaried: (data: Partial<SalariedDetails>) => void;
  onUpdateProfessional: (data: Partial<ProfessionalDetails>) => void;
  onUpdateBusiness: (data: Partial<BusinessDetails>) => void;
  loanType?: LoanType;
  errors?: Record<string, string>;
  // Loan-level (not per-applicant) vehicle price fields. Tied to the asset
  // being financed, not to any one applicant's income — only relevant for
  // the primary applicant's form. Omit these props to skip that block
  // entirely (used by the co-applicant form).
  vehicleOnRoadPrice?: number;
  vehicleQuotationPrice?: number;
  onUpdateLoanRequirements?: (data: Partial<LoanRequirements>) => void;
}

export const EmploymentDetailsFields: React.FC<EmploymentDetailsFieldsProps> = ({
  employmentType,
  financialDetails: fin,
  onUpdateSalaried,
  onUpdateProfessional,
  onUpdateBusiness,
  loanType,
  errors = {},
  vehicleOnRoadPrice,
  vehicleQuotationPrice,
  onUpdateLoanRequirements,
}) => {
  return (
    <AnimatePresence mode="wait">

      {/* ── SALARIED PATH ──────────────────────────────────── */}
      {employmentType === "SALARIED" && (
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
            value={fin.path === "SALARIED" ? fin.data.subType : null}
            onChange={(v) => onUpdateSalaried({ subType: v })}
          />

          {fin.path === "SALARIED" && fin.data.subType === "PRIVATE" && (
            <div className="mb-5">
              <StyledSelect
                label="Company Entity Type"
                icon={Building2}
                value={fin.data.companyType || ""}
                onValueChange={(v) => onUpdateSalaried({ companyType: v as any })}
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
              value={fin.path === "SALARIED" ? fin.data.companyName : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateSalaried({ companyName: e.target.value })}
              isValid={(fin.path === "SALARIED" ? fin.data.companyName || "" : "").length >= 2}
              error={errors.companyName}
            />
            <ValidatedInput
              label="Designation"
              placeholder="Software Engineer"
              icon={Briefcase}
              value={fin.path === "SALARIED" ? fin.data.designation : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateSalaried({ designation: e.target.value })}
              isValid={(fin.path === "SALARIED" ? fin.data.designation || "" : "").length >= 2}
              error={errors.designation}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <ValidatedInput
              label="Gross Monthly Income (₹)"
              formatAsCurrency
              placeholder="100000"
              icon={IndianRupee}
              value={fin.path === "SALARIED" ? (fin.data.grossSalary || "") : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateSalaried({ grossSalary: Number(e.target.value) })}
              isValid={(fin.path === "SALARIED" ? fin.data.grossSalary : 0) >= 10000}
            />
            <ValidatedInput
              label="Net Monthly Income (₹)"
              formatAsCurrency
              placeholder="85000"
              icon={IndianRupee}
              value={fin.path === "SALARIED" ? (fin.data.netMonthlySalary || "") : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateSalaried({ netMonthlySalary: Number(e.target.value) })}
              isValid={(fin.path === "SALARIED" ? fin.data.netMonthlySalary : 0) >= 10000}
              error={errors.netMonthlySalary}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ValidatedInput
              label="Total Experience (Years)"
              type="number"
              placeholder="5"
              icon={Calendar}
              value={fin.path === "SALARIED" ? (fin.data.totalExperienceYears || "") : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateSalaried({ totalExperienceYears: Number(e.target.value) })}
              isValid={(fin.path === "SALARIED" ? fin.data.totalExperienceYears : 0) > 0}
              error={errors.totalExperienceYears}
            />
            <ValidatedInput
              label="Current Experience (Years)"
              type="number"
              placeholder="2"
              icon={Calendar}
              value={fin.path === "SALARIED" ? (fin.data.currentCompanyYears || "") : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateSalaried({ currentCompanyYears: Number(e.target.value) })}
              isValid={(fin.path === "SALARIED" ? fin.data.currentCompanyYears : 0) > 0}
              error={errors.currentCompanyYears}
            />
          </div>

          {/* ── EMI Disclosure (Step A + conditional Step B) ── */}
          <div className="h-px bg-gradient-to-r from-transparent via-border dark:via-white/[0.06] to-transparent" />

          <ValidatedInput
            label="Total Monthly EMI across all loans (₹)"
            formatAsCurrency
            placeholder="e.g. 45000"
            icon={CreditCard}
            value={getInputValue(fin.path === "SALARIED" ? fin.data.existingEMI : null)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateSalaried({ existingEMI: e.target.value === "" ? undefined : Number(e.target.value) })}
            isValid={(fin.path === "SALARIED" ? fin.data.existingEMI : -1) >= 0}
          />

          <AnimatePresence>
            {fin.path === "SALARIED" && (fin.data.existingEMI ?? 0) > 0 && (
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
                    formatAsCurrency
                    placeholder="e.g. 15000 (or 0 if none)"
                    icon={IndianRupee}
                    value={getInputValue(fin.path === "SALARIED" ? fin.data.maturingLoanEMI : null)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateSalaried({ maturingLoanEMI: e.target.value === "" ? undefined : Number(e.target.value) })}
                    isValid={(fin.path === "SALARIED" ? fin.data.maturingLoanEMI ?? 0 : 0) >= 0}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── PROFESSIONAL PATH ──────────────────────────────── */}
      {employmentType === "PROFESSIONAL" && (
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
              { value: "ARCHITECT", label: "Architect", icon: PenTool },
            ]}
            value={fin.path === "PROFESSIONAL" ? fin.data.subType : null}
            onChange={(v) => onUpdateProfessional({ subType: v })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ValidatedInput
              label="Practice / Firm Name"
              placeholder="Sharma & Associates"
              icon={Building2}
              value={fin.path === "PROFESSIONAL" ? fin.data.practiceName : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateProfessional({ practiceName: e.target.value })}
              isValid={(fin.path === "PROFESSIONAL" ? fin.data.practiceName || "" : "").length >= 2}
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
              value={fin.path === "PROFESSIONAL" ? (fin.data.totalPracticeYears || "") : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const v = Number(e.target.value);
                onUpdateProfessional({ totalPracticeYears: v, practiceYears: v });
              }}
              isValid={(fin.path === "PROFESSIONAL" ? fin.data.totalPracticeYears : 0) > 0}
              error={errors.practiceYears}
            />
            <ValidatedInput
              label="Years in Current Firm"
              type="number"
              placeholder="e.g. 4"
              icon={Briefcase}
              value={fin.path === "PROFESSIONAL" ? (fin.data.yearsInCurrentFirm || "") : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateProfessional({ yearsInCurrentFirm: Number(e.target.value) })}
              isValid={(fin.path === "PROFESSIONAL" ? fin.data.yearsInCurrentFirm : 0) > 0}
            />
          </div>

          {/* ── Income fields ──────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ValidatedInput
              label="Annual Gross Receipts (Yearly, ₹ as per itr)"
              formatAsCurrency
              placeholder="e.g. 3600000"
              icon={IndianRupee}
              value={fin.path === "PROFESSIONAL" ? (fin.data.annualGrossReceipts || "") : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateProfessional({ annualGrossReceipts: Number(e.target.value) })}
              isValid={(fin.path === "PROFESSIONAL" ? fin.data.annualGrossReceipts : 0) > 0}
            />
            <ValidatedInput
              label="Professional Income as per ITR (Yearly, ₹)"
              formatAsCurrency
              placeholder="e.g. 500000"
              icon={IndianRupee}
              value={fin.path === "PROFESSIONAL" ? (fin.data.netProfit || "") : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = Number(e.target.value);
                onUpdateProfessional({
                  netProfit: val,
                  netMonthlyIncome: Math.round(val / 12),
                });
              }}
              isValid={(fin.path === "PROFESSIONAL" ? fin.data.netProfit || 0 : 0) >= 10000}
              error={errors.netMonthlyIncome}
            />
            <StyledSelect
              label="ITR Filing (Years)"
              icon={Calendar}
              value={fin.path === "PROFESSIONAL" && fin.data.itrFiledYears !== undefined && fin.data.itrFiledYears !== null ? fin.data.itrFiledYears.toString() : undefined}
              onValueChange={(v) => onUpdateProfessional({ itrFiledYears: Number(v) })}
              placeholder="Select years of ITR filed"
            >
              <SelectItem value="0">Not Filed</SelectItem>
              <SelectItem value="1">1 Year</SelectItem>
              <SelectItem value="2">2 Years</SelectItem>
              <SelectItem value="3">3+ Years</SelectItem>
            </StyledSelect>
            <ValidatedInput
              label="Last 12 Months GST Turnover (₹)"
              formatAsCurrency
              placeholder="e.g. 6000000"
              icon={IndianRupee}
              value={fin.path === "PROFESSIONAL" ? (fin.data.last12MonthsGstTurnover ?? "") : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value === "" ? undefined : Math.max(0, Number(e.target.value));
                // Professionals are always the "Service" GST margin bucket (see
                // Apply.tsx's hardcoded businessType: "Service" for the SEP path).
                //
                // GST turnover is billing volume, not income -- it must never
                // silently overwrite netMonthlyIncome once the applicant has
                // already declared a real ITR-based income (netProfit). Without
                // this guard, typing GST turnover after ITR income clobbers a
                // correct, much higher income figure with a tiny margin-based
                // estimate (e.g. ₹95,000/mo -> ₹1,000/mo on ₹1.2L turnover),
                // which then falsely trips the EMI-vs-income sanity check.
                const hasDeclaredItrIncome = fin.path === "PROFESSIONAL" && !!fin.data.netProfit;
                onUpdateProfessional({
                  last12MonthsGstTurnover: val,
                  ...(hasDeclaredItrIncome ? {} : {
                    netMonthlyIncome: val !== undefined ? Math.round((val * GST_MARGIN_BY_INDUSTRY.Service) / 12) : 0,
                  }),
                });
              }}
              isValid={(fin.path === "PROFESSIONAL" ? (fin.data.last12MonthsGstTurnover ?? -1) : -1) >= 0}
            />
          </div>

          {loanType === 'LAP' || loanType === 'HOME_LOAN' ? (
            <div className="mt-6 p-4 rounded-xl border border-[#DDA35D]/30 bg-[#FDFBF7] dark:bg-[#DDA35D]/5 space-y-4">
              <ValidatedInput
                label="Annual Depreciation Add-back (₹)"
                formatAsCurrency
                placeholder="e.g. 240000 — from P&L / Balance Sheet"
                icon={IndianRupee}
                value={fin.path === "PROFESSIONAL" && fin.data.annualDepreciation !== undefined ? fin.data.annualDepreciation : ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateProfessional({ annualDepreciation: e.target.value === "" ? undefined : Number(e.target.value) })}
                isValid={(fin.path === "PROFESSIONAL" ? (fin.data.annualDepreciation || 0) : 0) >= 0}
              />

              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 bg-background/50">
                <Checkbox
                  id="ca-certified-professional"
                  checked={fin.path === "PROFESSIONAL" ? fin.data.caCertifiedAccounts : false}
                  onCheckedChange={(checked) => onUpdateProfessional({ caCertifiedAccounts: checked === true })}
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
            formatAsCurrency
            placeholder="e.g. 45000"
            icon={CreditCard}
            value={getInputValue(fin.path === "PROFESSIONAL" ? fin.data.existingEMI : null)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateProfessional({ existingEMI: e.target.value === "" ? undefined : Number(e.target.value) })}
            isValid={(fin.path === "PROFESSIONAL" ? fin.data.existingEMI : -1) >= 0}
          />

          <AnimatePresence>
            {fin.path === "PROFESSIONAL" && (fin.data.existingEMI ?? 0) > 0 && (
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
                    formatAsCurrency
                    placeholder="e.g. 15000 (or 0 if none)"
                    icon={IndianRupee}
                    value={getInputValue(fin.path === "PROFESSIONAL" ? fin.data.maturingLoanEMI : null)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateProfessional({ maturingLoanEMI: e.target.value === "" ? undefined : Number(e.target.value) })}
                    isValid={(fin.path === "PROFESSIONAL" ? fin.data.maturingLoanEMI ?? 0 : 0) >= 0}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── SELF-EMPLOYED / BUSINESS PATH ──────────────────── */}
      {employmentType === "SELF_EMPLOYED" && (
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
                value={fin.path === "SELF_EMPLOYED" ? fin.data.businessName : ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateBusiness({ businessName: e.target.value })}
                isValid={(fin.path === "SELF_EMPLOYED" ? fin.data.businessName || "" : "").length >= 2}
                error={errors.businessName}
              />
              <ValidatedInput
                label="Business Vintage (Years)"
                type="number"
                placeholder="e.g. 8"
                icon={Calendar}
                value={fin.path === "SELF_EMPLOYED" ? (fin.data.vintageYears || "") : ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateBusiness({ vintageYears: Number(e.target.value) })}
                isValid={(fin.path === "SELF_EMPLOYED" ? fin.data.vintageYears : 0) > 0}
                error={errors.vintageYears}
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
                formatAsCurrency
                placeholder="e.g. 6000000"
                icon={IndianRupee}
                value={fin.path === "SELF_EMPLOYED" ? (fin.data.last12MonthsGstTurnover || "") : ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = Number(e.target.value);
                  const industry = fin.path === "SELF_EMPLOYED" ? (fin.data.industryType || "Service") : "Service";
                  const margin = GST_MARGIN_BY_INDUSTRY[industry] ?? GST_MARGIN_BY_INDUSTRY.Service;
                  // GST turnover is billing volume, not income -- it must never
                  // silently overwrite netMonthlyIncome once the applicant has
                  // already declared a real ITR-based income (netProfit). Without
                  // this guard, typing GST turnover after ITR income clobbers a
                  // correct, much higher income figure with a tiny margin-based
                  // estimate, which then falsely trips the EMI-vs-income check.
                  const hasDeclaredItrIncome = fin.path === "SELF_EMPLOYED" && !!fin.data.netProfit;
                  onUpdateBusiness({
                    last12MonthsGstTurnover: val,
                    monthlyGSTTurnover: Math.round(val / 12),
                    ...(hasDeclaredItrIncome ? {} : { netMonthlyIncome: Math.round((val * margin) / 12) }),
                    subType: hasDeclaredItrIncome ? "ITR_BASED" : (val > 0 ? "GST_BASED" : "ITR_BASED")
                  });
                }}
                isValid={(fin.path === "SELF_EMPLOYED" ? fin.data.last12MonthsGstTurnover || 0 : 0) >= 0}
              />
              <StyledSelect
                label="Business Industry Type"
                icon={Briefcase}
                value={fin.path === "SELF_EMPLOYED" ? (fin.data.industryType || "Service") : undefined}
                onValueChange={(v) => {
                  const turnover = fin.path === "SELF_EMPLOYED" ? (fin.data.last12MonthsGstTurnover || 0) : 0;
                  const margin = GST_MARGIN_BY_INDUSTRY[v] ?? GST_MARGIN_BY_INDUSTRY.Service;
                  const hasDeclaredItrIncome = fin.path === "SELF_EMPLOYED" && !!fin.data.netProfit;
                  onUpdateBusiness({
                    industryType: v,
                    // Re-derive income from turnover when the industry (and thus margin)
                    // changes after turnover was already entered -- otherwise it stays
                    // stale at whatever margin was in effect when turnover was typed.
                    // Same ITR-income guard as the turnover field above.
                    ...(turnover > 0 && !hasDeclaredItrIncome ? { netMonthlyIncome: Math.round((turnover * margin) / 12) } : {}),
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
                formatAsCurrency
                placeholder="5000000"
                icon={IndianRupee}
                value={fin.path === "SELF_EMPLOYED" ? (fin.data.annualTurnover || "") : ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = Number(e.target.value);
                  onUpdateBusiness({
                    annualTurnover: val,
                    subType: "ITR_BASED"
                  });
                }}
                isValid={(fin.path === "SELF_EMPLOYED" ? fin.data.annualTurnover || 0 : 0) >= 0}
              />
              <ValidatedInput
                label="Business Income as per ITR (Yearly, ₹)"
                formatAsCurrency
                placeholder="e.g. 500000"
                icon={IndianRupee}
                value={fin.path === "SELF_EMPLOYED" ? (fin.data.netProfit || "") : ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = Number(e.target.value);
                  onUpdateBusiness({
                    netProfit: val,
                    netMonthlyIncome: Math.round(val / 12),
                    subType: "ITR_BASED"
                  });
                }}
                isValid={(fin.path === "SELF_EMPLOYED" ? fin.data.netProfit || 0 : 0) >= 10000}
                error={errors.netMonthlyIncome}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <StyledSelect
                label="ITR Filing (Years)"
                icon={FileText}
                value={fin.path === "SELF_EMPLOYED" && fin.data.itrFiledYears !== undefined && fin.data.itrFiledYears !== null ? fin.data.itrFiledYears.toString() : undefined}
                onValueChange={(v) => {
                  const val = Number(v);
                  onUpdateBusiness({
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
              {loanType === "AUTO_LOAN" && onUpdateLoanRequirements && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ValidatedInput
                    label="On Road Price of Vehicle (₹)"
                    formatAsCurrency
                    placeholder="1050000"
                    icon={IndianRupee}
                    value={vehicleOnRoadPrice || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateLoanRequirements({ vehicleOnRoadPrice: Number(e.target.value) })}
                    isValid={(vehicleOnRoadPrice || 0) > 100000}
                  />
                  <ValidatedInput
                    label="Quotation of Vehicle (₹)"
                    formatAsCurrency
                    placeholder="850000"
                    icon={IndianRupee}
                    value={vehicleQuotationPrice || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateLoanRequirements({ vehicleQuotationPrice: Number(e.target.value) })}
                    isValid={(vehicleQuotationPrice || 0) > 100000}
                  />
                </div>
              )}

              {(loanType === "HOME_LOAN" || loanType === "LAP") && (
                <motion.div
                  key="depreciation-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                    <ValidatedInput
                      label="Annual Depreciation Add-back (₹)"
                      formatAsCurrency
                      placeholder="e.g. 240000 — from P&L / Balance Sheet"
                      icon={IndianRupee}
                      value={fin.path === "SELF_EMPLOYED" ? (fin.data.depreciation || "") : ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateBusiness({ depreciation: Number(e.target.value) })}
                      isValid={(fin.path === "SELF_EMPLOYED" ? fin.data.depreciation || 0 : 0) >= 0}
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
              aria-checked={!!(fin.path === "SELF_EMPLOYED" && fin.data.isCaCertifiedOrAudited)}
              onClick={() => {
                const current = fin.path === "SELF_EMPLOYED" ? !!fin.data.isCaCertifiedOrAudited : false;
                onUpdateBusiness({ isCaCertifiedOrAudited: !current });
              }}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                fin.path === "SELF_EMPLOYED" && fin.data.isCaCertifiedOrAudited
                  ? "bg-primary border-primary dark:bg-[#103783] dark:border-[#103783]"
                  : "border-border dark:border-white/20 bg-transparent"
              }`}
            >
              {fin.path === "SELF_EMPLOYED" && fin.data.isCaCertifiedOrAudited && (
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
            formatAsCurrency
            placeholder="e.g. 45000"
            icon={CreditCard}
            value={getInputValue(fin.path === "SELF_EMPLOYED" ? fin.data.existingEMI : null)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateBusiness({ existingEMI: e.target.value === "" ? undefined : Number(e.target.value) })}
            isValid={(fin.path === "SELF_EMPLOYED" ? fin.data.existingEMI : -1) >= 0}
          />

          <AnimatePresence>
            {fin.path === "SELF_EMPLOYED" && (fin.data.existingEMI ?? 0) > 0 && (
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
                    formatAsCurrency
                    placeholder="e.g. 15000 (or 0 if none)"
                    icon={IndianRupee}
                    value={getInputValue(fin.path === "SELF_EMPLOYED" ? fin.data.maturingLoanEMI : null)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateBusiness({ maturingLoanEMI: e.target.value === "" ? undefined : Number(e.target.value) })}
                    isValid={(fin.path === "SELF_EMPLOYED" ? fin.data.maturingLoanEMI ?? 0 : 0) >= 0}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
