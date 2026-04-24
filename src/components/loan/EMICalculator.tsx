import { useState, useEffect, useMemo } from "react";
import { Calculator, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface EMICalculatorProps {
  loanAmount?: number;
  interestRate?: number;
  tenure?: number;
  className?: string;
  showTerminology?: boolean;
}

const EMICalculator = ({
  loanAmount: initialAmount = 1500000,
  interestRate: initialRate = 10.5,
  tenure: initialTenure = 36,
  className = "",
  showTerminology = true,
}: EMICalculatorProps) => {
  const [amount, setAmount] = useState(initialAmount);
  const [rate, setRate] = useState(initialRate);
  const [months, setMonths] = useState(initialTenure);

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
      emi: Math.round(emiValue || 0),
      totalPayment: Math.round(total || 0),
      totalInterest: Math.round(interest || 0),
      principalPercentage: principalPct || 0,
      interestPercentage: interestPct || 0,
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
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1).replace(/\.0$/, '')}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    return `₹${Math.round(value)}`;
  };

  const terminology = [
    { term: "EMI (Equated Monthly Installment)", definition: "A fixed payment amount made by a borrower to a lender at a specified date each calendar month." },
    { term: "Principal Amount", definition: "The original sum of money borrowed in a loan. This is the amount you actually receive." },
    { term: "Rate of Interest (ROI)", definition: "The percentage of principal charged by the lender for the use of its money. Usually expressed as an annual percentage." },
    { term: "MCLR", definition: "A methodology used by banks in India to determine interest rates for loans. It's the minimum interest rate below which a bank cannot lend." },
    { term: "Repo Rate", definition: "The rate at which RBI lends money to commercial banks. Changes in repo rate affect your loan interest rates." },
    { term: "Processing Fee", definition: "A one-time fee charged by lenders for processing your loan application, typically 0.5% to 2% of the loan amount." },
  ];

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const principalArc = (principalPercentage / 100) * circumference;

  return (
    <div className={cn("bg-card text-card-foreground border border-border dark:bg-[#080d1e] dark:border-[#103783]/20 rounded-2xl md:rounded-[2rem] p-4 md:p-6 lg:p-7 shadow-xl dark:shadow-2xl relative overflow-hidden transition-all dark:hover:border-[#103783]/40 flex flex-col h-full min-w-0 w-full", className)}>
      

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 md:mb-6 relative z-10 shrink-0">
        <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-secondary dark:bg-[#0d1829] shadow-sm flex items-center justify-center border border-border dark:border-[#103783]/20 shrink-0">
          <Calculator className="w-4 h-4 md:w-5 md:h-5 text-primary dark:text-[#103783]" />
        </div>
        <div>
          <h3 className="text-lg md:text-2xl font-bold text-foreground tracking-tight leading-none mb-0.5 md:mb-1">EMI Calculator</h3>
          <p className="text-[8px] md:text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Real-time payment estimation</p>
        </div>
      </div>

      {/* HORIZONTAL LAYOUT IMPLEMENTATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 relative z-10 w-full items-stretch">
        
        {/* Left Col: Interactive Sliders (Inputs) */}
        <div className="space-y-4 flex flex-col justify-start w-full min-w-0">
          
          {/* Amount Slider */}
          <div className="p-4 md:px-5 bg-secondary/20 dark:bg-[#0d1829] rounded-2xl border border-border dark:border-white/5 shadow-sm transition-all focus-within:border-[#103783]/50">
            <div className="flex justify-between items-center mb-4 gap-2">
              <label className="text-[10px] font-bold text-primary dark:text-[#103783] uppercase tracking-wider">Loan Amount (₹)</label>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="text-sm md:text-base font-bold text-foreground bg-background dark:bg-[#080d1e] px-3 py-1.5 rounded-lg border border-border dark:border-white/5 shadow-sm w-32 text-right focus:outline-none focus:ring-1 focus:ring-primary"
                max={500000000}
                min={100000}
              />
            </div>
            <Slider value={[amount]} onValueChange={(v) => setAmount(v[0])} min={100000} max={500000000} step={100000} className="cursor-pointer py-1" />
            <div className="flex justify-between mt-3">
              <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">₹1 Lakh</span>
              <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">₹50 Cr</span>
            </div>
          </div>

          {/* Rate Slider */}
          <div className="p-4 md:px-5 bg-secondary/20 dark:bg-[#0d1829] rounded-2xl border border-border dark:border-white/5 shadow-sm transition-all focus-within:border-[#103783]/50">
            <div className="flex justify-between items-center mb-4 gap-2">
              <label className="text-[10px] font-bold text-primary dark:text-[#103783] uppercase tracking-wider">Interest Rate (% p.a.)</label>
              <input 
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="text-sm md:text-base font-bold text-foreground bg-background dark:bg-[#080d1e] px-3 py-1.5 rounded-lg border border-border dark:border-white/5 shadow-sm w-24 text-right focus:outline-none focus:ring-1 focus:ring-primary"
                max={36}
                min={1}
                step={0.1}
              />
            </div>
            <Slider value={[rate]} onValueChange={(v) => setRate(v[0])} min={1} max={36} step={0.25} className="cursor-pointer py-1" />
            <div className="flex justify-between mt-3">
              <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">1%</span>
              <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">36%</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div className="p-4 md:px-5 bg-secondary/20 dark:bg-[#0d1829] rounded-2xl border border-border dark:border-white/5 shadow-sm transition-all focus-within:border-[#103783]/50">
            <div className="flex justify-between items-center mb-4 gap-2">
              <label className="text-[10px] font-bold text-primary dark:text-[#103783] uppercase tracking-wider">Loan Tenure (Months)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="text-sm md:text-base font-bold text-foreground bg-background dark:bg-[#080d1e] px-3 py-1.5 rounded-lg border border-border dark:border-white/5 shadow-sm w-24 text-right focus:outline-none focus:ring-1 focus:ring-primary"
                  max={360}
                  min={6}
                />
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:inline-block">({(months / 12).toFixed(1)} Yrs)</span>
              </div>
            </div>
            <Slider value={[months]} onValueChange={(v) => setMonths(v[0])} min={6} max={360} step={6} className="cursor-pointer py-1" />
            <div className="flex justify-between mt-3">
              <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">6 Mo</span>
              <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">30 Yrs</span>
            </div>
          </div>
        </div>

        {/* Right Col: EMI Display & Pie Chart */}
        <div className="flex flex-col p-4 md:p-5 bg-secondary/30 dark:bg-[#0d1829] rounded-2xl border border-border dark:border-white/5 shadow-inner overflow-hidden w-full justify-between h-full min-w-0">
          
          <div className="flex flex-col items-center gap-4 w-full mb-4 md:mb-6">
            {/* Glowing Pie Chart */}
            <div className="relative w-[110px] h-[110px] md:w-32 md:h-32 shrink-0 drop-shadow-md dark:drop-shadow-lg mx-auto">
              <svg className="w-full h-full -rotate-90 dark:drop-shadow-[0_0_10px_rgba(124,58,237,0.3)]" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={radius} fill="none" className="stroke-slate-200 dark:stroke-[#222]" strokeWidth="12" />
                <circle
                  cx="70" cy="70" r={radius} fill="none" strokeWidth="12"
                  strokeDasharray={`${principalArc} ${circumference}`} strokeLinecap="round"
                  className="stroke-[#103783] transition-all duration-1000 ease-out"
                />
                <circle
                  cx="70" cy="70" r={radius} fill="none" strokeWidth="12"
                  strokeDasharray={`${circumference - principalArc} ${circumference}`} strokeDashoffset={-principalArc} strokeLinecap="round"
                  className="stroke-amber-500 transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider md:tracking-widest text-[#103783] mb-0.5 md:mb-1 whitespace-nowrap">Monthly EMI</span>
                <span className="text-xl font-bold text-foreground whitespace-nowrap">{formatShortCurrency(emi)}</span>
              </div>
            </div>

            {/* Total Payable */}
            <div className="w-full min-w-0 p-4 md:p-5 bg-gradient-to-br from-[#103783]/5 to-amber-500/5 dark:from-[#103783]/10 dark:to-amber-500/10 rounded-xl shadow-sm border border-[#103783]/15 dark:border-[#103783]/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#103783] to-amber-500 flex items-center justify-center shadow-sm shrink-0">
                    <span className="text-[10px] font-black text-white leading-none">Σ</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/70">Total Payable</span>
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-foreground leading-none">{formatCurrency(totalPayment)}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-[#103783]/10 dark:border-[#103783]/15 flex items-center">
                <div className="flex-1 flex items-center justify-between min-w-0 gap-2">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground truncate">Per Day Equivalent</p>
                  <p className="text-sm font-bold text-foreground whitespace-nowrap shrink-0">{formatShortCurrency(Math.round(emi / 30))}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Principal & Interest Cards */}
          <div className="grid grid-cols-2 gap-4 w-full mt-auto">
            <div className="p-4 bg-background dark:bg-[#080d1e] rounded-xl border border-border dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none">Principal</p>
                <div className="w-2.5 h-2.5 rounded-full bg-[#103783] shadow-[0_0_6px_rgba(16,55,131,0.3)] shrink-0" />
              </div>
              <p className="text-base sm:text-lg font-bold text-foreground leading-none whitespace-nowrap overflow-hidden text-ellipsis mb-2.5">{formatCurrency(amount)}</p>
              <span className="inline-block text-[10px] font-bold text-[#103783] bg-[#103783]/10 px-2.5 py-1 rounded leading-none">{principalPercentage.toFixed(0)}%</span>
            </div>

            <div className="p-4 bg-background dark:bg-[#080d1e] rounded-xl border border-border dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none">Interest</p>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.3)] shrink-0" />
              </div>
              <p className="text-base sm:text-lg font-bold text-foreground leading-none whitespace-nowrap overflow-hidden text-ellipsis mb-2.5">{formatCurrency(totalInterest)}</p>
              <span className="inline-block text-[10px] font-bold text-amber-600 dark:text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded leading-none">{interestPercentage.toFixed(0)}%</span>
            </div>
          </div>

        </div>
      </div>

      {/* Terminology Accordion */}
      {showTerminology && (
        <div className="mt-6 pt-5 border-t border-border dark:border-white/10 relative z-10 shrink-0">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="terminology" className="border-0">
              <AccordionTrigger className="text-[11px] font-bold text-muted-foreground hover:text-primary dark:hover:text-[#103783] py-2 hover:no-underline uppercase tracking-widest transition-colors">
                <div className="flex items-center gap-2.5">
                  <Info className="w-4 h-4" />
                  <span>Terminology Guide</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                  {terminology.map((item) => (
                    <div key={item.term} className="p-4 bg-secondary/30 dark:bg-[#0d1829] rounded-xl border border-border dark:border-white/5 shadow-sm">
                      <p className="text-xs font-bold text-foreground mb-2 uppercase tracking-wide">{item.term}</p>
                      <p className="text-[11px] font-medium text-muted-foreground dark:text-slate-400 leading-relaxed">{item.definition}</p>
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
