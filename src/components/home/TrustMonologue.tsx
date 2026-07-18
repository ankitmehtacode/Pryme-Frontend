import React from "react";
import { Shield, Lock, Trash2, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const cardVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: (index: number) => ({
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }
  })
};
const viewportOnce = { once: true };

const TiltCard = ({ feature, index }: { feature: any; index: number }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          custom={index}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={cardVariants}
          className="relative group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-200/40 dark:border-white/5 p-5 transition-all duration-300 cursor-help text-left z-10
            hover:border-[#103783]/20 dark:hover:border-blue-500/20 hover:bg-white/60 dark:hover:bg-slate-900/60 hover:shadow-[0_12px_30px_-10px_rgba(16,55,131,0.12)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#103783]/0 via-transparent to-[#103783]/0 group-hover:from-[#103783]/5 group-hover:to-[#103783]/2 rounded-2xl transition-all duration-300 pointer-events-none" />
          
          <div
            className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center mb-3 group-hover:bg-[#103783]/10 transition-colors duration-300 border border-slate-200/10 dark:border-white/5 relative"
          >
            <feature.icon className="w-5 h-5 text-[#103783] dark:text-blue-400 relative z-10" strokeWidth={2.2} />
          </div>
          
          <div>
            <h3 className="font-bold text-[#0a1530] dark:text-white mb-1 text-sm tracking-tight">{feature.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {feature.description}
            </p>
          </div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs bg-[#0a1530] text-white border-slate-700">
        <p className="text-sm">{feature.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default function TrustMonologue() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "Privacy First",
      description: "Used only for your loan",
      tooltip: "Your information is collected only for loan processing and related services. We never sell your data.",
    },
    {
      icon: Trash2,
      title: "Zero Retention Policy",
      description: "No traces left behind",
      tooltip: "We permanently delete your data after 30 days of your account deletion.",
    },
    {
      icon: EyeOff,
      title: "Total Privacy",
      description: "We can't see your details",
      tooltip: "Our system is built so that even our own team cannot access or read your personal financial details.",
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your connection is locked",
      tooltip: "We use the same high-end, military-grade security locks that your actual bank uses to protect your data.",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-4 md:py-6 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column (copy) */}
        <div className="lg:col-span-5 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/30 dark:border-slate-700/30 text-[#103783] dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            <Shield className="w-3.5 h-3.5" />
            Your Privacy Protected
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#0a1530] dark:text-white tracking-tight mb-4">
            Why Trust Us?
          </h2>
          <div className="border-l-2 border-primary/30 pl-4 py-1.5 text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed font-medium">
            "Your data is securely processed, used only for bank matching, and permanently deleted from the database after your session."
          </div>
        </div>

        {/* Right Column (2x2 grid of cards) */}
        <div className="lg:col-span-7 w-full">
          <TooltipProvider>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {securityFeatures.map((feature, idx) => (
                <TiltCard key={feature.title} feature={feature} index={idx} />
              ))}
            </div>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
