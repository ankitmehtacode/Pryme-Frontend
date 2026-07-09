import { StrategyDefinition, PrepaymentRule, UserProfile } from "./types";

// Standard Strategy definition helper
export function createStrategy(
  id: string,
  name: string,
  description: string,
  rules: PrepaymentRule[]
): StrategyDefinition {
  return { id, name, description, rules };
}

// 1. Baseline Strategy: No prepayment
export const BaselineStrategy = createStrategy(
  "baseline",
  "Current Plan",
  "Standard loan repayment according to the bank agreement without early prepayments.",
  []
);

// 2. Lump Sum Strategy
export const createLumpSumStrategy = (amount: number, monthIndex: number) =>
  createStrategy(
    "lump-sum",
    "Lump-Sum Prepayment",
    `One-time payment of ₹${amount.toLocaleString("en-IN")} in Month ${monthIndex}.`,
    [
      {
        trigger: "one_time",
        valueExpression: ({ month }) => (month === monthIndex ? amount : 0),
      },
    ]
  );

// 3. Extra Monthly EMI Strategy
export const createExtraEmiStrategy = (extraAmount: number) =>
  createStrategy(
    "extra-emi",
    "Accelerated Monthly Payments",
    `Contributing an extra ₹${extraAmount.toLocaleString("en-IN")} every single month.`,
    [
      {
        trigger: "months_interval",
        interval: 1,
        valueExpression: () => extraAmount,
      },
    ]
  );

// 4. 13th EMI Strategy
export const create13thEmiStrategy = () =>
  createStrategy(
    "thirteenth-emi",
    "13th EMI Annual Strategy",
    "Paying one extra standard monthly payment at the end of every 12-month period.",
    [
      {
        trigger: "months_interval",
        interval: 12,
        valueExpression: ({ currentEmi }) => currentEmi,
      },
    ]
  );

// 5. Annual Step-Up Strategy
export const createStepUpStrategy = (stepUpPercentage: number) =>
  createStrategy(
    "step-up",
    "Annual Step-Up Strategy",
    `Increasing the monthly payment amount by ${stepUpPercentage}% at the end of every 12 months.`,
    [
      {
        trigger: "step_up",
        valueExpression: ({ month, currentEmi, balance }) => {
          if (month > 1 && month % 12 === 1) {
            const increment = currentEmi * (stepUpPercentage / 100);
            return Math.min(increment, balance);
          }
          return 0;
        },
      },
    ]
  );

// 6. Bi-Weekly Acceleration Strategy
// Simulates paying every two weeks by contributing an extra 1/12th of standard EMI each month.
export const createBiWeeklyStrategy = () =>
  createStrategy(
    "bi-weekly",
    "Bi-Weekly Payment Equivalent",
    "Simulates bi-weekly schedules (26 half-payments) by adding an extra 8.33% to your EMI each month.",
    [
      {
        trigger: "months_interval",
        interval: 1,
        valueExpression: ({ currentEmi }) => currentEmi * (1 / 12),
      },
    ]
  );

// 7. Hybrid Strategy (The Pryme Peak Combo)
// Combines a 5% step-up + a recurring extra monthly flow + annual bonus matched matching.
export const createHybridStrategy = (extraMonthly: number, stepUpPercent: number) =>
  createStrategy(
    "hybrid",
    "Pryme Hybrid Strategy (Optimal ROI)",
    `Combines an extra ₹${extraMonthly.toLocaleString("en-IN")}/mo, a ${stepUpPercent}% yearly step-up, and automated 13th EMI contribution.`,
    [
      // Extra monthly flow
      {
        trigger: "months_interval",
        interval: 1,
        valueExpression: () => extraMonthly,
      },
      // 5% Step-Up increment
      {
        trigger: "step_up",
        valueExpression: ({ month, currentEmi, balance }) => {
          if (month > 1 && month % 12 === 1) {
            const increment = currentEmi * (stepUpPercent / 100);
            return Math.min(increment, balance);
          }
          return 0;
        },
      },
      // Thirteenth EMI at month 12, 24, 36...
      {
        trigger: "months_interval",
        interval: 12,
        valueExpression: ({ currentEmi }) => currentEmi * 0.5, // 50% extra EMI to keep stress low
      },
    ]
  );

/**
 * Returns available system strategies dynamically generated.
 */
export function getStrategiesForUser(profile: UserProfile): StrategyDefinition[] {
  const surplus = Math.max(0, profile.monthlyIncome - profile.monthlyExpenses - calculateBaseEmi(profile));
  const suggestedExtra = Math.min(profile.monthlyExtraSavings, surplus * 0.8);
  const safeLumpSum = Math.round(profile.loanAmount * 0.05); // 5% of loan balance

  return [
    BaselineStrategy,
    createLumpSumStrategy(safeLumpSum, 12),
    createExtraEmiStrategy(suggestedExtra > 0 ? suggestedExtra : 2000),
    create13thEmiStrategy(),
    createStepUpStrategy(5),
    createBiWeeklyStrategy(),
    createHybridStrategy(suggestedExtra > 0 ? suggestedExtra * 0.6 : 1000, 5),
  ];
}

// Helper math internally for standard EMI calculation before simulation
function calculateBaseEmi(profile: UserProfile): number {
  const r = profile.interestRate / 12 / 100;
  const n = profile.tenureMonths;
  if (r === 0) return profile.loanAmount / n;
  return (profile.loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}
