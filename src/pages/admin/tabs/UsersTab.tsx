import React from "react";
import { formatISTDate } from "@/lib/utils";

interface UsersTabProps {
  users: any[];
}

export const UsersTab: React.FC<UsersTabProps> = ({ users }) => {
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
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04] text-sm">
          {users.length === 0 ? (
            <tr><td colSpan={5} className="p-8 text-center text-slate-500">No registered customers yet.</td></tr>
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
                <td className="px-6 py-4 text-slate-500 text-xs">{u.createdAt ? formatISTDate(u.createdAt) : '—'}</td>
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
