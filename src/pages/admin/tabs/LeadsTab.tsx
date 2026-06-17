import React, { useMemo } from "react";
import { Loader2, Briefcase, IndianRupee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeadsTabProps {
  isLoadingLeads: boolean;
  rawLeads: any[];
  formatCurrency: (val: number) => string;
  StatusBadge: React.FC<{ status: string }>;
  onUpdateStatus: (id: string, status: string) => void;
  isUpdating: boolean;
}

// 🧠 Safe metadata parser — the metadata field is a JSON string from the backend.
// Returns a parsed object or empty object if null/invalid.
const parseMetadata = (metadata: string | null | undefined): Record<string, any> => {
  if (!metadata) return {};
  try {
    return JSON.parse(metadata);
  } catch {
    return {};
  }
};

// 🧠 Employment type display — converts raw enum values to human-readable labels
const formatEmploymentType = (raw: string | undefined): string => {
  if (!raw) return "—";
  const map: Record<string, string> = {
    SALARIED: "Salaried",
    SELF_EMPLOYED: "Self-Employed",
    SELF_EMPLOYED_PROFESSIONAL: "Self-Emp (Prof)",
    SELF_EMPLOYED_NON_PROFESSIONAL: "Self-Emp (Non-Prof)",
    BUSINESS: "Business",
    PROFESSIONAL: "Professional",
  };
  return map[raw.toUpperCase()] || raw.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

export const LeadsTab: React.FC<LeadsTabProps> = ({ isLoadingLeads, rawLeads, formatCurrency, StatusBadge, onUpdateStatus, isUpdating }) => {
  return (
    <div className="bg-[#0d0d14] rounded-2xl border border-white/[0.06] flex flex-col flex-1 min-h-0 relative animate-in fade-in slide-in-from-bottom-2">
      <div className="p-4 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.02] rounded-t-2xl">
        <h3 className="font-semibold text-white">Raw Inquiries (Initial Capture)</h3>
      </div>
      <div className="flex-1 overflow-auto relative">
        {isLoadingLeads ? (
          <div className="absolute inset-0 z-50 bg-black/20 backdrop-transform-gpu flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : null}
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#0d0d14] shadow-[0_1px_0_0_rgba(255,255,255,0.04)] z-10">
            <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
              <th className="px-6 py-4">Ref ID / Date</th>
              <th className="px-6 py-4">Client Data</th>
              <th className="px-6 py-4">Loan Needs</th>
              <th className="px-6 py-4">Employment</th>
              <th className="px-6 py-4">Monthly Income</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-sm">
            <AnimatePresence>
              {rawLeads.length === 0 && !isLoadingLeads ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500">No raw inquiries found.</td></tr>
              ) : (
                rawLeads.map((lead: any) => {
                  const meta = parseMetadata(lead.metadata);
                  return (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-6 py-4 align-top">
                        <p className="font-mono text-xs text-slate-400">{lead.id}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{new Date(lead.createdAt).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <p className="font-medium text-white">{lead.userName || 'Anonymous'}</p>
                        <p className="text-xs text-slate-400 mt-1">{lead.phone || 'No Phone'}</p>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <p className="font-semibold text-slate-200">{formatCurrency(lead.loanAmount)}</p>
                        <p className="text-[10px] bg-white/[0.06] text-slate-300 px-1.5 py-0.5 rounded font-medium border border-white/[0.06] uppercase inline-block mt-1">{lead.loanType}</p>
                      </td>
                      <td className="px-6 py-4 align-top">
                        {meta.employmentType ? (
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="text-xs text-slate-300">{formatEmploymentType(meta.employmentType)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600 italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        {meta.monthlyIncome ? (
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="text-xs font-mono text-emerald-300">
                              {formatCurrency(Number(meta.monthlyIncome))}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600 italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        {lead.status === "CONVERTED" ? (
                          <StatusBadge status={lead.status} />
                        ) : (
                          <Select
                            value={lead.status || "NEW"}
                            onValueChange={(val) => onUpdateStatus(lead.id, val)}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="bg-transparent border-0 p-0 h-auto w-auto focus:ring-0 focus:ring-offset-0 select-none cursor-pointer hover:opacity-80 transition-opacity">
                              <SelectValue>
                                <StatusBadge status={lead.status || "NEW"} />
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-[#0d0d14] border-white/[0.08] text-white">
                              <SelectItem value="NEW" className="text-xs">NEW</SelectItem>
                              <SelectItem value="CONTACTED" className="text-xs">CONTACTED</SelectItem>
                              <SelectItem value="REJECTED" className="text-xs">REJECTED</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsTab;
