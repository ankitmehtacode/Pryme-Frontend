import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import typo2Logo from "@/assets/Typo2.svg";
import Grainient from "@/components/ui/Grainient";

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
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.15, 
        filter: "blur(16px)",
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
      }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f8fbff] dark:bg-[#060a14] overflow-hidden cursor-wait selection:bg-transparent"
    >
      {/* ReactBits Grainient Background - Light Theme Profile */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply dark:mix-blend-screen pointer-events-none">
        <Grainient
          className="w-full h-full"
          color1="#FFFFFF"
          color2="#DBEAFE"
          color3="#103783"
          grainAmount={0.06}
          grainScale={1.5}
          noiseScale={1.5}
          warpSpeed={1.0}
          timeSpeed={0.15}
          rotationAmount={200}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full px-6">
        
        {/* Silicon Valley Grade Squircle Assembly (Superellipse) */}
        <motion.div
          initial={{ scale: 0.8, y: 20, opacity: 0, filter: "blur(20px)" }}
          animate={{ scale: 1, y: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
          className="relative w-40 h-40 md:w-48 md:h-48 mb-12 flex items-center justify-center rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(16,55,131,0.3)] z-10 group"
        >
          {/* Animated Conic Gradient Border Engine */}
          <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden">
            <motion.div 
              className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0_280deg,#3b82f6_360deg)] dark:bg-[conic-gradient(from_0deg,transparent_0_280deg,#60a5fa_360deg)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, ease: "linear", repeat: Infinity }}
            />
            {/* Counter-rotating subtle energy */}
            <motion.div 
              className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_180deg,transparent_0_280deg,#103783_360deg)] opacity-50"
              animate={{ rotate: -360 }}
              transition={{ duration: 8, ease: "linear", repeat: Infinity }}
            />
          </div>
          
          {/* Main Content Squircle (Apple-grade Glassmorphism) */}
          <div className="absolute inset-[2px] bg-white/80 dark:bg-[#060a14]/80 backdrop-blur-3xl rounded-[2.4rem] flex items-center justify-center shadow-[inset_0_1px_3px_rgba(255,255,255,0.8)] overflow-hidden">
            {/* Pure Light Spectral Shimmer */}
            <motion.div 
              className="absolute inset-0 w-[250%] h-full bg-gradient-to-r from-transparent via-blue-200/40 dark:via-white/10 to-transparent -skew-x-[30deg]"
              initial={{ x: "-150%" }}
              animate={{ x: "150%" }}
              transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.5 }}
            />
            {/* Subsurface glow behind the logo */}
            <div className="absolute w-24 h-24 bg-blue-400/20 rounded-full blur-2xl flex-shrink-0" />
            
            {/* High-Fidelity Vector Logo */}
            <img 
              src={typo2Logo} 
              alt="Pryme Loading" 
              className="w-20 md:w-24 h-auto relative z-10 filter drop-shadow-[0_4px_10px_rgba(16,55,131,0.15)] transition-transform duration-700 group-hover:scale-105" 
            />
          </div>
        </motion.div>

        {/* Premium High-Fashion Subtitle */}
        <div className="overflow-hidden mb-8 relative z-10">
          <motion.h2
            initial={{ y: "150%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 25, delay: 0.4 }}
            className="text-[11px] sm:text-xs md:text-[13px] font-light tracking-[0.65em] uppercase text-transparent bg-clip-text bg-gradient-to-br from-[#0a2357] to-[#2563eb] dark:from-white dark:to-blue-200 pl-[0.65em]"
          >
            Intelligent Lending
          </motion.h2>
        </div>
        
        {/* Dynamic Matrix Type-in Text */}
        <motion.div 
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: 0.8 }}
          className="h-6 flex items-center justify-center z-10"
        >
          <p className="text-[9px] sm:text-[10px] font-medium text-[#103783]/60 dark:text-blue-300/60 tracking-[0.3em] uppercase text-center w-full min-w-[300px]">
            {loadingText}
          </p>
        </motion.div>
        
      </div>

      {/* Titanium Laser Progress Line */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black/5 dark:bg-white/5 overflow-hidden">
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.4, ease: [0.25, 1, 0.5, 1] }} // Bezier curve matched to exact timeout
          className="h-full bg-gradient-to-r from-blue-500 via-[#103783] to-cyan-300 relative shadow-[0_0_15px_rgba(59,130,246,0.8)]"
        >
          {/* Laser Head Glow */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-[8px] bg-white blur-[4px] rounded-full shadow-[0_0_20px_#fff]" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-[2px] bg-white rounded-full" />
        </motion.div>
      </div>
      
    </motion.div>
  );
};