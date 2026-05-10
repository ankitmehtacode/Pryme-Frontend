import React, { useState, useMemo } from "react";
import { Plus, Settings, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SettingsTabProps {
  ruleStatusFilter: "all" | "active" | "inactive";
  setRuleStatusFilter: (filter: "all" | "active" | "inactive") => void;
  eligibilityRules: any[];
  filteredEligibilityRules: any[];
  isSuperAdmin: boolean;
  authUser: any;
  setEditingEligibilityRule: (rule: any) => void;
  setIsEligibilityModalOpen: (open: boolean) => void;
  updateEligibilityRuleMutation: any;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  ruleStatusFilter, setRuleStatusFilter, eligibilityRules, filteredEligibilityRules,
  isSuperAdmin, authUser, setEditingEligibilityRule, setIsEligibilityModalOpen,
  updateEligibilityRuleMutation
}) => {
  const [ruleSearchQuery, setRuleSearchQuery] = useState("");

  const searchFilteredRules = useMemo(() => {
    const q = ruleSearchQuery.toLowerCase().trim();
    if (!q) return filteredEligibilityRules;
    return filteredEligibilityRules.filter((rule: any) =>
      rule.bankName?.toLowerCase().includes(q) ||
      rule.productCode?.toLowerCase().includes(q) ||
      rule.employmentType?.toLowerCase().includes(q) ||
      rule.incomeType?.toLowerCase().includes(q) ||
      rule.conditions?.toLowerCase().includes(q)
    );
  }, [filteredEligibilityRules, ruleSearchQuery]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d0d14] p-5 rounded-2xl border border-white/[0.06] shadow-xl">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" /> Matrix Engine Rules
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Configure advanced eligibility criteria. These rules directly drive the real-time routing logic for user "See My Offers" matches.
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
              className="pl-8 pr-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs focus:bg-white/[0.08] focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all w-48 text-white placeholder:text-slate-600"
            />
          </div>
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
          {(isSuperAdmin || authUser?.role === "ADMIN") && (
            <Button
              onClick={() => { setEditingEligibilityRule(null); setIsEligibilityModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-none whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Rule
            </Button>
          )}
        </div>
      </div>

      {/* Rules Datatable */}
      <div className="bg-[#0d0d14] rounded-2xl border border-white/[0.06] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
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
                  <tr key={rule.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-200">{rule.bankName || 'Any Bank'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{rule.productCode}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300">Min Age: {rule.minAge} | Inc: ₹{rule.minIncome?.toLocaleString()}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{rule.employmentType} ({rule.incomeType})</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-emerald-400 font-mono">
                        {(rule.ltvAllowed ? rule.ltvAllowed * 100 : 0)}% / {(rule.foirMax ? rule.foirMax * 100 : 0)}%
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
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
                        onClick={() => { setEditingEligibilityRule(rule); setIsEligibilityModalOpen(true); }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
