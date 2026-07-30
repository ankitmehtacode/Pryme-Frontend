import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Edit2, Trash2, Sparkles,
  Loader2, Eye, ToggleLeft, ToggleRight,
  ImageIcon, Link2, UploadCloud
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PrymeAPI, resolveApiUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

// Import bank logos for live preview resolution
import idbiLogo from "@/assets/idbi-bank.png";
import axisLogo from "@/assets/axis-bank.png";
import unionLogo from "@/assets/union-bank-of-india.svg";
import kotakLogo from "@/assets/kotak-mahindra-bank-logo-vector_logoshape.com.svg";
import pnbLogo from "@/assets/punjab-national-bank-vector-logo_logoshape.com.svg";
import yesLogo from "@/assets/yes-bank.png";
import tataLogo from "@/assets/tata-capital.png";

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
  cta: string;
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
  cta: "Apply Now",
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
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

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

  // Direct banner upload -- gets a presigned S3 PUT URL scoped to the
  // public-marketing/ prefix, uploads the file straight to S3, then stores
  // the returned permanent public URL (not a signed one) as bannerImageUrl.
  const handleBannerFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (bannerFileInputRef.current) bannerFileInputRef.current.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Only JPG or PNG images are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }

    setIsUploadingBanner(true);
    try {
      const { uploadUrl, publicUrl } = await PrymeAPI.initiateMarketingBannerUpload(file.type);
      // uploadUrl is a real, absolute S3 presigned URL in production, but a
      // *relative* backend path (/api/v1/dummy-s3-upload/...) whenever the
      // backend falls back to "dummy S3 mode" (AWS_S3_BUCKET not configured)
      // -- resolveApiUrl correctly targets the backend's own origin for that
      // case instead of the frontend's, which a bare fetch() would otherwise
      // silently get wrong.

      // The two ways this PUT fails need telling apart, because they have
      // nothing to do with each other and only one of them is fixable here.
      //
      // A browser blocks a cross-origin PUT before it is ever sent when the
      // bucket's CORS rules do not allow it. That surfaces as fetch() *throwing*
      // a TypeError -- there is no response object and no status code to read,
      // by design, so the old `!s3Response.ok` check never even ran and the
      // generic catch below reported "Failed to upload banner image", which
      // points at the file. It is not the file. It is the bucket.
      //
      // A 403 that does arrive is the opposite: the request reached S3 and was
      // refused -- expired presign, or a signed Content-Type the request did not
      // match. Same toast previously, completely different fix.
      //
      // This mirrors what uploadApplicationDocument in lib/api.ts already does
      // for the document vault; the same failure had already been diagnosed
      // once there.
      let s3Response: Response;
      try {
        s3Response = await fetch(resolveApiUrl(uploadUrl), {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
      } catch (networkErr) {
        console.error("Banner PUT blocked before dispatch (CORS or network):", networkErr, { uploadUrl });
        throw new Error(
          "The storage bucket refused the connection. Its CORS rules need to allow PUT from this admin origin."
        );
      }

      if (!s3Response.ok) {
        console.error("Banner PUT rejected by storage:", s3Response.status, { uploadUrl });
        if (s3Response.status === 403) {
          throw new Error("Storage rejected the upload (403). The upload link expired or the bucket policy denies it — try again, and if it repeats the bucket policy needs checking.");
        }
        throw new Error(`Storage rejected the upload (${s3Response.status}). Please try again.`);
      }

      setFormData(prev => ({ ...prev, bannerImageUrl: publicUrl }));
      toast.success("Banner uploaded.");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload banner image.");
    } finally {
      setIsUploadingBanner(false);
    }
  };

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
      cta: offer.cta || "Apply Now",
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

  const sortedOffers = useMemo(() => {
    return [...offers].sort((a: any, b: any) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [offers]);

  // Determine current active preview properties
  const activePreset = THEME_PRESETS[formData.logoType.toLowerCase()] || THEME_PRESETS.default;
  const currentLogo = LOGO_MAP[formData.logoType.toLowerCase()];
  // Resolve banner: explicit URL > fallback asset by logoType. Only the
  // uploaded URL can be a backend-relative dummy-S3-mode path -- BANNER_MAP
  // entries are locally bundled Vite assets and must NOT be run through
  // resolveApiUrl (that would incorrectly redirect them to the API origin).
  const resolvedBanner = (formData.bannerImageUrl ? resolveApiUrl(formData.bannerImageUrl) : "")
    || BANNER_MAP[formData.logoType.toLowerCase()] || "";

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

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Button Text (CTA)</label>
                <input
                  type="text"
                  value={formData.cta}
                  onChange={e => setFormData({ ...formData, cta: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500/40"
                  placeholder="e.g. Apply Now, View Special Terms"
                  maxLength={100}
                />
                <p className="text-[10px] text-slate-500 mt-1">Text shown on the offer card's CTA button on the homepage. Defaults to "View Details" if left empty.</p>
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
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Offer Banner Image</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="url"
                        value={formData.bannerImageUrl}
                        onChange={e => setFormData({ ...formData, bannerImageUrl: e.target.value })}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 pl-9 text-white text-sm focus:outline-none focus:border-violet-500/40"
                        placeholder="https://cdn.example.com/offer-banner.png or upload below"
                      />
                    </div>
                    <input
                      ref={bannerFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleBannerFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploadingBanner}
                      onClick={() => bannerFileInputRef.current?.click()}
                      className="shrink-0 border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:text-white"
                    >
                      {isUploadingBanner ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                      <span className="ml-1.5 hidden sm:inline">{isUploadingBanner ? "Uploading..." : "Upload"}</span>
                    </Button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Recommended: 1200×1000px (6:5), JPG or PNG, under 5MB — matches the live offer card's actual aspect
                    ratio (~1.2:1 on desktop, 0.92:1 on tablet). Keep logo/headline within the centered ~70% safe zone
                    since object-cover crops edges differently per breakpoint. This replaces the text card with a
                    full-bleed image.
                  </p>
                  {formData.bannerImageUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.02] p-1">
                      <img src={resolveApiUrl(formData.bannerImageUrl)} alt="Banner preview" className="w-full h-20 object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
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
                {/* ─── BANNER IMAGE PREVIEW (always resolves via BANNER_MAP fallback) ───
                     aspect-[6/5] (1.2:1) matches the live offer card's actual desktop
                     rendering (HeroCarousel.tsx's --landing-offer-width/-height CSS
                     vars resolve to ~1.14-1.2:1 on desktop, not the previous 21:9 this
                     preview used to show -- that made every banner look correctly
                     framed here while getting cropped hard on the real homepage. */}
                <div
                  className="w-full rounded-2xl overflow-hidden relative aspect-[6/5] min-h-[140px] border border-white/60 shadow-xl flex flex-col justify-between group transition-all duration-300"
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
                      {formData.cta || "View Details"}
                    </button>
                  </div>

                  {/* Techy shimmer sweep */}
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-[1200ms] ease-out pointer-events-none" />
                </div>
              </div>

            </div>
          </div>
      {/* 2. Configured Offers — real DB-backed rows only. What's shown here is
           exactly what PublicOfferController.heroOffers() serves to the
           homepage; there is no frontend-only fallback data anymore. */}
      <div className="bg-[#0d0d14] rounded-2xl border border-white/[0.06] overflow-hidden">
            <div className="p-4 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.02]">
              <h3 className="font-semibold text-white">Configured Offers</h3>
              <span className="text-xs text-slate-400 font-semibold bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
                Live: {offers.filter((o: any) => o.active).length} / Total: {sortedOffers.length}
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
                  ) : sortedOffers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No offers configured yet. Use the form above to publish one.
                      </td>
                    </tr>
                  ) : (
                    sortedOffers.map((offer: any) => {
                      const offerBanner = (offer.bannerImageUrl ? resolveApiUrl(offer.bannerImageUrl) : "")
                        || BANNER_MAP[offer.logoType?.toLowerCase()] || "";
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
                      );
                    })
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
