import React from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";
import { products as loanProducts } from "../ProductSelectorGrid";
import { HeroBadges } from "./HeroBadges";
import { HeroActions } from "./HeroActions";
import { HeroMetrics } from "./HeroMetrics";

export const HeroContent = () => {
  return (
    <div className="flex flex-col justify-center order-1 lg:order-1 max-w-[38ch] w-full">
      {/* Eyebrow badges — hidden on mobile to reduce cognitive load */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="hidden md:flex flex-wrap items-center gap-2 mb-3"
      >
        {["INSTANT ELIGIBILITY", "ZERO SPAM", "NO HIDDEN CHARGES"].map((badge, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#103783]">
            {i === 0 && <Zap className="w-3 h-3 text-amber-500" />}
            {badge}
            {i < 2 && <span className="text-slate-300 ml-1">•</span>}
          </span>
        ))}
      </motion.div>

      {/* H1 Headline — Transducer font */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="text-[clamp(2.5rem,4vw,3.5rem)] font-extrabold text-[#0a1530] tracking-tight leading-[1.05] mb-1.5 md:mb-3"
        style={{ 
          fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif',
          maxInlineSize: "40ch"
        }}
      >
        {/* Mobile: 2-line layout */}
        <span className="md:hidden">
          FIND THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#103783] to-[#1e56c7]">RIGHT BANK</span><br />
          BEFORE YOU APPLY.
        </span>
        {/* Desktop: original 3-line layout */}
        <span className="hidden md:inline">
          FIND THE<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#103783] to-[#1e56c7]">RIGHT BANK</span><br />
          BEFORE YOU APPLY.
        </span>
      </motion.h1>

      {/* Subheadline — Gilroy font */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="text-[clamp(1.125rem,2vw,1.35rem)] text-[#3b4764] leading-relaxed mb-6 md:mb-8 font-medium"
        style={{ 
          fontFamily: '"Gilroy", "Inter", system-ui, sans-serif',
          maxInlineSize: "45ch"
        }}
      >
        We analyze your profile against 25+ top banks to find the highest approval odds—without affecting your credit score.
      </motion.p>

      {/* Trust Badges Row */}
      <HeroBadges />

      {/* CTA Button Row */}
      <HeroActions />

      {/* ─── MOBILE: Inline Loan Products Grid (conversion-first) ─── */}
      <div className="md:hidden mt-3">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Explore Loan Products</p>
        <div className="grid grid-cols-2 gap-1.5">
          {loanProducts.map((product, idx) => (
            <Link
              key={product.id}
              to={product.href}
              className={`flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-slate-100 rounded-lg px-2.5 py-2 hover:border-[#103783]/20 hover:bg-white transition-all active:scale-[0.97] ${
                idx === loanProducts.length - 1 ? 'col-span-2' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 bg-slate-50">
                <img src={product.image} alt={product.label} className="w-full h-full object-cover" loading="eager" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-extrabold text-[#0a1530] uppercase tracking-wide leading-tight block truncate">{product.label}</span>
                <span className="text-[7px] font-bold text-[#103783]/60 uppercase tracking-wider">{product.tag}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trust Metrics Row */}
      <HeroMetrics />
    </div>
  );
};
