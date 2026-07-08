import React from "react";
import { Plus, Building2, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { banks as localBankLogos } from "@/components/home/PartnerBankMarquee";

interface BanksTabProps {
  bankStatusFilter: "all" | "active" | "inactive";
  setBankStatusFilter: (filter: "all" | "active" | "inactive") => void;
  banks: any[];
  filteredBanks: any[];
  toggleBankMutation: any;
  refetchBanks: () => void;
  onAddBank: () => void;
  onEditBank: (bank: any) => void;
  onDeleteBank: (bank: any) => void;
}

const getLocalLogo = (bankName: string) => {
  if (!bankName) return null;
  const normalized = bankName.toLowerCase().trim();
  
  // Try exact match first
  let match = localBankLogos.find(lb => lb.name.toLowerCase() === normalized);
  if (match) return match.logo;

  // Try partial match
  match = localBankLogos.find(lb => 
    normalized.includes(lb.name.toLowerCase()) || 
    lb.name.toLowerCase().includes(normalized.replace(/ bank| limited| finance/g, "").trim())
  );
  return match ? match.logo : null;
};

const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : "?";

const getAvatarStyles = (name: string) => {
  const colors = [
    "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "bg-rose-500/20 text-rose-400 border-rose-500/30",
    "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    "bg-orange-500/20 text-orange-400 border-orange-500/30",
  ];
  if (!name) return colors[0];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export const BanksTab: React.FC<BanksTabProps> = ({
  bankStatusFilter, setBankStatusFilter, banks, filteredBanks,
  toggleBankMutation, refetchBanks, onAddBank, onEditBank, onDeleteBank
}) => {
  return (
    <div className="bg-[#0d0d14] rounded-2xl border border-white/[0.06] flex flex-col flex-1 min-h-0 relative animate-in fade-in slide-in-from-bottom-2">
      <div className="p-4 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.02] shrink-0 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-white">Partner Bank Network</h3>
          <Select value={bankStatusFilter} onValueChange={(v: any) => setBankStatusFilter(v)}>
            <SelectTrigger className="w-[120px] h-8 bg-white/[0.04] border-white/[0.08] text-white text-xs focus:ring-blue-500/50 outline-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d0d14] border-white/[0.08] text-white">
              <SelectItem value="all" className="text-xs">All ({banks.length})</SelectItem>
              <SelectItem value="active" className="text-xs text-green-400">Active</SelectItem>
              <SelectItem value="inactive" className="text-xs text-slate-400">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={onAddBank}>
          <Plus className="w-4 h-4 mr-2" /> Add Bank
        </Button>
      </div>
      <div className="flex-1 overflow-auto relative">
        <table className="w-full text-left border-collapse">
        <thead className="bg-white/[0.02] border-b border-white/[0.04]">
          <tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
            <th className="px-6 py-4">Bank</th>
            <th className="px-6 py-4">Logo</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04] text-sm">
          {filteredBanks.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-12 text-center text-slate-500">
                <div className="flex flex-col items-center gap-3">
                  <Building2 className="w-8 h-8 text-slate-600" />
                  <p>{bankStatusFilter === "all" ? "No banks configured." : `No ${bankStatusFilter} banks.`}</p>
                  {bankStatusFilter === "all" && (
                    <Button variant="link" onClick={onAddBank} className="text-blue-500">
                      Add your first partner bank
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            filteredBanks.map((b: any) => {
              const displayLogoUrl = b.logoUrl || getLocalLogo(b.bankName);
              
              return (
              <tr key={b.id} className="hover:bg-white/[0.03] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* Logo thumbnail */}
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border",
                      displayLogoUrl ? "bg-white/[0.04] border-white/[0.06]" : getAvatarStyles(b.bankName)
                    )}>
                      {displayLogoUrl ? (
                        <>
                          <img
                            src={displayLogoUrl}
                            alt={b.bankName}
                            className="w-full h-full object-contain p-0.5"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                parent.className = cn("w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border", getAvatarStyles(b.bankName));
                              }
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                          <span className="font-bold text-lg hidden">{getInitial(b.bankName)}</span>
                        </>
                      ) : (
                        <span className="font-bold text-lg">{getInitial(b.bankName)}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{b.bankName}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{b.id?.substring(0, 8)}…</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {displayLogoUrl ? (
                    <div className="w-24 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-white/[0.1] shadow-sm">
                      <img
                        src={displayLogoUrl}
                        alt={`${b.bankName} logo`}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full flex items-center justify-center ${getAvatarStyles(b.bankName)}"><span class="font-bold text-lg">${getInitial(b.bankName)}</span></div>`;
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className={cn("w-24 h-12 rounded-lg flex items-center justify-center overflow-hidden border shadow-sm", getAvatarStyles(b.bankName))}>
                      <span className="font-bold text-lg">{getInitial(b.bankName)}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleBankMutation.mutate({ id: b.id, active: !(b.active ?? b.isActive) })}
                    className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-full border transition-all",
                      (b.active ?? b.isActive)
                        ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                        : "bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20"
                    )}
                  >
                    {(b.active ?? b.isActive) ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300 opacity-60 group-hover:opacity-100 transition-opacity"
                      onClick={() => onEditBank(b)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 opacity-60 group-hover:opacity-100 transition-opacity"
                      onClick={() => onDeleteBank(b)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default BanksTab;
