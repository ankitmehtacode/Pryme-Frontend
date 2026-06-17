import { useState, useMemo } from "react";
import { Calculator, TrendingDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const PrepaymentCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(2000000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [tenureMonths, setTenureMonths] = useState(120);
  const [prepaymentAmount, setPrepaymentAmount] = useState(200000);
  const [prepaymentMonth, setPrepaymentMonth] = useState(12);

  // Formatting helpers
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const calculations = useMemo(() => {
    const monthlyRate = interestRate / 12 / 100;

    // Without Prepayment
    const emiOriginal =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    const totalOriginal = emiOriginal * tenureMonths;
    const interestOriginal = totalOriginal - loanAmount;

    // With Prepayment — recalculate after prepayment month
    let balance = loanAmount;
    let totalPaidWithPrepayment = 0;
    let monthsWithPrepayment = 0;

    for (let m = 1; m <= tenureMonths * 2; m++) {
      if (balance <= 0) break;

      const interestForMonth = balance * monthlyRate;
      const principalForMonth = Math.min(emiOriginal - interestForMonth, balance);
      totalPaidWithPrepayment += Math.min(emiOriginal, balance + interestForMonth);
      balance -= principalForMonth;
      monthsWithPrepayment = m;

      // Apply prepayment
      if (m === prepaymentMonth && balance > 0) {
        const actualPrepayment = Math.min(prepaymentAmount, balance);
        balance -= actualPrepayment;
        totalPaidWithPrepayment += actualPrepayment;
      }

      if (balance <= 0) break;
    }

    const interestWithPrepayment = totalPaidWithPrepayment - loanAmount;
    const interestSaved = interestOriginal - interestWithPrepayment;
    const tenureSaved = tenureMonths - monthsWithPrepayment;

    return {
      emiOriginal: Math.round(emiOriginal),
      totalOriginal: Math.round(totalOriginal),
      interestOriginal: Math.round(interestOriginal),
      totalWithPrepayment: Math.round(totalPaidWithPrepayment),
      interestWithPrepayment: Math.round(interestWithPrepayment),
      interestSaved: Math.max(0, Math.round(interestSaved)),
      tenureSaved: Math.max(0, tenureSaved),
      monthsWithPrepayment,
    };
  }, [loanAmount, interestRate, tenureMonths, prepaymentAmount, prepaymentMonth]);

  const savingsPercentage = calculations.interestOriginal > 0 
    ? ((calculations.interestSaved / calculations.interestOriginal) * 100).toFixed(1) 
    : "0";

  return (
    <div className="bg-card text-card-foreground border border-border dark:bg-[#080d1e] dark:border-white/10 rounded-[2rem] p-5 md:p-6 lg:p-7 shadow-xl dark:shadow-2xl relative overflow-hidden transition-all dark:hover:border-emerald-500/30 flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-3.5 mb-6 relative z-10 w-full shrink-0">
        <div className="w-11 h-11 rounded-full bg-secondary dark:bg-[#0d1829] border border-border dark:border-emerald-500/20 shadow-sm flex items-center justify-center shrink-0">
          <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-none mb-1">Prepayment Analysis</h3>
          <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-sm inline-block leading-none">
            REDUCE INTEREST BURDEN
          </p>
        </div>
      </div>

      {/* HORIZONTAL LAYOUT IMPLEMENTATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 relative z-10 w-full h-full items-stretch">
        
        {/* Left Col: 5 Compact Interactive Sliders */}
        <div className="space-y-3 flex flex-col justify-start w-full min-w-0">
          
          {/* Loan Amount */}
          <div className="bg-secondary/20 dark:bg-[#0d1829] p-3 rounded-xl border border-border dark:border-white/5 shadow-sm transition-all focus-within:border-emerald-500/50 hover:border-emerald-500/30">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Loan Amount</label>
              <div className="text-xs font-bold text-foreground bg-background dark:bg-[#080d1e] px-2 py-1 rounded shadow-sm border border-border dark:border-white/5 leading-none">
                {formatCurrency(loanAmount)}
              </div>
            </div>
            <Slider max={10000000} min={100000} step={50000} value={[loanAmount]} onValueChange={(val) => setLoanAmount(val[0])} className="w-full cursor-pointer py-0.5" />
          </div>

          {/* Interest Rate */}
          <div className="bg-secondary/20 dark:bg-[#0d1829] p-3 rounded-xl border border-border dark:border-white/5 shadow-sm transition-all focus-within:border-emerald-500/50 hover:border-emerald-500/30">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Interest Rate</label>
              <div className="text-xs font-bold text-foreground bg-background dark:bg-[#080d1e] px-2 py-1 rounded shadow-sm border border-border dark:border-white/5 leading-none">
                {interestRate}% <span className="text-[8px] text-muted-foreground">p.a.</span>
              </div>
            </div>
            <Slider max={24} min={6} step={0.25} value={[interestRate]} onValueChange={(val) => setInterestRate(val[0])} className="w-full cursor-pointer py-0.5" />
          </div>

          {/* Tenure */}
          <div className="bg-secondary/20 dark:bg-[#0d1829] p-3 rounded-xl border border-border dark:border-white/5 shadow-sm transition-all focus-within:border-emerald-500/50 hover:border-emerald-500/30">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Loan Tenure</label>
              <div className="text-xs font-bold text-foreground bg-background dark:bg-[#080d1e] px-2 py-1 rounded shadow-sm border border-border dark:border-white/5 leading-none">
                {tenureMonths} Mo <span className="text-[8px] text-muted-foreground">({(tenureMonths/12).toFixed(1)} Yrs)</span>
              </div>
            </div>
            <Slider max={360} min={12} step={12} value={[tenureMonths]} onValueChange={(val) => setTenureMonths(val[0])} className="w-full cursor-pointer py-0.5" />
          </div>

          {/* Prepayment Amount */}
          <div className="bg-emerald-50/30 dark:bg-emerald-500/5 p-3 rounded-xl border border-emerald-200/50 dark:border-emerald-500/15 shadow-sm transition-all focus-within:border-emerald-600/50 hover:border-emerald-500/40">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Prepayment Amount</label>
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-500/10 px-2 py-1 rounded shadow-sm border border-emerald-200/50 dark:border-emerald-500/20 leading-none">
                {formatCurrency(prepaymentAmount)}
              </div>
            </div>
            <Slider max={Math.min(loanAmount, 5000000)} min={10000} step={10000} value={[prepaymentAmount]} onValueChange={(val) => setPrepaymentAmount(val[0])} className="w-full cursor-pointer py-0.5" />
          </div>

          {/* Prepayment Month */}
          <div className="bg-emerald-50/30 dark:bg-emerald-500/5 p-3 rounded-xl border border-emerald-200/50 dark:border-emerald-500/15 shadow-sm transition-all focus-within:border-emerald-600/50 hover:border-emerald-500/40">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Prepay After Month</label>
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-500/10 px-2 py-1 rounded shadow-sm border border-emerald-200/50 dark:border-emerald-500/20 leading-none">
                Month {prepaymentMonth}
              </div>
            </div>
            <Slider max={Math.max(1, tenureMonths - 1)} min={1} step={1} value={[prepaymentMonth]} onValueChange={(val) => setPrepaymentMonth(val[0])} className="w-full cursor-pointer py-0.5" />
          </div>

        </div>

        {/* Right Col: Savings Hero & Output Matrix */}
        <div className="flex flex-col lg:grid lg:grid-rows-5 gap-3 w-full min-w-0 h-full mt-2 lg:mt-0">
          
          {/* Savings Hero */}
          <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-500/5 dark:to-emerald-900/10 rounded-2xl border border-emerald-200/50 dark:border-emerald-500/15 shadow-inner relative overflow-hidden flex-1 lg:row-span-3">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b9811a_1px,transparent_1px),linear-gradient(to_bottom,#10b9811a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
            
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5 relative z-10">
              <TrendingDown className="w-3.5 h-3.5" /> Interest Saved
            </span>
            <span className="text-2xl lg:text-3xl xl:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none drop-shadow-sm mb-2 truncate max-w-full relative z-10">
              {formatCurrency(calculations.interestSaved)}
            </span>
            <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-sm border border-emerald-500/20 relative z-10">
              {savingsPercentage}% Less Interest Overall
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0 lg:row-span-1">
             {/* Tenure Saved */}
             <div className="flex flex-col items-center justify-center p-3 bg-secondary/30 dark:bg-[#0d1829] rounded-xl border border-border dark:border-white/5 shadow-sm">
               <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Tenure Trimmed</span>
               <span className="text-xl font-bold text-foreground leading-none">{calculations.tenureSaved} <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Mo</span></span>
             </div>
             
             {/* New Tenure */}
             <div className="flex flex-col items-center justify-center p-3 bg-secondary/30 dark:bg-[#0d1829] rounded-xl border border-border dark:border-white/5 shadow-sm">
               <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">New Total Tenure</span>
               <span className="text-xl font-bold text-foreground leading-none">{calculations.monthsWithPrepayment} <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Mo</span></span>
             </div>
          </div>

          {/* Comparison Matrix */}
          <div className="grid grid-cols-2 gap-3 shrink-0 lg:row-span-1">
            <div className="p-3 bg-red-50/30 dark:bg-red-500/5 rounded-xl border border-red-200/50 dark:border-red-500/10 flex flex-col justify-center items-center text-center">
              <p className="text-[8px] font-bold uppercase tracking-wider text-red-500/70 mb-1">Base Interest</p>
              <p className="text-sm font-bold text-foreground leading-none truncate w-full">{formatCurrency(calculations.interestOriginal)}</p>
            </div>
            <div className="p-3 bg-emerald-50/30 dark:bg-emerald-500/5 rounded-xl border border-emerald-200/50 dark:border-emerald-500/10 flex flex-col justify-center items-center text-center">
              <p className="text-[8px] font-bold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70 mb-1">New Interest</p>
              <p className="text-sm font-bold text-foreground leading-none truncate w-full">{formatCurrency(calculations.interestWithPrepayment)}</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default PrepaymentCalculator;
