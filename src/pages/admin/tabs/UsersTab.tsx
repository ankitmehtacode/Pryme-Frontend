import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UsersTabProps {
  users: any[];
  isSuperAdmin: boolean;
  authUser: any;
  roleMutation: any;
}

export const UsersTab: React.FC<UsersTabProps> = ({ users, isSuperAdmin, authUser, roleMutation }) => {
  return (
    <div className="bg-[#0d0d14] rounded-2xl border border-white/[0.06] flex flex-col flex-1 min-h-0 relative animate-in fade-in slide-in-from-bottom-2">
      <div className="p-4 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.02] shrink-0 rounded-t-2xl">
        <h3 className="font-semibold text-white">Customer Directory</h3>
        <span className="text-xs text-slate-500 font-medium">{users.length} registered customers</span>
      </div>
      <div className="flex-1 overflow-auto relative">
        <table className="w-full text-left border-collapse">
        <thead className="bg-white/[0.02] border-b border-white/[0.04]">
          <tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
            <th className="px-6 py-4">Customer</th>
            <th className="px-6 py-4">Customer ID</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Joined</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04] text-sm">
          {users.length === 0 ? (
            <tr><td colSpan={6} className="p-8 text-center text-slate-500">No registered customers yet.</td></tr>
          ) : (
            users.map((u: any) => (
              <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-medium text-blue-400">
                      {(u.fullName || u.full_name || "US").substring(0, 2).toUpperCase()}
                    </div>
                    <p className="font-semibold text-white">{u.fullName || u.full_name}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300 font-mono text-xs font-semibold">{u.customerId || '—'}</td>
                <td className="px-6 py-4 text-slate-400 text-xs">{u.email}</td>
                <td className="px-6 py-4 text-slate-500 text-xs">{u.city ? `${u.city}, ${u.state || ''}` : '—'}</td>
                <td className="px-6 py-4 text-slate-500 text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                <td className="px-6 py-4 text-right">
                  {(isSuperAdmin || authUser?.role === "ADMIN") && (
                    <Select
                      onValueChange={(newRole) => {
                        if (newRole !== u.role) {
                          roleMutation.mutate({ userId: u.id, role: newRole });
                        }
                      }}
                    >
                      <SelectTrigger className="w-[120px] h-8 bg-white/[0.04] border-white/[0.08] text-white text-xs focus:ring-blue-500/50 outline-none ml-auto">
                        <SelectValue placeholder="Add to Team" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d0d14] border-white/[0.08] text-white">
                        {isSuperAdmin && <SelectItem value="SUPER_ADMIN" className="focus:bg-amber-500/10 focus:text-amber-400 text-xs">Super Admin</SelectItem>}
                        <SelectItem value="ADMIN" className="focus:bg-blue-500/10 focus:text-blue-400 text-xs">Admin</SelectItem>
                        <SelectItem value="EMPLOYEE" className="focus:bg-green-500/10 focus:text-green-400 text-xs">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default UsersTab;
