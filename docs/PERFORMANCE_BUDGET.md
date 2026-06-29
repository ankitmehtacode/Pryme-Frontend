# Pryme UI Foundation — Performance Budget

As we scale the engineering platform, performance must be treated as a feature. This document establishes baselines and strict budgets for bundle size, build times, and Core Web Vitals to prevent gradual degradation as the application grows.

## Core Web Vitals Goals (Target)
- **Largest Contentful Paint (LCP):** < 2.5s (Good)
- **Cumulative Layout Shift (CLS):** < 0.1 (Good)
- **Interaction to Next Paint (INP):** < 200ms (Good)

## Baseline Metrics (v1.0.0 Release)
*Recorded on: June 2026*

### Build Performance
- **Production Build Time:** ~8.7s

### Bundle Size (Gzipped)
- **Total Application:** ~410 kB (Largest chunk: vendor-charts)
- **App entry:** ~36 kB
- **Dashboard:** ~9.7 kB
- **Auth:** ~6.4 kB

## Strict Budgets
Any Pull Request that causes these budgets to be exceeded MUST be rejected during the `Architecture Review` phase.

1. **Vendor Chunk Limits:**
   - No single vendor chunk should exceed **150 kB (gzipped)**. (Currently charts is the only exception and needs code-splitting evaluation).
2. **Feature Route Limits:**
   - New feature routes (e.g., Settings, Admin) must not exceed **20 kB (gzipped)** of custom logic per chunk.
3. **Foundation CSS Limits:**
   - The global `index.css` (including Tailwind output + Semantic tokens) must remain under **15 kB (gzipped)**.

## Enforcement
To keep PR sizes manageable and avoid silent bloat:
- Import components directly rather than through barrel files if it breaks tree-shaking.
- Ensure Storybook and testing dependencies NEVER leak into the production bundle.
- Rely on our `check:architecture` script and future CI bundle size monitors to fail builds that break the budget.
