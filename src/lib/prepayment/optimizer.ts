import {
  UserProfile,
  GoalType,
  SimulationResult,
  SensitivityResult,
  StrategyDefinition
} from "./types";
import { simulateLoan } from "./simulator";
import { getStrategiesForUser } from "./strategies";
import { generateExplainability } from "./explainability";

/**
 * Returns dynamic weights based on the user's primary goal profile.
 */
export function getGoalWeights(goal: GoalType): {
  interest: number;
  time: number;
  liquidity: number;
  stress: number;
} {
  switch (goal) {
    case "max-savings":
      return { interest: 0.50, time: 0.30, liquidity: 0.10, stress: 0.10 };
    case "earliest-payoff":
      return { interest: 0.25, time: 0.55, liquidity: 0.10, stress: 0.10 };
    case "preserve-liquidity":
      return { interest: 0.15, time: 0.15, liquidity: 0.50, stress: 0.20 };
    case "stress-free":
      return { interest: 0.10, time: 0.10, liquidity: 0.30, stress: 0.50 };
    default:
      return { interest: 0.30, time: 0.30, liquidity: 0.20, stress: 0.20 };
  }
}

/**
 * Score a single strategy result using the adaptive goal weights.
 */
export function scoreStrategy(
  result: SimulationResult,
  goal: GoalType,
  baseline: SimulationResult
): number {
  const weights = getGoalWeights(goal);

  // Normalize scores (0 to 100)
  // 1. Interest Saving Score (relative to maximum possible saving or baseline interest)
  const interestSavingRatio = baseline.interestPaid > 0 ? result.interestSaved / baseline.interestPaid : 0;
  const interestScore = Math.min(100, interestSavingRatio * 100);

  // 2. Time Saving Score (relative to original months)
  const timeSavingRatio = baseline.monthsToPayOff > 0 ? result.tenureSaved / baseline.monthsToPayOff : 0;
  const timeScore = Math.min(100, timeSavingRatio * 100);

  // 3. Liquidity Score (normalized in simulator)
  const liquidityScore = result.liquidityScore;

  // 4. Stress Score (lower stress = higher score, so invert 100 - stress)
  const stressScore = Math.max(0, 100 - result.financialStress);

  const finalScore =
    interestScore * weights.interest +
    timeScore * weights.time +
    liquidityScore * weights.liquidity +
    stressScore * weights.stress;

  return Math.round(Math.max(0, Math.min(100, finalScore)));
}

/**
 * Filters out dominated solutions to keep only the Pareto frontier.
 * A solution is dominated if there is another solution that is better in ALL dimensions.
 */
export function filterParetoFrontier(results: SimulationResult[]): SimulationResult[] {
  return results.filter((candidate) => {
    // Check if any other candidate dominates this one
    const isDominated = results.some((other) => {
      if (candidate.strategyId === other.strategyId) return false;

      // Check if "other" is better or equal in ALL metrics, and strictly better in at least one
      const betterInAll =
        other.interestSaved >= candidate.interestSaved &&
        other.tenureSaved >= candidate.tenureSaved &&
        other.liquidityScore >= candidate.liquidityScore &&
        other.riskScore >= candidate.riskScore &&
        other.financialStress <= candidate.financialStress;

      const strictlyBetterInAtLeastOne =
        other.interestSaved > candidate.interestSaved ||
        other.tenureSaved > candidate.tenureSaved ||
        other.liquidityScore > candidate.liquidityScore ||
        other.riskScore > candidate.riskScore ||
        other.financialStress < candidate.financialStress;

      return betterInAll && strictlyBetterInAtLeastOne;
    });

    return !isDominated;
  });
}

export interface OptimizationOutput {
  primaryRecommendation: SimulationResult;
  paretoFrontier: SimulationResult[];
  scenarios: {
    conservative: SimulationResult;
    balanced: SimulationResult;
    aggressive: SimulationResult;
  };
  sensitivity: SensitivityResult[];
}

/**
 * Core Decision Optimization Pipeline.
 * Evaluates candidate strategies, scores them adaptively, builds the Pareto frontier,
 * and compiles recommendations, explanation context, and risk sensitivity analysis.
 */
export function optimizePrepayment(
  profile: UserProfile,
  goal: GoalType
): OptimizationOutput {
  const strategies = getStrategiesForUser(profile);
  
  // 1. Generate baseline
  const baselineResult = simulateLoan(profile, { id: "baseline", name: "Current Plan", description: "", rules: [] });

  // 2. Simulate all candidates
  const allResults = strategies.map((strat) => {
    return simulateLoan(profile, strat);
  });

  // 3. Score all strategies using adaptive goal weighting
  allResults.forEach((res) => {
    res.overallScore = scoreStrategy(res, goal, baselineResult);
  });

  // Sort by score descending (excluding baseline from active ranking)
  const activeResults = allResults.filter((r) => r.strategyId !== "baseline");
  activeResults.sort((a, b) => b.overallScore - a.overallScore);

  // 4. Calculate Pareto frontier
  const paretoFrontier = filterParetoFrontier(activeResults);

  // Fallback to top-scoring if Pareto frontier is empty
  const primaryRecommendation = paretoFrontier[0] || activeResults[0] || allResults[0];

  // Calculate recommendation confidence
  const secondBest = activeResults.find((r) => r.strategyId !== primaryRecommendation.strategyId);
  const confidence = secondBest
    ? Math.round(Math.max(10, Math.min(99, ((primaryRecommendation.overallScore - secondBest.overallScore) / primaryRecommendation.overallScore) * 100 + 75)))
    : 95;

  // 5. Tiered Scenarios (Conservative, Balanced, Aggressive)
  // Group strategies into risk categories based on stress/extra commitment
  const sortedByCommitment = [...activeResults].sort((a, b) => a.extraMonthlyCommitment - b.extraMonthlyCommitment);
  const conservative = sortedByCommitment[0] || allResults[0];
  const balanced = sortedByCommitment[Math.floor(sortedByCommitment.length / 2)] || allResults[0];
  const aggressive = sortedByCommitment[sortedByCommitment.length - 1] || allResults[0];

  // Generate explainability context
  allResults.forEach((res) => {
    res.explainability = generateExplainability(res, primaryRecommendation, goal, confidence);
  });

  // 6. Run Sensitivity Analysis
  const sensitivity = runSensitivityAnalysis(profile, primaryRecommendation.strategyId);

  return {
    primaryRecommendation,
    paretoFrontier,
    scenarios: {
      conservative,
      balanced,
      aggressive,
    },
    sensitivity,
  };
}

/**
 * Simulates risk stresses (rate spikes, income drop, windfall loss) to check robustness.
 */
function runSensitivityAnalysis(
  profile: UserProfile,
  strategyId: string
): SensitivityResult[] {
  const strategy = getStrategiesForUser(profile).find((s) => s.id === strategyId) || { id: "custom", name: "Custom", description: "", rules: [] };
  const baseline = simulateLoan(profile, { id: "baseline", name: "Current Plan", description: "", rules: [] });

  const runSim = (modifiedProfile: UserProfile): SimulationResult => {
    return simulateLoan(modifiedProfile, strategy);
  };

  // Case A: Interest Rate Volatility (+1% p.a.)
  const rateUp1Profile = { ...profile, interestRate: profile.interestRate + 1 };
  const rateUp1Result = runSim(rateUp1Profile);

  // Case B: Interest Rate Volatility (+2% p.a.)
  const rateUp2Profile = { ...profile, interestRate: profile.interestRate + 2 };
  const rateUp2Result = runSim(rateUp2Profile);

  // Case C: Income Drop (-20% cash surplus)
  const incomeDropProfile = {
    ...profile,
    monthlyIncome: profile.monthlyIncome * 0.8,
  };
  const incomeDropResult = runSim(incomeDropProfile);

  // Case D: Skipped Bonuses (Zero bonuses scheduled)
  const skippedBonusProfile = { ...profile, bonuses: [] };
  const skippedBonusResult = runSim(skippedBonusProfile);

  return [
    {
      parameter: "Interest Rate +1%",
      scenarioName: "1% Rate Spike",
      impactInterestSaved: rateUp1Result.interestSaved,
      impactTenureSaved: rateUp1Result.tenureSaved,
      isStillAffordable: rateUp1Result.financialStress < 75,
      stressIndex: rateUp1Result.financialStress,
    },
    {
      parameter: "Interest Rate +2%",
      scenarioName: "Severe 2% Rate Spike",
      impactInterestSaved: rateUp2Result.interestSaved,
      impactTenureSaved: rateUp2Result.tenureSaved,
      isStillAffordable: rateUp2Result.financialStress < 85,
      stressIndex: rateUp2Result.financialStress,
    },
    {
      parameter: "Salary Decrease -20%",
      scenarioName: "20% Income Decline",
      impactInterestSaved: incomeDropResult.interestSaved,
      impactTenureSaved: incomeDropResult.tenureSaved,
      isStillAffordable: incomeDropResult.financialStress < 80,
      stressIndex: incomeDropResult.financialStress,
    },
    {
      parameter: "Bonuses Skipped",
      scenarioName: "Missing Windfalls",
      impactInterestSaved: skippedBonusResult.interestSaved,
      impactTenureSaved: skippedBonusResult.tenureSaved,
      isStillAffordable: true,
      stressIndex: skippedBonusResult.financialStress,
    },
  ];
}
