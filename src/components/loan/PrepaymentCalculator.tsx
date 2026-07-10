import { useState, useMemo } from "react";
import { Calculator, TrendingDown, Calendar, Percent, Zap, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface PrepaymentCalculatorProps {
  showTerminology?: boolean;
  className?: string;
}

const PrepaymentCalculator = ({
  showTerminology = true,
  className = ""
}: PrepaymentCalculatorProps) => {
  const [loanAmount, setLoanAmount] = useState(2000000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [tenureMonths, setTenureMonths] = useState(120);
  const [prepaymentAmount, setPrepaymentAmount] = useState(200000);
  const prepaymentMonth = 12;
  const [strategy, setStrategy] = useState<"lump-sum" | "13th-emi" | "step-up" | "combo">("lump-sum");

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

    // With Prepayment / Step-up
    let balance = loanAmount;
    let totalPaidWithPrepayment = 0;
    let monthsWithPrepayment = 0;

    for (let m = 1; m <= tenureMonths * 2; m++) {
      if (balance <= 0) break;

      const interestForMonth = balance * monthlyRate;

      // Calculate current EMI for this month (incorporating annual 5% step-up if active)
      const isStepUp = strategy === "step-up" || strategy === "combo";
      const yearIndex = Math.floor((m - 1) / 12);
      const currentEmi = isStepUp ? emiOriginal * Math.pow(1.05, yearIndex) : emiOriginal;

      // Regular monthly payment
      const paymentForMonth = Math.min(currentEmi, balance + interestForMonth);
      const principalForMonth = paymentForMonth - interestForMonth;
      totalPaidWithPrepayment += paymentForMonth;
      balance -= principalForMonth;
      monthsWithPrepayment = m;

      // Apply prepayments at the end of the month
      if (balance <= 0) break;

      // 1. Lump Sum Prepayment (only for lump-sum strategy)
      if (strategy === "lump-sum" && m === prepaymentMonth) {
        const actualPrepayment = Math.min(prepaymentAmount, balance);
        balance -= actualPrepayment;
        totalPaidWithPrepayment += actualPrepayment;
      }

      // 2. 13th EMI / Combo Prepayment
      // paid at the end of every 12-month cycle (month 12, 24, 36...)
      if ((strategy === "13th-emi" || strategy === "combo") && m % 12 === 0) {
        const actualPrepayment = Math.min(currentEmi, balance);
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
  }, [loanAmount, interestRate, tenureMonths, prepaymentAmount, strategy]);

  const savingsPercentage = calculations.interestOriginal > 0
    ? ((calculations.interestSaved / calculations.interestOriginal) * 100).toFixed(1)
    : "0";

  const prepaymentTerminology = [
    {
      term: "Part Prepayment",
      definition: "Making a lump-sum payment over and above your regular EMI to reduce the outstanding principal balance.",
    },
    {
      term: "Foreclosure",
      definition: "Repaying the entire remaining loan amount in one go before the loan tenure ends.",
    },
    {
      term: "Reducing Balance Method",
      definition: "Interest is calculated on the outstanding balance after each EMI. Prepayments directly reduce this balance, saving future interest.",
    },
  ];

  return (
    <div className={cn("bg-card text-card-foreground border border-border dark:bg-[#080d1e] dark:border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 shadow-lg relative overflow-hidden transition-all dark:hover:border-emerald-500/30 flex flex-col w-full", className)}>

      <div className="flex-1 flex flex-col lg:min-h-[500px] justify-between relative z-10 w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3 md:mb-4 relative z-10 w-full shrink-0">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary dark:bg-[#0d1829] border border-border dark:border-emerald-500/20 shadow-sm flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-none mb-1">Prepayment Analysis</h3>
            <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-sm inline-block leading-none">
              REDUCE INTEREST BURDEN
            </p>
          </div>
        </div>

        {/* Strategy Tabs Selector */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-secondary/40 dark:bg-[#0d1829]/65 rounded-lg border border-border dark:border-white/5 mb-3 md:mb-4 relative z-10 select-none shrink-0">
          {[
            { id: "lump-sum", label: "Lump Sum" },
            { id: "13th-emi", label: "13th EMI" },
            { id: "step-up", label: "5% Step-Up" },
            { id: "combo", label: "Pryme Combo" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStrategy(tab.id as any)}
              className={`py-2 px-1 rounded-lg text-[10px] md:text-xs font-bold transition-all duration-200 cursor-pointer text-center whitespace-nowrap leading-none ${strategy === tab.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10 dark:bg-emerald-500 dark:text-[#080d1e]"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 dark:hover:bg-white/5"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* HORIZONTAL LAYOUT IMPLEMENTATION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 relative z-10 w-full items-stretch">

          {/* Left Col: 5 Compact Interactive Sliders or 3 Sliders + Explanation Card */}
          <div className="lg:grid lg:grid-rows-5 lg:gap-2 flex flex-col space-y-2 lg:space-y-0 w-full min-w-0">

            {/* Loan Amount */}
            <div className="lg:row-span-1 bg-secondary/20 dark:bg-[#0d1829] p-2.5 rounded-lg border border-border dark:border-white/5 shadow-sm transition-all focus-within:border-emerald-500/50 hover:border-emerald-500/30 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-1.5 gap-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Loan Amount (₹)</label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="text-xs font-bold text-foreground bg-background dark:bg-[#080d1e] px-2 py-1 rounded border border-border dark:border-white/5 w-28 text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min={100000}
                  max={10000000}
                />
              </div>
              <Slider max={10000000} min={100000} step={50000} value={[loanAmount]} onValueChange={(val) => setLoanAmount(val[0])} className="w-full cursor-pointer py-0.5" />
            </div>

            {/* Interest Rate */}
            <div className="lg:row-span-1 bg-secondary/20 dark:bg-[#0d1829] p-2.5 rounded-lg border border-border dark:border-white/5 shadow-sm transition-all focus-within:border-emerald-500/50 hover:border-emerald-500/30 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-1.5 gap-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="text-xs font-bold text-foreground bg-background dark:bg-[#080d1e] px-2 py-1 rounded border border-border dark:border-white/5 w-20 text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min={6}
                  max={24}
                  step={0.1}
                />
              </div>
              <Slider max={24} min={6} step={0.25} value={[interestRate]} onValueChange={(val) => setInterestRate(val[0])} className="w-full cursor-pointer py-0.5" />
            </div>

            {/* Tenure */}
            <div className="lg:row-span-1 bg-secondary/20 dark:bg-[#0d1829] p-2.5 rounded-lg border border-border dark:border-white/5 shadow-sm transition-all focus-within:border-emerald-500/50 hover:border-emerald-500/30 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-1.5 gap-2">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Loan Tenure (Months)</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(Number(e.target.value))}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="text-xs font-bold text-foreground bg-background dark:bg-[#080d1e] px-2 py-1 rounded border border-border dark:border-white/5 w-20 text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    min={12}
                    max={360}
                  />
                  <span className="text-[8px] text-muted-foreground whitespace-nowrap">({(tenureMonths / 12).toFixed(1)} Yrs)</span>
                </div>
              </div>
              <Slider max={360} min={12} step={12} value={[tenureMonths]} onValueChange={(val) => setTenureMonths(val[0])} className="w-full cursor-pointer py-0.5" />
            </div>

            {strategy === "lump-sum" ? (
              /* Prepayment Amount */
              <div className="lg:row-span-2 bg-emerald-50/30 dark:bg-emerald-500/5 p-3 rounded-lg border border-emerald-200/30 dark:border-emerald-500/10 shadow-sm transition-all focus-within:border-emerald-500/50 hover:border-emerald-500/30 flex flex-col justify-center min-h-[140px]">
                <div className="flex justify-between items-center mb-2.5 gap-2">
                  <div className="space-y-0.5">
                    <label className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest block">Prepayment Amount (₹)</label>
                    <span className="text-[8px] text-muted-foreground block">Assumes payment is made at month 12</span>
                  </div>
                  <input
                    type="number"
                    value={prepaymentAmount}
                    onChange={(e) => setPrepaymentAmount(Number(e.target.value))}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-500/10 px-2 py-1 rounded border border-emerald-200/50 dark:border-emerald-500/20 w-28 text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    min={10000}
                    max={Math.min(loanAmount, 5000000)}
                  />
                </div>
                <Slider max={Math.min(loanAmount, 5000000)} min={10000} step={10000} value={[prepaymentAmount]} onValueChange={(val) => setPrepaymentAmount(val[0])} className="w-full cursor-pointer py-0.5" />
              </div>
            ) : (
              /* Strategy Explanation Card */
              <div className="lg:row-span-2 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-[#0d1829]/80 dark:to-[#052015]/30 p-3.5 rounded-lg border border-emerald-500/15 dark:border-emerald-500/30 shadow-sm flex flex-col justify-center relative overflow-hidden select-none min-h-[140px]">
                <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                {strategy === "13th-emi" && (
                  <div className="flex gap-2.5 items-start relative z-10">
                    <div className="p-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-md shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1 uppercase tracking-wider">13th EMI Acceleration</h4>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        By making <strong className="text-foreground font-semibold">one extra EMI payment every 12 months</strong>, you aggressively reduce your outstanding principal. This simple compounding habit can trim a 20-year loan by up to 4 years.
                      </p>
                    </div>
                  </div>
                )}

                {strategy === "step-up" && (
                  <div className="flex gap-2.5 items-start relative z-10">
                    <div className="p-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-md shrink-0 mt-0.5">
                      <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1 uppercase tracking-wider">5% Step-Up Strategy</h4>
                      <p className="text-[10px] text-muted-foreground leading-relaxed mb-1.5">
                        Increases your monthly EMI by <strong className="text-foreground font-semibold">5% at the end of every 12 months</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {strategy === "combo" && (
                  <div className="flex gap-2.5 items-start relative z-10">
                    <div className="p-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-md shrink-0 mt-0.5">
                      <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1 uppercase tracking-wider">Pryme Dual-Engine Combo</h4>
                      <p className="text-[10px] text-muted-foreground leading-relaxed mb-1.5">
                        Combines both <strong className="text-foreground font-semibold">13th EMI prepayments</strong> and a <strong className="text-foreground font-semibold">5% annual step-up</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Col: Results Overview */}
          <div className="flex flex-col h-full bg-slate-50 dark:bg-[#080d1e] rounded-xl border border-border dark:border-white/5 p-3 md:p-4 overflow-hidden relative">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Savings Display Hero */}
            <div className="flex-1 min-h-[140px] md:min-h-0 flex flex-col items-center justify-center text-center p-4 bg-white dark:bg-[#0B1224] rounded-xl border border-emerald-200/60 dark:border-emerald-500/15 mb-3 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b9811a_1px,transparent_1px),linear-gradient(to_bottom,#10b9811a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5 relative z-10">
                <TrendingDown className="w-3.5 h-3.5" /> Interest Saved
              </span>
              <span className={cn(
                "font-extrabold text-emerald-600 dark:text-emerald-400 leading-none drop-shadow-sm mb-2 truncate max-w-full relative z-10",
                formatCurrency(calculations.interestSaved).length > 14
                  ? "text-base lg:text-lg xl:text-xl"
                  : formatCurrency(calculations.interestSaved).length > 10
                    ? "text-lg lg:text-xl xl:text-2xl"
                    : "text-xl lg:text-2xl xl:text-3xl"
              )}>
                {formatCurrency(calculations.interestSaved)}
              </span>
              <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-sm border border-emerald-500/20 relative z-10">
                {savingsPercentage}% Less Interest Overall
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 md:gap-3 shrink-0 lg:row-span-1">
              {/* New EMI */}
              <div className="flex flex-col items-center justify-center p-2.5 bg-secondary/15 dark:bg-[#0d1829]/35 rounded-lg border border-transparent">
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">New Total EMI</span>
                <span className="text-lg md:text-xl font-bold text-foreground leading-none">{formatCurrency(calculations.emiOriginal)}</span>
              </div>

              {/* New Tenure */}
              <div className="flex flex-col items-center justify-center p-2.5 bg-secondary/15 dark:bg-[#0d1829]/35 rounded-lg border border-transparent">
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">New Total Tenure</span>
                <span className="text-lg md:text-xl font-bold text-foreground leading-none">{calculations.monthsWithPrepayment} <span className="text-[9px] md:text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Mo</span></span>
              </div>
            </div>

            {/* Comparison Matrix */}
            <div className="grid grid-cols-2 gap-2 md:gap-3 shrink-0 lg:row-span-1 mt-2 md:mt-3">
              <div className="p-2.5 bg-red-50/15 dark:bg-red-500/[0.02] rounded-lg border border-transparent flex flex-col justify-center items-center text-center">
                <p className="text-[8px] font-bold uppercase tracking-wider text-red-500/70 mb-1">Base Interest</p>
                <p className={cn(
                  "font-bold text-foreground leading-none truncate w-full",
                  formatCurrency(calculations.interestOriginal).length > 12
                    ? "text-[10px] sm:text-xs"
                    : "text-xs sm:text-sm"
                )}>{formatCurrency(calculations.interestOriginal)}</p>
              </div>
              <div className="p-2.5 bg-emerald-50/15 dark:bg-emerald-500/[0.02] rounded-lg border border-transparent flex flex-col justify-center items-center text-center">
                <p className="text-[8px] font-bold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-400/70 mb-1">New Interest</p>
                <p className={cn(
                  "font-bold text-foreground leading-none truncate w-full",
                  formatCurrency(calculations.interestWithPrepayment).length > 12
                    ? "text-[10px] sm:text-xs"
                    : "text-xs sm:text-sm"
                )}>{formatCurrency(calculations.interestWithPrepayment)}</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Prepayment Guide */}
      {showTerminology && (
        <div className="mt-4 md:mt-5 pt-3 md:pt-4 border-t border-border dark:border-white/10 relative z-10 shrink-0">
          <div className="w-full">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="terminology" className="border-0">
                <AccordionTrigger className="text-[10px] md:text-[11px] font-bold text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 py-1 hover:no-underline uppercase tracking-widest transition-colors">
                  <div className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5" />
                    <span>Prepayment Guide</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 pt-2">
                    {prepaymentTerminology.map((item) => (
                      <div key={item.term} className="p-2.5 md:p-3 bg-secondary/15 dark:bg-[#0d1829]/35 rounded-lg border border-transparent">
                        <p className="text-[10px] md:text-xs font-bold text-foreground mb-1 uppercase tracking-wide">{item.term}</p>
                        <p className="text-[9px] md:text-[11px] font-medium text-muted-foreground dark:text-slate-400 leading-relaxed">{item.definition}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrepaymentCalculator;
