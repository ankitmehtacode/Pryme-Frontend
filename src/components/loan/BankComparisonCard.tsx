import { useState, memo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, TrendingUp, ArrowRight, Loader2, Calculator, FileText, CheckCircle2, ChevronDown, ExternalLink, Star, Gift, Smartphone, Car, Tag, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlossyRewardButton } from "@/components/admin/GlossyRewardButton";

const parseExpenseValue = (val: any): string | null => {
  if (val == null || val === "" || val === "0" || val === 0) return null;
  if (typeof val === "number") {
    return `₹${Math.round(val).toLocaleString("en-IN")}`;
  }
  const cleanStr = val.toString().trim();
  const num = parseFloat(cleanStr.replace(/[^0-9.]/g, ""));
  if (!isNaN(num) && num > 0) {
    if (cleanStr.includes("%")) return cleanStr;
    return `₹${Math.round(num).toLocaleString("en-IN")}`;
  }
  return cleanStr;
};

export interface BankOfferDTO {
  id: string;
  bankName: string;
  logoColor: string;
  logoUrl?: string;
  brandHex: string; // e.g. "#004c8f" — the bank's primary brand colour
  interestRate: number;
  processingFee: number;
  effectiveTenureYears: number;
  maxLoanAmount: number;
  approvalOdds: number;
  processingTime: string;
  requiredDocs: string[];
  originalEngineResult?: any;
  employmentType?: string;
  requestedTenure?: number;
}

interface BankComparisonCardProps {
  offer: BankOfferDTO;
  emi: number;
  totalRepayment: number;
  emiDiffFromHero: number;
  totalDiffFromHero: number;
  heroBankName: string;
  principalAmount: number;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onApply: (providerId: string) => Promise<void>;
  isGlobalLocking: boolean;
  isRecommended?: boolean;
  /** True only for the offer with the genuine lowest EMI across the list --
   * independent of isRecommended, which reflects the highest-eligible-amount
   * ranking and can be a different card. */
  isLowestEmi?: boolean;
  /** False when this lender's FOIR/LTV cap forces a loan smaller than what
   * was requested -- its EMI then sits on a different (smaller) principal
   * than every fully-funded card, so it must never be compared against them
   * via emiDiffFromHero/totalDiffFromHero (those are 0 for such offers). */
  isFullyFunded?: boolean;
  rewards?: any[];
}

export const BankComparisonCard = memo(function BankComparisonCard({
  offer,
  emi,
  totalRepayment,
  emiDiffFromHero,
  totalDiffFromHero,
  heroBankName,
  principalAmount,
  isExpanded,
  onToggleExpand,
  onApply,
  isGlobalLocking,
  isRecommended = false,
  isLowestEmi = false,
  isFullyFunded = true,
  rewards = [],
}: BankComparisonCardProps) {
  const navigate = useNavigate();
  const [localStatus, setLocalStatus] = useState<"idle" | "processing" | "resolved">("idle");
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [offer.logoUrl]);

  const handleApplyClick = async () => {
    setLocalStatus("processing");
    try {
      await onApply(offer.id);
      setLocalStatus("resolved");
    } catch {
      setLocalStatus("idle");
    }
  };

  const isLocking = localStatus === "processing";
  const brand = offer.brandHex;

  const matchingReward = rewards?.find(r => {
    // 1. Match Product Code (Engine obfuscates to ABFL-HL, so we check if it ends with the reward's product code like 'HL')
    const engineProdCode = offer.originalEngineResult?.productCode || offer.productType || "";
    if (r.productCode && !engineProdCode.toUpperCase().endsWith(r.productCode.toUpperCase())) return false;
    
    // 2. Match Bank Name (case-insensitive)
    if (r.bank?.toLowerCase() !== offer.bankName?.toLowerCase()) return false;
    
    // 3. Match Loan Amount Tier
    const eligibleAmount = offer.originalEngineResult?.maxEligibleLoanAmount || offer.maxLoanAmount || 0;
    
    if (r.minLoanAmount != null && eligibleAmount < r.minLoanAmount) return false;
    if (r.maxLoanAmount != null && eligibleAmount > r.maxLoanAmount) return false;
    
    // 4. Employment Type 
    const empType = (offer.employmentType || offer.originalEngineResult?.profile?.employmentType || "").toUpperCase();
    const rEmpType = (r.employmentType || "").toUpperCase();
    
    if (empType && rEmpType) {
      // Map frontend/engine types (SALARIED, PROFESSIONAL, SELF_EMPLOYED) to reward types
      const isSalariedMatch = empType === "SALARIED" && rEmpType === "SALARIED";
      const isProfMatch = empType === "PROFESSIONAL" && rEmpType.includes("PROFESSIONAL") && !rEmpType.includes("NON");
      const isNonProfMatch = empType === "SELF_EMPLOYED" && (rEmpType.includes("NON PROFESSIONAL") || rEmpType === "SELF_EMPLOYED");
      
      if (!isSalariedMatch && !isProfMatch && !isNonProfMatch) {
        return false;
      }
    }
    
    return true;
  });

  const dynamicRewardText = matchingReward 
    ? (matchingReward.rewardText || [matchingReward.reward1, matchingReward.reward2, matchingReward.pfWaiver].filter(Boolean).join(" • "))
    : "";

  const RewardIcon = matchingReward?.iconType === "GIFT" ? Gift :
                     matchingReward?.iconType === "SMARTPHONE" ? Smartphone :
                     matchingReward?.iconType === "CAR" ? Car :
                     matchingReward?.iconType === "DISCOUNT" ? Tag : Gift;

  // Processing fee in ₹ -- hoisted here so both the top-row metric chip and
  // the expandable cost-breakdown panel below use the exact same figure.
  const pfAmount = offer.processingFee >= 100
    ? Math.round(offer.processingFee)
    : Math.round(principalAmount * offer.processingFee / 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group relative antialiased z-10 hover:z-20 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.01] will-change-transform"
    >
      {/* ── Glassmorphic Card Shell ──────────────────────────── */}
      <div
        className={`
          relative rounded-[2rem] overflow-hidden
          bg-white dark:bg-[#0c1322]/95
          border transition-all duration-500 will-change-transform
          ${isExpanded
            ? 'border-slate-300 dark:border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.1)]'
            : 'border-slate-200/80 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.06)] group-hover:shadow-[0_24px_64px_rgba(0,0,0,0.12)] group-hover:border-slate-300 dark:group-hover:border-white/[0.22]'
          }
        `}
      >
        {/* ── Left Brand Accent — Dynamic bank color bar ─────── */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-[2rem] transition-transform duration-500 origin-left group-hover:scale-x-150"
          style={{ background: `linear-gradient(to bottom, ${brand}, ${brand}99)` }}
        />

        {/* ── Subtle Brand Glow on Hover ────────────────────── */}
        <div
          className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(120% 100% at 0% 50%, ${brand}0A 0%, transparent 60%)`,
          }}
        />

        {/* ── Top Promo Bar/Ribbon for Reward ── */}
        {matchingReward && (
          <div className="bg-purple-50/90 dark:bg-purple-950/20 border-b border-purple-100/80 dark:border-purple-900/30 px-5 py-2.5 md:px-8 flex items-center gap-2">
            <RewardIcon className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="text-[10px] md:text-[11px] font-extrabold text-purple-700 dark:text-purple-300 uppercase tracking-widest leading-none">
              Exclusive Reward: {dynamicRewardText}
            </span>
          </div>
        )}

        <div className="pl-5 pr-5 py-5 md:pl-8 md:pr-6 md:py-6">
          {/* ── Main Grid ───────────────────────────── */}
          <div className="flex flex-col xl:grid xl:grid-cols-[200px_210px_300px_minmax(0,1fr)] 2xl:grid-cols-[220px_230px_340px_minmax(0,1fr)] xl:items-center gap-5 xl:gap-5 2xl:gap-6">
            
            {/* ── Bank Identity & Mobile Chevron ────────────────────────────── */}
            <div className="flex items-start justify-between w-full xl:w-auto">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl bg-white border border-slate-200 dark:border-white/[0.08]"
                  style={{
                    boxShadow: `0 4px 12px rgba(0,0,0,0.03)`,
                    padding: offer.logoUrl && !logoError ? '4px' : '12px',
                  }}
                >
                  {offer.logoUrl && !logoError ? (
                    <img
                      src={offer.logoUrl}
                      alt={offer.bankName}
                      className="w-full h-full object-contain"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center rounded-xl text-xl sm:text-2xl font-black"
                      style={{ 
                        backgroundColor: `${offer.brandHex}15`, 
                        color: offer.brandHex,
                        border: `1px solid ${offer.brandHex}30` 
                      }}
                    >
                      {offer.bankName ? offer.bankName.charAt(0).toUpperCase() : <Building2 className="w-6 h-6 opacity-50" />}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  {isRecommended && (
                    <span className="inline-flex items-center gap-1.5 text-[9.5px] sm:text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full w-fit border border-amber-100 dark:border-amber-500/20">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" /> Recommended
                    </span>
                  )}
                  <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight leading-tight">{offer.bankName}</h3>
                </div>
              </div>

              {/* Mobile Chevron */}
              <button
                onClick={() => onToggleExpand(offer.id)}
                className={`xl:hidden flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 shrink-0 mt-1
                  ${isExpanded
                    ? 'bg-slate-100 dark:bg-white/10 text-foreground'
                    : 'bg-transparent text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                title="View requirements"
              >
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* ── EMI & Comparison Diff (Grouped for Perfect Alignment) ── */}
            <div className="hidden xl:flex items-end gap-3.5 min-h-[44px]">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-0.5">EMI</p>
                <p className="text-2xl sm:text-[26px] font-extrabold text-foreground tabular-nums leading-none tracking-tight">
                  <span className="text-sm sm:text-base text-muted-foreground/50 mr-0.5">₹</span>{emi.toLocaleString("en-IN")}
                </p>
              </div>
              
              <div className="pb-0.5 flex flex-col justify-end min-w-0">
                {!isFullyFunded ? (
                  <>
                    <p className="text-[11px] sm:text-xs font-bold truncate tracking-tight leading-none text-amber-600 dark:text-amber-400" title={`Funds ₹${Math.round(principalAmount).toLocaleString("en-IN")}`}>
                      Funds ₹{Math.round(principalAmount).toLocaleString("en-IN")}
                    </p>
                    {/* The exact requested amount is already shown in the page's
                        sticky summary bar -- restating it here is redundant and,
                        at large loan amounts, was long enough to overflow this
                        fixed-width grid column into the Interest/Tenure chips. */}
                    <p className="text-[9px] text-muted-foreground/50 font-semibold whitespace-nowrap leading-none mt-1">
                      Below your request
                    </p>
                  </>
                ) : !isLowestEmi ? (
                  <>
                    <p
                      className="text-[11px] sm:text-xs font-bold tabular-nums whitespace-nowrap tracking-tight leading-none"
                      style={{ color: emiDiffFromHero > 0 ? '#ea580c' : emiDiffFromHero < 0 ? '#10b981' : '#64748b' }}
                    >
                      {emiDiffFromHero > 0
                        ? `+₹${emiDiffFromHero.toLocaleString("en-IN")}/mo more`
                        : emiDiffFromHero < 0
                          ? `-₹${Math.abs(emiDiffFromHero).toLocaleString("en-IN")}/mo less`
                          : `Same EMI`}
                    </p>
                    <p className="text-[9px] text-muted-foreground/50 font-semibold tabular-nums whitespace-nowrap leading-none mt-1">
                      {totalDiffFromHero > 0
                        ? `₹${totalDiffFromHero.toLocaleString("en-IN")} extra total`
                        : totalDiffFromHero < 0
                          ? `₹${Math.abs(totalDiffFromHero).toLocaleString("en-IN")} less total`
                          : "Same total"}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] sm:text-xs font-bold whitespace-nowrap tracking-tight leading-none text-emerald-600 dark:text-emerald-400">
                      Lowest EMI
                    </p>
                    <p className="text-[9px] text-muted-foreground/50 font-semibold whitespace-nowrap leading-none mt-1">
                      Lowest total cost
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* ── Metrics Chips + Cost Breakdown Toggle ────────── */}
            <div className="hidden xl:flex xl:flex-col gap-2">
              <div className="flex items-center gap-1.5 2xl:gap-2">
                {[
                  { label: "Interest", value: `${offer.interestRate}%` },
                  { label: "Tenure", value: `${offer.effectiveTenureYears} yrs` },
                  { label: "Processing Fees", value: `₹${pfAmount.toLocaleString("en-IN")}` },
                ].map((m, i) => (
                  <div
                    key={i}
                    className="flex-1 min-w-0 py-2 2xl:py-2.5 px-1 text-center rounded-[1rem] bg-slate-50/95 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/[0.08] shadow-sm transition-all duration-300 group-hover:bg-white dark:group-hover:bg-white/[0.08] group-hover:shadow-md group-hover:border-slate-300 dark:group-hover:border-white/[0.15]"
                  >
                    <p className="text-[8px] 2xl:text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-tight mb-1.5">{m.label}</p>
                    <p className="text-sm sm:text-base font-extrabold text-foreground tabular-nums leading-none tracking-tight whitespace-nowrap">{m.value}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onToggleExpand(offer.id)}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl border transition-all duration-300 group/toggle
                  ${isExpanded
                    ? 'bg-slate-100 dark:bg-white/10 border-slate-300 dark:border-white/20'
                    : 'bg-slate-50/80 dark:bg-white/[0.03] border-slate-200/70 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.15]'
                  }`}
                style={isExpanded ? { color: brand } : undefined}
                title="View complete cost breakdown"
              >
                <span className="text-[9px] 2xl:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 group-hover/toggle:text-foreground transition-colors">
                  Complete Cost Break Down
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/70 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* ── Mobile Premium Metrics Board ────────────────────────────── */}
            <div className="xl:hidden w-full bg-slate-50/60 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] rounded-[1.25rem] p-4 flex flex-col gap-3 shadow-inner">
              <div className="flex justify-between items-end border-b border-slate-200/60 dark:border-white/[0.06] pb-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 mb-1">EMI</p>
                  <p className="text-[26px] font-black text-foreground tabular-nums leading-none tracking-tight">
                    <span className="text-base text-muted-foreground/40 mr-0.5 font-bold">₹</span>{emi.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 mb-1">Interest</p>
                  <p className="text-xl font-extrabold text-foreground tabular-nums leading-none tracking-tight">{offer.interestRate}%</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">Tenure</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-foreground bg-white dark:bg-white/[0.05] px-2.5 py-1 rounded-md border border-slate-200 dark:border-white/[0.05]">{offer.effectiveTenureYears} yrs</p>
                  {offer.requestedTenure && offer.effectiveTenureYears < offer.requestedTenure && (
                    <div className="group relative flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-900 dark:bg-slate-800 text-slate-100 text-[10px] p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                        Tenure clamped to {offer.effectiveTenureYears} years. The maximum tenure allowed by this product.
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {!isFullyFunded ? (
                <div className="mt-2 flex items-center justify-between gap-2 bg-white dark:bg-black/20 p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.05]">
                  <p className="text-[11px] font-extrabold tabular-nums tracking-tight truncate text-amber-600 dark:text-amber-400">
                    Funds ₹{Math.round(principalAmount).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[9px] text-muted-foreground/70 font-semibold uppercase tracking-widest shrink-0">
                    below request
                  </p>
                </div>
              ) : emiDiffFromHero !== 0 && (
                <div className="mt-2 flex items-center justify-between bg-white dark:bg-black/20 p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.05]">
                  <p className="text-[11px] font-extrabold tabular-nums tracking-tight" style={{ color: emiDiffFromHero > 0 ? '#ea580c' : '#10b981' }}>
                    {emiDiffFromHero > 0
                      ? `+₹${emiDiffFromHero.toLocaleString("en-IN")}/mo`
                      : `-₹${Math.abs(emiDiffFromHero).toLocaleString("en-IN")}/mo`}
                  </p>
                  <p className="text-[9px] text-muted-foreground/70 font-semibold tabular-nums uppercase tracking-widest">
                    vs {heroBankName}
                  </p>
                </div>
              )}
            </div>

            {/* ── Amount Capping Info Banner (shown when requested > max eligible) ── */}
            {offer.originalEngineResult?.rejectionReasons?.length > 0 && offer.originalEngineResult?.eligible && (
              <div className="xl:col-span-full w-full bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 px-4 py-2.5 rounded-xl flex items-center gap-2.5 shadow-sm">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <p className="text-[11px] sm:text-xs font-semibold text-blue-700 dark:text-blue-300 leading-snug">
                  {offer.originalEngineResult.rejectionReasons[0]}
                </p>
              </div>
            )}

            {/* ── CTAs (Mobile Stacked, Desktop Row/Col) ──────────────────────── */}
            {/* xl:row-start-1 pins this to the same grid row as bank identity/EMI/
                metrics. Without it, the Amount Capping banner above (col-span-full,
                placed between the metrics chips and this div in DOM order) can't fit
                in row 1's remaining space and gets auto-placed into row 2 -- which
                then pushes this col-start-4 item into row 3 instead of staying next
                to the rest of the card's top row, whenever that banner is shown. */}
            <div className="w-full xl:w-auto min-w-0 mt-1 xl:mt-0 xl:col-start-4 xl:row-start-1 flex flex-col xl:flex-row xl:flex-wrap items-center xl:justify-end gap-3 xl:gap-2.5">
              {matchingReward?.buttonDesign ? (
                // No height class here -- GlossyRewardButton derives its own
                // height from the image's real aspect ratio; forcing h-12/
                // h-11 here is exactly what cropped (then shrank) it before.
                <GlossyRewardButton
                  colorScheme={matchingReward.buttonDesign}
                  onClick={!(isGlobalLocking && !isLocking) ? handleApplyClick : undefined}
                  disabled={isGlobalLocking && !isLocking}
                  className="w-full xl:w-[175px]"
                />
              ) : (
                <Button
                  onClick={handleApplyClick}
                  disabled={isGlobalLocking && !isLocking}
                  className="rounded-xl h-12 xl:h-11 px-4 sm:px-5 text-sm font-extrabold transition-all duration-300 w-full xl:w-[175px] border-0 shadow-lg shadow-black/5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] group/btn relative overflow-hidden"
                  style={{
                    background: localStatus === "resolved"
                      ? '#10b981'
                      : isRecommended
                        ? '#eab308'
                        : '#0f172a',
                    color: localStatus === "resolved"
                      ? 'white'
                      : isRecommended
                        ? '#0f172a'
                        : 'white',
                  }}
                >
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  {localStatus === "resolved" ? (
                    <span className="relative z-10 flex items-center justify-center whitespace-nowrap">Applied <CheckCircle2 className="w-4 h-4 ml-1.5" /></span>
                  ) : isLocking ? (
                    <Loader2 className="relative z-10 w-4 h-4 animate-spin hidden xl:block mx-auto" />
                  ) : (
                    <span className="relative z-10 flex items-center justify-center w-full whitespace-nowrap">
                      Apply with Pryme 
                      <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover/btn:translate-x-1" />
                    </span>
                  )}
                </Button>
              )}

              <button
                onClick={() => navigate(`/apply-direct/${offer.id}`)}
                className="w-full xl:w-auto rounded-xl h-11 xl:h-11 px-4 text-xs font-bold transition-all border bg-transparent dark:bg-transparent border-slate-200 dark:border-white/[0.1] text-muted-foreground hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-foreground hover:border-slate-300 flex items-center justify-center gap-1.5"
                title={`Apply directly on ${offer.bankName} website`}
              >
                Apply Directly <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>


        {/* ── Expandable Details Panel ──────────────────────── */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div
                className="border-t mx-5 md:mx-7"
                style={{ borderColor: `${brand}15` }}
              />
              <div className="p-4 md:px-7 md:py-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
                {(() => {
                  const er = offer.originalEngineResult;

                  // A range like "9,000-18,000" (SBI Legal & Technical) or a variable
                  // formula like "5000+Mortgage charge between 2500-15000 according to
                  // loan amount" (BOB-LAP Other Fees) isn't a single number -- shown as
                  // text and deliberately excluded from Total Upfront Cost rather than
                  // guessing a point estimate.
                  const isRangeOrFormula = (s: string) => /\d\s*-\s*\d|according to loan amount/i.test(s);

                  // Parse a raw fee value (real data only -- no fallback substitution;
                  // if the backend has no figure for this product, it's excluded from
                  // the total rather than silently replaced with a guessed default).
                  const toNumeric = (val: any): number => {
                    if (val == null || val === "") return 0;
                    if (val === "Nil" || val === "0" || val === 0) return 0;
                    if (typeof val === "number") return val;
                    const s = String(val).trim();
                    if (isRangeOrFormula(s)) return 0;
                    const cleaned = s.replace(/[₹,\s]/g, "");
                    if (cleaned.includes("%")) {
                      const pct = parseFloat(cleaned.replace("%", ""));
                      return isNaN(pct) ? 0 : Math.round(principalAmount * pct / 100);
                    }
                    const n = parseFloat(cleaned);
                    return isNaN(n) ? 0 : n;
                  };

                  // Format a value for display. No fallback substitution to a guessed
                  // default -- but a missing/null figure still renders as ₹0 rather
                  // than leaking "null" or an ambiguous placeholder into the UI.
                  const fmt = (val: any): string => {
                    if (val == null || val === "") return "₹0";
                    if (val === 0 || val === "0" || val === 0.0) return "₹0";
                    if (typeof val === "number") return `₹${Math.round(val).toLocaleString("en-IN")}`;
                    const s = String(val).trim();
                    if (s === "0" || s.toLowerCase() === "nil") return "₹0";
                    if (s.includes("%")) {
                      const pct = parseFloat(s.replace(/[^\d.]/g, ""));
                      if (!isNaN(pct)) {
                        return `₹${Math.round(principalAmount * pct / 100).toLocaleString("en-IN")}`;
                      }
                    }
                    if (isRangeOrFormula(s)) {
                      // Format bare number ranges ("9000-18000") as currency; leave
                      // free-text formulas (BOB-LAP's mortgage-charge note) as-is.
                      const rangeMatch = s.match(/^([\d,]+)\s*-\s*([\d,]+)$/);
                      if (rangeMatch) {
                        const lo = parseInt(rangeMatch[1].replace(/,/g, ""), 10);
                        const hi = parseInt(rangeMatch[2].replace(/,/g, ""), 10);
                        return `₹${lo.toLocaleString("en-IN")} - ₹${hi.toLocaleString("en-IN")} (est.)`;
                      }
                      return `${s} (est.)`;
                    }
                    if (s.startsWith("₹")) return s;
                    const n = parseFloat(s.replace(/[₹,\s]/g, ""));
                    if (!isNaN(n)) return `₹${Math.round(n).toLocaleString("en-IN")}`;
                    return s;
                  };

                  const loginFeeNum = toNumeric(er?.loginFee);
                  const stampDutyNum = toNumeric(er?.stampDuty);

                  // "Other Charges" = Legal & Technical Fees + Other Fees combined into
                  // one line, since both are lender-side fixed/variable charges that
                  // aren't stamp duty or processing/login fees.
                  const legalTechRaw = er?.legalTechnicalCharges;
                  const otherExpenseRaw = er?.otherExpense;
                  const otherChargesNum = toNumeric(legalTechRaw) + toNumeric(otherExpenseRaw);
                  const otherChargesEstimated = [legalTechRaw, otherExpenseRaw].some(
                    (v) => typeof v === "string" && isRangeOrFormula(v)
                  );
                  const otherChargesDisplay = `₹${otherChargesNum.toLocaleString("en-IN")}${otherChargesEstimated ? " (est.)" : ""}`;

                  const totalUpfront = pfAmount + loginFeeNum + stampDutyNum + otherChargesNum;
                  const hasEstimatedFees = otherChargesEstimated || (typeof er?.stampDuty === "string" && isRangeOrFormula(er.stampDuty));

                  const coreRows = [
                    { label: "Principal Amount", value: `₹${principalAmount.toLocaleString("en-IN")}` },
                    { label: "Interest Rate", value: `${offer.interestRate}% p.a.` },
                    { label: "Loan Tenure", value: `${offer.effectiveTenureYears} Years` },
                    { label: "Estimated Monthly EMI", value: `₹${emi.toLocaleString("en-IN")}` },
                    { label: "Total Interest Payable", value: `₹${(totalRepayment - principalAmount).toLocaleString("en-IN")}` },
                    { label: "Total Cost of Loan", value: `₹${totalRepayment.toLocaleString("en-IN")}` },
                  ];

                  const feeRows = [
                    { label: "Processing Fees", value: `₹${pfAmount.toLocaleString("en-IN")}` },
                    { label: "Login Fees", value: fmt(er?.loginFee) },
                    { label: "Stamp Duty", value: fmt(er?.stampDuty) },
                    { label: "Other Charges", value: otherChargesDisplay },
                  ];

                  return (
                    <>
                      {/* Column 1: Core Loan Costs */}
                      <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md rounded-2xl p-5 border border-white/30 dark:border-white/[0.05] flex flex-col justify-between h-full">
                        <div>
                          <h4 className="text-xs font-bold text-foreground mb-3.5 flex items-center gap-1.5">
                            <Calculator className="w-3.5 h-3.5" style={{ color: brand }} /> Loan Cost Breakdown
                          </h4>
                          <div className="space-y-0">
                            {coreRows.map((r, i) => (
                              <div key={i} className="flex justify-between text-[11px] py-2 border-b border-dashed border-slate-100/60 dark:border-white/[0.04] last:border-b-0">
                                <span className="text-muted-foreground font-medium">{r.label}</span>
                                <span className="font-bold text-foreground tabular-nums">{r.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Upfront Fees & Charges */}
                      <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md rounded-2xl p-5 border border-white/30 dark:border-white/[0.05] flex flex-col justify-between h-full">
                        <div>
                          <h4 className="text-xs font-bold text-foreground mb-3.5 flex items-center gap-1.5">
                            <Calculator className="w-3.5 h-3.5" style={{ color: brand }} /> Upfront Fees & Charges
                          </h4>
                          <div className="space-y-0">
                            {feeRows.map((r, i) => (
                              <div key={i} className="flex justify-between text-[11px] py-2 border-b border-dashed border-slate-100/60 dark:border-white/[0.04]">
                                <span className="text-muted-foreground font-medium">{r.label}</span>
                                <span className="font-bold text-foreground tabular-nums">{r.value}</span>
                              </div>
                            ))}
                            {/* Empty spacer row to align vertically with left column's 6 rows (hidden on mobile) */}
                            <div className="hidden md:flex justify-between text-[11px] py-2 border-b border-dashed border-transparent invisible">
                              <span>Spacer</span>
                              <span>Spacer</span>
                            </div>
                            {/* Total Upfront Cost */}
                            <div className="flex justify-between text-xs py-2.5 mt-0.5">
                              <span className="font-extrabold text-foreground">Total Upfront Cost</span>
                              <span className="font-extrabold tabular-nums" style={{ color: brand }}>
                                {totalUpfront > 0 ? `₹${totalUpfront.toLocaleString("en-IN")}` : "₹0"}
                              </span>
                            </div>
                            {hasEstimatedFees && (
                              <p className="text-[10px] text-muted-foreground/70 leading-snug -mt-1">
                                Excludes one variable, lender-quoted charge shown above as an estimate — actual amount depends on loan amount and will be confirmed by the lender.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}



              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});
