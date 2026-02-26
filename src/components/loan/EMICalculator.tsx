import { useState, useEffect, useMemo } from "react";
import { Calculator, TrendingUp, IndianRupee, Info, ChevronDown } from "lucide-react";
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
    {
      term: "EMI (Equated Monthly Installment)",
      definition: "A fixed payment amount made by a borrower to a lender at a specified date each calendar month.",
    },
    {
      term: "Principal Amount",
      definition: "The original sum of money borrowed in a loan. This is the amount you actually receive.",
    },
    {
      term: "Rate of Interest (ROI)",
      definition: "The percentage of principal charged by the lender for the use of its money. Usually expressed as an annual percentage.",
    },
    {
      term: "MCLR (Marginal Cost of Funds based Lending Rate)",
      definition: "A methodology used by banks in India to determine interest rates for loans. It's the minimum interest rate below which a bank cannot lend.",
    },
    {
      term: "Repo Rate",
      definition: "The rate at which RBI lends money to commercial banks. Changes in repo rate affect your loan interest rates.",
    },
    {
      term: "Processing Fee",
      definition: "A one-time fee charged by lenders for processing your loan application, typically 0.5% to 2% of the loan amount.",
    },
  ];

  // Calculate SVG arc for pie chart
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const principalArc = (principalPercentage / 100) * circumference;

  return (
    <div className={`card-elevated p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">EMI Calculator</h3>
          <p className="text-xs text-muted-foreground">Estimate your monthly payments</p>
        </div>
      </div>

      {/* EMI Display with Pie Chart */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-muted/30 rounded-xl mb-6">
        {/* Pie Chart */}
        <div className="relative w-40 h-40 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="20"
            />
            {/* Principal segment */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="20"
              strokeDasharray={`${principalArc} ${circumference}`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            {/* Interest segment */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="hsl(var(--trust))"
              strokeWidth="20"
              strokeDasharray={`${circumference - principalArc} ${circumference}`}
              strokeDashoffset={-principalArc}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">Monthly EMI</span>
            <span className="text-xl font-bold text-primary">{formatShortCurrency(emi)}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between p-3 bg-card rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-foreground">Principal</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{formatCurrency(amount)}</p>
              <p className="text-xs text-muted-foreground">{principalPercentage.toFixed(1)}%</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-card rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-trust" />
              <span className="text-sm text-foreground">Interest</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-trust-foreground">{formatCurrency(totalInterest)}</p>
              <p className="text-xs text-muted-foreground">{interestPercentage.toFixed(1)}%</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
            <span className="text-sm font-medium text-foreground">Total Payment</span>
            <span className="text-lg font-bold text-foreground">{formatCurrency(totalPayment)}</span>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-6">
        {/* Loan Amount */}
        <div>
          <div className="flex justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Loan Amount</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {formatCurrency(amount)}
              </span>
            </div>
          </div>
          <Slider
            value={[amount]}
            onValueChange={(v) => setAmount(v[0])}
            min={100000}
            max={10000000}
            step={50000}
            className="cursor-pointer"
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">₹1 Lakh</span>
            <span className="text-xs text-muted-foreground">₹1 Crore</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Interest Rate (p.a.)</span>
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {rate}%
            </span>
          </div>
          <Slider
            value={[rate]}
            onValueChange={(v) => setRate(v[0])}
            min={6}
            max={24}
            step={0.25}
            className="cursor-pointer"
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">6%</span>
            <span className="text-xs text-muted-foreground">24%</span>
          </div>
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Loan Tenure</span>
            <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {months} months ({(months / 12).toFixed(1)} years)
            </span>
          </div>
          <Slider
            value={[months]}
            onValueChange={(v) => setMonths(v[0])}
            min={12}
            max={360}
            step={12}
            className="cursor-pointer"
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">1 Year</span>
            <span className="text-xs text-muted-foreground">30 Years</span>
          </div>
        </div>
      </div>

      {/* Terminology Accordion */}
      {showTerminology && (
        <div className="mt-6 pt-6 border-t border-border">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="terminology" className="border-0">
              <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <span>Loan Terminology Guide</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {terminology.map((item) => (
                    <div key={item.term} className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-1">{item.term}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.definition}</p>
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
