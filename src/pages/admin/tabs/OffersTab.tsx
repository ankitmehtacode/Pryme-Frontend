import React, { useState, useMemo } from "react";
import { Plus, Search, CreditCard, ChevronDown, ChevronUp, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PrymeAPI } from "@/lib/api";
import { toast } from "sonner";

interface OffersTabProps {
  productStatusFilter: "all" | "active" | "inactive";
  setProductStatusFilter: (filter: "all" | "active" | "inactive") => void;
  products: any[];
  filteredProducts: any[];
  setSelectedProduct: (product: any) => void;
  setIsOfferModalOpen: (open: boolean) => void;
  toggleProductMutation: any;
  refetchProducts: () => void;
  globalSearchQuery?: string;
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

const fmtPct = (v: any) => {
  if (v === null || v === undefined) return "—";
  const n = Number(v);
  return n < 1 ? `${(n * 100).toFixed(2)}%` : `${n}%`;
};

const fmtCurrency = (v: any) => {
  if (v === null || v === undefined) return "—";
  return `₹${Number(v).toLocaleString("en-IN")}`;
};

const fmtBool = (v: any) => {
  if (v === true) return "✅ Yes";
  if (v === false) return "❌ No";
  return "—";
};

const DetailCell = ({ label, value, mono }: { label: string; value: any; mono?: boolean }) => (
  <div>
    <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</span>
    <span className={cn("text-slate-300", mono && "font-mono")}>{value ?? "—"}</span>
  </div>
);

/* ── Main Component ──────────────────────────────────────────────────── */

export const OffersTab: React.FC<OffersTabProps> = ({
  productStatusFilter, setProductStatusFilter, products, filteredProducts,
  setSelectedProduct, setIsOfferModalOpen, toggleProductMutation, refetchProducts,
  globalSearchQuery
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [collapsedLenders, setCollapsedLenders] = useState<Set<string>>(new Set());

  const activeSearchQuery = (globalSearchQuery || searchQuery).toLowerCase().trim();

  const searchFilteredProducts = useMemo(() => {
    const list = filteredProducts || [];
    const q = activeSearchQuery;
    if (!q) return list;
    return list.filter((p: any) =>
      p && (
        (p.lenderName?.toLowerCase() ?? "").includes(q) ||
        (p.productCode?.toLowerCase() ?? "").includes(q) ||
        (p.productName?.toLowerCase() ?? "").includes(q) ||
        (p.campaignName?.toLowerCase() ?? "").includes(q) ||
        (p.loanType?.toLowerCase() ?? "").includes(q)
      )
    );
  }, [filteredProducts, activeSearchQuery]);

  // Group by lender, then sort each lender's products by loan type + code,
  // so HL/LAP variants of the same lender sit together instead of being
  // scattered across the raw id-insertion order the API returns them in.
  const lenderGroups = useMemo(() => {
    const groups = new Map<string, any[]>();
    for (const p of searchFilteredProducts) {
      const key = p.lenderName || "Unknown Lender";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(p);
    }
    for (const products of groups.values()) {
      products.sort((a, b) =>
        (a.loanType || "").localeCompare(b.loanType || "") ||
        (a.productCode || "").localeCompare(b.productCode || "")
      );
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b));
  }, [searchFilteredProducts]);

  // While actively searching, force every matching group open -- collapsing
  // would otherwise hide the very results the search just found.
  const isLenderExpanded = (lenderName: string) =>
    activeSearchQuery ? true : !collapsedLenders.has(lenderName);

  const toggleLender = (lenderName: string) => {
    setCollapsedLenders(prev => {
      const next = new Set(prev);
      if (next.has(lenderName)) next.delete(lenderName);
      else next.add(lenderName);
      return next;
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col space-y-6">

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d0d14] p-5 rounded-2xl border border-white/[0.06] shadow-xl shrink-0">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-500" /> Marketing & Offers — Product Matrix
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Full product catalogue. Every field from the <code className="text-purple-400 text-xs">loan_products</code> table is visible and editable here.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lender, code…"
              autoComplete="off"
              className="pl-8 pr-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs focus:bg-white/[0.08] focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all w-48 text-white placeholder:text-slate-600"
            />
          </div>
          <Select value={productStatusFilter} onValueChange={(v: any) => setProductStatusFilter(v)}>
            <SelectTrigger className="w-[130px] h-8 bg-white/[0.04] border-white/[0.08] text-white text-xs focus:ring-purple-500/50 outline-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d0d14] border-white/[0.08] text-white">
              <SelectItem value="all" className="text-xs">All ({products?.length || 0})</SelectItem>
              <SelectItem value="active" className="text-xs text-green-400">Active</SelectItem>
              <SelectItem value="inactive" className="text-xs text-slate-400">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => { setSelectedProduct(null); setIsOfferModalOpen(true); }}
            className="bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-none whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      {/* Products Datatable */}
      <div className="bg-[#0d0d14] rounded-2xl border border-white/[0.06] shadow-xl overflow-hidden flex flex-col">
        <div className="relative">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0d0d14] shadow-[0_1px_0_0_rgba(255,255,255,0.06)] z-10">
              <tr className="border-b border-white/[0.06] bg-slate-900/40 text-[10px] uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4 font-semibold">Lender / Product</th>
                <th className="px-6 py-4 font-semibold">Campaign</th>
                <th className="px-6 py-4 font-semibold">ROI / Fee</th>
                <th className="px-6 py-4 font-semibold">Tenure</th>
                <th className="px-6 py-4 font-semibold">Loan Range</th>
                <th className="px-6 py-4 font-semibold">CIBIL</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {lenderGroups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <CreditCard className="w-8 h-8 text-slate-600 mb-2" />
                      <p>{searchQuery ? `No products matching "${searchQuery}".` : (productStatusFilter === "all" ? "No products configured." : `No ${productStatusFilter} products.`)}</p>
                      {!searchQuery && productStatusFilter === "all" && (
                        <Button variant="link" onClick={() => { setSelectedProduct(null); setIsOfferModalOpen(true); }} className="text-purple-500">
                          Create the first product
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                lenderGroups.map(([lenderName, products]) => (
                  <React.Fragment key={lenderName}>
                    <tr
                      className="bg-white/[0.03] hover:bg-white/[0.05] transition-colors cursor-pointer select-none"
                      onClick={() => toggleLender(lenderName)}
                    >
                      <td colSpan={8} className="px-6 py-3">
                        <div className="flex items-center gap-2.5 text-sm font-bold text-slate-200">
                          {isLenderExpanded(lenderName)
                            ? <ChevronUp className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            : <ChevronDown className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{lenderName}</span>
                          <span className="text-xs font-normal text-slate-500">({products.length} product{products.length === 1 ? "" : "s"})</span>
                        </div>
                      </td>
                    </tr>
                    {isLenderExpanded(lenderName) && products.map((p: any) => (
                  <React.Fragment key={p.id}>
                    <tr className={cn("hover:bg-white/[0.02] transition-colors border-b border-white/[0.04]", expandedId === p.id && "bg-white/[0.02]")}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-200">{p.lenderName || "Unknown"}</div>
                        <div className="text-xs text-slate-500 mt-0.5 font-mono">{p.productCode}</div>
                        {p.productName && <div className="text-xs text-slate-500 mt-0.5">{p.productName}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-300">{p.campaignName || p.loanType || "—"}</span>
                        {p.offerType && (
                          <span className="ml-2 px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                            {p.offerType}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono">
                          <span className="text-amber-400">{fmtPct(p.roi)}</span>
                          <span className="text-slate-600 mx-1">/</span>
                          <span className="text-blue-400">{fmtPct(p.processingFee)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-300">{p.minTenureMonths ?? "—"} – {p.maxTenureMonths ?? "—"} mo</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-emerald-400 font-mono">
                          {fmtCurrency(p.minLoanAmount)} – {fmtCurrency(p.maxLoanAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-300">{p.minCibil ?? "—"} – {p.maxCibil ?? "—"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleProductMutation.mutate({ id: p.id, data: { ...p, active: !p.active } })}
                          className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border transition-all",
                            p.active ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20"
                          )}
                        >
                          {p.active ? "ACTIVE" : "DRAFT"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                            onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                          >
                            {expandedId === p.id ? <><ChevronUp className="w-3 h-3 mr-1" /> Hide</> : <><ChevronDown className="w-3 h-3 mr-1" /> Details</>}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
                            onClick={() => { setSelectedProduct(p); setIsOfferModalOpen(true); }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => {
                              if (!window.confirm(`Delete this product? This is irreversible.`)) return;
                              PrymeAPI.deleteAdminProduct(p.id)
                                .then(() => { toast.success("Product deleted."); refetchProducts(); })
                                .catch((e: any) => toast.error(e.message));
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* ── Expandable Details Accordion ─────────────────────────── */}
                    {expandedId === p.id && (
                      <tr className="bg-slate-950/40 border-b border-white/[0.04]">
                        <td colSpan={8} className="px-6 py-5">
                          <div className="space-y-5 animate-in slide-in-from-top-1 duration-200 text-xs">

                            {/* 1. Pricing Breakdown */}
                            <div>
                              <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-500 mb-2 border-b border-white/[0.06] pb-1">Pricing & Fees Breakdown</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                <DetailCell label="Base ROI" value={fmtPct(p.roi)} mono />
                                <DetailCell label="Processing Fee" value={fmtPct(p.processingFee)} mono />
                                <DetailCell label="Prepayment" value={fmtPct(p.prepaymentCharges)} mono />
                                <DetailCell label="Foreclosure" value={fmtPct(p.foreclosureCharges)} mono />
                                <DetailCell label="Login Fees" value={fmtCurrency(p.loginFees)} mono />
                                <DetailCell label="Legal/Technical" value={fmtCurrency(p.legalTechnicalCharges)} mono />
                                <DetailCell label="Stamp Duties" value={fmtCurrency(p.stampDuties)} mono />
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                <DetailCell label="Insurance" value={p.insuranceCharges || "—"} />
                                <DetailCell label="Other Expense" value={fmtCurrency(p.otherExpense)} mono />
                                <DetailCell label="Interest Type" value={p.interestType || "—"} />
                                <DetailCell label="FOIR / EMI-NMI" value={fmtPct(p.maxEmiNmiRatio)} mono />
                              </div>
                            </div>

                            {/* 2. Documentation */}
                            <div>
                              <h4 className="text-[11px] font-bold uppercase tracking-wider text-cyan-500 mb-2 border-b border-white/[0.06] pb-1">Documentation & Verification</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <DetailCell label="KYC Requirement" value={p.kycRequirement || "Standard"} />
                                <DetailCell label="Income Proof" value={p.incomeProof || "Standard"} />
                                <DetailCell label="Bank Statement" value={p.bankStatementMonths != null ? `${p.bankStatementMonths} Months` : "—"} />
                                <DetailCell label="ITR Required" value={p.itrRequirementYears != null ? `${p.itrRequirementYears} Years` : "—"} />
                                <DetailCell label="Salary Slips" value={p.salarySlipMonths != null ? `${p.salarySlipMonths} Months` : "—"} />
                                <DetailCell label="GST Required" value={p.gstRequiredMonths != null ? `${p.gstRequiredMonths} Months` : "—"} />
                                <DetailCell label="Residence Profile" value={p.residenceProfile || "—"} />
                                <DetailCell label="Additional Docs" value={p.additionalDocs || "—"} />
                              </div>
                            </div>

                            {/* 3. Risk & Ratios */}
                            <div>
                              <h4 className="text-[11px] font-bold uppercase tracking-wider text-red-500 mb-2 border-b border-white/[0.06] pb-1">Risk, Ratios & Restrictions</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <DetailCell label="LTV" value={fmtPct(p.ltv)} mono />
                                <DetailCell label="Obligation Treatment" value={p.obligationTreatment || "—"} />
                                <DetailCell label="DPD Allowed" value={fmtBool(p.dpdAllowed)} />
                                <DetailCell label="Write-Off Allowed" value={fmtBool(p.writeOffAllowed)} />
                                <DetailCell label="Settlement Allowed" value={fmtBool(p.settlementAllowed)} />
                                <DetailCell label="Risk Category" value={p.riskCategory || "—"} />
                              </div>
                            </div>

                            {/* 4. Applicant Profile */}
                            <div>
                              <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 mb-2 border-b border-white/[0.06] pb-1">Applicant Profile Constraints</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <DetailCell label="Occupation" value={p.occupation || "—"} />
                                <DetailCell label="Employer Type" value={p.employerType || "—"} />
                                <DetailCell label="Nature of Business" value={p.natureOfBusiness || "—"} />
                                <DetailCell label="Industry" value={p.industry || "—"} />
                              </div>
                            </div>

                            {/* 5. Restrictions */}
                            <div>
                              <h4 className="text-[11px] font-bold uppercase tracking-wider text-pink-500 mb-2 border-b border-white/[0.06] pb-1">Restrictions & Auto-Reject</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Pincode Restrictions</span>
                                  <pre className="p-2 bg-black/40 border border-white/5 rounded-md font-mono text-[11px] text-orange-400 overflow-x-auto whitespace-pre-wrap">{p.pincodeRestrictions || "None"}</pre>
                                </div>
                                <div>
                                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Rejection Codes</span>
                                  <pre className="p-2 bg-black/40 border border-white/5 rounded-md font-mono text-[11px] text-red-400 overflow-x-auto whitespace-pre-wrap">{p.rejectionCodes || "None"}</pre>
                                </div>
                                <div>
                                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Auto-Reject Conditions</span>
                                  <pre className="p-2 bg-black/40 border border-white/5 rounded-md font-mono text-[11px] text-red-400 overflow-x-auto whitespace-pre-wrap">{p.autoRejectConditions || "None"}</pre>
                                </div>
                              </div>
                            </div>

                            {/* 6. Campaign & Notes */}
                            <div>
                              <h4 className="text-[11px] font-bold uppercase tracking-wider text-purple-500 mb-2 border-b border-white/[0.06] pb-1">Campaign & Internal Notes</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <DetailCell label="Campaign Name" value={p.campaignName || "—"} />
                                <DetailCell label="Offer Type" value={p.offerType || "—"} />
                                <DetailCell label="Offer Details" value={p.offerDetails || "—"} />
                              </div>
                              <div className="mt-3">
                                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Internal Notes</span>
                                <p className="text-slate-400 italic">{p.notes || "No notes written."}</p>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OffersTab;
