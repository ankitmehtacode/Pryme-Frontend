import React from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ConfirmAction } from "@/components/ui/confirm-action";

interface CompanyTabProps {
  teamMembers: any[];
  isSuperAdmin: boolean;
  authUser: any;
  roleMutation: any;
  deleteUserMutation: any;
}

export const CompanyTab: React.FC<CompanyTabProps> = ({ teamMembers, isSuperAdmin, authUser, roleMutation, deleteUserMutation }) => {
  return (
    <div className="bg-[#0d0d14] rounded-2xl border border-white/[0.06] overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      <div className="p-4 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.02]">
        <h3 className="font-semibold text-white">Team Members</h3>
        <span className="text-xs text-slate-500 font-medium">{teamMembers.length} team members{!isSuperAdmin && " • Role changes require SUPER_ADMIN"}</span>
      </div>
      {(roleMutation.isPending || deleteUserMutation.isPending) && (
        <div className="px-6 py-2 bg-blue-500/10 border-b border-blue-500/20 flex items-center gap-2 text-xs text-blue-400 font-medium">
          <Loader2 className="w-3 h-3 animate-spin" /> {roleMutation.isPending ? "Updating role in database..." : "Deleting team member..."}
        </div>
      )}
      <table className="w-full text-left border-collapse">
        <thead className="bg-white/[0.02] border-b border-white/[0.04]">
          <tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
            <th className="px-6 py-4">Member</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Joined</th>
            <th className="px-6 py-4">Employee ID</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04] text-sm">
          {teamMembers.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-slate-500">No team members found.</td></tr> : teamMembers.map((u: any) => {
            const isCurrentUser = authUser?.id === u.id;
            const canDelete = (isSuperAdmin || authUser?.role === "ADMIN") && !isCurrentUser;
            return (
              <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium border",
                      u.role === "SUPER_ADMIN" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                      u.role === "ADMIN" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                      "bg-green-500/10 border-green-500/20 text-green-400"
                    )}>
                      {(u.fullName || u.full_name || "TM").substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{u.fullName || u.full_name}</p>
                      {isCurrentUser && <span className="text-[10px] text-blue-400 font-medium">You</span>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-400 text-xs">{u.email}</td>
                <td className="px-6 py-4">
                  {(isSuperAdmin || authUser?.role === "ADMIN") && !isCurrentUser ? (
                    <Select
                      defaultValue={u.role}
                      onValueChange={(newRole) => {
                        if (newRole !== u.role) {
                          roleMutation.mutate({ userId: u.id, role: newRole });
                        }
                      }}
                    >
                      <SelectTrigger className="w-[160px] h-8 bg-white/[0.04] border-white/[0.08] text-white text-xs focus:ring-blue-500/50 outline-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d0d14] border-white/[0.08] text-white">
                        {isSuperAdmin && <SelectItem value="SUPER_ADMIN" className="focus:bg-amber-500/10 focus:text-amber-400 text-xs">Super Admin</SelectItem>}
                        <SelectItem value="ADMIN" className="focus:bg-blue-500/10 focus:text-blue-400 text-xs">Admin</SelectItem>
                        <SelectItem value="EMPLOYEE" className="focus:bg-green-500/10 focus:text-green-400 text-xs">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold border",
                      u.role === "SUPER_ADMIN" ? "bg-amber-500/15 text-amber-400 border-amber-500/25" :
                      u.role === "ADMIN" ? "bg-blue-500/15 text-blue-400 border-blue-500/25" :
                      "bg-green-500/15 text-green-400 border-green-500/25"
                    )}>{u.role.replace('_', ' ')}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                <td className="px-6 py-4 text-slate-300 font-mono text-xs font-semibold">{u.employeeId || '—'}</td>
                <td className="px-6 py-4 text-right">
                  {canDelete && (
                    <ConfirmAction
                      title="Delete Team Member"
                      description={`Are you sure you want to delete ${u.fullName || u.full_name || 'this team member'}? This will invalidate their sessions, clear their assignments, and delete their user footprint.`}
                      confirmLabel="Yes, Delete"
                      cancelLabel="Cancel"
                      variant="destructive"
                      onConfirm={() => deleteUserMutation.mutate(u.id)}
                    >
                      <button
                        disabled={deleteUserMutation.isPending}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all active:scale-95 disabled:opacity-50 inline-flex items-center justify-center"
                        title="Delete team member"
                      >
                        {deleteUserMutation.isPending && deleteUserMutation.variables === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </ConfirmAction>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyTab;
