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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: (index: number) => ({
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};
const viewportOnce = { once: true };

/**
 * CSS-only 3D tilt card — replaces per-pixel useSpring + useTransform
 * that was causing 4 React re-renders per mouse-move event per card.
 * 
 * Uses CSS perspective + :hover pseudo-class for the tilt effect.
 * The hover transform runs entirely on the compositor thread.
 */
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
          className="relative group bg-white/5 dark:bg-slate-900/50 rounded-2xl border border-slate-200/20 dark:border-slate-800 p-6 transition-all duration-500 cursor-help text-center z-10
            hover:border-[#103783]/30 hover:bg-white/10 hover:shadow-[0_20px_60px_-15px_rgba(16,55,131,0.2)]"
        >
          {/* Card glow on hover — CSS only */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#103783]/0 via-transparent to-[#103783]/0 group-hover:from-[#103783]/20 group-hover:to-[#103783]/5 rounded-2xl transition-all duration-500 pointer-events-none" />
          
          <div
            className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#103783]/10 transition-colors duration-300 shadow-inner overflow-hidden relative"
          >
            <feature.icon className="w-8 h-8 text-[#103783] relative z-10" strokeWidth={2} />
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-base">{feature.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              {feature.description}
            </p>
          </div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs bg-slate-900 text-white border-slate-700">
        <p className="text-sm">{feature.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const headlineInitial = { opacity: 0, y: 20 };
const headlineInView = { opacity: 1, y: 0 };
const headlineViewport = { once: true, margin: "-100px" };
const headlineTransition = { duration: 0.7 };

const quoteInitial = { opacity: 0, scale: 0.96 };
const quoteInView = { opacity: 1, scale: 1 };
const quoteTransition = { duration: 0.6, delay: 0.2 };

export default function TrustMonologue() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "No Data Stored",
      description: "We don't keep your info",
      tooltip: "We only hold your details while matching you with banks. Once done, everything is wiped clean immediately.",
    },
    {
      icon: Trash2,
      title: "Zero Retention Policy",
      description: "No traces left behind",
      tooltip: "We permanently erase your data after every single visit. No sneaky databases or marketing lists.",
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
    <section className="py-20 md:py-28 relative bg-slate-50 dark:bg-[#030303] overflow-hidden">
      {/* Background Trust Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop&auto=format&q=80" 
          alt="" 
          className="w-full h-full object-cover opacity-[0.03] dark:opacity-[0.08]" 
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-slate-50/80 to-slate-50 dark:from-[#030303] dark:via-[#030303]/80 dark:to-[#030303]" />
      </div>
      
      {/* Ambient Glow — CSS animation only, no Framer Motion re-renders */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#103783]/10 md:bg-[#103783]/20 blur-[50px] rounded-full pointer-events-none"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Trust Quote */}
          <motion.div
            initial={headlineInitial}
            whileInView={headlineInView}
            viewport={headlineViewport}
            transition={headlineTransition}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700/50 text-[#103783] dark:text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">
              <Shield className="w-4 h-4" />
              Your Privacy Protected
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-slate-900 dark:text-white tracking-tight mb-8">
              Why Trust Us?
            </h2>
            <motion.div
              initial={quoteInitial}
              whileInView={quoteInView}
              viewport={viewportOnce}
              transition={quoteTransition}
              className="max-w-3xl mx-auto bg-gradient-to-b from-slate-200/80 dark:from-white/10 to-transparent p-[1.5px] rounded-[2.5rem]"
            >
              <div className="bg-white dark:bg-[#050505] rounded-[2.4rem] p-8 md:p-12 shadow-xl dark:shadow-2xl">
                <p className="text-lg md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  "Your privacy is protected in accordance with RBI guidelines and the IT Act (PII standards). Your data is securely processed, used only for bank matching, and permanently deleted from the Database after your session. We do not sell, or share your personal information."
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Security Features Grid */}
          <TooltipProvider>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            >
              {securityFeatures.map((feature, idx) => (
                <TiltCard key={feature.title} feature={feature} index={idx} />
              ))}
            </div>
          </TooltipProvider>
        </div>
      </div>
    </section>
  );
};
