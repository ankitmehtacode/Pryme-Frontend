import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  TrendingDown,
  IndianRupee,
  Calendar,
  Percent,
  ArrowDownRight,
  Info,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PrepaymentCalculatorPage = () => {
  const [loanAmount, setLoanAmount] = useState(2000000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [tenureMonths, setTenureMonths] = useState(120);
  const [prepaymentAmount, setPrepaymentAmount] = useState(200000);
  const [prepaymentMonth, setPrepaymentMonth] = useState(12);

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

  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const savingsPercentage =
    calculations.interestOriginal > 0
      ? (
          (calculations.interestSaved / calculations.interestOriginal) *
          100
        ).toFixed(1)
      : "0";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0a]">
      <Helmet>
        <title>Prepayment Calculator | PRYME Consulting</title>
        <meta
          name="description"
          content="Calculate how much you can save by prepaying your loan early. See interest savings and reduced tenure instantly."
        />
      </Helmet>

      <Header />

      <SmoothScroll>
        <main className="flex-1 pt-24 md:pt-32">
          <section className="container mx-auto px-4 pb-24">
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium uppercase tracking-widest mb-6 border border-emerald-500/20">
                  <TrendingDown className="w-4 h-4" />
                  Smart Savings
                </span>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-4 md:mb-8 tracking-tight">
                  Prepayment{" "}
                  <span className="text-emerald-600 dark:text-emerald-400 italic">
                    Savings
                  </span>{" "}
                  Calculator
                </h1>
                <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
                  Discover how a single lump-sum prepayment can dramatically
                  reduce your total interest and loan tenure.
                </p>
              </div>
            </ScrollReveal>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
              {/* Calculator Card */}
              <div className="lg:col-span-8">
                <div className="bg-card text-card-foreground rounded-2xl md:rounded-[2.5rem] border border-border p-4 md:p-8 shadow-2xl">
                  <div className="bg-card text-card-foreground border border-border dark:bg-[#0a0a0a] dark:border-emerald-500/20 rounded-2xl md:rounded-[2rem] p-4 md:p-6 lg:p-7 shadow-xl relative overflow-hidden">
                    {/* Ambient glow */}
                    <div className="absolute top-[-10%] right-[-10%] w-[250px] h-[250px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4 md:mb-6 relative z-10">
                      <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-emerald-50 dark:bg-[#111] shadow-sm flex items-center justify-center border border-emerald-200 dark:border-emerald-500/20 shrink-0">
                        <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-2xl font-bold text-foreground tracking-tight leading-none mb-0.5 md:mb-1">
                          Prepayment Calculator
                        </h3>
                        <p className="text-[8px] md:text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">
                          Lump-sum savings estimator
                        </p>
                      </div>
                    </div>

                    {/* Savings Hero */}
                    <div className="flex flex-col md:flex-row items-stretch gap-3 md:gap-4 p-3 md:p-5 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-500/5 dark:to-emerald-900/10 rounded-xl md:rounded-2xl border border-emerald-200/50 dark:border-emerald-500/15 mb-4 md:mb-6 relative z-10">
                      <div className="flex-1 flex flex-col items-center justify-center p-3 md:p-4 bg-white dark:bg-[#0a0a0a] rounded-xl border border-emerald-200/50 dark:border-emerald-500/10">
                        <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
                          Interest Saved
                        </span>
                        <span className="text-xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(calculations.interestSaved)}
                        </span>
                        <span className="text-[9px] md:text-[10px] font-bold text-emerald-500/70 mt-0.5">
                          {savingsPercentage}% less interest
                        </span>
                      </div>
                      <div className="flex flex-row md:flex-col gap-3 md:gap-3">
                        <div className="flex-1 flex flex-col items-center justify-center p-2.5 md:p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-border dark:border-white/5">
                          <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                            Tenure Saved
                          </span>
                          <span className="text-base md:text-xl font-bold text-foreground">
                            {calculations.tenureSaved}{" "}
                            <span className="text-[9px] md:text-xs text-muted-foreground font-medium">
                              months
                            </span>
                          </span>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center p-2.5 md:p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-border dark:border-white/5">
                          <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                            Monthly EMI
                          </span>
                          <span className="text-base md:text-xl font-bold text-foreground">
                            {formatCurrency(calculations.emiOriginal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Comparison Row */}
                    <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6 relative z-10">
                      <div className="p-2.5 md:p-3.5 bg-red-50/50 dark:bg-red-500/5 rounded-lg md:rounded-xl border border-red-200/50 dark:border-red-500/10">
                        <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-red-500/70 mb-1">
                          Without Prepayment
                        </p>
                        <p className="text-sm md:text-lg font-bold text-foreground leading-none">
                          {formatCurrency(calculations.interestOriginal)}
                        </p>
                        <p className="text-[8px] md:text-[9px] text-muted-foreground mt-0.5">
                          total interest • {tenureMonths} months
                        </p>
                      </div>
                      <div className="p-2.5 md:p-3.5 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-lg md:rounded-xl border border-emerald-200/50 dark:border-emerald-500/10">
                        <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-emerald-500/70 mb-1">
                          With Prepayment
                        </p>
                        <p className="text-sm md:text-lg font-bold text-foreground leading-none">
                          {formatCurrency(calculations.interestWithPrepayment)}
                        </p>
                        <p className="text-[8px] md:text-[9px] text-muted-foreground mt-0.5">
                          total interest •{" "}
                          {calculations.monthsWithPrepayment} months
                        </p>
                      </div>
                    </div>

                    {/* Sliders */}
                    <div className="space-y-3 md:space-y-4 relative z-10">
                      {/* Loan Amount */}
                      <div className="p-3 md:p-4 md:px-5 bg-secondary/20 dark:bg-[#111] rounded-xl md:rounded-2xl border border-border dark:border-white/5 shadow-sm">
                        <div className="flex justify-between items-center mb-3 md:mb-4">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            Loan Amount
                          </span>
                          <span className="text-sm md:text-base font-bold text-foreground bg-background dark:bg-[#0a0a0a] px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-lg border border-border dark:border-white/5 shadow-sm leading-none">
                            {formatCurrency(loanAmount)}
                          </span>
                        </div>
                        <Slider
                          value={[loanAmount]}
                          onValueChange={(v) => setLoanAmount(v[0])}
                          min={100000}
                          max={10000000}
                          step={50000}
                          className="cursor-pointer py-1"
                        />
                        <div className="flex justify-between mt-2 md:mt-3">
                          <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            ₹1 Lakh
                          </span>
                          <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            ₹1 Crore
                          </span>
                        </div>
                      </div>

                      {/* Interest Rate */}
                      <div className="p-3 md:p-4 md:px-5 bg-secondary/20 dark:bg-[#111] rounded-xl md:rounded-2xl border border-border dark:border-white/5 shadow-sm">
                        <div className="flex justify-between items-center mb-3 md:mb-4">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            Interest Rate
                          </span>
                          <span className="text-sm md:text-base font-bold text-foreground bg-background dark:bg-[#0a0a0a] px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-lg border border-border dark:border-white/5 shadow-sm flex items-center leading-none">
                            {interestRate}%{" "}
                            <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                              p.a.
                            </span>
                          </span>
                        </div>
                        <Slider
                          value={[interestRate]}
                          onValueChange={(v) => setInterestRate(v[0])}
                          min={6}
                          max={24}
                          step={0.25}
                          className="cursor-pointer py-1"
                        />
                        <div className="flex justify-between mt-2 md:mt-3">
                          <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            6%
                          </span>
                          <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            24%
                          </span>
                        </div>
                      </div>

                      {/* Tenure */}
                      <div className="p-3 md:p-4 md:px-5 bg-secondary/20 dark:bg-[#111] rounded-xl md:rounded-2xl border border-border dark:border-white/5 shadow-sm">
                        <div className="flex justify-between items-center mb-3 md:mb-4">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            Loan Tenure
                          </span>
                          <span className="text-sm md:text-base font-bold text-foreground bg-background dark:bg-[#0a0a0a] px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-lg border border-border dark:border-white/5 shadow-sm flex items-baseline gap-1 leading-none">
                            {tenureMonths} Mo{" "}
                            <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                              ({(tenureMonths / 12).toFixed(1)} Yrs)
                            </span>
                          </span>
                        </div>
                        <Slider
                          value={[tenureMonths]}
                          onValueChange={(v) => setTenureMonths(v[0])}
                          min={12}
                          max={360}
                          step={12}
                          className="cursor-pointer py-1"
                        />
                        <div className="flex justify-between mt-2 md:mt-3">
                          <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            1 Year
                          </span>
                          <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            30 Years
                          </span>
                        </div>
                      </div>

                      {/* Prepayment Amount */}
                      <div className="p-3 md:p-4 md:px-5 bg-emerald-50/30 dark:bg-emerald-500/5 rounded-xl md:rounded-2xl border border-emerald-200/30 dark:border-emerald-500/10 shadow-sm">
                        <div className="flex justify-between items-center mb-3 md:mb-4">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            Prepayment Amount
                          </span>
                          <span className="text-sm md:text-base font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-500/15 shadow-sm leading-none">
                            {formatCurrency(prepaymentAmount)}
                          </span>
                        </div>
                        <Slider
                          value={[prepaymentAmount]}
                          onValueChange={(v) => setPrepaymentAmount(v[0])}
                          min={10000}
                          max={Math.min(loanAmount, 5000000)}
                          step={10000}
                          className="cursor-pointer py-1"
                        />
                        <div className="flex justify-between mt-2 md:mt-3">
                          <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            ₹10K
                          </span>
                          <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            {formatCurrency(Math.min(loanAmount, 5000000))}
                          </span>
                        </div>
                      </div>

                      {/* Prepayment Month */}
                      <div className="p-3 md:p-4 md:px-5 bg-emerald-50/30 dark:bg-emerald-500/5 rounded-xl md:rounded-2xl border border-emerald-200/30 dark:border-emerald-500/10 shadow-sm">
                        <div className="flex justify-between items-center mb-3 md:mb-4">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            Prepay After Month
                          </span>
                          <span className="text-sm md:text-base font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-500/15 shadow-sm leading-none">
                            Month {prepaymentMonth}
                          </span>
                        </div>
                        <Slider
                          value={[prepaymentMonth]}
                          onValueChange={(v) => setPrepaymentMonth(v[0])}
                          min={1}
                          max={Math.max(1, tenureMonths - 1)}
                          step={1}
                          className="cursor-pointer py-1"
                        />
                        <div className="flex justify-between mt-2 md:mt-3">
                          <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            Month 1
                          </span>
                          <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            Month {Math.max(1, tenureMonths - 1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Terminology */}
                    <div className="mt-4 md:mt-5 pt-4 border-t border-border dark:border-white/10 relative z-10">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="terminology" className="border-0">
                          <AccordionTrigger className="text-[11px] font-bold text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 py-2 hover:no-underline uppercase tracking-widest transition-colors">
                            <div className="flex items-center gap-2.5">
                              <Info className="w-4 h-4" />
                              <span>Prepayment Guide</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid gap-3 pt-3">
                              {[
                                {
                                  term: "Part Prepayment",
                                  definition:
                                    "Making a lump-sum payment over and above your regular EMI to reduce the outstanding principal balance.",
                                },
                                {
                                  term: "Foreclosure",
                                  definition:
                                    "Repaying the entire remaining loan amount in one go before the loan tenure ends. Some banks charge 2-5% foreclosure fees.",
                                },
                                {
                                  term: "Prepayment Penalty",
                                  definition:
                                    "A fee charged by some lenders for early repayment. As per RBI guidelines, floating rate loans from banks cannot have prepayment penalties.",
                                },
                                {
                                  term: "Reducing Balance Method",
                                  definition:
                                    "Interest is calculated on the outstanding balance after each EMI. Prepayments directly reduce this balance, saving future interest.",
                                },
                              ].map((item) => (
                                <div
                                  key={item.term}
                                  className="p-3 bg-secondary/30 dark:bg-[#111] rounded-xl border border-border dark:border-white/5 shadow-sm"
                                >
                                  <p className="text-xs font-bold text-foreground mb-1 uppercase tracking-wide">
                                    {item.term}
                                  </p>
                                  <p className="text-[11px] font-medium text-muted-foreground dark:text-slate-400 leading-relaxed">
                                    {item.definition}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Info Cards */}
              <div className="lg:col-span-4 space-y-4 md:space-y-6">
                {[
                  {
                    icon: ArrowDownRight,
                    title: "Earlier = Better",
                    text: "Prepaying in the first few years saves the most interest since early EMIs are interest-heavy.",
                    color: "emerald",
                  },
                  {
                    icon: Percent,
                    title: "No Penalty on Floating",
                    text: "RBI mandates zero prepayment penalty on floating rate loans from banks. Check with NBFCs.",
                    color: "emerald",
                  },
                  {
                    icon: Calendar,
                    title: "Reduce Tenure, Not EMI",
                    text: "Keeping your EMI same after prepayment and reducing tenure saves more interest overall.",
                    color: "emerald",
                  },
                  {
                    icon: IndianRupee,
                    title: "Tax Benefits",
                    text: "Prepayment on home loans qualifies for tax deduction under Section 80C up to ₹1.5 Lakh.",
                    color: "emerald",
                  },
                ].map((item, i) => (
                  <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                    <div className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-secondary/50 border border-border backdrop-blur-md transition-all hover:bg-white dark:hover:bg-white/10">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3 md:mb-4">
                        <item.icon className="w-5 h-5 md:w-6 md:h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {item.text}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </SmoothScroll>
    </div>
  );
};

export default PrepaymentCalculatorPage;
