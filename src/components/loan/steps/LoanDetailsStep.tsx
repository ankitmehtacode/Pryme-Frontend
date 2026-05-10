import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { IndianRupee, Landmark, Calendar, CreditCard, Edit2 } from "lucide-react";
import { useApplicationStore } from "@/store/applicationStore";
import { SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { LoanType } from "@/lib/applicationTypes";
import { ValidatedInput, StyledSelect } from "../shared/FormComponents";

const PRODUCT_OPTIONS = [
  { value: "PERSONAL_LOAN", label: "Personal Loan", icon: IndianRupee },
  { value: "BUSINESS_LOAN", label: "Business Loan", icon: Landmark },
  { value: "HOME_LOAN", label: "Home Loan", icon: Landmark },
  { value: "LAP", label: "Loan Against Property", icon: Landmark },
  { value: "AUTO_LOAN", label: "Auto Loan", icon: Landmark },
];

interface LoanDetailsStepProps {
  cardCn: string;
}

export const LoanDetailsStep: React.FC<LoanDetailsStepProps> = ({ cardCn }) => {
  const store = useApplicationStore();
  const errors = store.validationErrors;
  const [editingCibil, setEditingCibil] = useState(false);
  const [cibilInputVal, setCibilInputVal] = useState("");

  const cibilScore = store.loanRequirements.cibilScore;
  const cibilUi = useMemo(() => {
    if (cibilScore === -1) return { color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20", label: "No History" };
    if (cibilScore >= 750) return { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Excellent" };
    if (cibilScore >= 650) return { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Good" };
    if (cibilScore >= 550) return { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Fair" };
    return { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "Poor" };
  }, [cibilScore]);

  return (
    <div id="section-loan-details" className={cn(cardCn, 'transition-all duration-500')}>
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-[#0d1829] border border-border dark:border-white/[0.06] flex items-center justify-center">
          <IndianRupee className="w-5 h-5 text-primary dark:text-[#103783]" />
        </div>
        <h3 className="text-lg font-bold text-foreground tracking-tight">Loan Details</h3>
      </div>

      <div className="space-y-5 relative z-10">
        <StyledSelect
          label="Loan Product"
          icon={Landmark}
          value={store.loanRequirements.loanType || undefined}
          onValueChange={(v) => store.updateLoanRequirements({ loanType: v as LoanType })}
          placeholder="Select your loan type"
          error={errors.loanType}
        >
          {PRODUCT_OPTIONS.map((opt) => {
            const OptIcon = opt.icon;
            return (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-2">
                  <OptIcon className="w-3.5 h-3.5 text-muted-foreground/60" />
                  {opt.label}
                </span>
              </SelectItem>
            );
          })}
        </StyledSelect>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ValidatedInput
            label="Loan Amount (₹)"
            type="number"
            placeholder="500000"
            icon={IndianRupee}
            value={store.loanRequirements.loanAmount || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateLoanRequirements({ loanAmount: Number(e.target.value) })}
            isValid={store.loanRequirements.loanAmount >= 50000}
          />
          <ValidatedInput
            label="Tenure (Years)"
            type="number"
            placeholder="5"
            icon={Calendar}
            value={store.loanRequirements.tenureYears}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateLoanRequirements({ tenureYears: parseInt(e.target.value) || 0 })}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
            isValid={
              (store.loanRequirements.loanType === 'PERSONAL_LOAN' || store.loanRequirements.loanType === 'BUSINESS_LOAN')
                ? (store.loanRequirements.tenureYears >= 1 && store.loanRequirements.tenureYears <= 7)
                : (store.loanRequirements.tenureYears >= 3 && store.loanRequirements.tenureYears <= 30)
            }
            error={
              store.loanRequirements.tenureYears > 0
                ? ((store.loanRequirements.loanType === 'PERSONAL_LOAN' || store.loanRequirements.loanType === 'BUSINESS_LOAN') && (store.loanRequirements.tenureYears < 1 || store.loanRequirements.tenureYears > 7)
                  ? "Must be 1 to 7 Years"
                  : ((store.loanRequirements.loanType === 'HOME_LOAN' || store.loanRequirements.loanType === 'LAP') && (store.loanRequirements.tenureYears < 3 || store.loanRequirements.tenureYears > 30)
                    ? "Must be 3 to 30 Years" : undefined))
                : undefined
            }
          />
        </div>

        {/* CIBIL Slider */}
        <div className={`p-5 rounded-2xl border backdrop-blur-sm transition-colors duration-500 ${cibilUi.bg} ${cibilUi.border}`}>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
            <div className="flex items-center gap-2">
              <CreditCard className={`w-5 h-5 shrink-0 ${cibilUi.color}`} />
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">CIBIL Score</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {editingCibil ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    type="number"
                    min={-1}
                    max={900}
                    className={`w-20 bg-transparent text-right text-2xl font-semibold tabular-nums outline-none border-b-2 border-primary/50 focus:border-primary transition-colors py-0.5 rounded-none ${cibilUi.color}`}
                    value={cibilInputVal}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setCibilInputVal(e.target.value)}
                    onBlur={() => {
                      const parsed = parseInt(cibilInputVal, 10);
                      let val;
                      if (parsed === -1 || parsed === 0) val = -1;
                      else val = Math.min(900, Math.max(300, parsed));
                      
                      if (!isNaN(val)) store.updateLoanRequirements({ cibilScore: val });
                      else setCibilInputVal(cibilScore.toString());
                      setEditingCibil(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      if (e.key === "Escape") { setCibilInputVal(cibilScore.toString()); setEditingCibil(false); }
                    }}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  className={`flex items-center gap-1.5 group/edit cursor-pointer`}
                  onClick={() => { setCibilInputVal(cibilScore.toString()); setEditingCibil(true); }}
                  title="Click to type exact score"
                >
                  <motion.span
                    key={cibilScore}
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`text-2xl font-semibold tabular-nums border-b border-dashed border-current/40 group-hover/edit:border-current pb-0.5 transition-colors ${cibilUi.color}`}
                  >
                    {cibilScore === -1 ? "N/A" : cibilScore}
                  </motion.span>
                  <Edit2 className={`w-3.5 h-3.5 opacity-40 group-hover/edit:opacity-100 transition-opacity ${cibilUi.color}`} />
                </button>
              )}
              <span className={`text-[10px] font-medium uppercase tracking-widest px-2 py-1 rounded border ${cibilUi.bg} ${cibilUi.color} ${cibilUi.border}`}>
                {cibilUi.label}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="rounded border-primary/30 text-primary focus:ring-primary/50"
                checked={cibilScore === -1}
                onChange={(e) => {
                  if (e.target.checked) {
                    store.updateLoanRequirements({ cibilScore: -1 });
                  } else {
                    store.updateLoanRequirements({ cibilScore: 750 });
                  }
                }}
              />
              I don't have a credit history (New to Credit)
            </label>
          </div>
          {cibilScore !== -1 && (
            <>
              <Slider
                value={[cibilScore]}
                onValueChange={(v) => store.updateLoanRequirements({ cibilScore: v[0] })}
                min={300} max={900} step={10}
                className="cursor-pointer mb-2"
              />
              <div className="flex justify-between text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest mt-2">
                <span>300</span>
                <span>900</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
