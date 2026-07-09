import { SimulationResult, GoalType, ExplainabilityDetails } from "./types";

/**
 * Generates deterministic financial insights and explainability details.
 */
export function generateExplainability(
  result: SimulationResult,
  bestResult: SimulationResult,
  goal: GoalType,
  confidence: number
): ExplainabilityDetails {
  const isBest = result.strategyId === bestResult.strategyId;
  const tradeoffs: string[] = [];

  let whyText = "";
  let whyNotText = "";

  // 1. Generate explanation context for the Chosen Strategy
  if (isBest) {
    whyText = `Recommended because it yields the highest lifetime score matching your priority of "${goal.replace("-", " ").toUpperCase()}". It structures cashflow to save interest without drying up emergency funds.`;
    whyNotText = "Alternative strategies underperform this recommendation either by saving less interest or by creating excessive stress.";

    if (result.strategyId === "hybrid") {
      tradeoffs.push("Requires a steady commitment of annual step-ups and extra monthly flows.");
      tradeoffs.push("Maintains a stable emergency cash reserve above 3 months of expenses.");
    } else if (result.strategyId === "extra-emi") {
      tradeoffs.push("Requires a constant monthly cash surplus reduction.");
      tradeoffs.push("Saves substantial interest while maintaining complete simplicity.");
    } else {
      tradeoffs.push("Undergoes standard tenure reduction dynamics.");
    }
  } else {
    // 2. Generate explainability for REJECTED alternative strategies
    whyText = `Saves ₹${result.interestSaved.toLocaleString("en-IN")} in interest, but fails to optimize for your goal.`;

    if (result.strategyId === "lump-sum") {
      whyNotText = "Rejected because bulk lump-sum payments dry up liquid emergency reserves too rapidly in early years, leaving you vulnerable to cashflow shocks.";
      tradeoffs.push("Saves interest early but drastically reduces liquid bank reserves.");
    } else if (result.strategyId === "step-up") {
      whyNotText = "Step-up increments compound monthly commitments over time. This increases cashflow risk in later years if income fluctuates.";
      tradeoffs.push("Low initial commitment, but builds significant financial pressure later.");
    } else if (result.strategyId === "thirteenth-emi") {
      whyNotText = "Underperforms the hybrid peak strategy. Adding a small monthly step-up saves significantly more without changing your 13th EMI frequency.";
      tradeoffs.push("Highly convenient strategy, but leaves money on the table.");
    } else {
      whyNotText = `Provides lower overall financial utility than the optimized ${bestResult.strategyName} strategy.`;
      tradeoffs.push("Provides sub-optimal savings-to-effort ratio.");
    }
  }

  // Common positive tradeoff always computed:
  if (result.interestSaved > 0) {
    tradeoffs.push(`Every ₹1 prepaid saves ₹${result.effectiveMultiplier} in compounding future interest charges.`);
  }

  return {
    whyText,
    whyNotText,
    tradeoffs,
    confidence: isBest ? confidence : Math.max(10, confidence - 20),
  };
}

/**
 * Returns dynamic insights that rotate or display on the interface.
 */
export function getSmartInsights(result: SimulationResult, baseline: SimulationResult): string[] {
  const insights: string[] = [];

  if (result.interestSaved > 0) {
    insights.push(`Your loan becomes interest-light after month ${Math.round(result.monthsToPayOff * 0.45)} under this strategy, compared to month ${Math.round(baseline.monthsToPayOff * 0.45)} normally.`);
    insights.push(`Every ₹10,000 prepaid today saves ₹${Math.round(result.effectiveMultiplier * 10000).toLocaleString("en-IN")} in future interest.`);
    insights.push(`By choosing the recommended acceleration, you will avoid paying ₹${result.interestSaved.toLocaleString("en-IN")} in unnecessary bank interest.`);
    insights.push(`Finishing your loan ${result.tenureSaved} months early frees up cash flow ${Math.round(result.tenureSaved / 12)} years ahead of schedule.`);
  } else {
    insights.push("No prepayment strategy active. Running the baseline amortization schedule.");
  }

  return insights;
}
