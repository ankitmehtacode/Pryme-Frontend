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
  ArrowLeft 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Offer {
  id: string;
  type: "discount" | "cashback" | "reward" | "gift";
  title: string;
  description: string;
  bank?: string;
  validTill?: string;
}

const OffersRewards = () => {
  // Form State
  const [loanAmount, setLoanAmount] = useState<number | "">("");
  const [loanProduct, setLoanProduct] = useState<string>("");
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
    <div className="w-full bg-white border border-slate-200 dark:bg-[#080d1e] dark:border-[#103783]/20 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
      
      {/* Background soft ambient glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#103783]/[0.02] rounded-full pointer-events-none" style={{ transform: "translate(30%, -30%)" }} />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#103783]/[0.01] rounded-full pointer-events-none" style={{ transform: "translate(-30%, 30%)" }} />

      <AnimatePresence mode="wait">
        {step === "form" ? (
          <motion.div
            key="calculator-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            {/* ────────────── HEADER SECTION (ILLUSTRATED SPLIT) ────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-10">
              <div className="md:col-span-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#103783]/10 border border-[#103783]/20 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-[#103783]" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                    Pryme Loyalty Club
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#0a1530] dark:text-white tracking-tight leading-none mb-3" style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif' }}>
                  Rewards Calculator
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-xl font-medium leading-relaxed">
                  Enter your loan details to see the exciting rewards and offers you can earn with top lenders.
                </p>
              </div>
              <div className="md:col-span-4 flex justify-center md:justify-end relative">
                <div className="relative w-44 h-44 xl:w-52 xl:h-52">
                  {/* Minimal sparkles background blur */}
                  <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 to-transparent rounded-full blur-2xl animate-pulse" />
                  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-contain relative z-10 animate-float">
                    <defs>
                      <linearGradient id="boxBodyGrad" x1="60" y1="90" x2="140" y2="160" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#1e3a8a" />
                        <stop offset="100%" stopColor="#103783" />
                      </linearGradient>
                      <linearGradient id="boxLidGrad" x1="56" y1="80" x2="144" y2="95" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                      <linearGradient id="ribbonGrad" x1="92" y1="67" x2="108" y2="160" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                    </defs>

                    {/* Ambient connection rays (dotted lines) */}
                    <path d="M 85,95 Q 55,95 48,110" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3,3" strokeLinecap="round" fill="none" className="dark:stroke-slate-700" />
                    <path d="M 115,95 Q 145,95 152,100" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3,3" strokeLinecap="round" fill="none" className="dark:stroke-slate-700" />
                    <path d="M 110,80 Q 130,80 138,68" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3,3" strokeLinecap="round" fill="none" className="dark:stroke-slate-700" />
                    <path d="M 90,80 Q 70,80 62,68" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3,3" strokeLinecap="round" fill="none" className="dark:stroke-slate-700" />

                    {/* Ground Shadow */}
                    <ellipse cx="100" cy="165" rx="36" ry="6" fill="#0f172a" opacity="0.1" />

                    {/* Box Body */}
                    <rect x="60" y="90" width="80" height="70" rx="10" fill="url(#boxBodyGrad)" stroke="#103783" strokeWidth="1.5" />
                    
                    {/* Vertical Ribbon (Body) */}
                    <rect x="92" y="90" width="16" height="70" fill="url(#ribbonGrad)" />

                    {/* Box Lid */}
                    <rect x="54" y="78" width="92" height="15" rx="4" fill="url(#boxLidGrad)" stroke="#103783" strokeWidth="1.5" />
                    
                    {/* Vertical Ribbon (Lid) */}
                    <rect x="92" y="78" width="16" height="15" fill="url(#ribbonGrad)" />

                    {/* Ribbon loops (Intersecting circles) */}
                    <circle cx="89" cy="65" r="12" fill="none" stroke="url(#ribbonGrad)" strokeWidth="2.5" />
                    <circle cx="111" cy="65" r="12" fill="none" stroke="url(#ribbonGrad)" strokeWidth="2.5" />
                    
                    {/* Ribbon Tails */}
                    <path d="M 94,76 L 84,88" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 106,76 L 116,88" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
                    
                    {/* Center Knot */}
                    <circle cx="100" cy="72" r="5" fill="url(#ribbonGrad)" stroke="#b45309" strokeWidth="0.5" />

                    {/* Reward Badges */}
                    <g className="hover:scale-110 transition-transform duration-300 origin-center">
                      <circle cx="40" cy="120" r="12" fill="#fffbeb" stroke="#f59e0b" strokeWidth="1.5" />
                      <text x="40" y="124" fill="#d97706" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="system-ui, sans-serif">₹</text>
                    </g>

                    <g className="hover:scale-110 transition-transform duration-300 origin-center">
                      <circle cx="160" cy="100" r="12" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1.5" />
                      <text x="160" y="104" fill="#0369a1" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="system-ui, sans-serif">%</text>
                    </g>

                    <g className="hover:scale-110 transition-transform duration-300 origin-center">
                      <circle cx="145" cy="60" r="10" fill="#fff7ed" stroke="#f97316" strokeWidth="1.5" />
                      <path d="M 145,55 L 146.5,58.5 L 150,58.5 L 147.2,60.5 L 148.3,64 L 145,62 L 141.7,64 L 142.8,60.5 L 140,58.5 L 143.5,58.5 Z" fill="#ea580c" />
                    </g>

                    <g className="hover:scale-110 transition-transform duration-300 origin-center">
                      <circle cx="55" cy="65" r="9" fill="#f0fdf4" stroke="#22c55e" strokeWidth="1.5" />
                      <path d="M 55,61 Q 55,65 59,65 Q 55,65 55,69 Q 55,65 51,65 Q 55,65 55,61 Z" fill="#16a34a" />
                    </g>

                    {/* Minimal sparkles */}
                    <path d="M 175,130 Q 175,135 180,135 Q 175,135 175,140 Q 175,135 170,135 Q 175,135 175,130 Z" fill="#cbd5e1" className="dark:fill-slate-700" />
                    <path d="M 25,85 Q 25,90 30,90 Q 25,90 25,95 Q 25,90 20,90 Q 25,90 25,85 Z" fill="#cbd5e1" className="dark:fill-slate-700" />
                  </svg>
                </div>
              </div>
            </div>

            {/* ────────────── FORM SECTION ────────────── */}
            <div className="bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-[#103783]/10 rounded-3xl p-6 md:p-8 max-w-4xl mx-auto shadow-sm">
              <h3 className="text-lg font-bold text-[#0a1530] dark:text-white mb-1" style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif' }}>
                Enter Loan Details
              </h3>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">
                Fill in the details below to calculate your rewards
              </p>

              <form onSubmit={handleCalculate} className="space-y-6">
                {/* Input: Loan Amount */}
                <div className="space-y-2">
                  <label htmlFor="reward-loan-amount" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Loan Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                      ₹
                    </span>
                    <input
                      id="reward-loan-amount"
                      type="text"
                      required
                      placeholder="Enter loan amount"
                      value={formatInputCurrency(loanAmount)}
                      onChange={handleAmountChange}
                      className="w-full pl-8 pr-4 py-3 bg-white dark:bg-[#0c1829] border border-slate-200 focus:border-[#103783] dark:border-[#103783]/20 dark:focus:border-[#1e56c7] focus:ring-4 focus:ring-[#103783]/5 transition-all rounded-xl text-sm font-bold text-[#0a1530] dark:text-white placeholder:text-slate-400"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Enter amount between ₹1,00,000 - ₹5,00,000,000
                  </span>
                </div>

                {/* Dropdown: Loan Product */}
                <div className="space-y-2">
                  <label htmlFor="reward-loan-product" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Loan Product
                  </label>
                  <select
                    id="reward-loan-product"
                    required
                    value={loanProduct}
                    onChange={(e) => setLoanProduct(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-[#0c1829] border border-slate-200 focus:border-[#103783] dark:border-[#103783]/20 dark:focus:border-[#1e56c7] focus:ring-4 focus:ring-[#103783]/5 transition-all rounded-xl text-sm font-bold text-[#0a1530] dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-slate-400 font-medium">Select loan product</option>
                    <option value="personal" className="font-semibold text-[#0a1530]">Personal Loan</option>
                    <option value="business" className="font-semibold text-[#0a1530]">Business Loan</option>
                    <option value="home" className="font-semibold text-[#0a1530]">Home Loan</option>
                    <option value="lap" className="font-semibold text-[#0a1530]">Loan Against Property</option>
                    <option value="auto" className="font-semibold text-[#0a1530]">Auto Loan</option>
                  </select>
                </div>

                {/* Selection Cards: Employment Type */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Employment Type
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400 block -mt-1.5 mb-3">
                    Select the type that best describes your employment
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Option 1: Salaried */}
                    <div 
                      onClick={() => setEmploymentType("salaried")}
                      className={cn(
                        "border rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 relative overflow-hidden group",
                        employmentType === "salaried"
                          ? "border-[#103783] bg-[#103783]/5 dark:border-[#1e56c7] dark:bg-[#1e56c7]/5" 
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-[#103783]/10 dark:bg-[#0c1829]"
                      )}
                    >
                      {/* Selection dot */}
                      <div className="absolute top-3 left-3 w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                        {employmentType === "salaried" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#103783] dark:bg-[#1e56c7]" />
                        )}
                      </div>
                      <Briefcase className={cn("w-7 h-7 mt-2 transition-transform duration-300 group-hover:scale-110", employmentType === "salaried" ? "text-[#103783] dark:text-[#1e56c7]" : "text-slate-400")} />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0a1530] dark:text-white">
                        Salaried
                      </span>
                    </div>

                    {/* Option 2: Self Employed Non Professional */}
                    <div 
                      onClick={() => setEmploymentType("non-professional")}
                      className={cn(
                        "border rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 relative overflow-hidden group",
                        employmentType === "non-professional"
                          ? "border-[#103783] bg-[#103783]/5 dark:border-[#1e56c7] dark:bg-[#1e56c7]/5" 
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-[#103783]/10 dark:bg-[#0c1829]"
                      )}
                    >
                      <div className="absolute top-3 left-3 w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                        {employmentType === "non-professional" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#103783] dark:bg-[#1e56c7]" />
                        )}
                      </div>
                      <User className={cn("w-7 h-7 mt-2 transition-transform duration-300 group-hover:scale-110", employmentType === "non-professional" ? "text-[#103783] dark:text-[#1e56c7]" : "text-slate-400")} />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0a1530] dark:text-white text-center leading-tight">
                        Self Employed<br /><span className="text-[10px] lowercase font-semibold text-slate-400">Non Professional</span>
                      </span>
                    </div>

                    {/* Option 3: Self Employed Professional */}
                    <div 
                      onClick={() => setEmploymentType("professional")}
                      className={cn(
                        "border rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 relative overflow-hidden group",
                        employmentType === "professional"
                          ? "border-[#103783] bg-[#103783]/5 dark:border-[#1e56c7] dark:bg-[#1e56c7]/5" 
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-[#103783]/10 dark:bg-[#0c1829]"
                      )}
                    >
                      <div className="absolute top-3 left-3 w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center">
                        {employmentType === "professional" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#103783] dark:bg-[#1e56c7]" />
                        )}
                      </div>
                      <UserCheck className={cn("w-7 h-7 mt-2 transition-transform duration-300 group-hover:scale-110", employmentType === "professional" ? "text-[#103783] dark:text-[#1e56c7]" : "text-slate-400")} />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0a1530] dark:text-white text-center leading-tight">
                        Self Employed<br /><span className="text-[10px] lowercase font-semibold text-slate-400">Professional</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full bg-[#103783] hover:bg-[#0c2a66] active:scale-[0.99] text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-[#103783]/20 hover:shadow-[#103783]/30 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  Calculate Rewards
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Privacy note */}
            <div className="flex items-center justify-center gap-2 mt-6 text-slate-400 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-slate-150 dark:border-[#103783]/20">
        {/* Item 1 */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#103783]/5 dark:bg-[#103783]/10 flex items-center justify-center shrink-0 border border-[#103783]/10">
            <ShieldCheck className="w-4.5 h-4.5 text-[#103783]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0a1530] dark:text-white uppercase tracking-wider mb-0.5">
              100% Secure
            </h4>
            <p className="text-[10px] font-semibold text-slate-400">
              Your information is safe and encrypted
            </p>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex items-start gap-3">
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
        <div className="flex items-start gap-3">
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