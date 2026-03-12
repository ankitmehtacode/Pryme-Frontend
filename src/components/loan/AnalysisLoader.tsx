import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Scan, Database, Cpu, Search, CheckCircle2, Loader2, CreditCard, IndianRupee } from "lucide-react";
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
  { id: "identity", label: "Validating user credentials", icon: Shield, duration: 1000 },
  { id: "cibil", label: "Synthesizing credit history", icon: CreditCard, duration: 1400 },
  { id: "income", label: "Verifying liquid assets", icon: IndianRupee, duration: 1200 },
  { id: "match", label: "Optimizing bank policies", icon: Cpu, duration: 1800 },
  { id: "optimize", label: "Securing best roi tiers", icon: Search, duration: 1200 },
];

const AnalysisLoader = ({ isVisible, onComplete, data }: AnalysisLoaderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      let totalTime = 0;
      steps.forEach((step, index) => {
        setTimeout(() => {
          setCurrentStep(index);
          setProgress(((index + 1) / steps.length) * 100);
          
          if (index > 0) {
            setCompletedSteps(prev => [...prev, steps[index-1].id]);
          }
        }, totalTime);
        totalTime += step.duration;
      });

      setTimeout(() => {
        setCompletedSteps(prev => [...prev, steps[steps.length - 1].id]);
        setTimeout(() => {
          onComplete();
        }, 800);
      }, totalTime);
    } else {
      setCurrentStep(0);
      setCompletedSteps([]);
      setProgress(0);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] backdrop-blur-3xl px-6"
        >
          {/* Minimalist Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[160px] rounded-full pointer-events-none" />
          
          <div className="max-w-xl w-full relative">
            {/* Header Area - Minimalist */}
            <div className="text-center mb-16">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8"
              >
                <div className="relative inline-block">
                  <Scan className="w-12 h-12 text-primary/40 stroke-[1px]" />
                  <motion.div 
                    className="absolute inset-0 border border-primary/20 rounded-lg"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                </div>
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight mb-4">
                Refining your <span className="text-primary font-medium">personalized</span> offers
              </h2>
              <p className="text-slate-500 font-normal tracking-wide text-sm md:text-base max-w-sm mx-auto">
                Analyzing market data from leading financial institutions in real-time.
              </p>
            </div>

            {/* Main Processing List - Understated */}
            <div className="space-y-8 px-4 md:px-10">
               {steps.map((step, index) => {
                 const isActive = currentStep === index;
                 const isCompleted = completedSteps.includes(step.id);
                 const Icon = step.icon;

                 return (
                   <motion.div
                     key={step.id}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ 
                       opacity: isActive || isCompleted ? 1 : 0.15,
                       x: isActive ? 4 : 0
                     }}
                     className="flex items-center gap-6"
                   >
                     <div className="relative flex items-center justify-center">
                        <div className={cn(
                          "w-2 h-2 rounded-full transition-all duration-700",
                          isActive ? "bg-primary shadow-[0_0_12px_rgba(42,172,100,0.8)] scale-125" : 
                          isCompleted ? "bg-primary/40" : "bg-white/10"
                        )} />
                        {isActive && (
                          <motion.div 
                             className="absolute w-4 h-4 border border-primary/30 rounded-full"
                             animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                             transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                     </div>
                     
                     <div className="flex-1">
                        <p className={cn(
                          "text-base md:text-lg font-light tracking-tight transition-colors duration-500",
                          isActive ? "text-white" : isCompleted ? "text-slate-500" : "text-slate-700"
                        )}>
                          {step.label}
                        </p>
                     </div>

                     <div className="w-12 flex justify-end">
                       {isActive && (
                         <div className="flex gap-[3px]">
                           {[0, 1, 2].map((i) => (
                             <motion.div
                               key={i}
                               className="w-[3px] h-[3px] bg-primary rounded-full"
                               animate={{ opacity: [0.2, 1, 0.2] }}
                               transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                             />
                           ))}
                         </div>
                       )}
                       {isCompleted && <CheckCircle2 className="w-4 h-4 text-primary/40 stroke-[1.5px]" />}
                     </div>
                   </motion.div>
                 );
               })}
            </div>

            {/* Sub-context Bar - Minimalist Footer */}
            <div className="mt-20 pt-8 border-t border-white/5 flex items-center justify-between px-2">
               {[
                 { label: "CREDIT SCORE", value: data?.cibilScore || "..." },
                 { label: "SECTOR", value: data?.productType?.toUpperCase() || "..." },
                 { label: "STATUS", value: "ENCRYPTED" }
               ].map((stat, i) => (
                 <div key={i} className="flex flex-col items-start">
                    <p className="text-[10px] font-medium text-slate-600 tracking-[0.2em] mb-1">{stat.label}</p>
                    <p className="text-xs font-medium text-white/80 tabular-nums">{stat.value}</p>
                 </div>
               ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnalysisLoader;
