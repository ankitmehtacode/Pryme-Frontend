import { useState, useEffect, useMemo } from "react";
import { Calculator, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface EMICalculatorProps {
  loanAmount?: number;
  interestRate?: number;
  tenure?: number;
  className?: string;
  showTerminology?: boolean;
}

const EMICalculator = ({
  loanAmount: initialAmount = 500000,
  interestRate: initialRate = 10.5,
  tenure: initialTenure = 36,
  className = "",
  showTerminology = true,
}: EMICalculatorProps) => {
  const [amount, setAmount] = useState(initialAmount);
  const [rate, setRate] = useState(initialRate);
  const [months, setMonths] = useState(initialTenure);

  // 🧠 Unchanged robust math logic
  useEffect(() => {
    setAmount(initialAmount);
  }, [initialAmount]);

  const { emi, totalPayment, totalInterest, principalPercentage, interestPercentage } = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const emiValue =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
    const total = emiValue * months;
    const interest = total - amount;
    const principalPct = (amount / total) * 100;
    const interestPct = (interest / total) * 100;

    return {
      emi: Math.round(emiValue),
      totalPayment: Math.round(total),
      totalInterest: Math.round(interest),
      principalPercentage: principalPct,
      interestPercentage: interestPct,
    };
  }, [amount, rate, months]);

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatShortCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const terminology = [
    { term: "EMI (Equated Monthly Installment)", definition: "A fixed payment amount made by a borrower to a lender at a specified date each calendar month." },
    { term: "Principal Amount", definition: "The original sum of money borrowed in a loan. This is the amount you actually receive." },
    { term: "Rate of Interest (ROI)", definition: "The percentage of principal charged by the lender for the use of its money. Usually expressed as an annual percentage." },
    { term: "MCLR (Marginal Cost of Funds based Lending Rate)", definition: "A methodology used by banks in India to determine interest rates for loans. It's the minimum interest rate below which a bank cannot lend." },
    { term: "Repo Rate", definition: "The rate at which RBI lends money to commercial banks. Changes in repo rate affect your loan interest rates." },
    { term: "Processing Fee", definition: "A one-time fee charged by lenders for processing your loan application, typically 0.5% to 2% of the loan amount." },
  ];

  // Calculate SVG arc for pie chart
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const principalArc = (principalPercentage / 100) * circumference;

  return (
    <div className={`bg-[#0a0a0a] border border-[#2aac64]/20 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden transition-all hover:border-[#2aac64]/40 ${className}`}>
      
      {/* 🧠 Ambient Glow Engine */}
      <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-[#2aac64]/10 blur-[80px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-[#111] shadow-sm flex items-center justify-center border border-[#2aac64]/20">
          <Calculator className="w-6 h-6 text-[#2aac64]" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-white tracking-tight">EMI Calculator</h3>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Real-time payment estimation</p>
        </div>
      </div>

      {/* Sleek EMI Display & Pie Chart */}
      <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-[#111] rounded-[2rem] border border-white/5 shadow-inner mb-10 relative z-10">
        
        {/* Glowing Pie Chart */}
        <div className="relative w-40 h-40 shrink-0 drop-shadow-2xl">
          <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(42,172,100,0.3)]" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={radius} fill="none" stroke="#222" className="text-slate-800" strokeWidth="18" />
            
            {/* Principal Segment */}
            <circle
              cx="100" cy="100" r={radius} fill="none" stroke="#2aac64" strokeWidth="18"
              strokeDasharray={`${principalArc} ${circumference}`} strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            {/* Interest Segment (Using a sleek dark violet for CRED vibe) */}
            <circle
              cx="100" cy="100" r={radius} fill="none" stroke="#6366f1" strokeWidth="18"
              strokeDasharray={`${circumference - principalArc} ${circumference}`} strokeDashoffset={-principalArc} strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-medium uppercase tracking-widest text-[#2aac64] mb-1">Monthly EMI</span>
            <span className="text-2xl font-semibold text-white">{formatShortCurrency(emi)}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-4 w-full">
          <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl shadow-sm border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-[#2aac64] shadow-[0_0_8px_rgba(42,172,100,0.6)]" />
              <span className="text-xs font-medium uppercase tracking-widest text-slate-300">Principal</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{formatCurrency(amount)}</p>
              <p className="text-[10px] font-medium text-[#2aac64]">{principalPercentage.toFixed(1)}%</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl shadow-sm border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              <span className="text-xs font-medium uppercase tracking-widest text-slate-300">Total Interest</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-indigo-400">{formatCurrency(totalInterest)}</p>
              <p className="text-[10px] font-medium text-indigo-500">{interestPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Sliders */}
      <div className="space-y-6 relative z-10">
        
        {/* Amount Slider */}
        <div className="p-5 bg-[#111] rounded-[1.5rem] border border-white/5 shadow-sm transition-all hover:border-[#2aac64]/30">
          <div className="flex justify-between items-center mb-5">
            <span className="text-[10px] font-medium text-[#2aac64] uppercase tracking-widest">Loan Amount</span>
            <span className="text-lg font-semibold text-white bg-[#0a0a0a] px-4 py-1.5 rounded-xl border border-white/5">
              {formatCurrency(amount)}
            </span>
          </div>
          <Slider value={[amount]} onValueChange={(v) => setAmount(v[0])} min={100000} max={10000000} step={50000} className="cursor-pointer" />
          <div className="flex justify-between mt-3">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">₹1 Lakh</span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">₹1 Crore</span>
          </div>
        </div>

        {/* Rate Slider */}
        <div className="p-5 bg-[#111] rounded-[1.5rem] border border-white/5 shadow-sm transition-all hover:border-[#2aac64]/30">
          <div className="flex justify-between items-center mb-5">
            <span className="text-[10px] font-medium text-[#2aac64] uppercase tracking-widest">Interest Rate</span>
            <span className="text-lg font-semibold text-white bg-[#0a0a0a] px-4 py-1.5 rounded-xl border border-white/5">
              {rate}% <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">p.a.</span>
            </span>
          </div>
          <Slider value={[rate]} onValueChange={(v) => setRate(v[0])} min={6} max={24} step={0.25} className="cursor-pointer" />
          <div className="flex justify-between mt-3">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">6%</span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">24%</span>
          </div>
        </div>

        {/* Tenure Slider */}
        <div className="p-5 bg-[#111] rounded-[1.5rem] border border-white/5 shadow-sm transition-all hover:border-[#2aac64]/30">
          <div className="flex justify-between items-center mb-5">
            <span className="text-[10px] font-medium text-[#2aac64] uppercase tracking-widest">Loan Tenure</span>
            <span className="text-lg font-semibold text-white bg-[#0a0a0a] px-4 py-1.5 rounded-xl border border-white/5">
              {months} Mo <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">({(months / 12).toFixed(1)} Yrs)</span>
            </span>
          </div>
          <Slider value={[months]} onValueChange={(v) => setMonths(v[0])} min={12} max={360} step={12} className="cursor-pointer" />
          <div className="flex justify-between mt-3">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">1 Year</span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">30 Years</span>
          </div>
        </div>
      </div>

      {/* Terminology Accordion */}
      {showTerminology && (
        <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="terminology" className="border-0">
              <AccordionTrigger className="text-[10px] font-medium text-slate-500 hover:text-[#2aac64] py-2 hover:no-underline uppercase tracking-widest transition-colors">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <span>Terminology Guide</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-3 pt-4">
                  {terminology.map((item) => (
                    <div key={item.term} className="p-4 bg-[#111] rounded-xl border border-white/5 shadow-sm">
                      <p className="text-xs font-medium text-white mb-1.5 uppercase tracking-wide">{item.term}</p>
                      <p className="text-xs font-medium text-slate-400 leading-relaxed">{item.definition}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default EMICalculator;