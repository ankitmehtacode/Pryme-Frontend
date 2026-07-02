import React from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { products as loanProducts } from "../ProductSelectorGrid";
import { HeroBadges } from "./HeroBadges";
import { HeroActions } from "./HeroActions";
import { HeroMetrics } from "./HeroMetrics";

export const HeroContent = () => {
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
          { text: "RBI COMPLIANT", icon: Shield },
          { text: "ISO 27001 CERTIFIED", icon: Lock },
          { text: "256-BIT ENCRYPTION", icon: ShieldCheck },
          { text: "GDPR READY", icon: CheckCircle2 }
        ].map((badge, i) => (
          <span key={i} className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-[#103783]/70">
            <badge.icon className="w-2.5 h-2.5 text-[#103783]/60" />
            {badge.text}
            {i < 3 && <span className="text-slate-300/60 ml-0.5">•</span>}
          </span>
        ))}
      </motion.div>

      {/* H1 Headline — Transducer font */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="text-[clamp(2.5rem,4vw,3.5rem)] md:text-[clamp(2.15rem,2.5vw,2.5rem)] lg:text-[clamp(2.25rem,2.5vw,2.55rem)] font-extrabold text-[#0a1530] tracking-tight leading-[1.02] mb-1 md:mb-1.5"
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
        className="text-[clamp(1.125rem,2vw,1.35rem)] md:text-[clamp(0.85rem,0.95vw,0.95rem)] text-[#3b4764] leading-relaxed md:leading-[1.28] mb-3 md:mb-2.5 font-medium"
        style={{ 
          fontFamily: '"Gilroy", "Inter", system-ui, sans-serif',
          maxInlineSize: "43ch"
        }}
      >
        Get matched with the best loan offers from 15+ banks based on your real eligibility — without harming your credit score.
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
