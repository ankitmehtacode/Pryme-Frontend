import React, { useState, useMemo } from "react";
import { Plus, Settings, Search, CreditCard, Zap, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import OffersTab from "./OffersTab";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { motion } from "framer-motion";
import { toast } from "sonner";
import * as XLSX from "xlsx";

/* ══════════════════════════════════════════════════════════════════════
   UNIFIED POLICY MATRIX TAB
   Sub-sections:
     1. Engine Rules     → EligibilityCondition CRUD
     2. Product Matrix   → LoanProduct CRUD (formerly "Marketing & Offers")
   ══════════════════════════════════════════════════════════════════════ */

interface SettingsTabProps {
  // ── Engine Rules (EligibilityCondition) ─────────────────────────────
  ruleStatusFilter: "all" | "active" | "inactive";
  setRuleStatusFilter: (filter: "all" | "active" | "inactive") => void;
  eligibilityRules: any[];
  filteredEligibilityRules: any[];
  isSuperAdmin: boolean;
  authUser: any;
  setEditingEligibilityRule: (rule: any) => void;
  setIsEligibilityModalOpen: (open: boolean) => void;
  updateEligibilityRuleMutation: any;
  deleteEligibilityRuleMutation: any;
  onViewSnapshot?: (ruleId: number) => void;

  // ── Product Matrix (LoanProduct) ────────────────────────────────────
  productStatusFilter: "all" | "active" | "inactive";
  setProductStatusFilter: (filter: "all" | "active" | "inactive") => void;
  products: any[];
  filteredProducts: any[];
  setSelectedProduct: (product: any) => void;
  setIsOfferModalOpen: (open: boolean) => void;
  toggleProductMutation: any;
  refetchProducts: () => void;
  
  // ── Global Search ──────────────────────────────────────────────────
  searchQuery?: string;
}

type SubSection = "rules" | "products";

export const SettingsTab: React.FC<SettingsTabProps> = ({
  ruleStatusFilter, setRuleStatusFilter, eligibilityRules, filteredEligibilityRules,
  isSuperAdmin, authUser, setEditingEligibilityRule, setIsEligibilityModalOpen,
  updateEligibilityRuleMutation, deleteEligibilityRuleMutation, onViewSnapshot,
  // Product props
  productStatusFilter, setProductStatusFilter, products, filteredProducts,
  setSelectedProduct, setIsOfferModalOpen, toggleProductMutation, refetchProducts,
  searchQuery
}) => {
  const [activeSubSection, setActiveSubSection] = useState<SubSection>("rules");
  const [ruleSearchQuery, setRuleSearchQuery] = useState("");
  const [expandedRuleId, setExpandedRuleId] = useState<number | null>(null);
  const [ruleBankFilter, setRuleBankFilter] = useState<string>("all");

  // Must read filteredEligibilityRules (AdminDashboard's RESOLVED bankName --
  // falls back to the linked product's lenderName when the raw DB column is
  // empty, which it is for almost every bulk-seeded rule) rather than the
  // raw eligibilityRules prop. Using the raw list here previously meant the
  // dropdown only ever offered the handful of banks whose bankName happened
  // to be set directly in the DB (manually-created rules), AND that its
  // options didn't match the resolved names searchFilteredRules below
  // actually filters against -- so selecting a bank could show "No active
  // rules" even when that bank plainly had rules in the table.
  const uniqueRuleBanks = useMemo(() => {
    const names = (filteredEligibilityRules || [])
      .map((rule: any) => rule?.bankName)
      .filter((name: unknown): name is string => typeof name === "string" && name.length > 0);
    return Array.from(new Set(names)).sort();
  }, [filteredEligibilityRules]);

  const searchFilteredRules = useMemo(() => {
    const list = filteredEligibilityRules || [];
    const q = (searchQuery || ruleSearchQuery).toLowerCase().trim();
    const bankFiltered = ruleBankFilter === "all"
      ? list
      : list.filter((rule: any) => rule?.bankName === ruleBankFilter);
    if (!q) return bankFiltered;
    return bankFiltered.filter((rule: any) =>
      rule && (
        (rule.bankName?.toLowerCase() ?? "").includes(q) ||
        (rule.productCode?.toLowerCase() ?? "").includes(q) ||
        (rule.employmentType?.toLowerCase() ?? "").includes(q) ||
        (rule.incomeType?.toLowerCase() ?? "").includes(q) ||
        (rule.conditions?.toLowerCase() ?? "").includes(q)
      )
    );
  }, [filteredEligibilityRules, ruleSearchQuery, searchQuery, ruleBankFilter]);

  const subSections: { id: SubSection; label: string; icon: React.ElementType; count: number }[] = [
    { id: "rules", label: "Engine Rules", icon: Zap, count: eligibilityRules?.length || 0 },
    { id: "products", label: "Product Matrix", icon: CreditCard, count: products?.length || 0 },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col flex-1 min-h-0 space-y-6">

      {/* ── Sub-Section Segmented Toggle ──────────────────────────────── */}
      <div className="flex items-center gap-1 bg-[#0d0d14] p-1.5 rounded-xl border border-white/[0.06] w-fit shadow-xl shrink-0">
        {subSections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSubSection(s.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
              activeSubSection === s.id
                ? "bg-white/[0.08] text-white shadow-lg shadow-black/30 border border-white/[0.08]"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] border border-transparent"
            )}
          >
            {activeSubSection === s.id && (
              <motion.div
                layoutId="activeSubTab"
                className="absolute inset-0 bg-white/[0.04] rounded-lg border border-white/[0.08]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <s.icon className={cn("w-4 h-4", activeSubSection === s.id ? "text-blue-400" : "text-slate-600")} />
            {s.label}
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-semibold transition-colors",
              activeSubSection === s.id ? "bg-blue-500/15 text-blue-400" : "bg-white/[0.04] text-slate-600"
            )}>
              {s.count}
            </span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
         SUB-SECTION 1: ENGINE RULES (EligibilityCondition)
      ══════════════════════════════════════════════════════════════════ */}
      {activeSubSection === "rules" && (
        <>
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d0d14] p-5 rounded-2xl border border-white/[0.06] shadow-xl shrink-0">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" /> Eligibility Engine Rules
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Configure who qualifies. These rules filter applicants during the "See My Offers" flow.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Search className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  value={ruleSearchQuery}
                  onChange={(e) => setRuleSearchQuery(e.target.value)}
                  placeholder="Search bank, product…"
                  autoComplete="off"
                  className="pl-8 pr-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs focus:bg-white/[0.08] focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all w-48 text-white placeholder:text-slate-600"
                />
              </div>
              <Select value={ruleBankFilter} onValueChange={setRuleBankFilter}>
                <SelectTrigger className="w-[150px] h-8 bg-white/[0.04] border-white/[0.08] text-white text-xs focus:ring-blue-500/50 outline-none">
                  <SelectValue placeholder="All Banks" />
                </SelectTrigger>
                <SelectContent className="bg-[#0d0d14] border-white/[0.08] text-white max-h-72">
                  <SelectItem value="all" className="text-xs">All Banks ({uniqueRuleBanks.length})</SelectItem>
                  {uniqueRuleBanks.map((bank) => (
                    <SelectItem key={bank} value={bank} className="text-xs">{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={ruleStatusFilter} onValueChange={(v: any) => setRuleStatusFilter(v)}>
                <SelectTrigger className="w-[130px] h-8 bg-white/[0.04] border-white/[0.08] text-white text-xs focus:ring-blue-500/50 outline-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0d0d14] border-white/[0.08] text-white">
                  <SelectItem value="all" className="text-xs">All ({eligibilityRules.length})</SelectItem>
                  <SelectItem value="active" className="text-xs text-green-400">Active</SelectItem>
                  <SelectItem value="inactive" className="text-xs text-slate-400">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  // Export exactly what's currently filtered on screen (search
                  // query, status, and bank) -- previously this always dumped
                  // every rule regardless of any filter the admin had applied,
                  // so "Download Matrix" never matched what was visible.
                  const rowsToExport = searchFilteredRules;
                  if (rowsToExport.length === 0) {
                    toast.error("No data to export.");
                    return;
                  }

                  // Extract all unique headers across all rules
                  const allKeys = new Set<string>();
                  rowsToExport.forEach(rule => {
                    Object.keys(rule).forEach(key => allKeys.add(key));
                  });

                  // Array of headers
                  const headers = Array.from(allKeys);

                  // Build JSON array for Excel
                  const dataToExport = rowsToExport.map(rule => {
                    const row: Record<string, any> = {};
                    headers.forEach(header => {
                      const value = rule[header];

                      // Handle null, undefined, objects (like JSON arrays/objects)
                      if (value === null || value === undefined) {
                        row[header] = "";
                      } else if (typeof value === 'object') {
                        row[header] = JSON.stringify(value);
                      } else {
                        row[header] = value;
                      }
                    });
                    return row;
                  });

                  // Create workbook and worksheet
                  const worksheet = XLSX.utils.json_to_sheet(dataToExport, { header: headers });
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(workbook, worksheet, "Policy Matrix");

                  // Download Excel file -- filename reflects the bank filter when one is active
                  const bankSuffix = ruleBankFilter !== "all" ? `_${ruleBankFilter.replace(/\s+/g, "_")}` : "";
                  XLSX.writeFile(workbook, `policy_matrix_export${bankSuffix}_${new Date().toISOString().split('T')[0]}.xlsx`);

                  toast.success(`Exported ${rowsToExport.length} rules to Excel.`);
                }}
                variant="outline"
                className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white shadow-none whitespace-nowrap h-9"
              >
                <Download className="w-4 h-4 mr-2" /> Download Matrix
              </Button>
              {(isSuperAdmin || authUser?.role === "ADMIN") && (
                <Button
                  onClick={() => { setEditingEligibilityRule(null); setIsEligibilityModalOpen(true); }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-none whitespace-nowrap h-9"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Rule
                </Button>
              )}
            </div>
          </div>

          {/* Rules Datatable */}
          <div className="bg-[#0d0d14] rounded-2xl border border-white/[0.06] shadow-xl overflow-hidden flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-auto relative">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#0d0d14] shadow-[0_1px_0_0_rgba(255,255,255,0.06)] z-10">
                  <tr className="border-b border-white/[0.06] bg-slate-900/40 text-[10px] uppercase tracking-widest text-slate-400">
                    <th className="px-6 py-4 font-semibold">Bank / Product</th>
                    <th className="px-6 py-4 font-semibold">Base Criteria</th>
                    <th className="px-6 py-4 font-semibold">Limits (LTV/FOIR)</th>
                    <th className="px-6 py-4 font-semibold">Exceptions</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {searchFilteredRules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-3">
                          <Settings className="w-8 h-8 text-slate-600 mb-2" />
                          <p>{ruleSearchQuery ? `No rules matching "${ruleSearchQuery}".` : (ruleStatusFilter === "all" ? "No engine rules defined." : `No ${ruleStatusFilter} rules.`)}</p>
                          {!ruleSearchQuery && ruleStatusFilter === "all" && (isSuperAdmin || authUser?.role === "ADMIN") && (
                            <Button variant="link" onClick={() => { setEditingEligibilityRule(null); setIsEligibilityModalOpen(true); }} className="text-blue-500">
                              Create the first rule
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    searchFilteredRules.map((rule: any) => (
                      <React.Fragment key={rule.id}>
                        <tr className={cn("hover:bg-white/[0.02] transition-colors border-b border-white/[0.04]", expandedRuleId === rule.id && "bg-white/[0.02]")}>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-200">{rule.bankName || 'Any Bank'}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{rule.productCode}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-300">Min Age: {rule.minAge} | Inc: ₹{rule.minIncome?.toLocaleString()} | CIBIL: {rule.cibilMin || "-"}</div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              <span className="text-xs text-slate-500">{rule.employmentType} ({rule.incomeType})</span>
                              {rule.surrogate && (
                                <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                                  {rule.surrogate}
                                </span>
                              )}
                              {rule.cityTier && (
                                <span className="px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                                  {rule.cityTier}
                                </span>
                              )}
                              {rule.employmentType?.includes("SELF_EMPLOYED") && rule.businessAgeYears !== undefined && rule.businessAgeYears !== null && (
                                <span className="text-xs text-slate-400 font-medium">
                                  • Biz Age: {rule.businessAgeYears} Yrs
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-emerald-400 font-mono">
                              {rule.ltvDisplay || "—"} / {rule.foirDisplay || "—"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-slate-400 max-w-[200px] truncate" title={rule.conditions}>
                              {rule.conditions || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => updateEligibilityRuleMutation.mutate({ id: rule.id, data: { ...rule, active: !rule.active } })} className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border transition-all", rule.active ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20")}>
                              {rule.active ? "ACTIVE" : "INACTIVE"}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 animate-all"
                                onClick={() => setExpandedRuleId(expandedRuleId === rule.id ? null : rule.id)}
                              >
                                {expandedRuleId === rule.id ? "Hide Details" : "Show Details"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 animate-all"
                                onClick={() => onViewSnapshot && onViewSnapshot(rule.id)}
                              >
                                Snapshot
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
                                onClick={() => { setEditingEligibilityRule(rule); setIsEligibilityModalOpen(true); }}
                              >
                                Edit
                              </Button>
                              {isSuperAdmin && (
                                <ConfirmAction
                                  title="Delete Engine Rule"
                                  description={`Are you sure you want to delete the eligibility rule for ${rule.bankName || 'Any Bank'} (${rule.productCode})? This action cannot be reversed.`}
                                  confirmLabel="Delete Rule"
                                  cancelLabel="Cancel"
                                  variant="destructive"
                                  onConfirm={() => deleteEligibilityRuleMutation.mutate(rule.id)}
                                >
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                                    Delete
                                  </Button>
                                </ConfirmAction>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expandedRuleId === rule.id && (
                          <tr className="bg-slate-950/40 border-b border-white/[0.04]">
                            <td colSpan={6} className="px-6 py-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-300 animate-in slide-in-from-top-1 duration-200">
                                <div>
                                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Negative Employer Type</span>
                                  <span className="font-mono text-slate-400">{rule.negativeEmployerType || "None"}</span>
                                </div>
                                <div>
                                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Negative Salary Mode</span>
                                  <span className="font-mono text-slate-400">{rule.negativeSalaryMode || "None"}</span>
                                </div>
                                <div>
                                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Margin By Occupation</span>
                                  <span className="font-mono text-slate-400">{rule.marginByOccupation || "None"}</span>
                                </div>
                                <div>
                                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">PF Mandatory</span>
                                  <span>{rule.providentFundMandatory ? "✅ Yes" : "❌ No"}</span>
                                </div>
                                <div>
                                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Property Type Allowed</span>
                                  <span className="text-slate-400">{rule.propertyType || "None"}</span>
                                </div>
                                <div>
                                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Negative Property Deny-List</span>
                                  <span className="text-slate-400">{rule.negativeProperty || "None"}</span>
                                </div>
                                <div>
                                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Profile Restrictions</span>
                                  <span className="text-slate-400">{rule.profileRestrictions || "None"}</span>
                                </div>
                                <div>
                                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">ITR Required</span>
                                  <span>{rule.itrRequiredYears || 0} Years</span>
                                </div>
                                <div className="col-span-2 md:col-span-4">
                                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Deviation Formulae</span>
                                  <pre className="p-2 bg-black/40 border border-white/5 rounded-md font-mono text-[11px] text-cyan-400 overflow-x-auto whitespace-pre-wrap">{rule.deviationFormulae || "None"}</pre>
                                </div>
                                <div className="col-span-2 md:col-span-4">
                                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Conditions</span>
                                  <pre className="p-2 bg-black/40 border border-white/5 rounded-md font-mono text-[11px] text-purple-400 overflow-x-auto whitespace-pre-wrap">{rule.conditions || "None"}</pre>
                                </div>
                                <div className="col-span-2 md:col-span-4">
                                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Internal Notes</span>
                                  <p className="text-slate-400 italic">{rule.notes || "No notes written."}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
         SUB-SECTION 2: PRODUCT MATRIX (LoanProduct)
      ══════════════════════════════════════════════════════════════════ */}
      {activeSubSection === "products" && (
        <OffersTab
          productStatusFilter={productStatusFilter}
          setProductStatusFilter={setProductStatusFilter}
          products={products}
          filteredProducts={filteredProducts}
          setSelectedProduct={setSelectedProduct}
          setIsOfferModalOpen={setIsOfferModalOpen}
          toggleProductMutation={toggleProductMutation}
          refetchProducts={refetchProducts}
          globalSearchQuery={searchQuery}
        />
      )}
    </div>
  );
};

export default SettingsTab;
