import { motion } from "framer-motion";
import { Building2, Star, ArrowRight, ExternalLink, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BankOffer {
  id: string;
  bankName: string;
  maxLoanAmount: number;
  roi: number;
  processingFee: string;
  emi: number;
  approvalProbability: number;
  processingTime: string;
  featured?: boolean;
  recommended?: boolean;
}

interface BankComparisonTableProps {
  offers: BankOffer[];
  loanAmount: number;
  tenure: number;
  onApplyDirect: (bankId: string) => void;
  onApplyWithPyrme: (bankId: string) => void;
}

const BankComparisonTable = ({
  offers,
  loanAmount,
  tenure,
  onApplyDirect,
  onApplyWithPyrme,
}: BankComparisonTableProps) => {
  
  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
  };

  const getApprovalColor = (probability: number) => {
    if (probability >= 80) return { bg: "bg-emerald-500", text: "text-emerald-500", border: "border-emerald-500/20", bgLight: "bg-emerald-500/10", label: "High" };
    if (probability >= 60) return { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500/20", bgLight: "bg-blue-500/10", label: "Medium" };
    return { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500/20", bgLight: "bg-amber-500/10", label: "Low" };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4 md:space-y-6 w-full"
    >
      {offers.map((offer, index) => {
        const approval = getApprovalColor(offer.approvalProbability);
        
        return (
          <motion.div
            variants={itemVariants}
            key={offer.id}
            className={cn(
              "relative overflow-hidden rounded-[2rem] border backdrop-blur-xl transition-all duration-300 hover:shadow-2xl",
              offer.recommended 
                ? "bg-white/90 dark:bg-[#0a0a0a]/90 border-primary shadow-[0_0_30px_rgba(var(--primary),0.15)]" 
                : "bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-primary/40"
            )}
          >
            {/* 🧠 Premium Ambient Glow for Recommended Card */}
            {offer.recommended && (
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
            )}

            <div className="p-5 md:p-8 flex flex-col xl:flex-row items-center gap-6 md:gap-8">
              
              {/* 1. Bank Identity Segment */}
              <div className="w-full xl:w-[25%] flex items-center gap-4 relative z-10">
                <div className={cn(
                  "w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-[1.25rem] flex items-center justify-center border shadow-sm",
                  offer.recommended ? "bg-primary/10 border-primary/20" : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/10"
                )}>
                  <Building2 className={cn("w-7 h-7 md:w-8 md:h-8", offer.recommended ? "text-primary" : "text-slate-400")} />
                </div>
                <div>
                  {offer.recommended && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-primary/30 bg-primary/10 text-[10px] font-medium tracking-widest uppercase text-primary mb-1">
                      <Star className="w-3 h-3 fill-primary" /> Top Match
                    </div>
                  )}
                  <h4 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">{offer.bankName}</h4>
                  <div className="flex items-center gap-1 mt-0.5 text-xs font-medium text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5" /> 
                    <span>Max {formatCurrency(offer.maxLoanAmount)}</span>
                  </div>
                </div>
              </div>

              {/* 2. Core Financial Metrics (The 3-Column Split) */}
              <div className="w-full xl:w-[45%] grid grid-cols-3 gap-4 xl:gap-8 border-y xl:border-y-0 xl:border-x border-slate-200 dark:border-white/10 py-5 xl:py-0 xl:px-8 relative z-10">
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-slate-500 mb-1">Interest Rate</p>
                  <p className={cn("text-xl md:text-2xl font-semibold", offer.recommended ? "text-primary" : "text-slate-900 dark:text-white")}>
                    {offer.roi}% <span className="text-xs font-medium text-slate-500">p.a.</span>
                  </p>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-slate-500 mb-1">Monthly EMI</p>
                  <p className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white">{formatCurrency(offer.emi)}</p>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-slate-500 mb-1">Processing</p>
                  <p className="text-sm md:text-base font-medium text-slate-700 dark:text-slate-300">{offer.processingFee}</p>
                </div>
              </div>

              {/* 3. UX Action Center (Probability & Buttons) */}
              <div className="w-full xl:w-[30%] flex flex-col gap-4 relative z-10">
                
                {/* Approval Probability Bar */}
                <div className={`p-3 rounded-xl border flex items-center justify-between gap-4 ${approval.bgLight} ${approval.border}`}>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-medium uppercase tracking-widest text-slate-600 dark:text-slate-400">Approval Probability</span>
                      <span className={`text-xs font-semibold ${approval.text}`}>{offer.approvalProbability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${offer.approvalProbability}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        className={`h-full rounded-full ${approval.bg}`} 
                      />
                    </div>
                  </div>
                </div>

                {/* Call To Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => onApplyWithPyrme(offer.id)}
                    className={cn(
                      "flex-1 group relative overflow-hidden rounded-xl text-sm md:text-base font-medium py-6 transition-all duration-300 hover:scale-[1.02]",
                      offer.recommended 
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)]" 
                        : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-xl"
                    )}
                  >
                    {/* Apple-style Shimmer on Recommended Button */}
                    {offer.recommended && (
                      <div className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:animate-shimmer" />
                    )}
                    <span className="relative flex items-center justify-center gap-2">
                      {offer.recommended && <Zap className="w-4 h-4 fill-current" />}
                      Apply via PRYME
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => onApplyDirect(offer.id)}
                    className="flex-none px-4 py-6 rounded-xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-colors"
                    title="Apply directly on bank website"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Button>
                </div>

              </div>

            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default BankComparisonTable;