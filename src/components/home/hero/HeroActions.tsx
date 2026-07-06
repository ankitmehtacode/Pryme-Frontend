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
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-x-3 mb-0 w-full"
    >
      <Link
        to="/apply"
        className="inline-flex items-center justify-center gap-1.5 bg-[#103783] text-white px-4 py-2.5 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 rounded-full text-xs sm:text-xs lg:text-sm font-bold shadow-lg shadow-[#103783]/20 hover:shadow-[#103783]/30 hover:bg-[#0c2a66] hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap w-full sm:w-auto shrink-0"
      >
        See My Loan Options
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
 
      {/* FOMO badge — strictly side-by-side on desktop, stacked on mobile */}
      <div className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 py-1.5 sm:px-2.5 sm:py-1 rounded-full bg-[#fffbeb] dark:bg-[#1f160f] border border-amber-500/30 text-[8.5px] sm:text-[9px] lg:text-[10px] font-extrabold tracking-wide uppercase shrink-0 shadow-sm shadow-amber-500/5 backdrop-blur-sm w-full sm:w-auto">
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
