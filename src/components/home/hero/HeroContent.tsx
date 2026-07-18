import React from "react";
import { Link } from "react-router-dom";
import { Shield, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { products as loanProducts } from "../ProductSelectorGrid";
import { HeroBadges } from "./HeroBadges";
import { HeroActions } from "./HeroActions";
import { HeroMetrics } from "./HeroMetrics";
import { HeroCarousel } from "./HeroCarousel";

export interface HeroContentProps {
  isInView?: boolean;
  onActiveOfferChange?: (offer: any) => void;
}

export const HeroContent: React.FC<HeroContentProps> = ({ isInView = true, onActiveOfferChange }) => {
  return (
    <div className="relative z-10 flex flex-col justify-center order-1 lg:order-1 max-w-[48ch] w-full md:max-w-[var(--landing-copy-width,48ch)]">
      {/* Eyebrow badges — hidden on mobile to reduce cognitive load */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="hidden md:flex items-center gap-1.5 mb-1 md:mb-1 opacity-75"
      >
        {[
          { text: "RBI GUIDELINE ALIGNED", icon: Shield },
          { text: "256-BIT ENCRYPTION", icon: ShieldCheck }
        ].map((badge, i) => (
          <span key={i} className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-[#103783]/70">
            <badge.icon className="w-2.5 h-2.5 text-[#103783]/60" />
            {badge.text}
            {i < 1 && <span className="text-slate-300/60 ml-0.5">•</span>}
          </span>
        ))}
      </motion.div>

      {/* H1 Headline — Transducer font */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="text-[clamp(2.15rem,7.5vw,2.5rem)] md:text-[clamp(2.15rem,2.5vw,2.5rem)] lg:text-[clamp(2.25rem,2.5vw,2.55rem)] font-extrabold text-[#0a1530] tracking-tight leading-[1.05] mb-2 md:mb-1.5"
        style={{ 
          fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif',
          maxInlineSize: "40ch"
        }}
      >
        FIND THE<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#103783] to-[#1e56c7]">RIGHT BANK</span><br />
        BEFORE YOU APPLY.
      </motion.h1>
 
      {/* Subheadline — Gilroy font */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="text-[clamp(0.95rem,1.8vw,1.15rem)] md:text-[clamp(0.85rem,0.95vw,0.95rem)] text-[#3b4764] leading-relaxed md:leading-[1.28] mb-3 md:mb-2.5 font-medium"
        style={{ 
          fontFamily: '"Gilroy", "Inter", system-ui, sans-serif',
          maxInlineSize: "43ch"
        }}
      >
        Discover loan offers you are actually eligible from 15+ leading banks without impacting your credit score.
      </motion.p>

      {/* Trust Badges Row */}
      <HeroBadges />

      {/* CTA Button Row */}
      <HeroActions />

      {/* ─── MOBILE: Inline Loan Products Grid (conversion-first) ─── */}
      <div className="md:hidden mt-3">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Explore Loan Products</p>
        <div className="grid grid-cols-2 gap-2">
          {loanProducts.map((product) => (
            <Link
              key={product.id}
              to={product.href}
              className="flex items-center gap-3 bg-white/70 backdrop-blur-sm border border-slate-100 rounded-xl px-3 py-2.5 hover:border-[#103783]/20 hover:bg-white transition-all active:scale-[0.97] shadow-sm"
            >
              <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-slate-50 border border-slate-100">
                <img src={product.image} alt={product.label} className="w-full h-full object-cover" loading="eager" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-extrabold text-[#0a1530] uppercase tracking-wide leading-snug block line-clamp-2 mb-0.5">{product.label}</span>
                <span className="text-[8px] font-bold text-[#103783]/60 uppercase tracking-wider block">{product.tag}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── MOBILE: Offer Carousel (Below Products) ─── */}
      <div className="md:hidden mt-6 w-full pb-4" style={{ '--landing-offer-width': '100%' } as React.CSSProperties}>
        <HeroCarousel isInView={isInView} onActiveOfferChange={onActiveOfferChange} />
      </div>

      {/* Trust Metrics Row */}
      <HeroMetrics />
    </div>
  );
};
