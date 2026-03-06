import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

// 🧠 CRO Tactic: Rapidly changing text distracts the user and makes the load feel 50% faster
const loadingStates = [
  "Initializing secure environment...",
  "Establishing encrypted DB connection...",
  "Loading PRYME CRM workspace...",
  "Optimizing dashboard interface...",
  "Ready."
];

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState(loadingStates[0]);

  useEffect(() => {
    // 2.4 seconds is the psychological sweet spot for a premium "heavy" application load
    const duration = 2400; 
    const interval = 20;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      
      // 🧠 200 IQ Math: Cubic ease-out formula. 
      // It starts fast to give immediate feedback, then slows down at the end to build anticipation.
      const p = 1 - Math.pow(1 - elapsed / duration, 3);
      const currentProgress = Math.min(100, p * 100);
      setProgress(currentProgress);

      // Update dynamic text based on exact progress intervals
      if (currentProgress > 90) setLoadingText(loadingStates[4]);
      else if (currentProgress > 70) setLoadingText(loadingStates[3]);
      else if (currentProgress > 40) setLoadingText(loadingStates[2]);
      else if (currentProgress > 15) setLoadingText(loadingStates[1]);

      if (elapsed >= duration) {
        clearInterval(timer);
        setTimeout(onComplete, 300); // Micro-pause at 100% before the zoom-through exit
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      key="splash"
      // 🧠 The "Zoom-Through" Exit: Instead of fading out, the screen flies PAST the user into the app.
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
          
          {/* Main Logo Box */}
          <div className="absolute inset-2 bg-gradient-to-br from-[#2aac64] to-emerald-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(42,172,100,0.4)] overflow-hidden">
            {/* Apple-style Glass Shimmer Sweep */}
            <motion.div 
              className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }}
            />
            <ShieldCheck className="w-10 h-10 text-white relative z-10" strokeWidth={2} />
          </div>
        </motion.div>

        {/* Brand Reveal */}
        <div className="overflow-hidden mb-2">
          <motion.h1
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 20, delay: 0.3 }}
            className="text-5xl font-black text-white tracking-tighter"
          >
            PRYME
          </motion.h1>
        </div>

        {/* Subtitle */}
        <div className="overflow-hidden">
          <motion.p
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 20, delay: 0.4 }}
            className="text-sm font-bold text-[#2aac64] tracking-[0.3em] uppercase"
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
        <motion.div 
          className="h-full bg-gradient-to-r from-emerald-500 via-[#2aac64] to-emerald-200 relative"
          style={{ width: `${progress}%` }}
        >
          {/* Leading Glow Head (Makes it look like a laser beam loading) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-[4px] bg-white blur-[2px] rounded-full shadow-[0_0_10px_#fff]" />
        </motion.div>
      </div>
      
    </motion.div>
  );
};