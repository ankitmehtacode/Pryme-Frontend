import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Trash2, Sparkles, Loader2, Link2, Gift, Smartphone, Car, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PrymeAPI } from "@/lib/api";

interface ProductRewardFormData {
  id?: string;
  bank: string;
  productCode: string;
  iconType: string;
  rewardText: string;
  buttonDesign: string;
  logoUrl?: string;
  minLoanAmount?: number;
  maxLoanAmount?: number;
  employmentType?: string;
  reward1?: string;
  reward2?: string;
}

const initialRewardFormState: ProductRewardFormData = {
  bank: "",
  productCode: "",
  iconType: "GIFT",
  rewardText: "",
  buttonDesign: "ocean-blue",
  logoUrl: "",
  minLoanAmount: 0,
  maxLoanAmount: 9999999999,
  employmentType: "SALARIED",
  reward1: "",
  reward2: ""
};

export const ProductRewardTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [rewardFormData, setRewardFormData] = useState<ProductRewardFormData>(initialRewardFormState);
  const [isEditingReward, setIsEditingReward] = useState(false);

  // Fetch loan products for dropdowns
  const { data: loanProducts = [] } = useQuery({
    queryKey: ["admin_products"],
    queryFn: async () => {
      const res = await PrymeAPI.getAdminProducts();
      return res?.data?.content ? res.data.content : (res?.content ? res.content : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])));
    },
  });

  // Reward matching (BankComparisonCard.tsx) compares against the OBFUSCATED
  // public product code the engine returns to applicants (EligibilityResult.
  // toPublicResult() truncates e.g. "ABFL-HL-0001" -> "ABFL-HL"), via
  // `publicCode.endsWith(reward.productCode)`. A reward saved with a full
  // product code (e.g. "ABFL-HL-0001") can never match -- a longer string
  // can't be a suffix of a shorter one -- so it must be entered/stored the
  // same lender-loanType prefix, not a specific product variant.
  const deriveProductPrefix = (code: string) => code.split("-").slice(0, 2).join("-");

  // Fetch all banks to populate the bank dropdown comprehensively
  const { data: allBanks = [] } = useQuery({
    queryKey: ["admin_banks"],
    queryFn: async () => {
      const res = await PrymeAPI.getAdminBanks();
      return res?.content ? res.content : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
    },
  });

  // Fetch product rewards
  const { data: productRewards = [], isLoading: rewardsLoading } = useQuery({
    queryKey: ["admin_product_rewards"],
    queryFn: async () => {
      const res = await PrymeAPI.getAdminProductRewards();
      return res?.content ? res.content : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
    },
  });

  const createRewardMutation = useMutation({
    mutationFn: (data: ProductRewardFormData) => PrymeAPI.createAdminProductReward(data),
    onSuccess: () => {
      toast.success("Product reward created.");
      setRewardFormData(initialRewardFormState);
      setIsEditingReward(false);
      queryClient.invalidateQueries({ queryKey: ["admin_product_rewards"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create reward.");
    }
  });

  const updateRewardMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductRewardFormData }) =>
      PrymeAPI.updateAdminProductReward(id, data),
    onSuccess: () => {
      toast.success("Product reward updated.");
      setRewardFormData(initialRewardFormState);
      setIsEditingReward(false);
      queryClient.invalidateQueries({ queryKey: ["admin_product_rewards"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update reward.");
    }
  });

  const deleteRewardMutation = useMutation({
    mutationFn: (id: string) => PrymeAPI.deleteAdminProductReward(id),
    onSuccess: () => {
      toast.success("Product reward deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin_product_rewards"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete reward.");
    }
  });

  const handleRewardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardFormData.bank || !rewardFormData.productCode || !rewardFormData.rewardText) {
      toast.error("Please fill in all required fields for the reward.");
      return;
    }

    if (isEditingReward && rewardFormData.id) {
      updateRewardMutation.mutate({ id: rewardFormData.id, data: rewardFormData });
    } else {
      createRewardMutation.mutate(rewardFormData);
    }
  };

  const handleRewardEditClick = (reward: any) => {
    setRewardFormData({
      id: reward.id,
      bank: reward.bank || "",
      productCode: reward.productCode || "",
      iconType: reward.iconType || "GIFT",
      rewardText: reward.rewardText || "",
      buttonDesign: reward.buttonDesign || "ocean-blue",
      logoUrl: reward.logoUrl || "",
    });
    setIsEditingReward(true);
  };

  const handleRewardCancel = () => {
    setRewardFormData(initialRewardFormState);
    setIsEditingReward(false);
  };

  const handleRewardDelete = (id: string, bank: string) => {
    if (window.confirm(`Are you sure you want to delete the reward for ${bank}?`)) {
      deleteRewardMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-12 w-full animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Form Column */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              {isEditingReward ? "Edit Product Reward" : "Add Product Reward"}
            </h3>

            <form onSubmit={handleRewardSubmit} className="space-y-4 relative z-10">

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Bank</label>
                <Select
                  value={rewardFormData.bank}
                  onValueChange={(val) => {
                    setRewardFormData({ ...rewardFormData, bank: val, productCode: "" });
                  }}
                >
                  <SelectTrigger className="w-full bg-black/40 border-white/10 text-white">
                    <SelectValue placeholder="Select Bank" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#12121a] border-white/10">
                    {allBanks
                      .map((b: any) => b.bankName)
                      .filter(Boolean)
                      .sort()
                      .map((bank: string) => (
                      <SelectItem key={bank} value={bank} className="text-white focus:bg-white/10">
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Product Code</label>
                <Select
                  value={rewardFormData.productCode}
                  onValueChange={(val) => setRewardFormData({ ...rewardFormData, productCode: val })}
                  disabled={!rewardFormData.bank}
                >
                  <SelectTrigger className="w-full bg-black/40 border-white/10 text-white">
                    <SelectValue placeholder="Select Product" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#12121a] border-white/10">
                    {Array.from(new Set(
                      loanProducts
                        .filter((p: any) => p.lenderName?.toLowerCase().trim() === rewardFormData.bank?.toLowerCase().trim())
                        .map((product: any) => deriveProductPrefix(product.productCode))
                    )).sort().map((prefix: string) => (
                        <SelectItem key={prefix} value={prefix} className="text-white focus:bg-white/10">
                          {prefix}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Icon Type</label>
                <Select
                  value={rewardFormData.iconType}
                  onValueChange={(val) => setRewardFormData({ ...rewardFormData, iconType: val })}
                >
                  <SelectTrigger className="w-full bg-black/40 border-white/10 text-white">
                    <SelectValue placeholder="Select Icon" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#12121a] border-white/10">
                    <SelectItem value="GIFT" className="text-white focus:bg-white/10">
                      <div className="flex items-center gap-2">
                        <Gift className="w-3.5 h-3.5 text-pink-400" />
                        <span>Gift Hamper</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="SMARTPHONE" className="text-white focus:bg-white/10">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                        <span>Smartphone</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="CAR" className="text-white focus:bg-white/10">
                      <div className="flex items-center gap-2">
                        <Car className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Car</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="DISCOUNT" className="text-white focus:bg-white/10">
                      <div className="flex items-center gap-2">
                        <Percent className="w-3.5 h-3.5 text-amber-400" />
                        <span>Discount / Percent</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Min Loan Amount (₹)</label>
                  <input
                    type="number"
                    value={rewardFormData.minLoanAmount}
                    onChange={(e) => setRewardFormData({ ...rewardFormData, minLoanAmount: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Max Loan Amount (₹)</label>
                  <input
                    type="number"
                    value={rewardFormData.maxLoanAmount}
                    onChange={(e) => setRewardFormData({ ...rewardFormData, maxLoanAmount: Number(e.target.value) })}
                    className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Employment Type</label>
                <Select
                  value={rewardFormData.employmentType}
                  onValueChange={(val) => setRewardFormData({ ...rewardFormData, employmentType: val })}
                >
                  <SelectTrigger className="w-full bg-black/40 border-white/10 text-white">
                    <SelectValue placeholder="Select Employment Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#12121a] border-white/10">
                    <SelectItem value="SALARIED" className="text-white focus:bg-white/10">SALARIED</SelectItem>
                    <SelectItem value="SELF EMPLOYEED PROFESSIONAL" className="text-white focus:bg-white/10">SELF EMPLOYEED PROFESSIONAL</SelectItem>
                    <SelectItem value="SELF EMPLOYEED NON PROFESSIONAL" className="text-white focus:bg-white/10">SELF EMPLOYEED NON PROFESSIONAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Reward 1</label>
                  <input
                    type="text"
                    value={rewardFormData.reward1 || ""}
                    onChange={(e) => setRewardFormData({ ...rewardFormData, reward1: e.target.value })}
                    placeholder="e.g. SMARTPHONE"
                    className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Reward 2</label>
                  <input
                    type="text"
                    value={rewardFormData.reward2 || ""}
                    onChange={(e) => setRewardFormData({ ...rewardFormData, reward2: e.target.value })}
                    placeholder="e.g. LAPTOP"
                    className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Reward Text (Override / Memo)</label>
                <input
                  type="text"
                  value={rewardFormData.rewardText || ""}
                  onChange={(e) => setRewardFormData({ ...rewardFormData, rewardText: e.target.value })}
                  placeholder="Leave blank to auto-generate from Rewards"
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-400 block mb-1">Bank Logo Image URL (Optional)</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="url"
                    value={rewardFormData.logoUrl || ""}
                    onChange={(e) => setRewardFormData({ ...rewardFormData, logoUrl: e.target.value })}
                    placeholder="https://cdn.example.com/logo.png"
                    className="w-full bg-black/40 border border-white/10 rounded-md py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  type="submit"
                  disabled={createRewardMutation.isPending || updateRewardMutation.isPending}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                >
                  {isEditingReward ? "Update Reward" : "Publish Reward"}
                </Button>
                {isEditingReward && (
                  <Button type="button" variant="ghost" onClick={handleRewardCancel} className="text-slate-400 hover:text-white">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Active Rewards Table Column */}
        <div className="xl:col-span-8 flex flex-col">
          <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl overflow-hidden flex-1 flex flex-col">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Active Product Rewards
              </h3>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] uppercase tracking-wider text-slate-500 bg-black/20 sticky top-0 z-10 backdrop-blur-md">
                  <tr>
                    <th className="px-4 py-3 font-medium">Bank & Product</th>
                    <th className="px-4 py-3 font-medium">Icon</th>
                    <th className="px-4 py-3 font-medium">Reward Text</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rewardsLoading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 opacity-50" />
                        <p className="text-xs">Loading rewards...</p>
                      </td>
                    </tr>
                  ) : productRewards.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                          <Sparkles className="w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-slate-400 font-medium">No active rewards</p>
                        <p className="text-xs text-slate-500 mt-1">Publish a reward to see it here.</p>
                      </td>
                    </tr>
                  ) : (
                    productRewards.map((reward: any) => (
                      <tr key={reward.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-white">{reward.bank}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{reward.productCode}</p>
                        </td>
                        <td className="px-4 py-3">
                          {(() => {
                            switch (reward.iconType) {
                              case 'GIFT': return <div className="flex items-center gap-2"><div className="p-1.5 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/20"><Gift className="w-3.5 h-3.5" /></div><span className="text-xs font-medium text-pink-400">Gift Hamper</span></div>;
                              case 'SMARTPHONE': return <div className="flex items-center gap-2"><div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20"><Smartphone className="w-3.5 h-3.5" /></div><span className="text-xs font-medium text-blue-400">Smartphone</span></div>;
                              case 'CAR': return <div className="flex items-center gap-2"><div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Car className="w-3.5 h-3.5" /></div><span className="text-xs font-medium text-emerald-400">Car</span></div>;
                              case 'DISCOUNT': return <div className="flex items-center gap-2"><div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20"><Percent className="w-3.5 h-3.5" /></div><span className="text-xs font-medium text-amber-400">Discount</span></div>;
                              default: return <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10">{reward.iconType}</span>;
                            }
                          })()}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {reward.rewardText || [reward.reward1, reward.reward2].filter(Boolean).join(" • ")}
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {reward.employmentType} | ₹{(reward.minLoanAmount/100000).toFixed(0)}L+
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-1 justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-2"
                              onClick={() => handleRewardEditClick(reward)}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2"
                              onClick={() => handleRewardDelete(reward.id, reward.bank)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductRewardTab;
