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
    { term: "MCLR", definition: "A methodology used by banks in India to determine interest rates for loans. It's the minimum interest rate below which a bank cannot lend." },
    { term: "Repo Rate", definition: "The rate at which RBI lends money to commercial banks. Changes in repo rate affect your loan interest rates." },
    { term: "Processing Fee", definition: "A one-time fee charged by lenders for processing your loan application, typically 0.5% to 2% of the loan amount." },
  ];

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const principalArc = (principalPercentage / 100) * circumference;

  return (
    <div className={cn("bg-card text-card-foreground border border-border dark:bg-[#0a0a0a] dark:border-[#7c3aed]/20 rounded-[2rem] p-5 md:p-6 lg:p-7 shadow-xl dark:shadow-2xl relative overflow-hidden transition-all dark:hover:border-[#7c3aed]/40 flex flex-col h-full", className)}>
      
      {/* 🧠 Ambient Glow Engine */}
      <div className="absolute top-[-10%] right-[-10%] w-[250px] h-[250px] bg-primary/5 dark:bg-[#7c3aed]/10 blur-[60px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-6 relative z-10 shrink-0">
        <div className="w-11 h-11 rounded-xl bg-secondary dark:bg-[#111] shadow-sm flex items-center justify-center border border-border dark:border-[#7c3aed]/20 shrink-0">
          <Calculator className="w-5 h-5 text-primary dark:text-[#7c3aed]" />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-none mb-1">EMI Calculator</h3>
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">Real-time payment estimation</p>
        </div>
      </div>

      {/* Sleek EMI Display & Pie Chart (Compact) */}
      <div className="flex flex-row items-center justify-between gap-5 p-4 md:p-5 bg-secondary/30 dark:bg-[#111] rounded-2xl border border-border dark:border-white/5 shadow-inner mb-6 relative z-10 shrink-0">
        
        {/* Glowing Pie Chart */}
        <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0 drop-shadow-md dark:drop-shadow-lg mx-auto md:mx-0">
          <svg className="w-full h-full -rotate-90 dark:drop-shadow-[0_0_10px_rgba(124,58,237,0.3)]" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} fill="none" className="stroke-slate-200 dark:stroke-[#222]" strokeWidth="12" />
            
            {/* Principal Segment */}
            <circle
              cx="70" cy="70" r={radius} fill="none" strokeWidth="12"
              strokeDasharray={`${principalArc} ${circumference}`} strokeLinecap="round"
              className="stroke-[#7c3aed] transition-all duration-1000 ease-out"
            />
            {/* Interest Segment */}
            <circle
              cx="70" cy="70" r={radius} fill="none" strokeWidth="12"
              strokeDasharray={`${circumference - principalArc} ${circumference}`} strokeDashoffset={-principalArc} strokeLinecap="round"
              className="stroke-amber-500 transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-0.5">
            <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-[#7c3aed] mb-0.5">Monthly EMI</span>
            <span className="text-xl md:text-2xl font-bold text-foreground">{formatShortCurrency(emi)}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex items-center justify-between p-3.5 bg-background dark:bg-[#0a0a0a] rounded-xl shadow-sm border border-border dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-[#7c3aed] shadow-[0_0_8px_rgba(124,58,237,0.4)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Principal</span>
            </div>
            <div className="text-right flex flex-col items-end">
              <p className="text-sm md:text-base font-bold text-foreground leading-none mb-1">{formatCurrency(amount)}</p>
              <p className="text-[10px] font-bold text-[#7c3aed] bg-[#7c3aed]/10 px-1.5 py-0.5 rounded leading-none">{principalPercentage.toFixed(1)}%</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3.5 bg-background dark:bg-[#0a0a0a] rounded-xl shadow-sm border border-border dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Interest</span>
            </div>
            <div className="text-right flex flex-col items-end">
              <p className="text-sm md:text-base font-bold text-foreground leading-none mb-1">{formatCurrency(totalInterest)}</p>
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded leading-none">{interestPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Sliders (Condensed) */}
      <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-center">
        
        {/* Amount Slider */}
        <div className="p-4 md:px-5 bg-secondary/20 dark:bg-[#111] rounded-2xl border border-border dark:border-white/5 shadow-sm transition-all dark:hover:border-[#7c3aed]/30">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-primary dark:text-[#7c3aed] uppercase tracking-wider">Loan Amount</span>
            <span className="text-base font-bold text-foreground bg-background dark:bg-[#0a0a0a] px-3.5 py-1.5 rounded-lg border border-border dark:border-white/5 shadow-sm leading-none">
              {formatCurrency(amount)}
            </span>
          </div>
          <Slider value={[amount]} onValueChange={(v) => setAmount(v[0])} min={100000} max={10000000} step={50000} className="cursor-pointer py-1" />
          <div className="flex justify-between mt-3">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">₹1 Lakh</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">₹1 Crore</span>
          </div>
        </div>

        {/* Rate Slider */}
        <div className="p-4 md:px-5 bg-secondary/20 dark:bg-[#111] rounded-2xl border border-border dark:border-white/5 shadow-sm transition-all dark:hover:border-[#7c3aed]/30">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-primary dark:text-[#7c3aed] uppercase tracking-wider">Interest Rate</span>
            <span className="text-base font-bold text-foreground bg-background dark:bg-[#0a0a0a] px-3.5 py-1.5 rounded-lg border border-border dark:border-white/5 shadow-sm flex items-center leading-none">
              {rate}% <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mt-0.5">p.a.</span>
            </span>
          </div>
          <Slider value={[rate]} onValueChange={(v) => setRate(v[0])} min={6} max={24} step={0.25} className="cursor-pointer py-1" />
          <div className="flex justify-between mt-3">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">6%</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">24%</span>
          </div>
        </div>

        {/* Tenure Slider */}
        <div className="p-4 md:px-5 bg-secondary/20 dark:bg-[#111] rounded-2xl border border-border dark:border-white/5 shadow-sm transition-all dark:hover:border-[#7c3aed]/30">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-primary dark:text-[#7c3aed] uppercase tracking-wider">Loan Tenure</span>
            <span className="text-base font-bold text-foreground bg-background dark:bg-[#0a0a0a] px-3.5 py-1.5 rounded-lg border border-border dark:border-white/5 shadow-sm flex items-baseline gap-1.5 leading-none">
              {months} Mo <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">({(months / 12).toFixed(1)} Yrs)</span>
            </span>
          </div>
          <Slider value={[months]} onValueChange={(v) => setMonths(v[0])} min={12} max={360} step={12} className="cursor-pointer py-1" />
          <div className="flex justify-between mt-3">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">1 Year</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">30 Years</span>
          </div>
        </div>
      </div>

      {/* Terminology Accordion */}
      {showTerminology && (
        <div className="mt-5 pt-4 border-t border-border dark:border-white/10 relative z-10 shrink-0">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="terminology" className="border-0">
              <AccordionTrigger className="text-[11px] font-bold text-muted-foreground hover:text-primary dark:hover:text-[#7c3aed] py-2 hover:no-underline uppercase tracking-widest transition-colors">
                <div className="flex items-center gap-2.5">
                  <Info className="w-4 h-4" />
                  <span>Terminology Guide</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-3 pt-3">
                  {terminology.map((item) => (
                    <div key={item.term} className="p-3 bg-secondary/30 dark:bg-[#111] rounded-xl border border-border dark:border-white/5 shadow-sm">
                      <p className="text-xs font-bold text-foreground mb-1 uppercase tracking-wide">{item.term}</p>
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