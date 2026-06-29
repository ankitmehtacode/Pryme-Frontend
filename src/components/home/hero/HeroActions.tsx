import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const HeroActions = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="flex flex-col items-start gap-1.5 md:gap-0 mb-0"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link
          to="/apply"
          className="inline-flex items-center gap-2 bg-[#103783] text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-[#103783]/20 hover:shadow-[#103783]/30 hover:bg-[#0c2a66] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          See My Loan Options
          <ArrowRight className="w-4 h-4" />
        </Link>

        {/* FOMO — desktop: inline badge */}
        <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-extrabold tracking-wide uppercase shrink-0">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-600"></span>
          </span>
          <span className="shiny-text-fomo">
            Only 3 pre-approved slots remaining today
          </span>
        </div>
      </div>

      {/* FOMO — mobile: subtle caption below CTA */}
      <span className="md:hidden inline-flex items-center gap-1 text-[9px] font-semibold text-amber-600/80 ml-1">
        <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse shrink-0" />
        Only 3 pre-approved slots remaining today
      </span>
    </motion.div>
  );
};
