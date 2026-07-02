import { useState } from "react";
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
import { cn } from "@/lib/utils";
import loyaltyGiftImg from "@/assets/loyalty-gift.png";

interface Offer {
  id: string;
  type: "discount" | "cashback" | "reward" | "gift";
  title: string;
  description: string;
  bank?: string;
  validTill?: string;
}

const products = [
  { id: "personal", label: "Personal Loan" },
  { id: "business", label: "Business Loan" },
  { id: "home", label: "Home Loan" },
  { id: "lap", label: "Loan Against Property" },
  { id: "auto", label: "Auto Loan" },
];

const OffersRewards = () => {
  // Form State
  const [loanAmount, setLoanAmount] = useState<number | "">("");
  const [loanProduct, setLoanProduct] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [employmentType, setEmploymentType] = useState<string>("salaried");
  
  // Navigation Step State
  const [step, setStep] = useState<"form" | "results">("form");
  const [calculatedOffers, setCalculatedOffers] = useState<Offer[]>([]);

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

  // Logic to calculate dynamic rewards based on user inputs
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(loanAmount) || 1000000;
    
    // Dynamic calculations
    const processingFeeDiscount = amount >= 5000000 ? "100% Processing Fee Waiver" : "50% Off Processing Fee";
    const processingFeeDesc = amount >= 5000000 
      ? "Exclusive premium benefit: zero processing charges on your loan application."
      : "Save on setup costs with a 50% discount on standard bank processing fees.";

    // Amazon voucher calculation
    let amazonCardVal = "₹1,000 Amazon Gift Card";
    let amazonCardDesc = "Get an Amazon shopping voucher upon successful disbursal.";
    if (amount >= 3000000) {
      amazonCardVal = "₹5,000 Amazon Gift Card";
      amazonCardDesc = "Premium milestone gift: ₹5,000 Amazon voucher added to your account.";
    } else if (amount >= 1000000) {
      amazonCardVal = "₹2,500 Amazon Gift Card";
      amazonCardDesc = "Special reward: ₹2,500 Amazon voucher credited on disbursal.";
    }

    // Cashback calculation
    let cashbackVal = "₹2,000 Instant Cashback";
    let cashbackDesc = "Direct cashback credited on your first successful EMI payment.";
    if (employmentType === "professional") {
      cashbackVal = "₹5,000 Cashback Bonus";
      cashbackDesc = "Special Self-Employed Professional bonus: ₹5,000 first EMI cashback.";
    } else if (amount >= 2000000) {
      cashbackVal = "₹3,500 High-Value Cashback";
      cashbackDesc = "Enhanced cashback of ₹3,500 for loan amounts exceeding ₹20 Lakhs.";
    }

    // Loyalty points calculation
    const loyaltyPoints = amount >= 5000000 ? "15,000 Pryme Reward Points" : "10,000 Pryme Reward Points";
    const loyaltyDesc = `Earn loyalty points redeemable for premium travel and hotel vouchers.`;

    const generatedOffers: Offer[] = [
      {
        id: "d1",
        type: "discount",
        title: processingFeeDiscount,
        description: processingFeeDesc,
        bank: "HDFC Bank",
        validTill: "31 Dec 2026"
      },
      {
        id: "d2",
        type: "cashback",
        title: cashbackVal,
        description: cashbackDesc,
        bank: "ICICI Bank",
        validTill: "31 Dec 2026"
      },
      {
        id: "d3",
        type: "gift",
        title: amazonCardVal,
        description: amazonCardDesc,
        bank: "Axis Bank",
        validTill: "31 Dec 2026"
      },
      {
        id: "d4",
        type: "reward",
        title: loyaltyPoints,
        description: loyaltyDesc,
        bank: "SBI",
        validTill: "Ongoing"
      }
    ];

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
                              {products.map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    setLoanProduct(p.id);
                                    setIsDropdownOpen(false);
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-2 text-xs font-bold transition-all flex items-center justify-between hover:bg-[#103783]/5 dark:hover:bg-[#1e56c7]/5 hover:text-[#103783] dark:hover:text-white",
                                    loanProduct === p.id 
                                      ? "text-[#103783] dark:text-white bg-[#103783]/5 dark:bg-[#1e56c7]/5" 
                                      : "text-slate-600 dark:text-slate-350"
                                  )}
                                >
                                  {p.label}
                                </button>
                              ))}
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
                  className="w-full bg-[#103783] hover:bg-[#0c2a66] active:scale-[0.99] text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-[#103783]/10 hover:shadow-[#103783]/20 transition-all flex items-center justify-center gap-1.5 mt-2"
                >
                  Calculate Rewards
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {calculatedOffers.map((offer) => {
                const Icon = getOfferIcon(offer.type);
                const styling = getOfferStyling(offer.type);

                return (
                  <div 
                    key={offer.id} 
                    className="bg-white dark:bg-[#0c1829] border border-slate-200/80 dark:border-[#103783]/20 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col h-full hover:-translate-y-1"
                  >
                    {/* Icon Top */}
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-5 border transition-transform duration-500 group-hover:scale-110", styling)}>
                      <Icon className="w-5.5 h-5.5" />
                    </div>

                    {/* Content */}
                    <h4 className="font-extrabold text-base text-[#0a1530] dark:text-white mb-2 leading-tight tracking-tight" style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif' }}>
                      {offer.title}
                    </h4>
                    <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-1">
                      {offer.description}
                    </p>

                    {/* Footer Meta */}
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-[#103783]/10 flex items-center justify-between gap-2">
                      {offer.bank && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#103783] bg-[#103783]/5 dark:bg-[#1e56c7]/10 dark:text-[#1e56c7] px-2 py-0.5 rounded border border-[#103783]/10">
                          {offer.bank}
                        </span>
                      )}
                      {offer.validTill && (
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          Valid: {offer.validTill}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

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
                to="/apply"
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