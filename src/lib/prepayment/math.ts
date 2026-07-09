/**
 * Pure mathematical functions for financial calculations.
 */

/**
 * Calculate Equated Monthly Installment (EMI) using standard formula:
 * EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateEmi(principal: number, annualRate: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRate <= 0) return principal / tenureMonths;

  const r = annualRate / 12 / 100;
  const n = tenureMonths;

  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return isNaN(emi) || !isFinite(emi) ? 0 : emi;
}

/**
 * Calculates interest for a given outstanding balance and rate for one month.
 */
export function calculateMonthlyInterest(balance: number, annualRate: number): number {
  if (balance <= 0 || annualRate <= 0) return 0;
  return balance * (annualRate / 12 / 100);
}

/**
 * Compute compound interest ROI or effective multiplier metrics.
 */
export function calculatePrepaymentMultiplier(interestSaved: number, totalPrepaid: number): number {
  if (totalPrepaid <= 0) return 0;
  // Multiplier represents how many rupees are saved in interest for every rupee prepaid
  return interestSaved / totalPrepaid;
}

/**
 * Calculate Loan Health Score out of 100 based on standard ratios.
 */
export function computeLoanHealthScore(
  originalPrincipal: number,
  currentBalance: number,
  interestPaid: number,
  interestOriginal: number,
  monthlyIncome: number,
  emi: number,
  tenureRemaining: number,
  emergencySavingsMonths: number,
  strategyScore: number
): number {
  // 1. Interest Burden Ratio (Max 30 points)
  // Low interest ratio relative to principal is good
  const interestBurdenRatio = interestOriginal / originalPrincipal;
  const interestPoints = Math.max(0, Math.min(30, 30 - interestBurdenRatio * 15));

  // 2. Debt-to-Income / EMI Burden (Max 25 points)
  // EMI / Income. Ideal is < 30%. Above 50% is critical.
  const dti = monthlyIncome > 0 ? emi / monthlyIncome : 1;
  const emiPoints = Math.max(0, Math.min(25, 25 - Math.max(0, dti - 0.25) * 60));

  // 3. Remaining Tenure (Max 20 points)
  // Sorter tenure = better score
  const tenureYears = tenureRemaining / 12;
  const tenurePoints = Math.max(0, Math.min(20, 20 - tenureYears * 0.8));

  // 4. Liquidity Health (Max 15 points)
  // 6+ months of emergency savings is max points.
  const liquidityPoints = Math.min(15, emergencySavingsMonths * 2.5);

  // 5. Strategy Quality (Max 10 points)
  const strategyPoints = Math.max(0, Math.min(10, strategyScore * 10));

  const totalScore = interestPoints + emiPoints + tenurePoints + liquidityPoints + strategyPoints;
  return Math.round(Math.max(0, Math.min(100, totalScore)));
}
