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
  Zap,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  Award,
  AlertCircle,
  HelpCircle,
  Activity,
  ArrowRight,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { optimizePrepayment } from "@/lib/prepayment/optimizer";
import { getSmartInsights } from "@/lib/prepayment/explainability";
import { UserProfile, GoalType, EmergencySavingsTier } from "@/lib/prepayment/types";

const PrepaymentCalculatorPage = () => {
  // --- Core Inputs ---
  const [loanAmount, setLoanAmount] = useState(3500000); // Default: 35 Lakhs
  const [interestRate, setInterestRate] = useState(9.5); // Default: 9.5% p.a.
  const [tenureMonths, setTenureMonths] = useState(240); // Default: 20 years

  // --- Financial Profile ---
  const [monthlyIncome, setMonthlyIncome] = useState(180000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(90000);
  const [comfortableExtra, setComfortableExtra] = useState(15000);
  const [emergencySavings, setEmergencySavings] = useState<EmergencySavingsTier>("3-6");

  // --- Goal & Investment Expectations ---
  const [primaryGoal, setPrimaryGoal] = useState<GoalType>("max-savings");
  const [expectedReturn, setExpectedReturn] = useState(12);

  // --- Bonus & Future Events Toggles ---
  const [hasAnnualBonus, setHasAnnualBonus] = useState(true);
  const [annualBonusAmount, setAnnualBonusAmount] = useState(100000);
  const [hasFestivalBonus, setHasFestivalBonus] = useState(true);
  const [festivalBonusAmount, setFestivalBonusAmount] = useState(30000);

  const [activeTab, setActiveTab] = useState<"recommendation" | "sensitivity" | "schedule">("recommendation");

  // Format currencies in Indian style
  const formatCurrency = (value: number) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Compile calculations and optimize
  const optimizationResults = useMemo(() => {
    const bonuses = [];
    if (hasAnnualBonus && annualBonusAmount > 0) {
      bonuses.push({
        id: "bonus-annual",
        type: "annual" as const,
        amount: annualBonusAmount,
        monthIndex: 12,
        label: "Annual Performance Bonus",
      });
    }
    if (hasFestivalBonus && festivalBonusAmount > 0) {
      bonuses.push({
        id: "bonus-festive",
        type: "festival" as const,
        amount: festivalBonusAmount,
        monthIndex: 8,
        label: "Diwali Bonus",
      });
    }

    const profile: UserProfile = {
      loanAmount,
      interestRate,
      tenureMonths,
      monthlyIncome,
      monthlyExpenses,
      emergencySavingsMonths: emergencySavings,
      monthlyExtraSavings: comfortableExtra,
      expectedInvestmentReturn: expectedReturn,
      bonuses,
      futureEvents: []
    };

    return optimizePrepayment(profile, primaryGoal);
  }, [
    loanAmount,
    interestRate,
    tenureMonths,
    monthlyIncome,
    monthlyExpenses,
    comfortableExtra,
    emergencySavings,
    primaryGoal,
    expectedReturn,
    hasAnnualBonus,
    annualBonusAmount,
    hasFestivalBonus,
    festivalBonusAmount
  ]);

  const baseline = useMemo(() => {
    const profile: UserProfile = {
      loanAmount,
      interestRate,
      tenureMonths,
      monthlyIncome,
      monthlyExpenses,
      emergencySavingsMonths: emergencySavings,
      monthlyExtraSavings: 0,
      expectedInvestmentReturn: expectedReturn,
      bonuses: [],
      futureEvents: []
    };
    return optimizePrepayment(profile, "max-savings").primaryRecommendation;
  }, [loanAmount, interestRate, tenureMonths, monthlyIncome, monthlyExpenses, emergencySavings, expectedReturn]);

  const best = optimizationResults.primaryRecommendation;
  const healthScoreOriginal = 62; // Baseline reference score
  const healthScoreOptimized = Math.min(98, healthScoreOriginal + Math.round((best.interestSaved / (baseline.interestPaid || 1)) * 36));

  const smartInsights = useMemo(() => {
    return getSmartInsights(best, baseline);
  }, [best, baseline]);

  // Investment decision rule
  const investmentDecision = useMemo(() => {
    const gap = expectedReturn - interestRate;
    if (gap > 2) {
      return {
        winner: "INVEST",
        text: `With expected returns of ${expectedReturn}% beating your loan rate of ${interestRate}%, investing your monthly surplus yields a higher mathematical net worth.`,
        color: "text-blue-600 dark:text-blue-400 bg-blue-500/5 border-blue-500/20"
      };
    } else if (gap < -2) {
      return {
        winner: "PREPAY",
        text: `Prepaying your loan saves a guaranteed, risk-free ${interestRate}% p.a. compound interest. This decisively beats an expected return of ${expectedReturn}% after tax.`,
        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/20"
      };
    } else {
      return {
        winner: "BALANCED",
        text: `Your loan rate (${interestRate}%) and expected returns (${expectedReturn}%) are closely balanced. We recommend a hybrid strategy: prepaying covers your risk while investing captures growth.`,
        color: "text-amber-600 dark:text-amber-400 bg-amber-500/5 border-amber-500/20"
      };
    }
  }, [expectedReturn, interestRate]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#070b19] font-sans transition-colors duration-300">
      <Helmet>
        <title>Decision Intelligence: Loan Prepayment Optimizer | PRYME</title>
        <meta
          name="description"
          content="Wealthfront-grade Loan Prepayment Intelligence System. Compute optimal, stress-free prepayments based on liquidity constraints, interest rates, and investment ROI."
        />
      </Helmet>

      <Header />

      <SmoothScroll>
        <main className="flex-1 pt-16 md:pt-24 pb-24">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Setup panel */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Page Header */}
                <ScrollReveal direction="up">
                  <div className="text-left mb-6">
                    <span className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-widest mb-4 border border-emerald-500/15">
                      <Award className="w-3.5 h-3.5" />
                      Pryme Decision Intelligence
                    </span>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-[#0B1530] dark:text-white mb-4 tracking-tight leading-tight">
                      Loan Prepayment <span className="text-emerald-600 dark:text-emerald-400 italic font-semibold">Optimizer</span>
                    </h1>
                    <p className="text-sm md:text-base text-[#64748B] dark:text-slate-400 max-w-xl">
                      Analyze thousands of cashflow combinations and identify the mathematically optimal strategy to eliminate debt efficiently.
                    </p>
                  </div>
                </ScrollReveal>

                {/* 1. Loan Parameters */}
                <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5">
                  <h3 className="text-sm font-bold text-[#0B1530] dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    1. Loan Profile
                  </h3>

                  <div className="space-y-4">
                    {/* Loan Amount */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Loan Principal</span>
                        <span className="font-bold text-[#0B1530] dark:text-white">{formatCurrency(loanAmount)}</span>
                      </div>
                      <Slider
                        value={[loanAmount]}
                        onValueChange={(v) => setLoanAmount(v[0])}
                        min={500000}
                        max={20000000}
                        step={100000}
                        className="py-1 cursor-pointer"
                      />
                    </div>

                    {/* Interest Rate */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Interest Rate (% p.a.)</span>
                        <span className="font-bold text-[#0B1530] dark:text-white">{interestRate}%</span>
                      </div>
                      <Slider
                        value={[interestRate]}
                        onValueChange={(v) => setInterestRate(v[0])}
                        min={6}
                        max={18}
                        step={0.1}
                        className="py-1 cursor-pointer"
                      />
                    </div>

                    {/* Tenure */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Tenure</span>
                        <span className="font-bold text-[#0B1530] dark:text-white">
                          {tenureMonths} mo ({(tenureMonths / 12).toFixed(0)} Yrs)
                        </span>
                      </div>
                      <Slider
                        value={[tenureMonths]}
                        onValueChange={(v) => setTenureMonths(v[0])}
                        min={24}
                        max={360}
                        step={12}
                        className="py-1 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Goal & Constraint Parameters */}
                <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5">
                  <h3 className="text-sm font-bold text-[#0B1530] dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    2. Goals & Constraints
                  </h3>

                  <div className="space-y-4">
                    {/* Primary Goal */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Primary Goal Profile</label>
                      <select
                        value={primaryGoal}
                        onChange={(e) => setPrimaryGoal(e.target.value as GoalType)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-[#0B1530] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="max-savings">Save Maximum Interest</option>
                        <option value="earliest-payoff">Debt-Free ASAP (Earliest Payoff)</option>
                        <option value="preserve-liquidity">Preserve Liquid Reserves</option>
                        <option value="stress-free">Minimize Financial Stress</option>
                      </select>
                    </div>

                    {/* Monthly Income & Expenses */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Monthly Income</span>
                        <input
                          type="number"
                          value={monthlyIncome}
                          onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg p-2 font-bold focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Monthly Expenses</span>
                        <input
                          type="number"
                          value={monthlyExpenses}
                          onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg p-2 font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Extra Comfortable Savings */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Comfortable Extra/Month</span>
                        <span className="font-bold text-[#0B1530] dark:text-white">{formatCurrency(comfortableExtra)}</span>
                      </div>
                      <Slider
                        value={[comfortableExtra]}
                        onValueChange={(v) => setComfortableExtra(v[0])}
                        min={1000}
                        max={100000}
                        step={1000}
                        className="py-1 cursor-pointer"
                      />
                    </div>

                    {/* Emergency Reserves */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Emergency Savings Reserves</label>
                      <select
                        value={emergencySavings}
                        onChange={(e) => setEmergencySavings(e.target.value as EmergencySavingsTier)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-[#0B1530] dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="less-3">Critical (Less than 3 Months Expenses)</option>
                        <option value="3-6">Safe (3-6 Months Expenses)</option>
                        <option value="6-12">Strong (6-12 Months Expenses)</option>
                        <option value="12-plus">Bulletproof (12+ Months Expenses)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Optimization results */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Health Score & Opportunity Cost Summary Banner */}
                <div className="bg-gradient-to-br from-[#0b1530] to-[#12234f] dark:from-[#080d19] dark:to-[#0f1b35] text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
                    
                    {/* Health Score Transition */}
                    <div className="text-center md:text-left md:border-r md:border-white/10 md:pr-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Loan Health Score</span>
                      <div className="flex items-baseline justify-center md:justify-start gap-2 mt-1">
                        <span className="text-4xl font-extrabold text-slate-300 line-through decoration-[#ef4444] decoration-2">{healthScoreOriginal}</span>
                        <ArrowRight className="w-5 h-5 text-emerald-400" />
                        <span className="text-5xl font-black text-emerald-400">{healthScoreOptimized}</span>
                        <span className="text-xs text-emerald-400/80 font-bold uppercase">/100</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-2 font-medium">Optimal prepayments increase score by {healthScoreOptimized - healthScoreOriginal} points</span>
                    </div>

                    {/* Cost of Doing Nothing */}
                    <div className="col-span-2 space-y-2">
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <ShieldAlert className="w-5 h-5 text-rose-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Cost of Inaction</span>
                      </div>
                      <p className="text-xl md:text-2xl font-black tracking-tight text-center md:text-left">
                        You will pay <span className="text-rose-500">{formatCurrency(best.interestSaved)}</span> in avoidable interest.
                      </p>
                      <p className="text-xs text-slate-300 text-center md:text-left">
                        Adopting the optimized strategy eliminates this interest loss and cuts loan tenure by <strong className="text-emerald-400 font-bold">{best.tenureSaved} months</strong>.
                      </p>
                    </div>

                  </div>
                </div>

                  <div className="space-y-6">
                    
                    {/* Primary Decision Card */}
                    <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-6 shadow-sm border-l-4 border-emerald-500 dark:border-emerald-500/70 border-y border-r border-slate-100 dark:border-white/5 relative overflow-hidden">
                      <div className="absolute right-4 top-4 flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PEAK ROI STRATEGY
                      </div>

                      <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Recommended Plan</h4>
                      <h2 className="text-xl md:text-2xl font-black text-[#0B1530] dark:text-white tracking-tight mb-3">
                        {best.strategyName}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                        {best.strategyDescription}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-white/5 mb-6">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Interest Saved</span>
                          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(best.interestSaved)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Tenure Saved</span>
                          <span className="text-base font-extrabold text-[#0B1530] dark:text-white">{best.tenureSaved} Months</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">ROI (Risk-Free)</span>
                          <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">{best.roi}% p.a.</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Prepayment Multiplier</span>
                          <span className="text-base font-extrabold text-[#0B1530] dark:text-white">₹{best.effectiveMultiplier} saved</span>
                        </div>
                      </div>

                      {/* Explainability bullet points */}
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Decision Explainability</h5>
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/25 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                            {best.explainability.whyText}
                          </p>
                        </div>

                        <div>
                          <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Trade-offs & Constraints</h5>
                          <ul className="text-xs space-y-1.5 pl-4 list-disc text-slate-500 dark:text-slate-400 font-medium">
                            {best.explainability.tradeoffs.map((to, i) => (
                              <li key={i}>{to}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Prepayment vs Investment Trade-off Box */}
                    <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5">
                      <h4 className="text-xs font-bold text-[#0B1530] dark:text-white uppercase tracking-wider mb-3">Prepayment vs. Investment Trade-Off</h4>
                      <div className={cn("p-4 rounded-xl border text-xs font-medium leading-relaxed mb-1", investmentDecision.color)}>
                        {investmentDecision.text}
                      </div>
                    </div>

                    {/* Scenario Engine Comparison Matrix */}
                    <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-white/5">
                      <h4 className="text-xs font-bold text-[#0B1530] dark:text-white uppercase tracking-wider mb-4">Risk Tiers & Strategy Comparison</h4>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5 text-[10px] font-bold uppercase text-slate-400">
                              <th className="pb-3 pr-2">Strategy Option</th>
                              <th className="pb-3 px-2 text-right">Interest Saved</th>
                              <th className="pb-3 px-2 text-right">Months Saved</th>
                              <th className="pb-3 px-2 text-right">Extra/Mo commitment</th>
                              <th className="pb-3 px-2 text-right">Stress Index</th>
                              <th className="pb-3 pl-2 text-right">Overall Score</th>
                            </tr>
                          </thead>
                          <tbody className="font-semibold text-[#0B1530] dark:text-slate-300">
                            {/* Conservative */}
                            <tr className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                              <td className="py-3.5 pr-2">
                                <span className="block font-bold text-slate-700 dark:text-white">Conservative Tier</span>
                                <span className="text-[10px] text-slate-400 font-medium">{optimizationResults.scenarios.conservative.strategyName}</span>
                              </td>
                              <td className="py-3.5 px-2 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(optimizationResults.scenarios.conservative.interestSaved)}</td>
                              <td className="py-3.5 px-2 text-right">{optimizationResults.scenarios.conservative.tenureSaved} mo</td>
                              <td className="py-3.5 px-2 text-right">{formatCurrency(optimizationResults.scenarios.conservative.extraMonthlyCommitment)}</td>
                              <td className="py-3.5 px-2 text-right text-rose-500">{optimizationResults.scenarios.conservative.financialStress}/100</td>
                              <td className="py-3.5 pl-2 text-right font-bold text-emerald-500">{optimizationResults.scenarios.conservative.overallScore}</td>
                            </tr>
                            
                            {/* Balanced */}
                            <tr className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 bg-emerald-500/5 dark:bg-emerald-500/[0.02]">
                              <td className="py-3.5 pr-2">
                                <span className="block font-bold text-slate-700 dark:text-white flex items-center gap-1">Balanced Tier <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /></span>
                                <span className="text-[10px] text-slate-400 font-medium">{optimizationResults.scenarios.balanced.strategyName}</span>
                              </td>
                              <td className="py-3.5 px-2 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(optimizationResults.scenarios.balanced.interestSaved)}</td>
                              <td className="py-3.5 px-2 text-right">{optimizationResults.scenarios.balanced.tenureSaved} mo</td>
                              <td className="py-3.5 px-2 text-right">{formatCurrency(optimizationResults.scenarios.balanced.extraMonthlyCommitment)}</td>
                              <td className="py-3.5 px-2 text-right text-amber-500">{optimizationResults.scenarios.balanced.financialStress}/100</td>
                              <td className="py-3.5 pl-2 text-right font-bold text-emerald-500">{optimizationResults.scenarios.balanced.overallScore}</td>
                            </tr>

                            {/* Aggressive */}
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                              <td className="py-3.5 pr-2">
                                <span className="block font-bold text-slate-700 dark:text-white">Aggressive Tier</span>
                                <span className="text-[10px] text-slate-400 font-medium">{optimizationResults.scenarios.aggressive.strategyName}</span>
                              </td>
                              <td className="py-3.5 px-2 text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(optimizationResults.scenarios.aggressive.interestSaved)}</td>
                              <td className="py-3.5 px-2 text-right">{optimizationResults.scenarios.aggressive.tenureSaved} mo</td>
                              <td className="py-3.5 px-2 text-right">{formatCurrency(optimizationResults.scenarios.aggressive.extraMonthlyCommitment)}</td>
                              <td className="py-3.5 px-2 text-right text-rose-500">{optimizationResults.scenarios.aggressive.financialStress}/100</td>
                              <td className="py-3.5 pl-2 text-right font-bold text-emerald-500">{optimizationResults.scenarios.aggressive.overallScore}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Dynamic Insights list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {smartInsights.slice(0, 2).map((ins, i) => (
                        <div key={i} className="p-4 bg-[#64748B]/5 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 rounded-xl flex items-start gap-3">
                          <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{ins}</p>
                        </div>
                      ))}
                    </div>

                  </div>


              </div>
            </div>

          </div>
        </main>
        <Footer />
      </SmoothScroll>
    </div>
  );
};

export default PrepaymentCalculatorPage;
