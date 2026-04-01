import { useState, useMemo } from "react";
import { Calculator, TrendingDown, Clock, Zap, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

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
    id: "combo",
    name: "PRYME Combo",
    description: "13th EMI + 5% Annual Step-Up.",
    savingsMultiplier: 6.56,
    timeSavedMultiplier: 0.44,
    icon: Zap,
  },
  {
    id: "5-percent",
    name: "5% Step-Up",
    description: "Increase your EMI by 5% annually.",
    savingsMultiplier: 4.24,
    timeSavedMultiplier: 0.28,
    icon: TrendingDown,
  }
];

const PrepaymentCalculator = () => {
  const [activeStrategy, setActiveStrategy] = useState(strategies[0].id);
  const [prepaymentAmount, setPrepaymentAmount] = useState<number>(50000);
  const [tenure, setTenure] = useState<number>(60); // Default to 5 Years / 60 Months

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
      // Dynamic Logic: Savings scale up radically the more tenure remains
      const tenureFactor = tenure / 60; // Baseline normalized to 60 Months
      const calculatedSavings = prepaymentAmount * strategy.savingsMultiplier * tenureFactor;
      const calculatedTimeSaved = Math.max(1, Math.round((prepaymentAmount / 10000) * strategy.timeSavedMultiplier * tenureFactor));
      
      return {
        ...strategy,
        displaySavings: formatCurrency(calculatedSavings),
        displayTimeSaved: `${calculatedTimeSaved} Months`
      };
    });
  }, [prepaymentAmount, tenure]);

  return (
    <div className="bg-card text-card-foreground border border-border dark:bg-[#0a0a0a] dark:border-white/10 rounded-[2rem] p-5 md:p-6 lg:p-7 shadow-xl dark:shadow-2xl relative overflow-hidden transition-all dark:hover:border-[#103783]/30 flex flex-col h-full">
      {/* 🧠 Decorative Ambient Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-primary/10 dark:bg-[#103783]/10 blur-[50px] rounded-full pointer-events-none" />

      {/* Header aligned strictly to premium typographic ratios */}
      <div className="flex items-center gap-3.5 mb-6 relative z-10 w-full shrink-0">
        <div className="w-11 h-11 rounded-full bg-secondary dark:bg-[#111] border border-border dark:border-[#103783]/20 shadow-sm flex items-center justify-center shrink-0">
          <Calculator className="w-5 h-5 text-primary dark:text-[#103783]" />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-none mb-1">Prepayment ROI</h3>
          <p className="text-[9px] font-bold text-[#103783] uppercase tracking-widest bg-[#103783]/10 border border-[#103783]/20 px-2 py-0.5 rounded-sm inline-block leading-none">
            REDUCE INTEREST BURDEN
          </p>
        </div>
      </div>

      {/* Dynamic Interactive Input Modules */}
      <div className="space-y-4 mb-6 relative z-10 shrink-0">
        
        {/* Lumpsum Amount Module */}
        <div className="bg-secondary/20 dark:bg-[#111] p-4 md:px-5 rounded-2xl border border-border dark:border-white/5 shadow-sm transition-all focus-within:border-[#103783]/50 hover:border-[#103783]/30">
          <div className="flex justify-between items-center mb-4">
            <label className="text-[10px] font-bold text-primary dark:text-[#103783] uppercase tracking-wider">
              Yearly Input Amount
            </label>
            <div className="text-base font-bold text-foreground bg-background dark:bg-[#0a0a0a] px-3.5 py-1.5 rounded-lg border border-border dark:border-white/5 shadow-sm leading-none flex items-center gap-1.5 focus:outline-none">
              {formatCurrency(prepaymentAmount)}
            </div>
          </div>
          
          <Slider
            defaultValue={[50000]}
            max={1000000}
            min={10000}
            step={10000}
            value={[prepaymentAmount]}
            onValueChange={(val) => setPrepaymentAmount(val[0])}
            className="w-full cursor-pointer py-1"
          />
          <div className="flex justify-between mt-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>₹10,000</span>
            <span>₹10L+</span>
          </div>
        </div>

        {/* 🧠 NEW: Tenure Remaining Module */}
        <div className="bg-secondary/20 dark:bg-[#111] p-4 md:px-5 rounded-2xl border border-border dark:border-white/5 shadow-sm transition-all focus-within:border-[#103783]/50 hover:border-[#103783]/30">
          <div className="flex justify-between items-center mb-4">
            <label className="text-[10px] font-bold text-primary dark:text-[#103783] uppercase tracking-wider">
              Remaining Tenure
            </label>
            <div className="text-base font-bold text-foreground bg-background dark:bg-[#0a0a0a] px-3.5 py-1.5 rounded-lg border border-border dark:border-white/5 shadow-sm leading-none flex items-baseline gap-1.5 focus:outline-none">
              {tenure} <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Months</span>
            </div>
          </div>
          
          <Slider
            defaultValue={[60]}
            max={360}
            min={12}
            step={12}
            value={[tenure]}
            onValueChange={(val) => setTenure(val[0])}
            className="w-full cursor-pointer py-1"
          />
          <div className="flex justify-between mt-3 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>1 Year</span>
            <span>30 Years</span>
          </div>
        </div>
      </div>

      {/* Strategies Output Matrix */}
      <div className="space-y-3 relative z-10 flex-1 flex flex-col justify-end">
        {calculateImpact.map((strategy) => {
          const isActive = activeStrategy === strategy.id;
          const Icon = strategy.icon;
          
          return (
            <div 
              key={strategy.id}
              onClick={() => setActiveStrategy(strategy.id)}
              className={cn(
                "relative cursor-pointer rounded-2xl p-4 transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-[#103783]",
                isActive 
                  ? "bg-secondary dark:bg-black/60 border-primary shadow-lg dark:border-[#103783]/50 dark:shadow-[0_0_15px_rgba(124,58,237,0.15)]" 
                  : "bg-secondary/30 dark:bg-[#111] border-border dark:border-white/5 hover:border-border dark:hover:border-white/10"
              )}
              role="button"
              aria-pressed={isActive}
              tabIndex={0}
            >
              {isActive && (
                <div className="absolute top-4 right-4 text-primary dark:text-[#103783] animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="w-5 h-5 drop-shadow-sm fill-primary/10" />
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <div className={cn(
                  "mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-sm",
                  isActive ? "bg-primary text-primary-foreground dark:bg-[#103783]/20 dark:text-[#103783] border border-transparent dark:border-[#103783]/30" : "bg-card dark:bg-[#0a0a0a] border border-border dark:border-white/5 text-muted-foreground"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 pr-6">
                  <h4 className={cn("text-base font-bold transition-colors leading-tight mb-1", isActive ? "text-foreground" : "text-foreground/80")}>
                    {strategy.name}
                  </h4>
                  <p className="text-[10px] md:text-xs font-semibold text-muted-foreground mb-3 leading-relaxed">
                    {strategy.description}
                  </p>
                  
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 pt-3 mt-2 border-t border-border dark:border-white/10">
                          <div>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1">Interest Saved</p>
                            <p className="text-xl md:text-2xl font-bold text-primary dark:text-[#103783] leading-none drop-shadow-sm">{strategy.displaySavings}</p>
                          </div>
                          <div className="hidden sm:block h-10 w-px bg-border dark:bg-white/10" />
                          <div>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1">Time Trimmed</p>
                            <p className="text-xl md:text-2xl font-bold text-foreground leading-none">{strategy.displayTimeSaved}</p>
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
