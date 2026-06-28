import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, Edit2, Trash2, Sparkles, CheckCircle2, Zap, 
  Percent, ShieldCheck, Loader2, Eye, ToggleLeft, ToggleRight,
  ImageIcon, Link2
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

export const MarketingTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<HeroOfferFormData>(initialFormState);
  const [isEditing, setIsEditing] = useState(false);

  // 1. Fetch configured hero offers
  const { data: offers = [], isLoading, refetch } = useQuery({
    queryKey: ["admin_hero_offers"],
    queryFn: async () => {
      const res = await PrymeAPI.getAdminHeroOffers();
      return Array.isArray(res) ? res : (res?.data || []);
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

  // 3. Form operations
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tag || !formData.bank || !formData.title) {
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-2">
      
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
                <label className="text-xs font-semibold text-slate-400 block mb-1">Hero Illustration URL (Optional)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input 
                      type="url" 
                      value={formData.heroImageUrl} 
                      onChange={e => setFormData({ ...formData, heroImageUrl: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 pl-9 text-white text-sm focus:outline-none focus:border-violet-500/40"
                      placeholder="https://cdn.example.com/hero-illustration.png"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Recommended: 640×800px (.png/.webp) — Overrides the center bank illustration.</p>
                {formData.heroImageUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02] p-1">
                    <img src={formData.heroImageUrl} alt="Hero preview" className="w-full h-20 object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
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
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-[#f0f4ff] via-white to-[#fafafa] p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch shadow-inner min-h-[300px]">
            {/* Tech grid pattern overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-40 z-0" style={{ backgroundImage: "linear-gradient(to right, rgba(16, 55, 131, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 55, 131, 0.05) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            
            {/* Left side: Hero Illustration Mockup */}
            <div className="md:col-span-5 flex flex-col items-center justify-center relative p-2 z-0 h-[260px] overflow-hidden"
              style={{
                WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)',
                maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)',
              }}
            >
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-[#103783]/5 border border-[#103783]/10 text-[#103783] text-[8px] font-extrabold uppercase tracking-wider z-10 bg-white/70 shadow-sm">
                Hero Illustration
              </span>
              
              <img
                src={formData.heroImageUrl || heroBankImg}
                alt="Hero Illustration preview"
                className="w-full h-full object-contain filter drop-shadow(0 12px 40px rgba(16,55,131,0.05)) transform scale-[1.25] translate-x-[25px] -translate-y-[10px]"
                onError={(e) => { (e.target as HTMLImageElement).src = heroBankImg; }}
              />
              <span className="absolute bottom-3 left-3 text-[7px] text-slate-500 font-bold uppercase tracking-widest z-10 bg-white/70 px-2 py-0.5 rounded-full border border-[#103783]/5 shadow-sm">
                {formData.heroImageUrl ? "Custom Illustration" : "Default Bank Building"}
              </span>
            </div>

            {/* Right side: Offer Card Mockup (Replicating Homepage Premium glassmorphic look) */}
            <div className="md:col-span-7 h-full flex flex-col justify-center z-10">
              {/* ─── BANNER IMAGE PREVIEW (always resolves via BANNER_MAP fallback) ─── */}
              <div
                className="w-full rounded-3xl overflow-hidden relative min-h-[260px] border border-white/60 shadow-xl flex flex-col justify-between group transition-all duration-300"
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
                  <th className="px-4 py-3">Tagline & Offer</th>
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
                            <p className="text-white truncate font-medium">{offer.title}</p>
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
  );
};

export default MarketingTab;
