import { motion } from "framer-motion";
import { Building2, Star, ExternalLink, ShieldCheck } from "lucide-react";
import { GlossyRewardButton } from "@/components/admin/GlossyRewardButton";
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
    if (probability >= 80) return { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500/20", bgLight: "bg-blue-500/10", label: "High" };
    if (probability >= 60) return { bg: "bg-blue-500", text: "text-blue-500", border: "border-blue-500/20", bgLight: "bg-blue-500/10", label: "Medium" };
    return { bg: "bg-amber-500", text: "text-amber-500", border: "border-amber-500/20", bgLight: "bg-amber-500/10", label: "Low" };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: import("framer-motion").Variants = {
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
              "relative overflow-hidden rounded-[2rem] border backdrop-blur-sm transition-all duration-300 hover:shadow-2xl",
              offer.recommended 
                ? "bg-white/90 dark:bg-[#080d1e]/90 border-primary shadow-[0_0_30px_rgba(var(--primary),0.15)]" 
                : "bg-white/60 dark:bg-white/5 border-border hover:border-primary/40"
            )}
          >


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
                  {/* Decision Anchoring Tags */}
                  <div className="flex flex-wrap gap-2 mb-1.5">
                    {offer.recommended && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#103783]/10 border border-[#103783]/20 text-[10px] font-bold tracking-widest uppercase text-[#103783]">
                        Lowest EMI
                      </div>
                    )}
                    {offer.processingTime.includes("hours") && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold tracking-widest uppercase text-amber-500">
                        Fastest Approval
                      </div>
                    )}
                  </div>
                  <h4 className="text-lg md:text-xl font-semibold text-foreground tracking-tight">{offer.bankName}</h4>
                  <div className="flex items-center gap-1 mt-0.5 text-xs font-medium text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5" /> 
                    <span>Max {formatCurrency(offer.maxLoanAmount)}</span>
                  </div>
                </div>
              </div>

              {/* 2. Core Financial Metrics (The 3-Column Split) */}
              <div className="w-full xl:w-[45%] grid grid-cols-3 gap-4 xl:gap-8 border-y xl:border-y-0 xl:border-x border-border py-5 xl:py-0 xl:px-8 relative z-10">
                {/* Primary Metric: EMI (Decision Anchor) */}
                <div className="flex flex-col justify-center xl:border-r border-border xl:pr-6 col-span-2 xl:col-span-1">
                  <p className="text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] text-primary dark:text-[#103783] mb-1">Monthly EMI</p>
                  <p className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">{formatCurrency(offer.emi)}</p>
                </div>
                
                {/* Secondary Metrics */}
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-0.5">Interest Rate</p>
                  <p className="text-sm md:text-lg font-bold text-foreground">
                    {offer.roi}% <span className="text-xs font-semibold text-slate-500">p.a.</span>
                  </p>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-0.5">Processing Fee</p>
                  <p className="text-sm md:text-lg font-bold text-foreground">{offer.processingFee}</p>
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

                {/* Call To Action Buttons -- same premium glossy design as
                    BankComparisonCard.tsx's Offers page cards. Stacked, and
                    both share the same w-full/max-w-[210px] container so
                    they render at identical width and height. */}
                <div className="w-full max-w-[210px] flex flex-col items-stretch gap-3">
                  <GlossyRewardButton
                    onClick={() => onApplyWithPyrme(offer.id)}
                  />

                  <button
                    onClick={() => onApplyDirect(offer.id)}
                    className="w-full h-12 md:h-[52px] rounded-full border border-primary text-slate-600 dark:border-[#103783] dark:text-slate-300 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
                    title="Apply directly on bank website"
                  >
                    Apply Directly
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 opacity-70">
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </button>
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