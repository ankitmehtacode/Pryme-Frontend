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

export const AdminProductModal: React.FC<AdminProductModalProps> = ({ isOpen, onClose, onSubmit, initialData, banks }) => {
  const [formData, setFormData] = useState<any>({
    productCode: "",
    productName: "",
    campaignName: "", // Added campaignName mapping
    loanType: "HOME_LOAN",
    lenderId: "",
    lenderName: "",
    interestType: "REDUCING",
    minCibil: 650,
    maxCibil: 900,
    roi: 10.5,
    processingFee: 1.0,
    minTenureMonths: 12,
    maxTenureMonths: 240,
    minLoanAmount: 100000,
    maxLoanAmount: 50000000,
    maxEmiNmiRatio: 65, // UI displays 65%
    active: true, // Corrected from isActive
    roiComputationLogic: ""
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ 
          ...initialData,
          // Expand fractional database ratio (0.65) back to UI percentage (65)
          maxEmiNmiRatio: initialData.maxEmiNmiRatio ? Number((initialData.maxEmiNmiRatio * 100).toFixed(2)) : 65
        });
      } else {
        // Reset to defaults if purely adding
        setFormData({
          productCode: "",
          productName: "",
          campaignName: "",
          loanType: "HOME_LOAN",
          lenderId: "",
          lenderName: "",
          interestType: "REDUCING",
          minCibil: 650,
          maxCibil: 900,
          roi: 10.5,
          processingFee: 1.0,
          minTenureMonths: 12,
          maxTenureMonths: 240,
          minLoanAmount: 100000,
          maxLoanAmount: 50000000,
          maxEmiNmiRatio: 65,
          active: true,
          roiComputationLogic: ""
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    // Handle boolean for 'active'
    if (name === "active") {
      setFormData((prev: any) => ({ ...prev, active: value === "true" }));
      return;
    }

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prepare fail-proof final payload to match Spring Boot exact types & constraints
    const payload = {
      ...formData,
      // Hard parse the Select string to a Long to prevent Jackson TypeMismatchException
      lenderId: parseInt(formData.lenderId, 10),
      // Database numeric(5,4) max value is 9.9999. Must scale % down to fraction to prevent exception.
      maxEmiNmiRatio: Number((formData.maxEmiNmiRatio / 100).toFixed(4))
    };
    
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#13131a] border border-[#103783]/20 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#103783]/20 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {initialData ? "Edit Policy Entity (Product)" : "Add New Policy Entity"}
            </h2>
            <p className="text-xs text-slate-400 mt-1">Configure baseline rules. Immediate impact on Matrix engine routing.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Core Identification */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-blue-500 border-b border-[#103783]/20 pb-2">Core Identity & Partner</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Partner Bank / Lender *</label>
                  <select required name="lenderId" value={formData.lenderId} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-4 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50">
                    <option value="" disabled>-- Select Active Partner --</option>
                    {banks.map((b) => (
                      <option key={b.id} value={b.id}>{b.bankName}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Policy Code (Unique) *</label>
                  <input required type="text" name="productCode" value={formData.productCode} onChange={handleChange} maxLength={20} placeholder="e.g. HDFC_BL_001" pattern="^[A-Z0-9_]+$" title="Only uppercase letters, numbers, and underscores allowed" className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-4 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Friendly Product Name *</label>
                  <input required type="text" name="productName" value={formData.productName} onChange={handleChange} maxLength={200} placeholder="e.g. Business Loan Top Up" className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-4 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Campaign / Display Name</label>
                  <input type="text" name="campaignName" value={formData.campaignName} onChange={handleChange} maxLength={100} placeholder="e.g. HDFC Diwali Mega Offer" className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-4 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Standard Loan Type *</label>
                  <select required name="loanType" value={formData.loanType} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-4 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50">
                    <option value="HOME_LOAN">Home Loan (HL)</option>
                    <option value="LOAN_AGAINST_PROPERTY">Loan Against Property (LAP)</option>
                    <option value="BUSINESS_LOAN">Business Loan (BL)</option>
                    <option value="PERSONAL_LOAN">Personal Loan (PL)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400">Entity Status</label>
                  <select name="active" value={formData.active ? "true" : "false"} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50" style={{ color: formData.active ? "#4ade80" : "#f87171" }}>
                    <option value="true" className="text-green-400">● Active</option>
                    <option value="false" className="text-red-400">● Inactive / Draft</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Matrix Rule Thresholds */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-amber-500 border-b border-[#103783]/20 pb-2">Matrix Policy Thresholds</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/30 p-4 border border-[#103783]/20 rounded-xl">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">Min CIBIL Score</label>
                  <input required type="number" name="minCibil" value={formData.minCibil} onChange={handleChange} min={300} max={900} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm font-mono text-amber-400 outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">Max CIBIL Score</label>
                  <input required type="number" name="maxCibil" value={formData.maxCibil} onChange={handleChange} min={300} max={900} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm font-mono text-amber-400 outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">Max FOIR / EMI ratio (%)</label>
                  <input required type="number" name="maxEmiNmiRatio" value={formData.maxEmiNmiRatio} onChange={handleChange} min={10} max={100} step="0.5" className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm font-mono text-pink-400 outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">Min Loan Amount (₹)</label>
                  <input required type="number" name="minLoanAmount" value={formData.minLoanAmount} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm font-mono text-green-400 outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">Max Loan Amount (₹)</label>
                  <input required type="number" name="maxLoanAmount" value={formData.maxLoanAmount} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm font-mono text-green-400 outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">Min Tenure (Months)</label>
                  <input required type="number" name="minTenureMonths" value={formData.minTenureMonths} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-200 outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">Max Tenure (Months)</label>
                  <input required type="number" name="maxTenureMonths" value={formData.maxTenureMonths} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-200 outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            {/* Pricing Parameters */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-500 border-b border-[#103783]/20 pb-2">Pricing & Margins</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">Base ROI (%) *</label>
                  <input required type="number" step="0.01" name="roi" value={formData.roi} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-200 outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">Processing Fee (%)</label>
                  <input required type="number" step="0.01" name="processingFee" value={formData.processingFee} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-200 outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400">Interest Type</label>
                  <select name="interestType" value={formData.interestType} onChange={handleChange} className="w-full bg-[#0d0d14] border border-[#103783]/20 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:border-blue-500">
                    <option value="REDUCING">Reducing</option>
                    <option value="FLAT">Flat</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 🧠 DYNAMIC ROI PRICING MATRIX */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-cyan-500 border-b border-[#103783]/20 pb-2">Dynamic ROI Matrix (Optional)</h3>
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
                Any leads matching `{formData.productCode || 'this code'}` parameters will be eligible for routing to `{formData.lenderName || 'the assigned partner'}`.
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
