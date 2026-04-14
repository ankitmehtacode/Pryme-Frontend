import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import typo2Logo from "@/assets/Typo2.svg";

interface SplashScreenProps {
  onComplete: () => void;
}

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
    const t1 = setTimeout(() => setLoadingText(loadingStates[1]), 500);
    const t2 = setTimeout(() => setLoadingText(loadingStates[2]), 1100);
    const t3 = setTimeout(() => setLoadingText(loadingStates[3]), 1700);
    const t4 = setTimeout(() => setLoadingText(loadingStates[4]), 2200);

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
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden cursor-wait selection:bg-transparent"
      style={{
        background: "linear-gradient(135deg, #f8fbff 0%, #DBEAFE 40%, #e0e7ff 70%, #f8fbff 100%)",
        backgroundSize: "400% 400%",
        animation: "splashGradientShift 6s ease infinite",
      }}
    >
      {/* CSS-only animated gradient background — zero WebGL, zero GPU context */}
      <style>{`
        @keyframes splashGradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes splashConicSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes splashConicSpinReverse {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        @keyframes splashShimmerSlide {
          0% { transform: translateX(-150%) skewX(-30deg); }
          100% { transform: translateX(150%) skewX(-30deg); }
        }
      `}</style>

      {/* Subtle grain via CSS pseudo — no SVG filter, no mix-blend */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full px-6">
        
        {/* Squircle Assembly — CSS-only animated border */}
        <motion.div
          initial={{ scale: 0.8, y: 20, opacity: 0, filter: "blur(20px)" }}
          animate={{ scale: 1, y: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
          className="relative w-40 h-40 md:w-48 md:h-48 mb-12 flex items-center justify-center rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(16,55,131,0.3)] z-10 group"
        >
          {/* CSS Conic Gradient Border — replaces the motion.div rotate */}
          <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden">
            <div 
              className="absolute top-1/2 left-1/2 w-[200%] h-[200%]"
              style={{
                background: "conic-gradient(from 0deg, transparent 0 280deg, #3b82f6 360deg)",
                animation: "splashConicSpin 4s linear infinite",
              }}
            />
            <div 
              className="absolute top-1/2 left-1/2 w-[200%] h-[200%] opacity-50"
              style={{
                background: "conic-gradient(from 180deg, transparent 0 280deg, #103783 360deg)",
                animation: "splashConicSpinReverse 8s linear infinite",
              }}
            />
          </div>
          
          {/* Main Content Squircle */}
          <div className="absolute inset-[2px] bg-white/80 backdrop-blur-xl rounded-[2.4rem] flex items-center justify-center shadow-[inset_0_1px_3px_rgba(255,255,255,0.8)] overflow-hidden">
            {/* CSS shimmer — replaces motion.div x animation */}
            <div 
              className="absolute inset-0 w-[250%] h-full bg-gradient-to-r from-transparent via-blue-200/40 to-transparent"
              style={{ animation: "splashShimmerSlide 3.5s ease-in-out infinite 1.5s" }}
            />
            <div className="absolute w-24 h-24 bg-blue-400/20 rounded-full blur-2xl flex-shrink-0" />
            
            <img 
              src={typo2Logo} 
              alt="Pryme Loading" 
              className="w-20 md:w-24 h-auto relative z-10 filter drop-shadow-[0_4px_10px_rgba(16,55,131,0.15)]" 
            />
          </div>
        </motion.div>

        {/* Subtitle */}
        <div className="overflow-hidden mb-8 relative z-10">
          <motion.h2
            initial={{ y: "150%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 25, delay: 0.4 }}
            className="text-[11px] sm:text-xs md:text-[13px] font-light tracking-[0.65em] uppercase text-transparent bg-clip-text bg-gradient-to-br from-[#0a2357] to-[#2563eb] pl-[0.65em]"
          >
            Intelligent Lending
          </motion.h2>
        </div>
        
        {/* Loading Text */}
        <motion.div 
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: 0.8 }}
          className="h-6 flex items-center justify-center z-10"
        >
          <p className="text-[9px] sm:text-[10px] font-medium text-[#103783]/60 tracking-[0.3em] uppercase text-center w-full min-w-[300px]">
            {loadingText}
          </p>
        </motion.div>
        
      </div>

      {/* Progress Line */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black/5 overflow-hidden">
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.4, ease: [0.25, 1, 0.5, 1] }}
          className="h-full bg-gradient-to-r from-blue-500 via-[#103783] to-cyan-300 relative shadow-[0_0_15px_rgba(59,130,246,0.8)]"
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-[8px] bg-white blur-[4px] rounded-full shadow-[0_0_20px_#fff]" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-[2px] bg-white rounded-full" />
        </motion.div>
      </div>
      
    </motion.div>
  );
};