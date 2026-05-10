import React from "react";
import { Loader2, LayoutList, LayoutGrid, ArrowUpRight, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ApplicationsTabProps {
  leadFilter: "all" | "queue";
  setLeadFilter: (filter: "all" | "queue") => void;
  crmView: "list" | "kanban";
  setCrmView: (view: "list" | "kanban") => void;
  statusMutation: any;
  assignMutation: any;
  filteredApplications: any[];
  pipelineStages: string[];
  setSelectedApp: (app: any) => void;
  formatCurrency: (val: number) => string;
  getNextStage: (status: string) => string | null;
  teamMembers: any[];
  StatusBadge: React.FC<{ status: string }>;
  isEmployee: boolean;
}

export const ApplicationsTab: React.FC<ApplicationsTabProps> = ({
  leadFilter, setLeadFilter, crmView, setCrmView, statusMutation, assignMutation,
  filteredApplications, pipelineStages, setSelectedApp, formatCurrency,
  getNextStage, teamMembers, StatusBadge, isEmployee
}) => {
  return (
    <div className="bg-[#0d0d14] rounded-2xl border border-white/[0.06] flex flex-col h-[calc(100vh-180px)] relative animate-in fade-in slide-in-from-bottom-2">
      <div className="p-4 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.02] rounded-t-2xl">
        <div className="flex gap-2">
          <Button onClick={() => setLeadFilter("all")} variant={leadFilter === "all" ? "default" : "outline"} size="sm" className={cn("h-8 text-xs font-medium shadow-sm transition-all", leadFilter === "all" && "bg-primary text-primary-foreground", leadFilter !== "all" && "border-white/[0.08] text-slate-400 hover:bg-white/[0.06] bg-transparent")}>All Leads</Button>
          <Button onClick={() => setLeadFilter("queue")} variant={leadFilter === "queue" ? "default" : "ghost"} size="sm" className={cn("h-8 text-xs font-medium transition-all", leadFilter === "queue" && "bg-primary text-primary-foreground", leadFilter !== "queue" && "text-slate-500 hover:text-slate-200")}>Active Queue</Button>
        </div>
        <div className="flex bg-white/[0.04] p-1 rounded-lg border border-white/[0.06]">
          <button onClick={() => setCrmView("list")} className={cn("p-1.5 rounded-md transition-all", crmView === "list" ? "bg-white/[0.1] shadow-sm text-white scale-105" : "text-slate-500 hover:text-white")}><LayoutList className="w-4 h-4" /></button>
          <button onClick={() => setCrmView("kanban")} className={cn("p-1.5 rounded-md transition-all", crmView === "kanban" ? "bg-white/[0.1] shadow-sm text-white scale-105" : "text-slate-500 hover:text-white")}><LayoutGrid className="w-4 h-4" /></button>
        </div>
      </div>

      {/* VIEW 1: List View */}
      {crmView === "list" && (
        <div className="flex-1 overflow-auto relative">
          {statusMutation.isPending || assignMutation.isPending ? (
            <div className="absolute inset-0 z-50 bg-black/20 backdrop-transform-gpu flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : null}

          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0d0d14] shadow-[0_1px_0_0_rgba(255,255,255,0.04)] z-10">
              <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                <th className="px-6 py-4">Case / Client</th>
                <th className="px-6 py-4">Client Data</th>
                <th className="px-6 py-4">Assignment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-sm">
              <AnimatePresence>
                {filteredApplications.length === 0 ? (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-500">No applications found in the database.</td></tr>
                ) : (
                  filteredApplications.map((app: any, idx: number) => (
                    <motion.tr
                      key={app.id || idx}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setSelectedApp(app)}
                      className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-medium text-xs mt-1 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            {(app.applicant?.name || app.applicant?.fullName || 'U')?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm leading-tight">{app.applicant?.name || app.applicant?.fullName || 'Unknown'}</p>
                            <p className="font-mono text-[11px] text-slate-500 mt-0.5">{app.applicationId}</p>
                            <p className="font-semibold text-slate-300 text-xs mt-0.5">{formatCurrency(app.requestedAmount)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400 truncate max-w-[180px]">{app.applicant?.email || app.applicant?.phoneNumber || '—'}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>CIBIL: <strong className={app.declaredCibilScore === -1 ? "text-slate-400" : (app.declaredCibilScore >= 750 ? "text-blue-400" : "text-amber-400")}>{app.declaredCibilScore === -1 ? "N/A" : app.declaredCibilScore}</strong></span>
                            <span className="text-[10px] bg-white/[0.06] text-slate-300 px-1.5 py-0.5 rounded font-medium border border-white/[0.06] uppercase">{app.loanType}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top" onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={app.assignedTo || "UNASSIGNED"}
                          onValueChange={(val) => {
                            assignMutation.mutate({ id: app.applicationId || app.id, assigneeId: val === "UNASSIGNED" ? "" : val });
                          }}
                          disabled={isEmployee}
                        >
                          <SelectTrigger className={cn("w-[150px] h-8 text-xs font-medium border focus:ring-blue-500/50 outline-none transition-colors", !app.assignedTo ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" : "bg-white/[0.04] text-slate-300 border-white/[0.08]")}>
                            <SelectValue placeholder="Assign Lead" />
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
                      <td className="px-6 py-4 align-top">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-4 align-top text-right">
                        {getNextStage(app.status) ? (
                          <Button
                            onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: app.applicationId, status: getNextStage(app.status)!, version: app.version }); }}
                            disabled={statusMutation.isPending}
                            size="sm"
                            className="h-8 bg-primary hover:bg-[#0c2a66] text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            → {getNextStage(app.status)} <ArrowUpRight className="w-3 h-3 ml-1" />
                          </Button>
                        ) : (
                          <span className="text-[10px] text-slate-600 font-medium uppercase">Terminal</span>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: Kanban Board */}
      {crmView === "kanban" && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-[#050508]/50">
          <div className="flex gap-6 h-full items-start w-max">
            {pipelineStages.map((stage) => (
              <div key={stage} className="w-80 flex flex-col max-h-full">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-sm font-medium text-slate-300">{stage}</h3>
                  <span className="text-xs font-semibold bg-white/[0.06] text-slate-400 px-2 py-0.5 rounded-full border border-white/[0.06]">
                    {filteredApplications.filter((a: any) => a.status === stage).length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 p-2">
                  {filteredApplications.filter((a: any) => a.status === stage).map((app: any) => (
                    <div key={app.id} onClick={() => setSelectedApp(app)} className="bg-[#0d0d14] p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.12] hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer border-l-4" style={{ borderLeftColor: stage === 'APPROVED' ? '#103783' : 'rgba(255,255,255,0.08)' }}>
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-xs font-mono text-slate-500">{app.applicationId}</span>
                        <span className="text-[10px] bg-white/[0.06] text-slate-300 px-1.5 py-0.5 rounded font-medium border border-white/[0.06] uppercase">{app.loanType}</span>
                      </div>
                      <p className="text-sm font-semibold text-white truncate mb-0.5">{app.applicant?.name || app.applicant?.fullName || 'Unknown'}</p>
                      <p className="text-lg font-semibold text-white mb-3">{formatCurrency(app.requestedAmount)}</p>
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span className={cn("flex items-center gap-1 font-medium", app.declaredCibilScore === -1 ? "text-slate-400" : (app.declaredCibilScore >= 750 ? "text-blue-400" : ""))}>
                          <Activity className="w-3 h-3" /> {app.declaredCibilScore === -1 ? "N/A" : app.declaredCibilScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsTab;
