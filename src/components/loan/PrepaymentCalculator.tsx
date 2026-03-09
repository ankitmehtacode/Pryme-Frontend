import { useState } from "react";
import { Calculator, TrendingDown, Clock, Zap, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const strategies = [
  {
    id: "13th-emi",
    name: "The 13th EMI",
    description: "Pay just 1 extra EMI every year.",
    savings: "₹1,45,000",
    timeSaved: "8 Months",
    icon: Clock,
  },
  {
    id: "5-percent",
    name: "5% Step-Up",
    description: "Increase your EMI by 5% annually.",
    savings: "₹2,12,000",
    timeSaved: "14 Months",
    icon: TrendingDown,
  },
  {
    id: "combo",
    name: "PRYME Combo",
    description: "13th EMI + 5% Annual Step-Up.",
    savings: "₹3,28,000",
    timeSaved: "22 Months",
    icon: Zap,
  }
];

const PrepaymentCalculator = () => {
  const [activeStrategy, setActiveStrategy] = useState(strategies[0].id);

  return (
    <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#2aac64]/10 blur-[50px] rounded-full pointer-events-none" />

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
          <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Prepayment Calculator</h3>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Reduce your interest burden</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {strategies.map((strategy) => {
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
                            <p className="text-lg font-bold text-[#2aac64]">{strategy.savings}</p>
                          </div>
                          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                          <div>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Time Saved</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{strategy.timeSaved}</p>
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
