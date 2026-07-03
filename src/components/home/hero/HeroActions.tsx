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
      className="flex flex-row flex-wrap items-center gap-2 sm:gap-x-3 mb-0 w-full"
    >
      <Link
        to="/apply"
        className="inline-flex items-center gap-1.5 bg-[#103783] text-white px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 rounded-full text-[10px] sm:text-xs lg:text-sm font-bold shadow-lg shadow-[#103783]/20 hover:shadow-[#103783]/30 hover:bg-[#0c2a66] hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
      >
        See My Loan Options
        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </Link>

      {/* FOMO badge — strictly side-by-side, scaled to fit perfectly */}
      <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#fffbeb] dark:bg-[#1f160f] border border-amber-500/30 text-[7.5px] sm:text-[9px] lg:text-[10px] font-extrabold tracking-wide uppercase shrink-0 shadow-sm shadow-amber-500/5 backdrop-blur-sm">
        <span className="relative flex h-1 w-1 sm:h-1.5 sm:w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1 w-1 sm:h-1.5 sm:w-1.5 bg-amber-600"></span>
        </span>
        <span className="shiny-text-fomo whitespace-nowrap">
          Only 3 pre-approved slots remaining today
        </span>
      </div>
    </motion.div>
  );
};
