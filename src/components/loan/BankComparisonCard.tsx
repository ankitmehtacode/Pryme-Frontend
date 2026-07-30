import { useState, memo, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, TrendingUp, Calculator, FileText, ChevronDown, ExternalLink, Star, Gift, Smartphone, Car, Tag, AlertCircle, Info, Percent, Calendar } from "lucide-react";
import { GlossyRewardButton, GLOSSY_BUTTON_SIBLING_WIDTH } from "@/components/admin/GlossyRewardButton";

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

// ── Upfront fee parsing ─────────────────────────────────────────────────────
// Module scope so the metric chip and the expandable breakdown panel below
// derive Total Cost from one implementation rather than two.

// A range like "9,000-18,000" (SBI Legal & Technical) or a variable formula
// like "5000+Mortgage charge between 2500-15000 according to loan amount"
// (BOB-LAP Other Fees) isn't a single number -- shown as text and deliberately
// excluded from the upfront total rather than guessing a point estimate.
const isRangeOrFormula = (s: string) => /\d\s*-\s*\d|according to loan amount/i.test(s);

// Parse a raw fee value (real data only -- no fallback substitution; if the
// backend has no figure for this product, it's excluded from the total rather
// than silently replaced with a guessed default).
const toNumericFee = (val: any, principalAmount: number): number => {
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

// Format a value for display. No fallback substitution to a guessed default --
// but a missing/null figure still renders as ₹0 rather than leaking "null" or
// an ambiguous placeholder into the UI.
const formatFee = (val: any, principalAmount: number): string => {
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
    // Format bare number ranges ("9000-18000") as currency; leave free-text
    // formulas (BOB-LAP's mortgage-charge note) as-is.
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
  const [isLocking, setIsLocking] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [offer.logoUrl]);

  // The button shows no state of its own -- no spinner, no "Applied" badge.
  // Applying opens the confirmation popup and routes the user to /auth, so
  // the card is about to unmount either way. isLocking is kept only to guard
  // against a double submit and to keep this card out of the disabled state
  // its siblings enter while a lock is in flight.
  const handleApplyClick = async () => {
    setIsLocking(true);
    try {
      await onApply(offer.id);
    } catch {
      // Swallowed deliberately: onApply (Offers.tsx handleUnlock) already
      // surfaces its own error toast, and an async throw out of an event
      // handler would escape React's error boundaries as an unhandled
      // rejection rather than being caught by one.
    } finally {
      setIsLocking(false);
    }
  };
  const brand = offer.brandHex;

  const matchingReward = rewards?.find(r => {
    // 1. Match Product Code (Engine obfuscates to ABFL-HL, so we check if it ends with the reward's product code like 'HL')
    const engineProdCode = offer.originalEngineResult?.productCode || offer.productType || "";
    if (r.productCode && !engineProdCode.toUpperCase().endsWith(r.productCode.toUpperCase())) return false;
    
    // 2. Match Bank Name (case-insensitive)
    if (r.bank?.toLowerCase() !== offer.bankName?.toLowerCase()) return false;
    
    // 3. Match Loan Amount Tier -- against what's actually being funded
    // (principalAmount = min(requested, true eligibility ceiling)), not the
    // applicant's broader uncapped ceiling. A ₹50L-funded applicant who
    // happens to be eligible for ₹90L should get the ₹50L-tier reward, not
    // the ₹90L one -- matching a reward to money that was never disbursed.
    // (offer.maxLoanAmount holds that uncapped ceiling -- previously used
    // here via a nonexistent `maxEligibleLoanAmount` field that silently
    // fell through to it.)
    const eligibleAmount = principalAmount || 0;

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

  // Total upfront cost = processing fee + login fee + stamp duty + other
  // charges. Hoisted for the same reason as pfAmount: the top-row "Total Cost"
  // chip and the "Total Upfront Cost" line in the breakdown panel are the same
  // number and must not be able to drift apart.
  const { totalUpfront, otherChargesDisplay, hasEstimatedFees } = useMemo(() => {
    const er = offer.originalEngineResult;

    // "Other Charges" = Legal & Technical Fees + Other Fees combined into one
    // line, since both are lender-side fixed/variable charges that aren't
    // stamp duty or processing/login fees.
    const legalTechRaw = er?.legalTechnicalCharges;
    const otherExpenseRaw = er?.otherExpense;
    const otherChargesNum = toNumericFee(legalTechRaw, principalAmount) + toNumericFee(otherExpenseRaw, principalAmount);
    const otherChargesEstimated = [legalTechRaw, otherExpenseRaw].some(
      (v) => typeof v === "string" && isRangeOrFormula(v)
    );

    return {
      totalUpfront:
        pfAmount +
        toNumericFee(er?.loginFee, principalAmount) +
        toNumericFee(er?.stampDuty, principalAmount) +
        otherChargesNum,
      otherChargesDisplay: `₹${otherChargesNum.toLocaleString("en-IN")}${otherChargesEstimated ? " (est.)" : ""}`,
      hasEstimatedFees: otherChargesEstimated || (typeof er?.stampDuty === "string" && isRangeOrFormula(er.stampDuty)),
    };
  }, [offer.originalEngineResult, principalAmount, pfAmount]);

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

        {/* ── Top Promo Bar/Ribbon for Reward — tinted to this offer's brand colour ── */}
        {matchingReward && (
          <div
            className="border-b px-5 py-3 md:px-8 flex items-center gap-3"
            style={{ backgroundColor: `${brand}0D`, borderColor: `${brand}26` }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${brand}1A` }}>
              <RewardIcon className="w-4 h-4" style={{ color: brand }} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] md:text-[10px] font-extrabold uppercase tracking-widest leading-none" style={{ color: brand }}>
                Exclusive Reward
              </p>
              <p className="text-[11px] md:text-xs font-semibold leading-snug mt-1" style={{ color: brand }}>
                {dynamicRewardText}
              </p>
            </div>
          </div>
        )}

        <div className="pl-5 pr-5 py-5 md:pl-8 md:pr-6 md:py-6">
          {/* ── Main Grid ───────────────────────────── */}
          <div className="flex flex-col xl:grid xl:grid-cols-[200px_210px_300px_minmax(0,1fr)] 2xl:grid-cols-[220px_230px_340px_minmax(0,1fr)] xl:items-center gap-5 xl:gap-5 2xl:gap-6">
            
            {/* ── Bank Identity ────────────────────────────── */}
            <div className="flex items-center gap-4 w-full xl:w-auto">
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

            {/* ── EMI & Comparison Diff ── */}
            {/* Stacked vertically (EMI, then the Funds/diff line below it)
                rather than side-by-side: at 210-230px this grid column can't
                fit a large EMI figure and a full "Funds ₹XX,XX,XXX" amount on
                one line without squeezing the latter down to a truncated
                ellipsis. Stacking gives each line the full column width, same
                pattern already used in the mobile block below. */}
            <div className="hidden xl:flex flex-col justify-center min-h-[44px] min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-0.5">EMI</p>
              <p className="text-2xl sm:text-[26px] font-extrabold text-foreground tabular-nums leading-none tracking-tight">
                <span className="text-sm sm:text-base text-muted-foreground/50 mr-0.5">₹</span>{emi.toLocaleString("en-IN")}
              </p>

              {!isFullyFunded ? (
                <>
                  <p className="text-[11px] sm:text-xs font-bold tracking-tight leading-none text-amber-600 dark:text-amber-400 mt-1.5">
                    Funds ₹{Math.round(principalAmount).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[9px] text-muted-foreground/50 font-semibold whitespace-nowrap leading-none mt-1">
                    Below your request
                  </p>
                </>
              ) : !isLowestEmi ? (
                <>
                  <p
                    className="text-[11px] sm:text-xs font-bold tabular-nums whitespace-nowrap tracking-tight leading-none mt-1.5"
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
                  <p className="text-[11px] sm:text-xs font-bold whitespace-nowrap tracking-tight leading-none text-emerald-600 dark:text-emerald-400 mt-1.5">
                    Lowest EMI
                  </p>
                  <p className="text-[9px] text-muted-foreground/50 font-semibold whitespace-nowrap leading-none mt-1">
                    Lowest total cost
                  </p>
                </>
              )}
            </div>

            {/* ── Metrics Chips + Cost Breakdown Toggle ────────── */}
            <div className="hidden xl:flex xl:flex-col gap-2">
              <div className="flex items-center gap-1.5 2xl:gap-2">
                {[
                  { label: "Interest", value: `${offer.interestRate}%` },
                  { label: "Tenure", value: `${offer.effectiveTenureYears} yrs` },
                  { label: "Total Cost", value: `₹${totalUpfront.toLocaleString("en-IN")}` },
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

            {/* ── Mobile EMI + Metrics Board ────────────────────────────── */}
            <div className="xl:hidden w-full flex flex-col gap-3">
              <div className="flex items-start gap-3">
                {/* EMI column -- same label/diff logic as the desktop EMI block above */}
                <div className="flex-[0_0_38%] min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">EMI</p>
                  <p className="text-[26px] font-black text-foreground tabular-nums leading-none tracking-tight">
                    <span className="text-sm text-muted-foreground/40 mr-0.5 font-bold">₹</span>{emi.toLocaleString("en-IN")}
                  </p>
                  {!isFullyFunded ? (
                    <>
                      <p className="text-[10px] font-bold tracking-tight leading-tight text-amber-600 dark:text-amber-400 mt-1.5">
                        Funds ₹{Math.round(principalAmount).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[9px] text-muted-foreground/50 font-semibold leading-tight mt-0.5">Below your request</p>
                    </>
                  ) : !isLowestEmi ? (
                    <>
                      <p
                        className="text-[10px] font-bold tabular-nums tracking-tight leading-tight mt-1.5"
                        style={{ color: emiDiffFromHero > 0 ? '#ea580c' : emiDiffFromHero < 0 ? '#10b981' : '#64748b' }}
                      >
                        {emiDiffFromHero > 0
                          ? `+₹${emiDiffFromHero.toLocaleString("en-IN")}/mo more`
                          : emiDiffFromHero < 0
                            ? `-₹${Math.abs(emiDiffFromHero).toLocaleString("en-IN")}/mo less`
                            : "Same EMI"}
                      </p>
                      <p className="text-[9px] text-muted-foreground/50 font-semibold tabular-nums leading-tight mt-0.5">
                        {totalDiffFromHero > 0
                          ? `₹${totalDiffFromHero.toLocaleString("en-IN")} extra total`
                          : totalDiffFromHero < 0
                            ? `₹${Math.abs(totalDiffFromHero).toLocaleString("en-IN")} less total`
                            : "Same total"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] font-bold tracking-tight leading-tight text-emerald-600 dark:text-emerald-400 mt-1.5">Lowest EMI</p>
                      <p className="text-[9px] text-muted-foreground/50 font-semibold leading-tight mt-0.5">Lowest total cost</p>
                    </>
                  )}
                </div>

                {/* Metrics box -- icon + label + value rows, tinted to this offer's brand colour */}
                <div className="flex-1 min-w-0 bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] rounded-2xl p-3 flex flex-col gap-2.5">
                  {[
                    { icon: Percent, label: "Interest Rate", value: `${offer.interestRate}%` },
                    { icon: Calendar, label: "Tenure", value: `${offer.effectiveTenureYears} yrs` },
                    { icon: FileText, label: "Total Cost", value: `₹${totalUpfront.toLocaleString("en-IN")}` },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${brand}1A` }}>
                          <m.icon className="w-3 h-3" style={{ color: brand }} />
                        </div>
                        <span className="text-[10px] font-semibold text-muted-foreground truncate">{m.label}</span>
                      </div>
                      <span className="text-xs font-bold text-foreground tabular-nums whitespace-nowrap flex items-center gap-1">
                        {m.value}
                        {m.label === "Tenure" && offer.requestedTenure && offer.effectiveTenureYears < offer.requestedTenure && (
                          <div className="group relative flex items-center justify-center">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            <div className="absolute bottom-full right-0 mb-2 w-44 bg-slate-900 dark:bg-slate-800 text-slate-100 text-[10px] p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 normal-case font-normal">
                              Tenure clamped to {offer.effectiveTenureYears} years. The maximum tenure allowed by this product.
                            </div>
                          </div>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onToggleExpand(offer.id)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all duration-300
                  ${isExpanded
                    ? 'bg-slate-100 dark:bg-white/10 border-slate-300 dark:border-white/20'
                    : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08]'
                  }`}
                style={isExpanded ? { color: brand } : undefined}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                  Complete Cost Break Down
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/70 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
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

            {/* ── CTAs (stacked, identical size, at every breakpoint) ──────────── */}
            {/* xl:row-start-1 pins this to the same grid row as bank identity/EMI/
                metrics. Without it, the Amount Capping banner above (col-span-full,
                placed between the metrics chips and this div in DOM order) can't fit
                in row 1's remaining space and gets auto-placed into row 2 -- which
                then pushes this col-start-4 item into row 3 instead of staying next
                to the rest of the card's top row, whenever that banner is shown. */}
            {/* Pushed right with an auto margin, never a fixed one.

                This previously used xl:ml-[75px] on a xl:w-[210px] stack -- 285px
                of hard requirement inside a track that is not always that wide.
                Offers.tsx caps the page at max-w-6xl, so the card's inner width is
                a constant 1096px at every viewport, while this grid widens its
                fixed columns at 2xl (200/210/300 -> 220/230/340, gap 20 -> 24).
                Cols 1-3 therefore grow from 770px to 862px with nothing paying for
                it, and the trailing 1fr track drops from 326px to 234px -- 51px
                short. The overflow was invisible as overflow because the card is
                overflow-hidden: the buttons were simply sliced off.

                ml-auto cannot do that. An auto margin consumes only free space
                that exists, collapsing to zero when there is none, so the stack
                stays inside the track at any width. max-w keeps the intended
                210px cap while w-full lets it shrink below that if a future
                layout ever leaves less. */}
            <div className="w-full xl:w-full xl:max-w-[210px] min-w-0 mt-1 xl:mt-0 xl:ml-auto xl:col-start-4 xl:row-start-1 flex flex-col items-stretch gap-3">
              {/* Apply with Pryme -- always the premium glossy design now,
                  regardless of whether a reward matched this offer. The button
                  renders no click state of its own: the confirmation popup is
                  the feedback, and it opens immediately. */}
              <GlossyRewardButton
                onClick={!(isGlobalLocking && !isLocking) ? handleApplyClick : undefined}
                disabled={isGlobalLocking && !isLocking}
              />

              {/* Width tracks the glossy graphic's footprint (not w-full), inset
                  5px per side -- see GLOSSY_BUTTON_SIBLING_WIDTH. */}
              <button
                onClick={() => navigate(`/apply-direct/${offer.id}`)}
                className={`self-center ${GLOSSY_BUTTON_SIBLING_WIDTH} max-w-full h-12 md:h-[52px] rounded-full text-[11px] font-semibold transition-all border bg-transparent border-primary text-slate-600 dark:border-[#103783] dark:text-slate-300 hover:bg-primary/5 dark:hover:bg-primary/10 flex items-center justify-center gap-1.5`}
              >
                Apply Directly
                <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0 opacity-70">
                  <ExternalLink className="w-2.5 h-2.5" />
                </span>
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

                  const coreRows = [
                    { label: "Principal Amount", value: `₹${principalAmount.toLocaleString("en-IN")}` },
                    { label: "Interest Rate", value: `${offer.interestRate}% p.a.` },
                    { label: "Loan Tenure", value: `${offer.effectiveTenureYears} Years` },
                    { label: "Estimated Monthly EMI", value: `₹${emi.toLocaleString("en-IN")}` },
                    { label: "Total Interest Payable", value: `₹${(totalRepayment - principalAmount).toLocaleString("en-IN")}` },
                    { label: "Total Cost of Loan", value: `₹${totalRepayment.toLocaleString("en-IN")}` },
                  ];

                  const feeRows = [
                    { label: "Processing Fees(Inclusive of GST)", value: `₹${pfAmount.toLocaleString("en-IN")}` },
                    { label: "Login Fees", value: formatFee(er?.loginFee, principalAmount) },
                    { label: "Stamp Duty", value: formatFee(er?.stampDuty, principalAmount) },
                    { label: "Other Charges(approx.)", value: otherChargesDisplay },
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
