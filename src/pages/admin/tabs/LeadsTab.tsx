import React, { useCallback, useRef, useState } from "react";
import { Download, Loader2, Briefcase, IndianRupee, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatISTDateTime, cn } from "@/lib/utils";

interface LeadsTabProps {
  isLoadingLeads: boolean;
  rawLeads: any[];
  formatCurrency: (val: number) => string;
  StatusBadge: React.FC<{ status: string }>;
  onUpdateStatus: (id: string, status: string) => void;
  isUpdating: boolean;
  // 🧠 Backend's /admin/leads/{id}/assign has always existed and is itself
  // gated ADMIN/SUPER_ADMIN only -- isEmployee mirrors that here so the
  // control isn't shown as usable to a role that would just get a 403.
  onAssign: (id: string, assigneeId: string) => void;
  isAssigning: boolean;
  teamMembers: any[];
  isEmployee: boolean;
  // Infinite-scroll pagination — the backend still only ever returns one
  // page (default 20/req size 50) at a time; the table asks for the next
  // one as the admin scrolls near the bottom instead of silently capping
  // the list at page 1.
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  // CSV export is gated ADMIN/SUPER_ADMIN server-side (AdminLeadController's
  // /admin/leads/export), so the button itself is hidden for isEmployee
  // rather than surfacing a 403.
  onExport: () => void;
  isExporting: boolean;
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

export const LeadsTab: React.FC<LeadsTabProps> = ({ isLoadingLeads, rawLeads, formatCurrency, StatusBadge, onUpdateStatus, isUpdating, onAssign, isAssigning, teamMembers, isEmployee, onLoadMore, hasMore, isLoadingMore, onExport, isExporting }) => {
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const selectedMeta = selectedLead ? parseMetadata(selectedLead.metadata) : {};
  // Callback fields get their own dedicated callout above, so they're
  // excluded here to avoid showing the same info twice.
  const CALLBACK_META_KEYS = new Set(["callbackRequested", "callbackRequestedAt", "rejectionReason"]);
  const formDetailEntries = Object.entries(selectedMeta).filter(([key]) => !CALLBACK_META_KEYS.has(key));

  // Fires the next page fetch once the scroller is within 200px of the
  // bottom, so the next batch is already in flight before the admin hits
  // the literal end of the list.
  const scrollerRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || !hasMore || isLoadingMore) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  return (
    <div className="bg-[#0d0d14] rounded-2xl border border-white/[0.06] flex flex-col flex-1 min-h-0 relative animate-in fade-in slide-in-from-bottom-2">
      <div className="p-4 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.02] rounded-t-2xl">
        <h3 className="font-semibold text-white">Raw Inquiries (Initial Capture)</h3>
        {!isEmployee && (
          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-2 text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Download Last 100 (CSV)
          </button>
        )}
      </div>
      <div ref={scrollerRef} onScroll={handleScroll} className="flex-1 overflow-auto relative">
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
              <th className="px-6 py-4">Assigned To</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-sm">
            <AnimatePresence>
              {rawLeads.length === 0 && !isLoadingLeads ? (
                <tr><td colSpan={7} className="p-12 text-center text-slate-500">No raw inquiries found.</td></tr>
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
                        <p className="text-[10px] text-slate-500 mt-1">{formatISTDateTime(lead.createdAt)}</p>
                        {meta.callbackRequested && (
                          <span className="text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase inline-block mt-1.5">
                            Requested a Callback
                          </span>
                        )}
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
                        <Select
                          value={lead.assignedTo || "UNASSIGNED"}
                          onValueChange={(val) => onAssign(lead.id, val === "UNASSIGNED" ? "" : val)}
                          disabled={isEmployee || isAssigning}
                        >
                          <SelectTrigger className={cn("w-[150px] h-8 text-xs font-medium border focus:ring-blue-500/50 outline-none transition-colors", !lead.assignedTo ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" : "bg-white/[0.04] text-slate-300 border-white/[0.08]")}>
                            <SelectValue placeholder="Assign" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0d0d14] border-white/[0.08] text-white">
                            <SelectItem value="UNASSIGNED" className="text-xs text-slate-400">Unassigned</SelectItem>
                            {teamMembers.map((tm: any) => (
                              <SelectItem key={tm.id} value={tm.id} className="text-xs">
                                {tm.fullName || tm.full_name || tm.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                              <SelectGroup>
                                <SelectLabel className="text-[10px] text-slate-500 uppercase tracking-wider pl-8">Contacted</SelectLabel>
                                <SelectItem value="FOLLOW_UP_PENDING" className="text-xs">Follow Up Pending</SelectItem>
                                <SelectItem value="REMINDER" className="text-xs">Reminder</SelectItem>
                                <SelectItem value="FOLLOW_UP_DONE" className="text-xs">Follow Up Done</SelectItem>
                              </SelectGroup>
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
            {isLoadingMore && (
              <tr><td colSpan={7} className="p-4 text-center text-slate-500 text-xs">
                <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> Loading more inquiries…
              </td></tr>
            )}
            {!hasMore && !isLoadingLeads && rawLeads.length > 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-slate-600 text-xs">
                End of list — {rawLeads.length} inquiries loaded.
              </td></tr>
            )}
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
                  {selectedMeta.callbackRequested && (
                    <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase">
                      Requested a Callback
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">Captured: {formatISTDateTime(selectedLead.createdAt)}</p>
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

              {selectedMeta.callbackRequested && (
                <div className="p-5 border border-blue-500/20 rounded-xl bg-blue-500/5">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">Callback Requested</h4>
                  {selectedMeta.callbackRequestedAt && (
                    <p className="text-[10px] text-slate-500 mb-2">{formatISTDateTime(selectedMeta.callbackRequestedAt)}</p>
                  )}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedMeta.rejectionReason || "Applicant asked to be contacted about this application."}
                  </p>
                </div>
              )}

              {formDetailEntries.length > 0 ? (
                <div className="p-5 border border-white/[0.06] rounded-xl bg-white/[0.02]">
                  <h4 className="text-sm font-medium text-slate-300 mb-4 border-b border-white/[0.06] pb-2">Application Form Details</h4>
                  <div className="grid grid-cols-2 gap-6">
                    {formDetailEntries.map(([key, value]) => (
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
