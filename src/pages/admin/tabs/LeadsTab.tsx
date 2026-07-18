import React, { useState } from "react";
import { Loader2, Briefcase, IndianRupee, X } from "lucide-react";
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

// Humanizes a metadata key exactly like the CRM Pipeline's "Application Form
// Details" drawer does (AdminDashboard.tsx's selectedApp.metadata grid), so
// Raw Inquiries shows the same style of full form dump.
const humanizeKey = (key: string): string =>
  key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim();

export const LeadsTab: React.FC<LeadsTabProps> = ({ isLoadingLeads, rawLeads, formatCurrency, StatusBadge, onUpdateStatus, isUpdating }) => {
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const selectedMeta = selectedLead ? parseMetadata(selectedLead.metadata) : {};

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
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer"
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
                      <td className="px-6 py-4 align-top" onClick={(e) => e.stopPropagation()}>
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

      {/* ── Lead Details Drawer — mirrors CRM Pipeline's (AdminDashboard.tsx
          selectedApp) drawer: same layout, same full metadata dump, so a raw
          inquiry shows every form field exactly like an elevated application does. */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all">
          <div className="w-[500px] bg-[#0a0a10] h-full shadow-2xl flex flex-col animate-in slide-in-from-right border-l border-white/[0.06]">
            <div className="p-6 border-b border-white/[0.06] flex items-start justify-between bg-[#0d0d14]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold text-white font-mono">{selectedLead.id}</h2>
                  <StatusBadge status={selectedLead.status || "NEW"} />
                </div>
                <p className="text-sm text-slate-500">Captured: {new Date(selectedLead.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 bg-white/[0.06] rounded-full border border-white/[0.08] hover:bg-white/[0.1] active:scale-95 transition-all"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-[#0a0a10] space-y-4">
              <div className="p-5 border border-white/[0.06] rounded-xl grid grid-cols-2 gap-6 bg-white/[0.02]">
                <div><p className="text-xs text-slate-500 mb-1">Loan Amount</p><p className="font-semibold text-white">{formatCurrency(selectedLead.loanAmount)}</p></div>
                <div><p className="text-xs text-slate-500 mb-1">Loan Type</p><p className="font-semibold text-white uppercase">{selectedLead.loanType}</p></div>
                <div><p className="text-xs text-slate-500 mb-1">Applicant Name</p><p className="font-semibold text-white truncate">{selectedLead.userName || "Anonymous"}</p></div>
                <div><p className="text-xs text-slate-500 mb-1">Phone</p><p className="font-semibold text-white truncate">{selectedLead.phone || "—"}</p></div>
              </div>

              {Object.keys(selectedMeta).length > 0 ? (
                <div className="p-5 border border-white/[0.06] rounded-xl bg-white/[0.02]">
                  <h4 className="text-sm font-medium text-slate-300 mb-4 border-b border-white/[0.06] pb-2">Application Form Details</h4>
                  <div className="grid grid-cols-2 gap-6">
                    {Object.entries(selectedMeta).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-slate-500 mb-1">{humanizeKey(key)}</p>
                        <p className="font-semibold text-white truncate">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-5 border border-white/[0.06] rounded-xl bg-white/[0.02] text-center text-sm text-slate-500">
                  No additional form details captured for this inquiry.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsTab;
