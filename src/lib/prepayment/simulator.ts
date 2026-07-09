import {
  UserProfile,
  StrategyDefinition,
  LoanEvent,
  SimulationResult,
  AmortizationEntry,
  RiskMetrics
} from "./types";
import { calculateEmi, calculateMonthlyInterest, computeLoanHealthScore } from "./math";
import { projectEventsTimeline } from "./events";

// Convert emergency savings tier to numerical months
export function savingsTierToMonths(tier: string): number {
  switch (tier) {
    case "less-3": return 1.5;
    case "3-6": return 4.5;
    case "6-12": return 9;
    case "12-plus": return 15;
    default: return 3;
  }
}

/**
 * Runs a high-fidelity monthly simulation for a given loan profile and strategy.
 */
export function simulateLoan(
  profile: UserProfile,
  strategy: StrategyDefinition,
  events: LoanEvent[] = []
): SimulationResult {
  const isBaseline = strategy.id === "baseline";
  const projections = projectEventsTimeline(profile, events);

  // Initial parameters
  let balance = profile.loanAmount;
  let currentRate = profile.interestRate;
  const originalMonths = profile.tenureMonths;

  // Track variables
  let totalPaid = 0;
  let interestPaid = 0;
  let totalPrepayment = 0;
  let monthsToPayOff = 0;
  const amortization: AmortizationEntry[] = [];

  // Emergency savings pool (starts with standard user multiplier)
  const initialSavingsMonths = savingsTierToMonths(profile.emergencySavingsMonths);
  const baseMonthlyExpenses = profile.monthlyExpenses;
  let cashReservePool = profile.monthlyIncome * initialSavingsMonths;

  // Standard baseline calculation first to compute savings comparison
  const baseEmi = calculateEmi(profile.loanAmount, profile.interestRate, originalMonths);

  // Perform simulation up to 480 months (40 years) to capture worst-case edge cases safely
  for (let m = 1; m <= 480; m++) {
    if (balance <= 0.01) {
      break;
    }

    monthsToPayOff = m;

    // 1. Fetch active interest rate for this month (incorporating historical RATE_CHANGED events)
    if (projections.interestRateTimeline[m] !== undefined) {
      currentRate = projections.interestRateTimeline[m];
    } else if (projections.interestRateTimeline[0] !== undefined && m === 1) {
      currentRate = projections.interestRateTimeline[0];
    }

    // 2. Fetch active cash flow for this month (incorporating INCOME_CHANGED events)
    let activeIncome = profile.monthlyIncome;
    let activeExpenses = profile.monthlyExpenses;
    if (projections.incomeTimeline[m] !== undefined) {
      activeIncome = projections.incomeTimeline[m].income;
      activeExpenses = projections.incomeTimeline[m].expenses;
    }

    const currentMonthlySurplus = Math.max(0, activeIncome - activeExpenses);

    // Recalculate EMI if rate changed (Floating Rate Simulation)
    let currentEmi = baseEmi;
    if (currentRate !== profile.interestRate) {
      currentEmi = calculateEmi(balance, currentRate, Math.max(1, originalMonths - m + 1));
    }

    // Calculate monthly interest charge
    const interestForMonth = calculateMonthlyInterest(balance, currentRate);
    
    // Regular payment this month (must cover interest first, clamped by balance + interest)
    const emiPayment = Math.min(Math.max(currentEmi, interestForMonth), balance + interestForMonth);
    const principalPaidFromEmi = emiPayment - interestForMonth;

    totalPaid += emiPayment;
    interestPaid += interestForMonth;
    balance -= principalPaidFromEmi;

    let prepaymentMade = 0;

    // Apply prepayments (Only if not baseline)
    if (!isBaseline && balance > 0) {
      let potentialPrepayment = 0;

      // Rule A: Apply plug-and-play strategy rule sets
      strategy.rules.forEach((rule) => {
        if (rule.trigger === "one_time" || (rule.trigger === "step_up" && m > 1 && m % 12 === 1)) {
          potentialPrepayment += rule.valueExpression({ month: m, balance, currentEmi, profile });
        } else if (rule.trigger === "months_interval" && rule.interval && m % rule.interval === 0) {
          potentialPrepayment += rule.valueExpression({ month: m, balance, currentEmi, profile });
        }
      });

      // Rule B: Apply scheduled one-time windfalls or bonuses from event timelines
      if (projections.oneTimePrepayments[m]) {
        projections.oneTimePrepayments[m].forEach((pf) => {
          potentialPrepayment += pf.amount;
        });
      }

      // --- CONSTRAINT ENGINE (Liquidity, Affordability, and Surplus safety guards) ---
      
      // Constraint 1: Affordability Surplus Clamp
      // Prepayment cannot exceed available monthly savings surplus after EMI is paid
      const availableSurplus = Math.max(0, currentMonthlySurplus - emiPayment);
      let clampedPrepayment = Math.min(potentialPrepayment, availableSurplus + (projections.oneTimePrepayments[m] ? potentialPrepayment : 0));

      // Constraint 2: Emergency Savings Guard
      // Prepayment must not dry up emergency cash pool below 3 months of expenses
      const safetyBufferLimit = baseMonthlyExpenses * 3.0;
      const projectedPoolAfterPrepayment = cashReservePool + (currentMonthlySurplus - emiPayment - clampedPrepayment) - clampedPrepayment;

      if (projectedPoolAfterPrepayment < safetyBufferLimit) {
        // Clamp prepayment so reserves remain safe
        const allowedPrepaymentFromReserves = Math.max(0, cashReservePool + (currentMonthlySurplus - emiPayment) - safetyBufferLimit);
        clampedPrepayment = Math.min(clampedPrepayment, allowedPrepaymentFromReserves);
      }

      // Apply the final validated prepayment
      if (clampedPrepayment > 0) {
        const actualPrepayment = Math.min(clampedPrepayment, balance);
        balance -= actualPrepayment;
        totalPaid += actualPrepayment;
        totalPrepayment += actualPrepayment;
        prepaymentMade = actualPrepayment;

        // Deduct from reserves
        cashReservePool -= actualPrepayment;
      }
    }

    // Accrue leftover surplus to reserves
    cashReservePool += Math.max(0, currentMonthlySurplus - emiPayment - prepaymentMade);

    // Save amortization detail
    amortization.push({
      month: m,
      balanceBefore: balance + principalPaidFromEmi + prepaymentMade,
      interest: interestForMonth,
      emi: emiPayment,
      prepayment: prepaymentMade,
      balanceAfter: balance,
      cumulativeInterest: interestPaid,
      cumulativePrepayment: totalPrepayment,
    });
  }

  // Calculate final output variables
  const baselineResult = isBaseline
    ? null
    : simulateLoan(profile, { id: "baseline", name: "Baseline", description: "", rules: [] }, events);

  const baselineInterest = baselineResult ? baselineResult.interestPaid : interestPaid;
  const interestSaved = Math.max(0, baselineInterest - interestPaid);
  const tenureSaved = Math.max(0, originalMonths - monthsToPayOff);

  // Computations for Risk Metrics
  const emiRatio = profile.monthlyIncome > 0 ? baseEmi / profile.monthlyIncome : 0;
  
  const liquidityRisk = cashReservePool < (profile.monthlyExpenses * 3) ? 80 : 20;
  const cashflowRisk = (baseEmi + (totalPrepayment / Math.max(1, monthsToPayOff))) / Math.max(1, profile.monthlyIncome) > 0.5 ? 70 : 30;
  const rateRisk = currentRate > profile.interestRate ? 65 : 30;
  const incomeRisk = emiRatio > 0.4 ? 75 : 25;
  const behavioralRisk = totalPrepayment === 0 ? 50 : 15;

  const riskScore = Math.round(100 - (liquidityRisk + cashflowRisk + rateRisk + incomeRisk + behavioralRisk) / 5);
  const financialStress = Math.round((emiRatio * 60) + (liquidityRisk * 0.4));

  // ROI equivalent to avoid interest rate p.a.
  const roi = currentRate;
  const effectiveMultiplier = totalPrepayment > 0 ? Number((interestSaved / totalPrepayment).toFixed(2)) : 0;

  // Placeholder explainability payload filled in by explainability module later
  const explainability = {
    whyText: "",
    whyNotText: "",
    tradeoffs: [],
    confidence: 0,
  };

  return {
    strategyId: strategy.id,
    strategyName: strategy.name,
    strategyDescription: strategy.description,
    isBaseline,
    totalPaid: Math.round(totalPaid),
    interestPaid: Math.round(interestPaid),
    interestSaved: Math.round(interestSaved),
    monthsToPayOff,
    tenureSaved,
    extraMonthlyCommitment: isBaseline ? 0 : Math.round(totalPrepayment / Math.max(1, monthsToPayOff)),
    liquidityScore: Math.round(Math.min(100, (cashReservePool / (profile.monthlyExpenses * 6)) * 100)),
    riskScore,
    financialStress,
    overallScore: 0, // Assigned by optimizer
    roi,
    effectiveMultiplier,
    amortization,
    explainability,
  };
}
