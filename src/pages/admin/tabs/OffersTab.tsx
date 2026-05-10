import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PrymeAPI } from "@/lib/api";
import { toast } from "sonner";

interface OffersTabProps {
  productStatusFilter: "all" | "active" | "inactive";
  setProductStatusFilter: (filter: "all" | "active" | "inactive") => void;
  products: any[];
  filteredProducts: any[];
  setSelectedProduct: (product: any) => void;
  setIsOfferModalOpen: (open: boolean) => void;
  toggleProductMutation: any;
  refetchProducts: () => void;
}

export const OffersTab: React.FC<OffersTabProps> = ({
  productStatusFilter, setProductStatusFilter, products, filteredProducts,
  setSelectedProduct, setIsOfferModalOpen, toggleProductMutation, refetchProducts
}) => {
  return (
    <div className="bg-[#0d0d14] rounded-2xl border border-white/[0.06] overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      <div className="p-4 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-white">Dynamic Policy Engines / Offers</h3>
          <Select value={productStatusFilter} onValueChange={(v: any) => setProductStatusFilter(v)}>
            <SelectTrigger className="w-[120px] h-8 bg-white/[0.04] border-white/[0.08] text-white text-xs focus:ring-blue-500/50 outline-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0d0d14] border-white/[0.08] text-white">
              <SelectItem value="all" className="text-xs">All ({products.length})</SelectItem>
              <SelectItem value="active" className="text-xs text-green-400">Active</SelectItem>
              <SelectItem value="inactive" className="text-xs text-slate-400">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
          setSelectedProduct(null);
          setIsOfferModalOpen(true);
        }}><Plus className="w-4 h-4 mr-2" /> Add Entity</Button>
      </div>
      <table className="w-full text-left border-collapse">
        <thead className="bg-white/[0.02] border-b border-white/[0.04]">
          <tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
            <th className="px-6 py-4">Lender</th>
            <th className="px-6 py-4">Campaign</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">ROI</th>
            <th className="px-6 py-4">Processing Fee</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04] text-sm">
          {filteredProducts.length === 0 ? (
            <tr><td colSpan={6} className="p-6 text-center text-slate-500">{productStatusFilter === "all" ? "No products configured." : `No ${productStatusFilter} products.`}</td></tr>
          ) : (
            filteredProducts.map((p: any) => (
              <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-6 py-4 font-semibold text-white">{p.lenderName || "Unknown"}</td>
                <td className="px-6 py-4 text-slate-300">{p.campaignName || p.loanType}</td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleProductMutation.mutate({ id: p.id, data: { ...p, active: !p.active } })} className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border transition-all", p.active ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20")}>
                    {p.active ? "Active" : "Draft"}
                  </button>
                </td>
                <td className="px-6 py-4 font-mono text-amber-400">{p.roi < 1 ? (p.roi * 100).toFixed(2) : p.roi}%</td>
                <td className="px-6 py-4 font-mono text-blue-400">{p.processingFee < 1 ? (p.processingFee * 100).toFixed(2) : p.processingFee || 0}%</td>
                <td className="px-6 py-4 text-right flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300" onClick={() => {
                    setSelectedProduct(p);
                    setIsOfferModalOpen(true);
                  }}>Edit</Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => {
                    if (!window.confirm(`Delete this offer? This is irreversible.`)) return;
                    PrymeAPI.deleteAdminProduct(p.id)
                      .then(() => { toast.success("Product deleted."); refetchProducts(); })
                      .catch((e: any) => toast.error(e.message));
                  }}>Delete</Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OffersTab;
