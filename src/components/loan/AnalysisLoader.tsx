import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Cpu, Search, CheckCircle2, CreditCard, IndianRupee, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisLoaderProps {
  isVisible: boolean;
  onComplete: () => void;
  data: {
    cibilScore?: number;
    productType?: string;
    monthlyIncome?: number;
  } | null;
}

const steps = [
  { id: "identity", label: "Validating identity credentials", icon: Shield, duration: 1200 },
  { id: "cibil", label: "Synthesizing credit matrix", icon: CreditCard, duration: 1500 },
  { id: "income", label: "Verifying liquid assets", icon: IndianRupee, duration: 1200 },
  { id: "match", label: "Querying partner bank algorithms", icon: Cpu, duration: 1800 },
  { id: "optimize", label: "Locking lowest ROI tiers", icon: Search, duration: 1400 },
];

const AnalysisLoader = ({ isVisible, onComplete, data }: AnalysisLoaderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (isVisible) {
      let totalTime = 0;

      // Clear any existing timeouts to prevent memory leaks if re-mounted
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];

      steps.forEach((step, index) => {
        const timeout = setTimeout(() => {
          setCurrentStep(index);

          if (index > 0) {
            setCompletedSteps(prev => [...new Set([...prev, steps[index - 1].id])]);
          }
        }, totalTime);

        timeoutsRef.current.push(timeout);
        totalTime += step.duration;
      });

      const finalTimeout = setTimeout(() => {
        setCompletedSteps(prev => [...new Set([...prev, steps[steps.length - 1].id])]);
        const completeTimeout = setTimeout(() => {
          onComplete();
        }, 800);
        timeoutsRef.current.push(completeTimeout);
      }, totalTime);

      timeoutsRef.current.push(finalTimeout);

    } else {
      setCurrentStep(0);
      setCompletedSteps([]);
    }

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030303]/95 backdrop-blur-2xl px-6 overflow-hidden"
        >
          {/* Deep Ambient Core Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-xl w-full relative flex flex-col items-center">

            {/* Cinematic Orbital Stars (Replacing the static Scan icon) */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative w-48 h-48 mb-12 flex items-center justify-center"
            >
              {/* Outer Dashed Orbit */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-[1px] border-dashed border-primary/30"
              />

              {/* Inner Solid Orbit */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                className="absolute inset-6 rounded-full border-[1px] border-white/10"
              />

              {/* Floating Star 1 (Outer Track) */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]">
                  <Star className="w-5 h-5 fill-primary" />
                </div>
              </motion.div>

              {/* Floating Star 2 (Inner Track) */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                className="absolute inset-6"
              >
                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 text-white/80">
                  <Star className="w-3 h-3 fill-white/80" />
                </div>
              </motion.div>

              {/* Pulsing Core */}
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="bg-primary/10 p-4 rounded-full border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.15)]"
              >
                <Sparkles className="w-8 h-8 text-primary" />
              </motion.div>
            </motion.div>

            {/* Main Processing List */}
            <div className="w-full space-y-6 px-4 md:px-10">
              {steps.map((step, index) => {
                const isActive = currentStep === index;
                const isCompleted = completedSteps.includes(step.id);

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: isActive || isCompleted ? 1 : 0.2,
                      y: 0,
                      scale: isActive ? 1.02 : 1
                    }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-5"
                  >
                    <div className="relative flex items-center justify-center w-6 h-6">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-500",
                        isActive ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)] scale-150" :
                          isCompleted ? "bg-primary/50" : "bg-white/10"
                      )} />
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 border border-primary/40 rounded-full"
                          animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className={cn(
                        "text-sm md:text-base tracking-wide transition-colors duration-500",
                        isActive ? "text-white font-medium" : isCompleted ? "text-white/40 font-light" : "text-white/20 font-light"
                      )}>
                        {step.label}
                      </p>
                    </div>

                    <div className="w-8 flex justify-end">
                      {isCompleted && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle2 className="w-5 h-5 text-primary/60 stroke-[1.5px]" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Sub-context Bar - Data Ledger */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="w-full mt-16 pt-6 border-t border-white/5 flex items-center justify-between px-4"
            >
              {[
                { label: "CREDIT SCORE", value: data?.cibilScore || "AWAITING" },
                { label: "SECTOR", value: data?.productType?.toUpperCase() || "AWAITING" },
                { label: "CONNECTION", value: "ENCRYPTED" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-start">
                  <p className="text-[9px] font-medium text-white/30 tracking-[0.2em] mb-1">{stat.label}</p>
                  <p className="text-xs font-medium text-white/80 tabular-nums">{stat.value}</p>
                </div>
              ))}
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnalysisLoader;