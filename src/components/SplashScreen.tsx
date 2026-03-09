import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

// 🧠 160 IQ CRO Tactic: High-tier algorithmic phrasing builds unmatched psychological trust
const loadingStates = [
  "Initializing institutional-grade infrastructure...",
  "Calibrating real-time lending algorithms...",
  "Deploying cryptographic security protocols...",
  "Aggregating premium bank matchmaking logic...",
  "Capital deployment systems operational."
];

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [loadingText, setLoadingText] = useState(loadingStates[0]);

  useEffect(() => {
    // 🧠 160 IQ Fix: Replaced the dangerous 20ms setInterval with safe, staggered timeouts.
    // This completely eliminates React state-thrashing and prevents the black screen.
    const t1 = setTimeout(() => setLoadingText(loadingStates[1]), 500);
    const t2 = setTimeout(() => setLoadingText(loadingStates[2]), 1100);
    const t3 = setTimeout(() => setLoadingText(loadingStates[3]), 1700);
    const t4 = setTimeout(() => setLoadingText(loadingStates[4]), 2200);

    // 🧠 Deterministic completion trigger. 
    // Always fires at exactly 2.4 seconds, guaranteeing the app reveals itself.
    const exitTimer = setTimeout(() => {
      onComplete();
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      key="splash"
      // 🧠 The "Zoom-Through" Exit
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.15, 
        filter: "blur(12px)",
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } 
      }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030712] overflow-hidden cursor-wait selection:bg-transparent"
    >
      {/* Ambient Aurora Background */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1.2 }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#2aac64]/10 blur-[100px] rounded-full pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center">
        
        {/* Logo Container with floating physics */}
        <motion.div
          initial={{ scale: 0, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", mass: 0.8, damping: 14, delay: 0.1 }}
          className="relative w-24 h-24 mb-8 flex items-center justify-center"
        >
          {/* Outer orbital rotating ring */}
          <motion.div 
            className="absolute inset-0 rounded-3xl border border-[#2aac64]/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, ease: "linear", repeat: Infinity }}
          />
          
          {/* Main Logo Box - Transparent & Premium */}
          <div className="absolute inset-2 bg-black/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.02),0_0_40px_rgba(42,172,100,0.15)] overflow-hidden">
            {/* Apple-style Glass Shimmer Sweep */}
            <motion.div 
              className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }}
            />
            <img src="/src/assets/pryme-logo.svg" alt="Pryme Logo" className="w-14 h-14 relative z-10 drop-shadow-[0_0_25px_rgba(42,172,100,0.6)]" />
          </div>
        </motion.div>

        {/* Brand Reveal */}
        <div className="overflow-hidden mb-2">
          <motion.h1
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 20, delay: 0.3 }}
            className="text-xl font-semibold text-white tracking-tight"
          >
            Go Pryme
          </motion.h1>
        </div>

        {/* Subtitle */}
        <div className="overflow-hidden">
          <motion.p
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 20, delay: 0.4 }}
            className="text-sm font-medium text-[#2aac64] tracking-[0.3em] uppercase"
          >
            Intelligent Lending
          </motion.p>
        </div>
        
        {/* Dynamic Status Text */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute top-[140%] left-1/2 -translate-x-1/2 w-max text-center"
        >
          <p className="text-xs font-mono text-slate-500 tracking-wide">
            {loadingText}
          </p>
        </motion.div>
      </div>

      {/* Cyberpunk Progress Line */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-900 overflow-hidden">
        {/* 🧠 160 IQ Fix: Pure GPU animation for the width. Zero JavaScript overhead! */}
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }} // Mathematical Cubic Ease Out
          className="h-full bg-gradient-to-r from-emerald-500 via-[#2aac64] to-emerald-200 relative"
        >
          {/* Leading Glow Head (Makes it look like a laser beam loading) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-[4px] bg-white blur-[2px] rounded-full shadow-[0_0_10px_#fff]" />
        </motion.div>
      </div>
      
    </motion.div>
  );
};