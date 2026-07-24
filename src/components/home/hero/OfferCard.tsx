import React, { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { initialOffers } from "./HeroOffers";
import { resolveApiUrl } from "@/lib/api";

const childVariants = {
  enter: { opacity: 0, y: 8, scale: 0.98 },
  center: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 380,
      damping: 24
    } 
  },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } }
};

export const OfferCard = memo(({ offer, compact = false }: { offer: typeof initialOffers[0] & { bannerImageUrl?: string | null; heroImageUrl?: string | null; targetUrl?: string | null }; compact?: boolean }) => {
  const targetUrl = offer.targetUrl || "/apply";
  // 200-IQ FOMO badge based on offer details
  const fomoBadge = offer.id.includes("axis")
    ? { text: "Only 4 slots left", color: "bg-rose-500/10 text-rose-700 border-rose-500/20" }
    : offer.id.includes("hdfc")
    ? { text: "Closing in 2 hours", color: "bg-amber-500/10 text-amber-700 border-amber-500/20" }
    : { text: "Sanctioned in 4h", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" };

  // ─── IMAGE MODE: Full-bleed banner image (PaisaBazaar/BankBazaar style) ───
  if (offer.bannerImageUrl) {
    return (
      <div
        className="relative h-full rounded-3xl overflow-hidden group cursor-default transition-all duration-500 hover:shadow-[0_32px_70px_rgba(0,0,0,0.15)] hover:-translate-y-4 hover:scale-[1.05] isolation-isolate"
        style={{
          boxShadow: `0 8px 32px 0 rgba(16,55,131,0.06), 0 20px 40px -10px ${offer.accentColor}15`,
          backgroundColor: offer.accentColor ? `${offer.accentColor}08` : '#f8fafc',
          WebkitMaskImage: "-webkit-radial-gradient(white, black)"
        }}
      >
        {/* Full-bleed image */}
        <img
          src={resolveApiUrl(offer.bannerImageUrl)}
          alt={`${offer.bank} — ${offer.title}`}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          loading="eager"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />

        {/* Subtle gradient overlay at bottom for contrast */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none" />

        {/* Floating FOMO badge — top right */}
        <span className={`absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border backdrop-blur-md bg-white/70 shadow-lg ${fomoBadge.color}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
          {fomoBadge.text}
        </span>

        {/* Floating CTA button overlay — bottom right */}
        <div className="absolute bottom-5 right-5 z-10 flex items-center">
          {targetUrl.startsWith("http://") || targetUrl.startsWith("https://") ? (
            <a 
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-[#103783] text-white px-3 py-1.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider shadow-lg hover:scale-[1.05] active:scale-[0.95] transition-all hover:bg-[#0c2a66]"
              style={{
                backgroundColor: offer.accentColor || "#103783",
                boxShadow: offer.accentColor ? `0 4px 12px ${offer.accentColor}40` : undefined
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {offer.cta || "View Details"}
              <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
            </a>
          ) : (
            <Link 
              to={targetUrl}
              className="inline-flex items-center gap-1 bg-[#103783] text-white px-3 py-1.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider shadow-lg hover:scale-[1.05] active:scale-[0.95] transition-all hover:bg-[#0c2a66]"
              style={{
                backgroundColor: offer.accentColor || "#103783",
                boxShadow: offer.accentColor ? `0 4px 12px ${offer.accentColor}40` : undefined
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {offer.cta || "View Details"}
              <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
            </Link>
          )}
        </div>

        {/* Techy shimmer sweep */}
        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-[1200ms] ease-out pointer-events-none" />
      </div>
    );
  }

  // ─── TEXT MODE: Glassmorphic card fallback (existing layout) ──────────────
  return (
    <div 
      className="relative h-full bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 overflow-hidden transition-all duration-500 hover:shadow-[0_24px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 hover:scale-[1.03] flex flex-col justify-between p-4 md:p-5 lg:p-6 group isolation-isolate"
      style={{
        boxShadow: `0 8px 32px 0 rgba(16,55,131,0.04), inset 0 1px 1px 0 rgba(255,255,255,0.8), 0 20px 40px -10px ${offer.accentColor}12`,
        WebkitMaskImage: "-webkit-radial-gradient(white, black)"
      }}
    >
      {/* 200-IQ Techy Shimmer Reflection Sweep */}
      <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-[1200ms] ease-out pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top Header Row with Bank Logo & FOMO Badge */}
        <motion.div 
          variants={childVariants}
          className="flex items-center justify-between gap-2.5 mb-2.5 pb-2.5 border-b border-slate-100/30 shrink-0"
        >
          {/* Enlarged Bank Logo (Responsive and Landscape-Friendly) */}
          <div className="h-7 md:h-8 lg:h-9 w-20 md:w-24 lg:w-28 bg-white/80 backdrop-blur-sm border border-white shadow-sm p-1 rounded-lg md:rounded-xl flex items-center justify-center overflow-hidden">
            {offer.logo ? (
              <img src={offer.logo} alt={offer.bank} className="h-full w-auto object-contain object-left max-w-[65px] md:max-w-[85px] lg:max-w-[100px]" />
            ) : (
              <div className="flex items-center gap-1">
                <Building2 className="w-3 md:w-4 h-3 md:h-4 text-slate-400" />
                <span className="text-[9px] md:text-[11px] font-bold text-slate-700 tracking-tight">{offer.bank}</span>
              </div>
            )}
          </div>

          {/* Pulse FOMO Tag */}
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[7.5px] md:text-[8px] font-extrabold uppercase tracking-wider border ${fomoBadge.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
            {fomoBadge.text}
          </span>
        </motion.div>

        {/* Middle Content Group (grows to fill available space) */}
        <div className="flex-1 flex flex-col justify-center my-auto py-2 md:py-3">
          {/* Headline + Amount */}
          <motion.div variants={childVariants} className="mb-2">
            <h3 className="text-sm md:text-[15px] font-bold text-[#0a1530]/90 leading-snug mb-1" style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif' }}>
              {offer.headline}
            </h3>
            <p className="text-lg md:text-xl lg:text-2xl font-extrabold tracking-tight" style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif', color: offer.accentColor }}>
              {offer.amount}
            </p>
          </motion.div>

          {/* Highlights */}
          {offer.highlights && offer.highlights.filter(Boolean).length > 0 && (
            <motion.div variants={childVariants} className="space-y-1.5 md:space-y-2">
              {offer.highlights.filter(Boolean).map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  </div>
                  <span className="text-[10.5px] md:text-xs lg:text-[13px] font-semibold leading-tight text-slate-600">{h}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* CTA Button using brand-color overlay */}
        <motion.div variants={childVariants} className="mt-4 shrink-0">
          {targetUrl.startsWith("http://") || targetUrl.startsWith("https://") ? (
            <a 
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 px-3 text-[10px] font-bold text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-center"
              style={{ 
                backgroundColor: offer.accentColor,
                boxShadow: `0 8px 16px -4px ${offer.accentColor}40`
              }}
            >
              {offer.cta}
            </a>
          ) : (
            <Link 
              to={targetUrl}
              className="block w-full py-2 px-3 text-[10px] font-bold text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-center"
              style={{ 
                backgroundColor: offer.accentColor,
                boxShadow: `0 8px 16px -4px ${offer.accentColor}40`
              }}
            >
              {offer.cta}
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
});
OfferCard.displayName = "OfferCard";
