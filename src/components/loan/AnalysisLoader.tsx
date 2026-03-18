import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Cpu, Search, CheckCircle2, CreditCard, IndianRupee, Sparkles } from "lucide-react";
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

// ─── FLOATING SVG SHAPES ─────────────────────────────────────────────────────

const FloatingSVGs = () => {
  const shapes = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 16 + Math.random() * 40,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 5,
      drift: 20 + Math.random() * 40,
      rotation: Math.random() * 360,
      variant: i % 6,
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          initial={{ opacity: 0, y: 0, rotate: s.rotation }}
          animate={{
            opacity: [0, 0.12, 0.08, 0.12, 0],
            y: [-s.drift, s.drift, -s.drift],
            x: [-s.drift * 0.5, s.drift * 0.5, -s.drift * 0.5],
            rotate: [s.rotation, s.rotation + 180, s.rotation + 360],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
          }}
        >
          <svg
            width={s.size}
            height={s.size}
            viewBox="0 0 48 48"
            fill="none"
            className="text-primary dark:text-[#2aac64]"
          >
            {s.variant === 0 && (
              /* Hexagon */
              <polygon
                points="24,2 44,14 44,34 24,46 4,34 4,14"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                opacity="0.5"
              />
            )}
            {s.variant === 1 && (
              /* Circle with center dot */
              <>
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
                <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.3" />
              </>
            )}
            {s.variant === 2 && (
              /* Diamond */
              <polygon
                points="24,4 44,24 24,44 4,24"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                opacity="0.4"
              />
            )}
            {s.variant === 3 && (
              /* Triangle */
              <polygon
                points="24,4 44,40 4,40"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                opacity="0.35"
              />
            )}
            {s.variant === 4 && (
              /* Cross / Plus */
              <path
                d="M24 8v32M8 24h32"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.3"
              />
            )}
            {s.variant === 5 && (
              /* Concentric Circles */
              <>
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.3" />
                <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.25" />
                <circle cx="24" cy="24" r="5" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.2" />
              </>
            )}
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

// ─── SANDY LOADER (CSS-only Lottie-inspired) ─────────────────────────────────

const SandyLoader = () => (
  <div className="relative w-28 h-28 flex items-center justify-center">
    {/* Outer ring — slow pulse */}
    <motion.div
      className="absolute inset-0 rounded-full border border-primary/20 dark:border-[#2aac64]/20"
      animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
    {/* Middle ring — counter-rotate */}
    <motion.div
      className="absolute inset-3 rounded-full border border-dashed border-primary/30 dark:border-[#2aac64]/30"
      animate={{ rotate: -360 }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
    />
    {/* Inner ring — rotate */}
    <motion.div
      className="absolute inset-6 rounded-full border-2 border-primary/40 dark:border-[#2aac64]/40"
      style={{ borderTopColor: "transparent", borderLeftColor: "transparent" }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    />
    {/* Dot trail — three orbiting dots */}
    {[0, 120, 240].map((offset) => (
      <motion.div
        key={offset}
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: offset / 360 }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary dark:bg-[#2aac64] shadow-[0_0_8px_rgba(42,172,100,0.6)]" />
      </motion.div>
    ))}
    {/* Core icon */}
    <motion.div
      animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-10 bg-primary/10 dark:bg-[#2aac64]/10 p-3 rounded-full border border-primary/20 dark:border-[#2aac64]/20"
    >
      <Sparkles className="w-6 h-6 text-primary dark:text-[#2aac64]" />
    </motion.div>
  </div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const AnalysisLoader = ({ isVisible, onComplete, data }: AnalysisLoaderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (isVisible) {
      let totalTime = 0;

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
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-2xl px-6 overflow-hidden"
        >
          {/* Floating SVG Background */}
          <FloatingSVGs />

          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/8 dark:bg-[#2aac64]/8 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-xl w-full relative z-10 flex flex-col items-center">

            {/* Sandy Loader */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-12"
            >
              <SandyLoader />
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
                        isActive ? "bg-primary dark:bg-[#2aac64] shadow-[0_0_10px_rgba(42,172,100,0.8)] scale-150" :
                          isCompleted ? "bg-primary/50 dark:bg-[#2aac64]/50" : "bg-muted-foreground/20"
                      )} />
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 border border-primary/40 dark:border-[#2aac64]/40 rounded-full"
                          animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className={cn(
                        "text-sm md:text-base tracking-wide transition-colors duration-500",
                        isActive ? "text-foreground font-medium" : isCompleted ? "text-muted-foreground font-light" : "text-muted-foreground/30 font-light"
                      )}>
                        {step.label}
                      </p>
                    </div>

                    <div className="w-8 flex justify-end">
                      {isCompleted && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle2 className="w-5 h-5 text-primary/60 dark:text-[#2aac64]/60 stroke-[1.5px]" />
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
              className="w-full mt-16 pt-6 border-t border-border flex items-center justify-between px-4"
            >
              {[
                { label: "CREDIT SCORE", value: data?.cibilScore || "AWAITING" },
                { label: "SECTOR", value: data?.productType?.toUpperCase() || "AWAITING" },
                { label: "CONNECTION", value: "ENCRYPTED" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-start">
                  <p className="text-[9px] font-medium text-muted-foreground/40 tracking-[0.2em] mb-1">{stat.label}</p>
                  <p className="text-xs font-medium text-foreground/80 tabular-nums">{stat.value}</p>
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