import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Gift,
  Percent,
  Tag,
  Sparkles,
  Briefcase,
  User,
  UserCheck,
  ShieldCheck,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, numberToIndianWords } from "@/lib/utils";
import { PrymeAPI } from "@/lib/api";
import loyaltyGiftImg from "@/assets/loyalty-gift.png";

interface Offer {
  id: string;
  type: "discount" | "cashback" | "reward" | "gift";
  title: string;
  bank?: string;
  validTill?: string;
}

// Real product_rewards row shape (see AdminProductRewardController / PublicProductRewardController)
interface ProductRewardRow {
  id: string;
  bank: string;
  productCode: string;
  iconType?: string;
  rewardText?: string;
  minLoanAmount?: number | null;
  maxLoanAmount?: number | null;
  employmentType?: string;
  reward1?: string;
  reward2?: string;
  pfWaiver?: string;
}

const products = [
  { id: "personal", label: "Personal Loan" },
  { id: "business", label: "Business Loan" },
  { id: "home", label: "Home Loan" },
  { id: "lap", label: "Loan Against Property" },
  { id: "auto", label: "Auto Loan" },
];

// Loan product selection -> product_code prefix suffix used in seeded reward data
// (e.g. "ABFL-HL", "ABFL-LAP"). Personal/Business/Auto have no reward data seeded
// yet (the curated sheet only covered Home Loan and LAP) -- left unmapped on
// purpose rather than guessing, so those profiles honestly show "no rewards"
// instead of fabricated ones.
const PRODUCT_TO_CODE_SUFFIX: Record<string, string | null> = {
  personal: null,
  business: null,
  home: "-HL",
  lap: "-LAP",
  auto: null,
};

// Employment selection -> exact employment_type string stored in product_rewards
// (sourced verbatim from Rewards_Offers_Mapped.xlsx, including its own spelling).
const EMPLOYMENT_TO_REWARD_TYPE: Record<string, string> = {
  salaried: "SALARIED",
  "non-professional": "SELF EMPLOYEED NON PROFESSIONAL",
  professional: "SELF EMPLOYEED PROFESSIONAL",
};

const OffersRewards = () => {
  // Form State
  const [loanAmount, setLoanAmount] = useState<number | "">("");
  const [loanProduct, setLoanProduct] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [employmentType, setEmploymentType] = useState<string>("salaried");

  // Navigation Step State
  const [step, setStep] = useState<"form" | "results">("form");
  const [calculatedOffers, setCalculatedOffers] = useState<Offer[]>([]);

  // Real reward data, fetched once from the public catalogue
  const [rewardRows, setRewardRows] = useState<ProductRewardRow[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    PrymeAPI.getPublicProductRewards()
      .then((res: any) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        setRewardRows(list);
      })
      .catch(() => {
        if (!cancelled) setRewardRows([]);
      })
      .finally(() => {
        if (!cancelled) setRewardsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Format amount input as numbers
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (val === "") {
      setLoanAmount("");
      return;
    }
    const numVal = parseInt(val, 10);
    if (numVal <= 500000000) {
      setLoanAmount(numVal);
    }
  };

  const formatInputCurrency = (value: number | "") => {
    if (value === "" || isNaN(value)) return "";
    return new Intl.NumberFormat("en-IN").format(value);
  };

  // Match real seeded reward rows against the applicant's inputs -- no
  // fabricated offers. If nothing in product_rewards matches (e.g. Personal/
  // Business/Auto loans, which have no reward data seeded yet), the result
  // list is honestly empty rather than inventing a plausible-looking offer.
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(loanAmount) || 0;
    const codeSuffix = PRODUCT_TO_CODE_SUFFIX[loanProduct];
    const targetEmpType = EMPLOYMENT_TO_REWARD_TYPE[employmentType];

    const matches = rewardRows.filter((r) => {
      if (codeSuffix && !r.productCode?.toUpperCase().endsWith(codeSuffix)) return false;
      if (targetEmpType && r.employmentType && r.employmentType.toUpperCase() !== targetEmpType) return false;
      if (r.minLoanAmount != null && amount < r.minLoanAmount) return false;
      if (r.maxLoanAmount != null && amount > r.maxLoanAmount) return false;
      return true;
    });

    // One card per matching lender, deduplicated by bank (a lender could in
    // theory have more than one row matching the same bracket).
    const seenBanks = new Set<string>();
    const generatedOffers: Offer[] = [];
    for (const r of matches) {
      if (seenBanks.has(r.bank)) continue;
      seenBanks.add(r.bank);

      // All three reward categories (item 1, item 2, PF waiver) shown as one
      // line separated by "/" rather than splitting the physical items with
      // "+" and demoting the PF waiver to a separate pill.
      const items = [r.reward1, r.reward2, r.pfWaiver].filter(Boolean);
      generatedOffers.push({
        id: r.id,
        type: items.length > 0 ? "gift" : "discount",
        title: items.length > 0 ? items.join(" / ") : "Special Offer",
        bank: r.bank,
        validTill: "Ongoing",
      });
    }

    setCalculatedOffers(generatedOffers);
    setStep("results");
  };

  const getOfferIcon = (type: Offer["type"]) => {
    switch (type) {
      case "discount": return Percent;
      case "cashback": return Tag;
      case "gift": return Gift;
      case "reward": return Sparkles;
    }
  };

  const getOfferStyling = (type: Offer["type"]) => {
    switch (type) {
      case "discount": return "text-[#103783] bg-[#103783]/10 border-[#103783]/20 shadow-[0_0_15px_rgba(16,55,131,0.05)]";
      case "cashback": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]";
      case "gift": return "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]";
      case "reward": return "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]";
    }
  };

  return (
    <div className="w-full bg-transparent relative overflow-visible">

      <AnimatePresence mode="wait">
        {step === "form" ? (
          <motion.div
            key="calculator-form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            {/* ────────────── HEADER SECTION ────────────── */}
            <div className="text-center mb-6 pb-6 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#103783]/10 border border-[#103783]/20 flex items-center justify-center">
                  <Gift className="w-3.5 h-3.5 text-[#103783]" />
                </div>
                <span className="text-[10px] font-extrabold text-[#103783] dark:text-[#3b82f6] uppercase tracking-widest leading-none">
                  Pryme Loyalty Club
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-[#0a1530] dark:text-white tracking-tight leading-none mb-2" style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif' }}>
                Rewards Calculator
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-xl mx-auto font-medium leading-relaxed">
                Enter your loan details to see the exciting rewards and offers you can earn with top lenders.
              </p>
            </div>

            {/* ────────────── FORM SECTION ────────────── */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleCalculate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Input: Loan Amount */}
                  <div className="space-y-1.5">
                    <label htmlFor="reward-loan-amount" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Loan Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                        ₹
                      </span>
                      <input
                        id="reward-loan-amount"
                        type="text"
                        required
                        placeholder="Enter loan amount"
                        value={formatInputCurrency(loanAmount)}
                        onChange={handleAmountChange}
                        className="w-full pl-7 pr-3 py-2 bg-white dark:bg-[#0c1829] border border-slate-200 focus:border-[#103783] dark:border-[#103783]/20 dark:focus:border-[#1e56c7] focus:ring-4 focus:ring-[#103783]/5 transition-all rounded-lg text-xs font-bold text-[#0a1530] dark:text-white placeholder:text-slate-400"
                      />
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400 block">
                      Enter amount between ₹1,00,000 - ₹5,00,000,000
                    </span>
                    {loanAmount !== "" && Number(loanAmount) > 0 && (
                      <span className="text-[10px] font-bold text-[#103783]/70 dark:text-[#3b82f6]/70 block">
                        {numberToIndianWords(Number(loanAmount))}
                      </span>
                    )}
                  </div>

                  {/* Dropdown: Loan Product */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Loan Product
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-[#0c1829] border border-slate-200 dark:border-[#103783]/20 focus:outline-none focus:border-[#103783] dark:focus:border-[#1e56c7] focus:ring-4 focus:ring-[#103783]/5 transition-all rounded-lg text-xs font-bold text-[#0a1530] dark:text-white text-left cursor-pointer"
                      >
                        <span className={cn(!loanProduct && "text-slate-400 font-medium")}>
                          {loanProduct 
                            ? products.find(p => p.id === loanProduct)?.label 
                            : "Select loan product"}
                        </span>
                        <ChevronDown className={cn(
                          "w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0",
                          isDropdownOpen && "transform rotate-180"
                        )} />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {isDropdownOpen && (
                          <>
                            {/* Backdrop to close on click outside */}
                            <div 
                              className="fixed inset-0 z-40 bg-transparent" 
                              onClick={() => setIsDropdownOpen(false)} 
                            />
                            <motion.div
                              initial={{ opacity: 0, y: 4, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 4, scale: 0.98 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-[#0c1829] border border-slate-200 dark:border-[#103783]/20 rounded-xl shadow-xl z-50 py-1 overflow-hidden"
                            >
                              {products.map((p) => {
                                const hasRewards = PRODUCT_TO_CODE_SUFFIX[p.id] != null;
                                return (
                                  <button
                                    key={p.id}
                                    type="button"
                                    disabled={!hasRewards}
                                    onClick={() => {
                                      if (!hasRewards) return;
                                      setLoanProduct(p.id);
                                      setIsDropdownOpen(false);
                                    }}
                                    className={cn(
                                      "w-full text-left px-3 py-2 text-xs font-bold transition-all flex items-center justify-between",
                                      !hasRewards
                                        ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                        : cn(
                                            "hover:bg-[#103783]/5 dark:hover:bg-[#1e56c7]/5 hover:text-[#103783] dark:hover:text-white",
                                            loanProduct === p.id
                                              ? "text-[#103783] dark:text-white bg-[#103783]/5 dark:bg-[#1e56c7]/5"
                                              : "text-slate-600 dark:text-slate-350"
                                          )
                                    )}
                                  >
                                    <span>{p.label}</span>
                                    {!hasRewards && (
                                      <span className="text-[9px] font-bold uppercase tracking-wide text-slate-300 dark:text-slate-600">
                                        Coming Soon
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Selection Cards: Employment Type */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Employment Type
                  </label>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {/* Option 1: Salaried */}
                    <div 
                      onClick={() => setEmploymentType("salaried")}
                      className={cn(
                        "border rounded-xl py-2 flex items-center justify-center cursor-pointer transition-all duration-200 text-center select-none",
                        employmentType === "salaried"
                          ? "border-[#103783] bg-[#103783]/5 text-[#103783] dark:border-[#1e56c7] dark:bg-[#1e56c7]/5 dark:text-white font-bold" 
                          : "border-slate-200 bg-white hover:border-slate-350 text-slate-500 dark:border-[#103783]/10 dark:bg-[#0c1829]"
                      )}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Salaried
                      </span>
                    </div>

                    {/* Option 2: Self Employed Non Professional */}
                    <div 
                      onClick={() => setEmploymentType("non-professional")}
                      className={cn(
                        "border rounded-xl py-2 flex items-center justify-center cursor-pointer transition-all duration-200 text-center select-none",
                        employmentType === "non-professional"
                          ? "border-[#103783] bg-[#103783]/5 text-[#103783] dark:border-[#1e56c7] dark:bg-[#1e56c7]/5 dark:text-white font-bold" 
                          : "border-slate-200 bg-white hover:border-slate-350 text-slate-500 dark:border-[#103783]/10 dark:bg-[#0c1829]"
                      )}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Self Employed
                      </span>
                    </div>

                    {/* Option 3: Self Employed Professional */}
                    <div 
                      onClick={() => setEmploymentType("professional")}
                      className={cn(
                        "border rounded-xl py-2 flex items-center justify-center cursor-pointer transition-all duration-200 text-center select-none",
                        employmentType === "professional"
                          ? "border-[#103783] bg-[#103783]/5 text-[#103783] dark:border-[#1e56c7] dark:bg-[#1e56c7]/5 dark:text-white font-bold" 
                          : "border-slate-200 bg-white hover:border-slate-350 text-slate-500 dark:border-[#103783]/10 dark:bg-[#0c1829]"
                      )}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Professional
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={rewardsLoading}
                  className="w-full bg-[#103783] hover:bg-[#0c2a66] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#103783]/10 hover:shadow-[#103783]/20 transition-all flex items-center justify-center gap-1.5 mt-2"
                >
                  {rewardsLoading ? "Loading rewards…" : "Calculate Rewards"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Privacy note */}
            <div className="flex items-center justify-center gap-1.5 mt-2 text-slate-400 text-[10px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Your information is 100% secure and confidential</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="calculator-results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            {/* ────────────── RESULTS HEADER ────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-100 dark:border-[#103783]/10">
              <div>
                <button 
                  onClick={() => setStep("form")}
                  className="inline-flex items-center gap-1 text-[#103783] hover:text-[#0c2a66] text-xs font-extrabold uppercase tracking-widest mb-3 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to calculator
                </button>
                <h2 className="text-3xl font-extrabold text-[#0a1530] dark:text-white tracking-tight" style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif' }}>
                  Your Exciting Rewards
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mt-1">
                  Matched Offers based on your profile
                </p>
              </div>

              {/* Quick Summary Badge */}
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-[#103783]/20 rounded-2xl px-4 py-3 shrink-0 flex items-center gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loan Request</p>
                  <p className="text-sm font-extrabold text-[#0a1530] dark:text-white">₹{formatInputCurrency(loanAmount)}</p>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-[#103783]/20" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profile</p>
                  <p className="text-sm font-extrabold text-[#0a1530] dark:text-white capitalize">{employmentType.replace("-", " ")}</p>
                </div>
              </div>
            </div>

            {/* ────────────── RESULTS GRID ────────────── */}
            {calculatedOffers.length === 0 ? (
              <div className="text-center py-16 px-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-[#103783]/20 rounded-2xl">
                <Gift className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-[#0a1530] dark:text-white mb-1">No rewards currently available for this profile</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {PRODUCT_TO_CODE_SUFFIX[loanProduct] === null
                    ? "Reward offers are currently only available for Home Loan and Loan Against Property applications."
                    : "Try a different loan amount or employment type, or check back soon — new lender offers are added regularly."}
                </p>
              </div>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {calculatedOffers.map((offer) => {
                const Icon = getOfferIcon(offer.type);
                const styling = getOfferStyling(offer.type);

                return (
                  <div
                    key={offer.id}
                    className="group relative bg-white dark:bg-[#0c1829] border border-slate-200/70 dark:border-[#103783]/15 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {/* Brand accent bar — consistent with the bank-card left stripe used elsewhere on the site */}
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#103783] to-[#1e56c7]" />

                    <div className="pl-4 pr-3.5 py-3.5">
                      {/* Header: icon + bank name */}
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-110", styling)}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span
                          className="text-[10px] font-extrabold uppercase tracking-wide text-[#103783] dark:text-[#3b82f6] truncate"
                          title={offer.bank}
                        >
                          {offer.bank}
                        </span>
                      </div>

                      {/* Reward headline */}
                      <h4
                        className="font-extrabold text-[13px] text-[#0a1530] dark:text-white leading-snug tracking-tight line-clamp-2 min-h-[2.4em]"
                        style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif' }}
                        title={offer.title}
                      >
                        {offer.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            {/* Back action below results */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 pt-6 border-t border-slate-100 dark:border-[#103783]/10">
              <button
                onClick={() => setStep("form")}
                className="w-full sm:w-auto bg-slate-50 border border-slate-200 dark:bg-white/[0.02] dark:border-[#103783]/20 hover:bg-slate-100 hover:border-slate-300 dark:hover:bg-white/[0.05] active:scale-[0.99] text-[#0a1530] dark:text-white px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Recalculate Rewards
              </button>

              <Link
                to={`/apply?amount=${loanAmount}&type=${loanProduct}&employment=${employmentType}`}
                className="w-full sm:w-auto bg-[#103783] hover:bg-[#0c2a66] active:scale-[0.99] text-white px-6 py-3 rounded-xl text-xs font-bold shadow-lg shadow-[#103783]/20 transition-all flex items-center justify-center gap-2"
              >
                Apply for Loan Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────── TRUST FOOTER SECTION ────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 md:gap-16 mt-2.5 pt-2.5 border-t border-slate-150 dark:border-[#103783]/20 w-full">
        {/* Item 2 */}
        <div className="flex items-start gap-3 max-w-xs">
          <div className="w-9 h-9 rounded-full bg-[#103783]/5 dark:bg-[#103783]/10 flex items-center justify-center shrink-0 border border-[#103783]/10">
            <Percent className="w-4.5 h-4.5 text-[#103783]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0a1530] dark:text-white uppercase tracking-wider mb-0.5">
              Best Rewards
            </h4>
            <p className="text-[10px] font-semibold text-slate-400">
              Compare and choose from top lender offers
            </p>
          </div>
        </div>

        {/* Item 3 */}
        <div className="flex items-start gap-3 max-w-xs">
          <div className="w-9 h-9 rounded-full bg-[#103783]/5 dark:bg-[#103783]/10 flex items-center justify-center shrink-0 border border-[#103783]/10">
            <Clock className="w-4.5 h-4.5 text-[#103783]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0a1530] dark:text-white uppercase tracking-wider mb-0.5">
              Quick & Easy
            </h4>
            <p className="text-[10px] font-semibold text-slate-400">
              Get results in seconds and save time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersRewards;