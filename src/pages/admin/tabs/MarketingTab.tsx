import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Edit2, Trash2, Sparkles, CheckCircle2, Zap,
  Percent, ShieldCheck, Loader2, Eye, ToggleLeft, ToggleRight,
  ImageIcon, Link2, Gift, Smartphone, Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PrymeAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

// Import bank logos for live preview resolution
import idbiLogo from "@/assets/idbi-bank-logo-1.svg";
import axisLogo from "@/assets/axis-bank-logo-1.svg";
import unionLogo from "@/assets/union-bank-of-india.svg";
import kotakLogo from "@/assets/kotak-mahindra-bank-logo-vector_logoshape.com.svg";
import pnbLogo from "@/assets/punjab-national-bank-vector-logo_logoshape.com.svg";
import yesLogo from "@/assets/yes-bank-new-logo-download_logoshape.com.svg";
import tataLogo from "@/assets/tata-capital-logo-svg_logoshape.com.svg";
import heroBankImg from "@/assets/hero-bank-building.png";
import { GlossyRewardButton } from "../../../components/admin/GlossyRewardButton";

// Import fallback banner images (matches HeroSection.tsx initialOffers)
import axisBanner from "@/assets/axis_festive_banner.png";
import hdfcBanner from "@/assets/hdfc_preferred_banner.png";
import idbiBanner from "@/assets/idbi_personal_banner.png";

const LOGO_MAP: Record<string, string> = {
  idbi: idbiLogo,
  axis: axisLogo,
  union: unionLogo,
  kotak: kotakLogo,
  pnb: pnbLogo,
  yes: yesLogo,
  tata: tataLogo,
};

// Fallback banner images per logoType — exact match of HeroSection defaults
const BANNER_MAP: Record<string, string> = {
  axis: axisBanner,
  hdfc: hdfcBanner,
  idbi: idbiBanner,
};

// Default hero offers that always display on the homepage carousel
// These are the source-of-truth fallbacks from HeroSection.tsx
const DEFAULT_HERO_OFFERS = [
  { logoType: "axis", bank: "AXIS BANK", tag: "SPECIAL FESTIVE OFFER", title: "Axis Bank Special Festive Offer", highlights: "Zero documentation (salary a/c) | Disbursed within 3 hours | Dedicated Relationship Manager", orderIndex: 1, active: true, bannerImageUrl: "", heroImageUrl: "", targetUrl: "/apply" },
  { logoType: "hdfc", bank: "HDFC BANK", tag: "PREFERRED OFFER", title: "HDFC Preferred Loan Offer Interest rates from 10.5% p.a.", highlights: "Flexible repayment options | Paperless process | Approval in 24 hours", orderIndex: 2, active: true, bannerImageUrl: "", heroImageUrl: "", targetUrl: "/apply" },
  { logoType: "idbi", bank: "IDBI BANK", tag: "ZERO FEE OFFER", title: "Zero Processing Fee on Personal Loans", highlights: "Quick digital sanction in 4 hours | Foreclosure charges waived off | No hidden charges", orderIndex: 3, active: true, bannerImageUrl: "", heroImageUrl: "", targetUrl: "/apply" },
];

// Preset colors and gradients for the live preview cards based on chosen bank
const THEME_PRESETS: Record<string, { accentColor: string; bgGradient: string }> = {
  idbi: { accentColor: "#0284c7", bgGradient: "conic-gradient(from 220deg at 30% 40%, #38bdf8 0deg, #818cf8 120deg, #0284c7 240deg, #38bdf8 360deg)" },
  axis: { accentColor: "#ec4899", bgGradient: "conic-gradient(from 220deg at 30% 40%, #f472b6 0deg, #fb7185 120deg, #9BAFD9 240deg, #f472b6 360deg)" },
  union: { accentColor: "#10b981", bgGradient: "conic-gradient(from 220deg at 30% 40%, #34d399 0deg, #6ee7b7 120deg, #10b981 240deg, #34d399 360deg)" },
  kotak: { accentColor: "#eab308", bgGradient: "conic-gradient(from 220deg at 30% 40%, #fde047 0deg, #fb923c 120deg, #ca8a04 240deg, #fde047 360deg)" },
  pnb: { accentColor: "#d97706", bgGradient: "conic-gradient(from 220deg at 30% 40%, #f59e0b 0deg, #fb923c 120deg, #b45309 240deg, #f59e0b 360deg)" },
  yes: { accentColor: "#2563eb", bgGradient: "conic-gradient(from 220deg at 30% 40%, #60a5fa 0deg, #3b82f6 120deg, #1d4ed8 240deg, #60a5fa 360deg)" },
  tata: { accentColor: "#4f46e5", bgGradient: "conic-gradient(from 220deg at 30% 40%, #818cf8 0deg, #6366f1 120deg, #4338ca 240deg, #818cf8 360deg)" },
  default: { accentColor: "#0284c7", bgGradient: "conic-gradient(from 220deg at 30% 40%, #38bdf8 0deg, #818cf8 120deg, #0284c7 240deg, #38bdf8 360deg)" },
};

export const BUTTON_DESIGNS: Record<string, { label: string; className: string }> = {
  "ocean-blue": { label: "Ocean Blue", className: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30" },
  "sunset-gradient": { label: "Sunset Gradient", className: "bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white shadow-lg shadow-orange-500/30" },
  "deep-navy": { label: "Deep Navy", className: "bg-blue-900 hover:bg-blue-950 text-white shadow-lg shadow-blue-900/30" },
  "teal-gradient": { label: "Teal Gradient", className: "bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-lg shadow-teal-500/30" },
  "emerald-glow": { label: "Emerald Glow", className: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]" },
  "neon-cyber": { label: "Neon Cyber", className: "bg-[#12121a] hover:bg-[#1a1a24] text-cyan-400 border border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" },
  "midnight-purple": { label: "Midnight Purple", className: "bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white shadow-lg shadow-purple-600/30" },
  "minimal-mono": { label: "Minimal Mono", className: "bg-black hover:bg-zinc-800 text-white border border-white/10 shadow-xl" },
  "golden-prestige": { label: "Golden Prestige", className: "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white shadow-lg shadow-amber-500/30" },
  "crimson-red": { label: "Crimson Red", className: "bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white shadow-lg shadow-red-500/30" },
};

interface HeroOfferFormData {
  id?: string;
  tag: string;
  bank: string;
  logoType: string;
  title: string;
  highlights: string;
  active: boolean;
  orderIndex: number;
  bannerImageUrl: string;
  heroImageUrl: string;
  targetUrl: string;
}

const initialFormState: HeroOfferFormData = {
  tag: "SPECIAL FESTIVE OFFER",
  bank: "AXIS BANK",
  logoType: "axis",
  title: "Pre-Approved Limit up to ₹50,00,000",
  highlights: "",
  active: true,
  orderIndex: 0,
  bannerImageUrl: "",
  heroImageUrl: "",
  targetUrl: "",
};

interface ProductRewardFormData {
  id?: string;
  bank: string;
  productCode: string;
  iconType: string;
  rewardText: string;
  buttonDesign: string;
  logoUrl?: string;
}

const initialRewardFormState: ProductRewardFormData = {
  bank: "",
  productCode: "",
  iconType: "GIFT",
  rewardText: "",
  buttonDesign: "ocean-blue",
  logoUrl: "",
};

export const MarketingTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<HeroOfferFormData>(initialFormState);
  const [isEditing, setIsEditing] = useState(false);

  const [rewardFormData, setRewardFormData] = useState<ProductRewardFormData>(initialRewardFormState);
  const [isEditingReward, setIsEditingReward] = useState(false);

  // 1. Fetch configured hero offers
  const { data: offers = [], isLoading, refetch } = useQuery({
    queryKey: ["admin_hero_offers"],
    queryFn: async () => {
      const res = await PrymeAPI.getAdminHeroOffers();
      return res?.content ? res.content : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
    },
  });

  // 2. Mutations
  const createMutation = useMutation({
    mutationFn: (data: HeroOfferFormData) => PrymeAPI.createAdminHeroOffer(data),
    onSuccess: () => {
      toast.success("Marketing offer published successfully.");
      setFormData(initialFormState);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["admin_hero_offers"] });
      queryClient.invalidateQueries({ queryKey: ["public_hero_offers"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to publish offer.");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: HeroOfferFormData }) =>
      PrymeAPI.updateAdminHeroOffer(id, data),
    onSuccess: () => {
      toast.success("Marketing offer updated successfully.");
      setFormData(initialFormState);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["admin_hero_offers"] });
      queryClient.invalidateQueries({ queryKey: ["public_hero_offers"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update offer.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => PrymeAPI.deleteAdminHeroOffer(id),
    onSuccess: () => {
      toast.success("Marketing offer deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin_hero_offers"] });
      queryClient.invalidateQueries({ queryKey: ["public_hero_offers"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete offer.");
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (offer: HeroOfferFormData) => {
      const updated = { ...offer, active: !offer.active };
      return PrymeAPI.updateAdminHeroOffer(offer.id!, updated);
    },
    onSuccess: () => {
      toast.success("Offer status toggled.");
      queryClient.invalidateQueries({ queryKey: ["admin_hero_offers"] });
      queryClient.invalidateQueries({ queryKey: ["public_hero_offers"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to toggle status.");
    }
  });

  // Fetch loan products for dropdowns
  const { data: loanProducts = [] } = useQuery({
    queryKey: ["admin_products"],
    queryFn: async () => {
      const res = await PrymeAPI.getAdminProducts();
      return res?.data?.content ? res.data.content : (res?.content ? res.content : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])));
    },
  });

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

  // 3. Form operations
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tag || !formData.bank) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (isEditing && formData.id) {
      updateMutation.mutate({ id: formData.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEditClick = (offer: any) => {
    setFormData({
      id: offer.id,
      tag: offer.tag || "",
      bank: offer.bank || "",
      logoType: offer.logoType || "default",
      title: offer.title || "",
      highlights: offer.highlights || "",
      active: offer.active ?? true,
      orderIndex: offer.orderIndex ?? 0,
      bannerImageUrl: offer.bannerImageUrl || "",
      heroImageUrl: offer.heroImageUrl || "",
      targetUrl: offer.targetUrl || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setIsEditing(false);
  };

  const handleDelete = (id: string, bank: string) => {
    if (window.confirm(`Are you sure you want to delete the offer for ${bank}?`)) {
      deleteMutation.mutate(id);
    }
  };

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

  // ── Merge defaults into configured offers so all 3 are always visible ──
  const mergedOffers = useMemo(() => {
    const list = [...offers] as any[];
    DEFAULT_HERO_OFFERS.forEach((def) => {
      const exists = list.some(
        (o: any) =>
          o.logoType?.toLowerCase() === def.logoType.toLowerCase() ||
          o.bank?.toUpperCase() === def.bank.toUpperCase()
      );
      if (!exists) {
        list.push({ ...def, id: `default-${def.logoType}`, _isDefault: true });
      }
    });
    return list.sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [offers]);

  // Determine current active preview properties
  const activePreset = THEME_PRESETS[formData.logoType.toLowerCase()] || THEME_PRESETS.default;
  const currentLogo = LOGO_MAP[formData.logoType.toLowerCase()];
  // Resolve banner: explicit URL > fallback asset by logoType
  const resolvedBanner = formData.bannerImageUrl || BANNER_MAP[formData.logoType.toLowerCase()] || "";

  return (
    <div className="space-y-12 w-full animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: Configuration Form (Streamlined — no text-only fields) */}
        <div className="lg:col-span-5 bg-[#0d0d14] rounded-2xl border border-white/[0.06] overflow-hidden p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
              {isEditing ? "Edit Marketing Offer" : "New Marketing Offer"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Upload banners, set illustrations, and configure offer layouts.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ─── Offer Details Section ─── */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={e => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500/40"
                    placeholder="e.g. SPECIAL OFFER"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Bank Theme/Logo</label>
                  <Select value={formData.logoType} onValueChange={(val) => setFormData({ ...formData, logoType: val })}>
                    <SelectTrigger className="w-full h-11 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 text-white text-sm focus:ring-0 focus:outline-none focus:border-blue-500/40">
                      <SelectValue placeholder="Select logo type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#11111a] border-white/[0.1] text-white">
                      {["HDFC", "SBI", "AXIS", "ICICI", "IDFC", "KOTAK", "RBL", "SC", "YES", "BAJAJ", "TATA", "DEFAULT", "CUSTOM"].map(b => (
                        <SelectItem key={b} value={b} className="focus:bg-white/[0.05] focus:text-white cursor-pointer">{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bank}
                  onChange={e => setFormData({ ...formData, bank: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500/40"
                  placeholder="e.g. HDFC Bank"
                  required
                />
              </div>
            </div>

            {/* ─── Image URLs Section ─── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Banner Images (Optional)</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Offer Banner Image URL</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="url"
                        value={formData.bannerImageUrl}
                        onChange={e => setFormData({ ...formData, bannerImageUrl: e.target.value })}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 pl-9 text-white text-sm focus:outline-none focus:border-violet-500/40"
                        placeholder="https://cdn.example.com/offer-banner.png"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Recommended: 800×500px (.png/.webp) — This replaces the text card with a full-bleed image.</p>
                  {formData.bannerImageUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02] p-1">
                      <img src={formData.bannerImageUrl} alt="Banner preview" className="w-full h-20 object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                </div>


                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Redirect / Target Link URL</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        value={formData.targetUrl}
                        onChange={e => setFormData({ ...formData, targetUrl: e.target.value })}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 pl-9 text-white text-sm focus:outline-none focus:border-violet-500/40"
                        placeholder="/apply or https://example.com"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Redirection destination for the CTA button (defaults to /apply if left empty).</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Display Rank/Order Index</label>
                <input
                  type="number"
                  value={formData.orderIndex}
                  onChange={e => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500/40"
                  required
                />
              </div>
              <div className="flex flex-col justify-end pb-1">
                <label className="text-xs font-semibold text-slate-400 block mb-2">Publish Status</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-xs border transition-all font-semibold w-full justify-center",
                      formData.active
                        ? "bg-green-500/10 text-green-400 border-green-500/25"
                        : "bg-slate-500/10 text-slate-400 border-slate-500/25"
                    )}
                  >
                    {formData.active ? "Published & Active" : "Draft (Inactive)"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
              {isEditing && (
                <Button type="button" variant="outline" className="flex-1 border-white/[0.08] text-slate-300" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  isEditing ? "Save Updates" : "Publish Offer"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Interactive Mockup & List */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Live Premium Mockup */}
          <div className="bg-[#0a0a0f] rounded-2xl border border-white/[0.06] p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <h4 className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-400" />
                Live Interactive Mockup
              </h4>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">WYSIWYG Mode</span>
              </div>
            </div>

            {/* Side-by-Side Preview Layout (Replicated from Homepage Hero Section) */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-[#f0f4ff] via-white to-[#fafafa] p-4 flex justify-center items-center shadow-inner min-h-[160px]">
              {/* Tech grid pattern overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-40 z-0" style={{ backgroundImage: "linear-gradient(to right, rgba(16, 55, 131, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 55, 131, 0.05) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

              {/* Offer Card Mockup (Replicating Homepage Premium glassmorphic look) */}
              <div className="z-10 max-w-xl w-full">
                {/* ─── BANNER IMAGE PREVIEW (always resolves via BANNER_MAP fallback) ─── */}
                <div
                  className="w-full rounded-2xl overflow-hidden relative aspect-[21/9] min-h-[140px] border border-white/60 shadow-xl flex flex-col justify-between group transition-all duration-300"
                  style={{
                    boxShadow: `0 8px 32px 0 rgba(16,55,131,0.06), 0 20px 40px -10px ${activePreset.accentColor}15`
                  }}
                >
                  {resolvedBanner ? (
                    <img
                      src={resolvedBanner}
                      alt={`${formData.bank} banner preview`}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <span className="text-xs text-slate-400 font-semibold">No banner configured</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none" />

                  {/* Floating FOMO badge */}
                  <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider border bg-amber-500/10 text-amber-700 border-amber-500/20 backdrop-blur-md bg-white/70 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {formData.tag || "LIVE OFFER"}
                  </span>

                  {/* Tag indicating source */}
                  {!formData.bannerImageUrl && resolvedBanner && (
                    <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full text-[7px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-600 border border-blue-500/20 backdrop-blur-md bg-white/70 shadow-sm">
                      Default Banner
                    </span>
                  )}

                  <div className="mt-auto p-3.5 z-10 flex justify-between items-center w-full">
                    <span className="text-[7px] text-white font-bold uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">{formData.bank || "BANK"}</span>
                    <button type="button" className="bg-[#103783] text-white px-3.5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-wider transition-all shadow-md hover:scale-[1.02]" style={{ backgroundColor: activePreset.accentColor, boxShadow: `0 4px 10px ${activePreset.accentColor}30` }}>
                      Apply Now
                    </button>
                  </div>

                  {/* Techy shimmer sweep */}
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-[1200ms] ease-out pointer-events-none" />
                </div>
              </div>

            </div>
          </div>
      {/* 2. Configured Offers — Always shows all 3 (DB + defaults merged) */}
      <div className="bg-[#0d0d14] rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="p-4 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.02]">
              <h3 className="font-semibold text-white">Configured Offers</h3>
              <span className="text-xs text-slate-400 font-semibold bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
                Total: {mergedOffers.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/[0.02] border-b border-white/[0.04]">
                  <tr className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="px-4 py-3 text-center">Rank</th>
                    <th className="px-4 py-3">Bank</th>
                    <th className="px-4 py-3">Offer Highlights</th>
                    <th className="px-4 py-3">Banner</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        <div className="flex justify-center items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          Loading offers database...
                        </div>
                      </td>
                    </tr>
                  ) : (
                    mergedOffers.map((offer: any) => {
                      const isDefault = !!offer._isDefault;
                      const offerBanner = offer.bannerImageUrl || BANNER_MAP[offer.logoType?.toLowerCase()] || "";
                      return (
                        <tr key={offer.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-4 py-3 text-center font-bold font-mono text-slate-400">
                            {offer.orderIndex}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="font-semibold text-white">{offer.bank}</p>
                                <p className="text-[9px] text-slate-500 tracking-wide uppercase mt-0.5">{offer.tag}</p>
                              </div>
                              {isDefault && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 tracking-wider">Default</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 max-w-[200px] truncate">
                            <div>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">{offer.highlights}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {offerBanner ? (
                              <div className="flex items-center gap-1.5">
                                <img src={offerBanner} alt="Banner" className="w-12 h-7 object-cover rounded-md border border-white/10 shadow-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                <span className="text-[9px] text-violet-400 font-bold uppercase">{offer.bannerImageUrl ? "Custom" : "Default"}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">None</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isDefault ? (
                              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold bg-green-500/10 text-green-400 border-green-500/20">
                                <ToggleRight className="w-3.5 h-3.5" />
                                Active
                              </span>
                            ) : (
                              <button
                                onClick={() => toggleStatusMutation.mutate(offer)}
                                className={cn(
                                  "flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold transition-all",
                                  offer.active
                                    ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                                    : "bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20"
                                )}
                                disabled={toggleStatusMutation.isPending}
                              >
                                {offer.active ? (
                                  <>
                                    <ToggleRight className="w-3.5 h-3.5" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft className="w-3.5 h-3.5" />
                                    Inactive
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex gap-1 justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-2"
                                onClick={() => handleEditClick(offer)}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              {!isDefault && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2"
                                  onClick={() => handleDelete(offer.id, offer.bank)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
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
        </div>
      </div>

      {/* ── Product Rewards Section ── */}
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
                    {loanProducts
                      .filter((p: any) => p.lenderName?.toLowerCase().trim() === rewardFormData.bank?.toLowerCase().trim())
                      .map((product: any) => (
                        <SelectItem key={product.productCode} value={product.productCode} className="text-white focus:bg-white/10">
                          {product.productCode} - {product.productName}
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

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Reward Text (Memo)</label>
                <input
                  type="text"
                  value={rewardFormData.rewardText}
                  onChange={(e) => setRewardFormData({ ...rewardFormData, rewardText: e.target.value })}
                  placeholder="e.g., 50% off on processing fee"
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

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Button Design</label>
                <Select
                  value={rewardFormData.buttonDesign}
                  onValueChange={(val) => setRewardFormData({ ...rewardFormData, buttonDesign: val })}
                >
                  <SelectTrigger className="w-full bg-black/40 border-white/10 text-white">
                    <SelectValue placeholder="Select Button Design" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#12121a] border-white/10 max-h-60">
                    {Object.entries(BUTTON_DESIGNS).map(([key, design]) => (
                      <SelectItem key={key} value={key} className="text-white focus:bg-white/10">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-4 h-4 rounded-full", design.className.split("hover:")[0])} />
                          <span>{design.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

        {/* Table & Mockup Column */}
        <div className="xl:col-span-8 flex flex-col">
          
          {/* Live Interactive Mockup for Rewards */}
          <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-6 relative overflow-hidden mb-6 flex-shrink-0">
            <h4 className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5 mb-4">
              <Eye className="w-4 h-4 text-purple-400" />
              Live Interactive Mockup
            </h4>
            
            <div className="bg-white rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between shadow-xl min-w-full relative overflow-hidden">
              {/* Optional background accent pattern */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#103783 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
              
              {/* Left: Bank Logo & Reward Tag */}
              <div className="flex items-center gap-3 md:gap-4 relative z-10 w-full md:w-auto shrink-0">
                <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center p-2 shrink-0 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-slate-100">
                   <img src={rewardFormData.logoUrl || LOGO_MAP[rewardFormData.bank?.toLowerCase()] || heroBankImg} alt="Bank Logo" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="shrink-0 min-w-[100px]">
                   <h3 className="text-[#103783] font-bold text-base mb-1.5 whitespace-nowrap">{rewardFormData.bank || "Select Bank"}</h3>
                   <div className="flex flex-col gap-2">
                     {rewardFormData.rewardText ? (
                       <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border whitespace-nowrap self-start", 
                          rewardFormData.iconType === 'GIFT' ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
                          rewardFormData.iconType === 'SMARTPHONE' ? "text-blue-600 bg-blue-50 border-blue-200" :
                          rewardFormData.iconType === 'CAR' ? "text-amber-600 bg-amber-50 border-amber-200" :
                          "text-purple-600 bg-purple-50 border-purple-200"
                       )}>
                         {rewardFormData.iconType === 'GIFT' && <Gift className="w-3 h-3" />}
                         {rewardFormData.iconType === 'SMARTPHONE' && <Smartphone className="w-3 h-3" />}
                         {rewardFormData.iconType === 'CAR' && <Car className="w-3 h-3" />}
                         {rewardFormData.iconType === 'DISCOUNT' && <Percent className="w-3 h-3" />}
                         <span>{rewardFormData.rewardText}</span>
                       </div>
                     ) : (
                       <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border text-slate-400 bg-slate-50 border-slate-200 border-dashed whitespace-nowrap self-start">
                         Add reward text to preview
                       </div>
                     )}
                     <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium tracking-wide">
                        <ShieldCheck className="w-3 h-3 text-blue-400" /> <span className="text-blue-400 font-bold">Only with Pryme</span> <Sparkles className="w-3 h-3 text-amber-400" />
                     </div>
                   </div>
                </div>
              </div>

              {/* Middle: EMI info (Mocked) */}
              <div className="hidden lg:flex items-center gap-4 px-4 xl:px-6 border-x border-slate-100 relative z-10 shrink-0">
                 <div>
                   <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5 whitespace-nowrap">EMI</p>
                   <p className="text-[#103783] font-black text-lg whitespace-nowrap">₹27,663</p>
                 </div>
                 <div className="text-center">
                   <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5 whitespace-nowrap">% Interest</p>
                   <p className="text-slate-700 font-bold text-xs whitespace-nowrap">7.25%</p>
                 </div>
                 <div className="text-center">
                   <p className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5 whitespace-nowrap">Tenure</p>
                   <p className="text-slate-700 font-bold text-xs whitespace-nowrap">20 yrs</p>
                 </div>
              </div>

              {/* Right: Apply Button */}
              <div className="flex flex-col items-center gap-0 mt-6 md:-mt-2 relative z-10 w-full md:w-auto shrink-0 justify-center">
                 <div className="-mb-8 md:-mb-12">
                   <GlossyRewardButton colorScheme={rewardFormData.buttonDesign as any} />
                 </div>
                 <button className="px-5 py-1.5 rounded-full font-medium text-[11px] text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors w-full md:w-auto whitespace-nowrap relative z-20">
                   Apply Directly 
                 </button>
              </div>
            </div>
          </div>

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
                        <td className="px-4 py-3 text-slate-300 truncate max-w-[200px]">
                          {reward.rewardText}
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

export default MarketingTab;
