import React from "react";
import { PhoneOff, ShieldCheck, Eye, Award } from "lucide-react";
import { motion } from "framer-motion";

const trustBadges = [
  { icon: PhoneOff, label: "No Spam Calls" },
  { icon: ShieldCheck, label: "No Impact On\nCredit Score" },
  { icon: Eye, label: "Complete\nTransparency" },
  { icon: Award, label: "Higher\nApproval Chances" },
];

export const HeroBadges = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="hidden md:flex flex-wrap items-start gap-3 sm:gap-4 mb-2"
    >
      {trustBadges.map((badge, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 text-center min-w-[60px]">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <badge.icon className="w-4 h-4 text-[#103783]" />
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide leading-tight whitespace-pre-line">
            {badge.label}
          </span>
        </div>
      ))}
    </motion.div>
  );
};
