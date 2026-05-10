import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpelBuilder } from "./SpelBuilder";
import { PricingMatrixBuilder } from "@/components/admin/PricingMatrixBuilder";

const PROPERTY_OPTIONS = [
  "RESIDENTIAL", "FLAT", "HOME", "VILLA", "APARTMENT", "BUILDER_FLOOR", "ROW_HOUSE", "PENTHOUSE",
  "COMMERCIAL", "HOSPITAL", "HOSTEL", "RESTAURANTS", "HOTEL", "MARRIAGE_GARDEN", "SCHOOL", "SHOP", "WAREHOUSE", "GODOWN", "OFFICE",
  "INDUSTRIAL", "FACTORIES", "WAREHOUSES", "DISTRIBUTION_CENTER", "R_AND_D_FACILITY", "FLEX_SPACES",
  "PLOT", "LAND", "GRAM_PANCHAYAT"
];

const MultiSelect = ({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (val: string) => void }) => {
  const selected = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];
  
  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(o => o !== opt).join(','));
    } else {
      onChange([...selected, opt].join(','));
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-semibold text-slate-400">{label}</label>
      <div className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg p-2 h-24 overflow-y-auto custom-scrollbar flex flex-wrap content-start gap-1.5">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggleOption(opt)}
            className={`text-[10px] px-2 py-1 rounded-md border transition-colors ${
              selected.includes(opt) 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-500'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export interface AdminEligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export const AdminEligibilityModal: React.FC<AdminEligibilityModalProps> = ({ 
  isOpen, onClose, onSubmit, initialData 
}) => {
  const [formData, setFormData] = useState<any>({
    bankName: "",
    loanType: "HOME_LOAN",
    productCode: "",
    employmentType: "SALARIED",
    minAge: 21,
    maxAge: 65,
    minIncome: 25000,
    incomeType: "STANDARD",
    surrogate: "",
    workExpYears: 2,
    itrRequiredYears: 2,
    ltvAllowed: 80,
    ltvComputationLogic: "",
    foirMax: 65,
    foirComputationLogic: "",
    deviationFormulae: "",
    conditions: "",
    emiNotObligated: "NO",
    propertyType: "RESIDENTIAL",
    negativeProperty: "",
    profileRestrictions: "",
    notes: "",
    active: true
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ 
          ...initialData,
          ltvAllowed: initialData.ltvAllowed ? Number((initialData.ltvAllowed * 100).toFixed(2)) : 80,
          ltvComputationLogic: initialData.ltvComputationLogic || "",
          foirMax: initialData.foirMax ? Number((initialData.foirMax * 100).toFixed(2)) : 65,
          foirComputationLogic: initialData.foirComputationLogic || ""
        });
      } else {
        setFormData({
          bankName: "",
          loanType: "HOME_LOAN",
          productCode: "",
          employmentType: "SALARIED",
          minAge: 21,
          maxAge: 65,
          minIncome: 25000,
          incomeType: "STANDARD",
          workExpYears: 2,
          itrRequiredYears: 2,
          ltvAllowed: 80,
          ltvComputationLogic: "",
          foirMax: 65,
          foirComputationLogic: "",
          deviationFormulae: "",
          conditions: "",
          emiNotObligated: "NO",
     surrogate: "",
          propertyType: "RESIDENTIAL",
          negativeProperty: "",
          profileRestrictions: "",
          notes: "",
          active: true
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    
    if (name === "active") {
      setFormData((prev: any) => ({ ...prev, active: value === "true" }));
      return;
    }
    
    if (name === "emiNotObligated") {
      setFormData((prev: any) => ({ ...prev, emiNotObligated: value }));
      return;
    }

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : parseFloat(value)) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      productId: formData.productId || 1, // Dummy ID required by current Entity constraint
      ltvAllowed: Number((formData.ltvAllowed / 100).toFixed(4)),
      foirMax: Number((formData.foirMax / 100).toFixed(4))
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#13131a] border border-[#103783]/20 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#103783]/20 flex justify-between items-center bg-slate-900/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {initialData ? "Edit Engine Rule" : "Add Engine Rule"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">Configure baseline rules. Immediate impact on Matrix engine routing.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="eligibility-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Core Identity & Linking */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-blue-500 border-b border-[#103783]/20 pb-2">Core Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Bank Name *</label>
                  <input required type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500" placeholder="e.g. HDFC" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Product Type *</label>
                  <input required type="text" name="loanType" value={formData.loanType} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500" placeholder="e.g. HOME_LOAN" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Product Uid *</label>
                  <input required type="text" name="productCode" value={formData.productCode} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500" placeholder="e.g. HDFC_HL_001" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Rule Status</label>
                  <select name="active" value={formData.active ? "true" : "false"} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" style={{ color: formData.active ? "#4ade80" : "#f87171" }}>
                    <option value="true" className="text-green-400">● Active</option>
                    <option value="false" className="text-red-400">● Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Applicant Thresholds */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-amber-500 border-b border-[#103783]/20 pb-2">Applicant Thresholds</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/30 p-4 border border-[#103783]/20 rounded-xl">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">Employment Type</label>
                  <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-blue-500">
                    <option value="SALARIED">Salaried</option>
                    <option value="SELF_EMPLOYED_PROFESSIONAL">Self Employed, Professional</option>
                    <option value="SELF_EMPLOYED_NON_PROFESSIONAL">Self Employed, Non-Professional</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">Min Age (Years)</label>
                  <input type="number" name="minAge" value={formData.minAge} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">Max Age (Years)</label>
                  <input type="number" name="maxAge" value={formData.maxAge} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">Min Income (₹)</label>
                  <input type="number" name="minIncome" value={formData.minIncome} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">Surrogate</label>
                  <select name="surrogate" value={formData.surrogate || ""} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-blue-500">
                    <option value="">None (Universal)</option>
                    <option value="ITR">ITR</option>
                    <option value="BANKING">Banking / ABB</option>
                    <option value="GST">GST</option>
                    <option value="CASH_SALARY">Cash Salary</option>
                    <option value="FORM_16">Form 16</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">Vintage (Years)</label>
                  <input type="number" name="workExpYears" value={formData.workExpYears} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">ITR Required (Years)</label>
                  <input type="number" name="itrRequiredYears" value={formData.itrRequiredYears} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">EMI Not Obligated</label>
                  <select name="emiNotObligated" value={formData.emiNotObligated || "NO"} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500 text-slate-200">
                    <option value="NO">No</option>
                    <option value="6_MONTHS">6 Months</option>
                    <option value="12_MONTHS">12 Months</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Margins & Adjustments */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-500 border-b border-[#103783]/20 pb-2">Margins & Adjustments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-400">Base LTV Allowed (%)</label>
                    <input required type="number" name="ltvAllowed" value={formData.ltvAllowed} onChange={handleChange} min={0} max={100} step="0.01" className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm font-mono text-emerald-400 outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-2 border border-[#103783]/20 rounded-xl p-3 bg-slate-900/30">
                    <label className="text-[11px] font-semibold text-cyan-500">Dynamic LTV Matrix</label>
                    <PricingMatrixBuilder
                      value={formData.ltvComputationLogic || ""}
                      onChange={(spel) => setFormData((prev: any) => ({ ...prev, ltvComputationLogic: spel }))}
                      baseRate={formData.ltvAllowed}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-400">Base FOIR Allowed (%)</label>
                    <input required type="number" name="foirMax" value={formData.foirMax} onChange={handleChange} min={0} max={100} step="0.01" className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm font-mono text-emerald-400 outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-2 border border-[#103783]/20 rounded-xl p-3 bg-slate-900/30">
                    <label className="text-[11px] font-semibold text-cyan-500">Dynamic FOIR Matrix</label>
                    <PricingMatrixBuilder
                      value={formData.foirComputationLogic || ""}
                      onChange={(spel) => setFormData((prev: any) => ({ ...prev, foirComputationLogic: spel }))}
                      baseRate={formData.foirMax}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* 4. Property & Deviation Rules (Large text areas) */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-purple-500 border-b border-[#103783]/20 pb-2">Policy & Property Deviations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SpelBuilder
                  label="Deviation Formulae"
                  value={formData.deviationFormulae}
                  onChange={(val) => setFormData((prev: any) => ({ ...prev, deviationFormulae: val }))}
                  placeholder="e.g. Deviation applied if LTV > 85%..."
                />
                <SpelBuilder
                  label="Conditions"
                  value={formData.conditions}
                  onChange={(val) => setFormData((prev: any) => ({ ...prev, conditions: val }))}
                  placeholder="e.g. Mandatory co-applicant if CIBIL < 700"
                />
                <MultiSelect
                  label="Property Type Allow-List"
                  options={PROPERTY_OPTIONS}
                  value={formData.propertyType}
                  onChange={(val) => setFormData((prev: any) => ({ ...prev, propertyType: val }))}
                />
                <MultiSelect
                  label="Negative Property Deny-List"
                  options={PROPERTY_OPTIONS}
                  value={formData.negativeProperty}
                  onChange={(val) => setFormData((prev: any) => ({ ...prev, negativeProperty: val }))}
                />
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400">Negative Profile</label>
                  <textarea name="profileRestrictions" value={formData.profileRestrictions} onChange={handleChange} rows={2} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 custom-scrollbar resize-none" placeholder="e.g. Police, Lawyer, Politician" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400">Internal Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 custom-scrollbar resize-none" placeholder="Any additional memos" />
                </div>
              </div>
            </div>
            
            <div className="bg-blue-900/10 border border-blue-900/30 p-3 rounded-lg flex gap-3 text-blue-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs">
                Saving this profile will immediately activate it within the Policy Matrix engine. 
                Any leads matching `{formData.productCode || 'this uid'}` parameters will jump through this tier.
              </p>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#103783]/20 bg-slate-900/50 flex justify-end gap-3 rounded-b-xl shrink-0">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">Cancel</Button>
          <Button type="submit" form="eligibility-form" className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-none">
            <Save className="w-4 h-4 mr-2" />
            {initialData ? "Save Engine Rule" : "Create Engine Rule"}
          </Button>
        </div>
      </div>
    </div>
  );
};
