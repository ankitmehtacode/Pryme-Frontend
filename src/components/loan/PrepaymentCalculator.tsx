import { useState, useMemo } from "react";
import { Calculator, TrendingDown, Clock, Zap, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";

const strategies = [
  {
    id: "13th-emi",
    name: "The 13th EMI",
    description: "Pay just 1 extra EMI every year.",
    savingsMultiplier: 2.9,
    timeSavedMultiplier: 0.16,
    icon: Clock,
  },
  {
    id: "5-percent",
    name: "5% Step-Up",
    description: "Increase your EMI by 5% annually.",
    savingsMultiplier: 4.24,
    timeSavedMultiplier: 0.28,
    icon: TrendingDown,
  },
  {
    id: "combo",
    name: "PRYME Combo",
    description: "13th EMI + 5% Annual Step-Up.",
    savingsMultiplier: 6.56,
    timeSavedMultiplier: 0.44,
    icon: Zap,
  }
];

const PrepaymentCalculator = () => {
  const [activeStrategy, setActiveStrategy] = useState(strategies[0].id);
  const [prepaymentAmount, setPrepaymentAmount] = useState<number>(50000);

  // Formatting helpers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const calculateImpact = useMemo(() => {
    return strategies.map(strategy => {
      // Logic: Multiply base user input by the strategy impact multiplier 
      // (a real system would use remaining tenure + exact interest rates)
      const calculatedSavings = prepaymentAmount * strategy.savingsMultiplier;
      const calculatedTimeSaved = Math.max(1, Math.round((prepaymentAmount / 10000) * strategy.timeSavedMultiplier));
      
      return {
        ...strategy,
        displaySavings: formatCurrency(calculatedSavings),
        displayTimeSaved: `${calculatedTimeSaved} Months`
      };
    });
  }, [prepaymentAmount]);

  return (
    <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#2aac64]/10 blur-[50px] rounded-full pointer-events-none" />

      <div className="flex items-center justify-between gap-3 mb-6 relative z-10 w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 shrink-0">
            <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Prepayment ROI</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Reduce your interest burden</p>
          </div>
        </div>
      </div>

      {/* Input Slider Section */}
      <div className="mb-6 relative z-10 bg-white/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700/30">
        <div className="flex justify-between items-center mb-4">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Lumpsum Input Amount
          </label>
          <div className="text-lg font-bold text-[#2aac64] font-mono bg-[#2aac64]/10 px-3 py-1 rounded-lg border border-[#2aac64]/20 shadow-inner">
            {formatCurrency(prepaymentAmount)}
          </div>
        </div>
        
        <div className="px-2">
          <Slider
            defaultValue={[50000]}
            max={1000000}
            min={10000}
            step={10000}
            value={[prepaymentAmount]}
            onValueChange={(val) => setPrepaymentAmount(val[0])}
            className="w-full"
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-medium text-slate-400 px-2">
          <span>₹10,000</span>
          <span>₹10L+</span>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {calculateImpact.map((strategy) => {
          const isActive = activeStrategy === strategy.id;
          const Icon = strategy.icon;
          
          return (
            <div 
              key={strategy.id}
              onClick={() => setActiveStrategy(strategy.id)}
              className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-300 border ${
                isActive 
                  ? "bg-white dark:bg-slate-800 border-[#2aac64]/30 shadow-md" 
                  : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/30 hover:bg-white/80 dark:hover:bg-slate-800/80"
              }`}
            >
              {isActive && (
                <div className="absolute top-4 right-4 text-[#2aac64]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? "bg-[#2aac64]/10 text-[#2aac64]" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 pr-6">
                  <h4 className={`text-sm font-semibold transition-colors ${
                    isActive ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                  }`}>
                    {strategy.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
                    {strategy.description}
                  </p>
                  
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Interest Saved</p>
                            <p className="text-lg font-bold text-[#2aac64]">{strategy.displaySavings}</p>
                          </div>
                          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Time Trimmed</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{strategy.displayTimeSaved}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrepaymentCalculator;
