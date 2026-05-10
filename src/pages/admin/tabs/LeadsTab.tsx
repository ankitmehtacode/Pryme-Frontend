import React from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LeadsTabProps {
  isLoadingLeads: boolean;
  rawLeads: any[];
  formatCurrency: (val: number) => string;
  StatusBadge: React.FC<{ status: string }>;
}

export const LeadsTab: React.FC<LeadsTabProps> = ({ isLoadingLeads, rawLeads, formatCurrency, StatusBadge }) => {
  return (
    <div className="bg-[#0d0d14] rounded-2xl border border-white/[0.06] flex flex-col h-[calc(100vh-180px)] relative animate-in fade-in slide-in-from-bottom-2">
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
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-sm">
            <AnimatePresence>
              {rawLeads.length === 0 && !isLoadingLeads ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-500">No raw inquiries found.</td></tr>
              ) : (
                rawLeads.map((lead: any) => (
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
                      <StatusBadge status={lead.status || 'NEW'} />
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsTab;
