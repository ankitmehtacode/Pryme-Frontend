import { LoanEvent, UserProfile } from "./types";

export interface TimelineProjections {
  interestRateTimeline: Record<number, number>; // month -> rate
  incomeTimeline: Record<number, { income: number; expenses: number }>; // month -> cashflow
  oneTimePrepayments: Record<number, Array<{ amount: number; label: string }>>; // month -> list of windfalls
  refinanceTimeline: Record<number, { amount?: number; newRate?: number; newTenure?: number }>; // month -> refinance info
}

/**
 * Projects a stream of loan events into monthly lookup maps.
 */
export function projectEventsTimeline(
  profile: UserProfile,
  events: LoanEvent[]
): TimelineProjections {
  const interestRateTimeline: Record<number, number> = {};
  const incomeTimeline: Record<number, { income: number; expenses: number }> = {};
  const oneTimePrepayments: Record<number, Array<{ amount: number; label: string }>> = {};
  const refinanceTimeline: Record<number, { amount?: number; newRate?: number; newTenure?: number }> = {};

  // Sort events chronologically by month index
  const sortedEvents = [...events].sort((a, b) => a.monthIndex - b.monthIndex);

  // Initialize month 0 values from the initial profile
  interestRateTimeline[0] = profile.interestRate;
  incomeTimeline[0] = { income: profile.monthlyIncome, expenses: profile.monthlyExpenses };

  // Map absolute bonuses to months
  profile.bonuses.forEach((bonus) => {
    if (!oneTimePrepayments[bonus.monthIndex]) {
      oneTimePrepayments[bonus.monthIndex] = [];
    }
    oneTimePrepayments[bonus.monthIndex].push({
      amount: bonus.amount,
      label: `${bonus.label} (${bonus.type.toUpperCase()})`,
    });
  });

  // Map future lifestyle events (promotions, expense increases, one-time inflows)
  profile.futureEvents.forEach((ev) => {
    if (ev.type === "promotion") {
      // In the simulator, this will update the active income record
    } else if (ev.type === "one_time_inflow") {
      if (!oneTimePrepayments[ev.monthIndex]) {
        oneTimePrepayments[ev.monthIndex] = [];
      }
      oneTimePrepayments[ev.monthIndex].push({
        amount: ev.amount,
        label: ev.label,
      });
    }
  });

  // Process event stream
  sortedEvents.forEach((event) => {
    const month = event.monthIndex;

    switch (event.type) {
      case "RATE_CHANGED":
        if (event.payload.rate !== undefined) {
          interestRateTimeline[month] = event.payload.rate;
        }
        break;
      case "INCOME_CHANGED":
        if (event.payload.income !== undefined || event.payload.expenses !== undefined) {
          incomeTimeline[month] = {
            income: event.payload.income ?? (incomeTimeline[month - 1]?.income ?? profile.monthlyIncome),
            expenses: event.payload.expenses ?? (incomeTimeline[month - 1]?.expenses ?? profile.monthlyExpenses),
          };
        }
        break;
      case "PREPAYMENT_EVENT":
        if (event.payload.amount !== undefined) {
          const isRec = event.payload.isRecurring ?? false;
          if (isRec && event.payload.frequencyMonths) {
            const freq = event.payload.frequencyMonths;
            // Project recurring events into future months (cap at 360 months for safety)
            for (let m = month; m <= 360; m += freq) {
              if (!oneTimePrepayments[m]) oneTimePrepayments[m] = [];
              oneTimePrepayments[m].push({
                amount: event.payload.amount ?? 0,
                label: event.payload.label ?? "Recurring Prepayment",
              });
            }
          } else {
            if (!oneTimePrepayments[month]) oneTimePrepayments[month] = [];
            oneTimePrepayments[month].push({
              amount: event.payload.amount ?? 0,
              label: event.payload.label ?? "Manual Prepayment",
            });
          }
        }
        break;
      case "REFINANCE":
        refinanceTimeline[month] = {
          amount: event.payload.amount,
          newRate: event.payload.rate,
          newTenure: event.payload.frequencyMonths, // Re-using for new tenure index in months
        };
        break;
      default:
        break;
    }
  });

  return {
    interestRateTimeline,
    incomeTimeline,
    oneTimePrepayments,
    refinanceTimeline,
  };
}

/**
 * Creates an event log that can be replayed to recreate a custom simulation scenario.
 */
export function createEvent(
  type: LoanEvent["type"],
  monthIndex: number,
  payload: LoanEvent["payload"]
): LoanEvent {
  return {
    id: `${type}_${monthIndex}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    monthIndex,
    date: `Month ${monthIndex}`,
    payload,
  };
}
