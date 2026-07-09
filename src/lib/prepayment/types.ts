export type LoanEventType = "LOAN_CREATED" | "RATE_CHANGED" | "INCOME_CHANGED" | "PREPAYMENT_EVENT" | "BONUS_RECEIVED" | "REFINANCE";

export interface LoanEvent {
  id: string;
  type: LoanEventType;
  date: string; // ISO format or month index string (e.g., "month_12")
  monthIndex: number;
  payload: {
    amount?: number;
    rate?: number;
    income?: number;
    expenses?: number;
    isRecurring?: boolean;
    frequencyMonths?: number;
    label?: string;
  };
}

export type EmergencySavingsTier = "less-3" | "3-6" | "6-12" | "12-plus";
export type GoalType = "max-savings" | "earliest-payoff" | "preserve-liquidity" | "stress-free";

export interface UserProfile {
  loanAmount: number;
  interestRate: number;
  tenureMonths: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencySavingsMonths: EmergencySavingsTier;
  monthlyExtraSavings: number; // how much extra cash they can comfortably contribute
  expectedInvestmentReturn: number; // percentage (e.g. 12 for 12%)
  bonuses: Array<{
    id: string;
    type: "annual" | "quarterly" | "one-time" | "festival";
    amount: number;
    monthIndex: number; // month of the year or absolute month index
    label: string;
  }>;
  futureEvents: Array<{
    id: string;
    label: string;
    monthIndex: number;
    type: "promotion" | "expense_increase" | "one_time_inflow";
    amount: number;
  }>;
}

export interface AmortizationEntry {
  month: number;
  balanceBefore: number;
  interest: number;
  emi: number;
  prepayment: number;
  balanceAfter: number;
  cumulativeInterest: number;
  cumulativePrepayment: number;
}

export interface RiskMetrics {
  liquidityRisk: number; // 0-100 (high = bad)
  cashflowRisk: number;  // 0-100 (high = bad)
  rateRisk: number;      // 0-100 (high = bad)
  incomeRisk: number;    // 0-100 (high = bad)
  behavioralRisk: number;// 0-100 (high = bad)
}

export interface ExplainabilityDetails {
  whyText: string;
  whyNotText: string;
  tradeoffs: string[];
  confidence: number; // 0-100 percentage based on best vs runner-up gap
}

export interface SimulationResult {
  strategyId: string;
  strategyName: string;
  strategyDescription: string;
  isBaseline: boolean;
  totalPaid: number;
  interestPaid: number;
  interestSaved: number;
  monthsToPayOff: number;
  tenureSaved: number;
  extraMonthlyCommitment: number;
  liquidityScore: number; // 0-100 (high = good)
  riskScore: number;      // 0-100 (high = good / safe)
  financialStress: number;// 0-100 (high = bad stress)
  overallScore: number;   // 0-100 (weighted aggregate based on goal profile)
  roi: number;            // effective risk-free return (% rate avoided)
  effectiveMultiplier: number; // e.g. 2.84 means every ₹1 prepaid saves ₹2.84 in interest
  amortization: AmortizationEntry[];
  explainability: ExplainabilityDetails;
}

export interface SensitivityResult {
  parameter: string;
  scenarioName: string;
  impactInterestSaved: number;
  impactTenureSaved: number;
  isStillAffordable: boolean;
  stressIndex: number; // 0-100
}

export interface PrepaymentRule {
  trigger: "months_interval" | "one_time" | "annual_bonus_match" | "step_up";
  interval?: number;
  valueExpression: (context: {
    month: number;
    balance: number;
    currentEmi: number;
    profile: UserProfile;
  }) => number;
}

export interface StrategyDefinition {
  id: string;
  name: string;
  description: string;
  rules: PrepaymentRule[];
}
