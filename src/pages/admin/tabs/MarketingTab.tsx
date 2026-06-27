import React, { useState, useEffect } from "react";
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

const LOGO_MAP: Record<string, string> = {
  idbi: idbiLogo,
  axis: axisLogo,
  union: unionLogo,
  kotak: kotakLogo,
  pnb: pnbLogo,
  yes: yesLogo,
  tata: tataLogo,
};

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
  highlights: "Zero documentation for salary accounts | Funds disbursed within 3 hours",
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
    if (!formData.tag || !formData.bank || !formData.title || !formData.highlights) {
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

  // Determine current active preview properties
  const activePreset = THEME_PRESETS[formData.logoType.toLowerCase()] || THEME_PRESETS.default;
  const currentLogo = LOGO_MAP[formData.logoType.toLowerCase()];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-2">
      
      {/* LEFT COLUMN: Configuration Form */}
      <div className="lg:col-span-5 bg-[#0d0d14] rounded-2xl border border-white/[0.06] overflow-hidden p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
            {isEditing ? "Edit Marketing Offer" : "New Marketing Offer"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Configure taglines, bulletins, and custom layouts instantly.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Badge Tagline (e.g. SPECIAL OFFER)</label>
            <input 
              type="text" 
              value={formData.tag} 
              onChange={e => setFormData({ ...formData, tag: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500/40"
              placeholder="e.g. SPECIAL FESTIVE OFFER"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Bank Name</label>
              <input 
                type="text" 
                value={formData.bank} 
                onChange={e => setFormData({ ...formData, bank: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500/40"
                placeholder="e.g. AXIS BANK"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Logo Preset Mapping</label>
              <Select 
                value={formData.logoType} 
                onValueChange={(v) => setFormData({ ...formData, logoType: v })}
              >
                <SelectTrigger className="w-full h-11 bg-white/[0.04] border-white/[0.08] text-white text-sm focus:ring-blue-500/50 outline-none">
                  <SelectValue placeholder="Select logo" />
                </SelectTrigger>
                <SelectContent className="bg-[#0d0d14] border-white/[0.08] text-white">
                  <SelectItem value="axis">Axis Bank</SelectItem>
                  <SelectItem value="idbi">IDBI Bank</SelectItem>
                  <SelectItem value="union">Union Bank of India</SelectItem>
                  <SelectItem value="kotak">Kotak Mahindra Bank</SelectItem>
                  <SelectItem value="pnb">Punjab National Bank</SelectItem>
                  <SelectItem value="yes">Yes Bank</SelectItem>
                  <SelectItem value="tata">Tata Capital</SelectItem>
                  <SelectItem value="none">Text Only / Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Headline (Hero offer tagline)</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500/40"
              placeholder="e.g. Zero Processing Fee on Personal Loans"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Bullets / Highlights (separate using `|` symbol)</label>
            <textarea 
              value={formData.highlights} 
              onChange={e => setFormData({ ...formData, highlights: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500/40 min-h-[80px] resize-none"
              placeholder="e.g. Quick digital sanction in 4 hours | Foreclosure charges waived"
              required
            />
            <p className="text-[10px] text-slate-500 mt-1">Separate multiple bullet points with the pipe symbol ( | ).</p>
          </div>

          {/* ─── Image URLs Section ─── */}
          <div className="pt-3 border-t border-white/[0.06]">
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

          {/* Premium Glassmorphic Hero Card Mockup — Image or Text Mode */}
          {formData.bannerImageUrl ? (
            /* ─── IMAGE MODE PREVIEW ─── */
            <div className="w-full rounded-[24px] overflow-hidden relative min-h-[200px] border border-white/20 shadow-2xl transition-all duration-500 ease-out group">
              <img 
                src={formData.bannerImageUrl} 
                alt="Banner preview" 
                className="w-full h-full object-cover min-h-[200px] transition-transform duration-700 group-hover:scale-[1.02]" 
                onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect fill="%23111" width="400" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23555" font-size="14">Image failed to load</text></svg>'; }}
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none" />
              <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <ImageIcon className="w-2.5 h-2.5" />
                Image Mode
              </div>
              <div className="absolute bottom-2 inset-x-0 z-10 flex items-center justify-center">
                <span className="text-[7px] text-white/60 font-bold uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">Live Preview — Image Banner</span>
              </div>
            </div>
          ) : (
            /* ─── TEXT MODE PREVIEW (existing glassmorphic layout) ─── */
            <div 
              className="w-full rounded-[24px] overflow-hidden p-6 relative flex flex-col justify-between min-h-[200px] border border-white/20 shadow-2xl transition-all duration-500 ease-out"
              style={{ contain: "layout style paint" }}
            >
              {/* Aurora Background Effect */}
              <div 
                className="absolute inset-[-10%] opacity-40 blur-3xl pointer-events-none transition-all duration-500"
                style={{ background: activePreset.bgGradient }}
              />

              {/* Specular glare overlay */}
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/25 via-transparent to-transparent pointer-events-none opacity-80" />

              {/* Top Bar Mockup */}
              <div className="relative z-10 flex items-center justify-between pointer-events-none shrink-0 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-[1.5px] bg-slate-800/40 rounded-full shrink-0" />
                  <span className="text-[8px] font-mono tracking-widest uppercase text-slate-800/80 font-bold">
                    Instant Capital. Zero Friction.
                  </span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800/30" />
              </div>

              {/* Center Billboard Mockup */}
              <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center pointer-events-none select-none">
                {/* Badge Tagline & Bank */}
                <div className="flex items-center justify-center gap-2 px-3 py-1 mb-2.5 rounded-full bg-white/40 border border-white/50 shadow-sm">
                  <div className="px-1.5 py-0.5 rounded-full bg-white text-slate-800 text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-xs">
                    <Zap className="w-2 h-2" style={{ color: activePreset.accentColor }} />
                    {formData.tag || "LIVE OFFER"}
                  </div>
                  {currentLogo ? (
                    <img src={currentLogo} className="h-3.5 object-contain" alt={formData.bank} />
                  ) : (
                    <span className="text-[9px] font-bold text-slate-800 tracking-wider">{formData.bank || "BANK NETWORK"}</span>
                  )}
                </div>

                {/* Title Tagline */}
                <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-[#0a1530] tracking-tight leading-tight mb-2.5 max-w-xl">
                  {formData.title || "Pre-Approved Loan Limits & Offers"}
                </h2>

                {/* Highlights Bullet List */}
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {(formData.highlights ? formData.highlights.split('|') : ["Premium live preview updates", "Instant CRM publishing"])
                    .map((h, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/5 border border-slate-900/10 text-[#0a1530]/90 text-[8px] font-bold tracking-wide">
                        <CheckCircle2 className="w-2 h-2 text-slate-800/70" style={{ color: activePreset.accentColor }} />
                        {h.trim()}
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Bottom Bar Marquee Spacer */}
              <div className="relative z-10 w-full border-t-[0.5px] border-white/30 bg-white/20 mt-4 pt-1 rounded-b-2xl pointer-events-none">
                <div className="flex items-center justify-center py-1">
                  <span className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">Live Preview — Text Mode</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Configured Offers Table */}
        <div className="bg-[#0d0d14] rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.02]">
            <h3 className="font-semibold text-white">Configured Offers</h3>
            <span className="text-xs text-slate-400 font-semibold bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
              Total: {offers.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.02] border-b border-white/[0.04]">
                <tr className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="px-4 py-3 text-center">Rank</th>
                  <th className="px-4 py-3">Bank</th>
                  <th className="px-4 py-3">Tagline & Offer</th>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        Loading offers database...
                      </div>
                    </td>
                  </tr>
                ) : offers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <Sparkles className="w-6 h-6 text-slate-600" />
                        <p>No custom marketing offers configured.</p>
                        <p className="text-[10px] text-slate-600">The home page is currently running on the automatic fallback (Top Active Products).</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  offers.map((offer: any) => (
                    <tr key={offer.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-3 text-center font-bold font-mono text-slate-400">
                        {offer.orderIndex}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-white">{offer.bank}</p>
                          <p className="text-[9px] text-slate-500 tracking-wide uppercase mt-0.5">{offer.tag}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate">
                        <div>
                          <p className="text-white truncate font-medium">{offer.title}</p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{offer.highlights}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {offer.bannerImageUrl ? (
                          <div className="flex items-center gap-1.5">
                            <img src={offer.bannerImageUrl} alt="Banner" className="w-10 h-6 object-cover rounded border border-white/10" />
                            <span className="text-[9px] text-violet-400 font-bold uppercase">Image</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Text</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2"
                            onClick={() => handleDelete(offer.id, offer.bank)}
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
  );
};

export default MarketingTab;
