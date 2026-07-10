import { useState, memo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, TrendingUp, ArrowRight, Loader2, Calculator, FileText, CheckCircle2, ChevronDown, ExternalLink, Star, Gift, Smartphone, Car, Tag } from "lucide-react";
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
  maxTenure: number;
  maxLoanAmount: number;
  approvalOdds: number;
  processingTime: string;
  requiredDocs: string[];
  originalEngineResult?: any;
  employmentType?: string;
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

        <div className="pl-5 pr-5 py-5 md:pl-8 md:pr-6 md:py-6">
          {/* ── Main Grid ───────────────────────────── */}
          <div className="flex flex-col xl:grid xl:grid-cols-[220px_auto_1fr_auto] 2xl:grid-cols-[245px_auto_1fr_auto] xl:items-center gap-5 xl:gap-5 2xl:gap-6">
            
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
                  {matchingReward && (
                    <div className="mt-1.5 flex items-center gap-1.5 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 px-2.5 py-1 rounded-md w-fit shadow-sm">
                      <RewardIcon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span className="text-[10px] sm:text-[11px] font-bold text-purple-700 dark:text-purple-300 leading-tight">
                        {dynamicRewardText}
                      </span>
                    </div>
                  )}
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
              
              <div className="pb-0.5 flex flex-col justify-end">
                {!isRecommended ? (
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

            {/* ── Metrics Chips ────────────────────────────── */}
            <div className="hidden xl:flex items-center gap-2 2xl:gap-3">
              {[
                { label: "Interest", value: `${offer.interestRate}%` },
                { label: "Tenure", value: `${offer.maxTenure} yrs` },
              ].map((m, i) => (
                <div
                  key={i}
                  className="px-2.5 py-2 2xl:px-3.5 2xl:py-2.5 rounded-[1rem] bg-slate-50/95 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/[0.08] shadow-sm transition-all duration-300 group-hover:bg-white dark:group-hover:bg-white/[0.08] group-hover:shadow-md group-hover:border-slate-300 dark:group-hover:border-white/[0.15]"
                >
                  <p className="text-[9px] 2xl:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mb-1.5">{m.label}</p>
                  <p className="text-sm sm:text-base font-extrabold text-foreground tabular-nums leading-none tracking-tight">{m.value}</p>
                </div>
              ))}
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
                <p className="text-sm font-bold text-foreground bg-white dark:bg-white/[0.05] px-2.5 py-1 rounded-md border border-slate-200 dark:border-white/[0.05]">{offer.maxTenure} yrs</p>
              </div>
              {emiDiffFromHero !== 0 && (
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

            {/* ── CTAs (Mobile Stacked, Desktop Row/Col) ──────────────────────── */}
            <div className="w-full xl:w-auto mt-1 xl:mt-0 xl:col-start-4 flex flex-col xl:flex-row items-center xl:justify-end gap-3 xl:gap-2.5">
              {matchingReward?.buttonDesign ? (
                <GlossyRewardButton 
                  colorScheme={matchingReward.buttonDesign}
                  onClick={!(isGlobalLocking && !isLocking) ? handleApplyClick : undefined}
                  disabled={isGlobalLocking && !isLocking}
                  className="w-full xl:w-[175px] h-12 xl:h-11 flex justify-center items-center"
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

              {/* Desktop Chevron */}
              <button
                onClick={() => onToggleExpand(offer.id)}
                className={`hidden xl:flex ml-2 p-2.5 rounded-xl transition-all duration-300 border shrink-0 shadow-sm
                  ${isExpanded
                    ? 'bg-slate-100 dark:bg-white/10 border-slate-300 dark:border-white/20'
                    : 'bg-slate-50 dark:bg-transparent border-slate-200 dark:border-transparent hover:bg-white hover:border-slate-300'
                  }`}
                style={isExpanded ? { color: brand } : { color: 'var(--muted-foreground)' }}
                title="View requirements"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
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
                  const productCode = (er?.productCode || offer.id || "").toUpperCase();
                  const isLap = productCode.includes("LAP");

                  // Parse a raw fee value into a displayable ₹ amount number (for totaling)
                  const toNumeric = (val: any, fallbackVal: string): number => {
                    let checkVal = val;
                    if (checkVal == null || checkVal === "") {
                      checkVal = fallbackVal;
                    }
                    if (checkVal === "Nil" || checkVal === "0") return 0;
                    if (typeof checkVal === "number") return checkVal;
                    const s = String(checkVal).replace(/[₹,\s]/g, "");
                    if (s.includes("%")) {
                      // Percentage based (e.g. stamp duty 0.25%) - compute percentage of principal
                      const pct = parseFloat(s.replace("%", ""));
                      return isNaN(pct) ? 0 : Math.round(principalAmount * pct / 100);
                    }
                    const n = parseFloat(s);
                    return isNaN(n) ? 0 : n;
                  };

                  // Format a value for display with fallback
                  const fmt = (val: any, fallbackVal: string): string => {
                    const checkVal = (val != null && val !== "") ? val : fallbackVal;
                    if (checkVal === 0 || checkVal === "0" || checkVal === 0.0) return "₹0";
                    if (typeof checkVal === "number") return `₹${Math.round(checkVal).toLocaleString("en-IN")}`;
                    const s = String(checkVal).trim();
                    if (s === "0" || s.toLowerCase() === "nil") return "₹0";
                    if (s.includes("%")) {
                      const pct = parseFloat(s.replace(/[^\d.]/g, ""));
                      if (!isNaN(pct)) {
                        return `₹${Math.round(principalAmount * pct / 100).toLocaleString("en-IN")}`;
                      }
                    }
                    if (s.startsWith("₹") || s.includes("-")) return s;
                    const n = parseFloat(s.replace(/[₹,\s]/g, ""));
                    if (!isNaN(n)) return `₹${Math.round(n).toLocaleString("en-IN")}`;
                    return s;
                  };

                  // Fallbacks matching database seed patterns
                  const stampDutyFallback = isLap ? "0.50%" : "0.25%";
                  const legalTechFallback = isLap ? "₹2,500" : "₹0";
                  const loginFeeFallback = "₹1,000";

                  // Processing fee in ₹
                  const pfAmount = offer.processingFee >= 100
                    ? Math.round(offer.processingFee)
                    : Math.round(principalAmount * offer.processingFee / 100);

                  const loginFeeNum = toNumeric(er?.loginFee, loginFeeFallback);
                  const stampDutyNum = toNumeric(er?.stampDuty, stampDutyFallback);
                  const legalTechNum = toNumeric(er?.legalTechnicalCharges, legalTechFallback);

                  const totalUpfront = pfAmount + loginFeeNum + stampDutyNum + legalTechNum;

                  const coreRows = [
                    { label: "Principal Amount", value: `₹${principalAmount.toLocaleString("en-IN")}` },
                    { label: "Interest Rate", value: `${offer.interestRate}% p.a.` },
                    { label: "Loan Tenure", value: `${offer.maxTenure} Years` },
                    { label: "Estimated Monthly EMI", value: `₹${emi.toLocaleString("en-IN")}` },
                    { label: "Total Interest Payable", value: `₹${(totalRepayment - principalAmount).toLocaleString("en-IN")}` },
                    { label: "Total Cost of Loan", value: `₹${totalRepayment.toLocaleString("en-IN")}` },
                  ];

                  const feeRows = [
                    { label: "Processing Fees", value: `₹${pfAmount.toLocaleString("en-IN")}` },
                    { label: "Login Fees", value: fmt(er?.loginFee, loginFeeFallback) },
                    { label: "Stamp Duty", value: fmt(er?.stampDuty, stampDutyFallback) },
                    { label: "Legal & Technical Fees", value: fmt(er?.legalTechnicalCharges, legalTechFallback) },
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
