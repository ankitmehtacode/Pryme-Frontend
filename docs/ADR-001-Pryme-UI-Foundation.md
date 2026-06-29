# ADR-001 — Pryme UI Foundation

**Status:** Accepted
**Date:** 2026-06-29

## Context
The previous Auth page layout was built iteratively with page-specific variables (e.g., `--auth-page-pad-x`). As the product grows, building individual pages with ad-hoc layout logic leads to visual inconsistencies, increased bundle size, and high maintenance overhead. We need a systematic way to ensure every authenticated page (Auth, Dashboard, Profile, Admin) inherits the exact same spatial language and optical composition across every viewport.

## Decision
We have established the **Pryme UI Foundation** as a strictly layered, composition-based design system that replaces page-specific abstractions with generic, reusable primitives.

### 1. Token Hierarchy (The "Why")
Tokens are decoupled from components through a 4-tier architecture to support future themes and white-labeling:
- **Brand Layer:** Hardcoded core values (e.g., `--brand-primary`).
- **Theme Layer:** Maps Brand to Theme slots (e.g., `--theme-primary: var(--brand-primary)`).
- **Semantic Layer:** Intent-based meaning (e.g., `--color-primary: var(--theme-primary)`).
- **Component Layer:** Consumes only Semantic tokens.

### 2. Layer Responsibilities
- **Foundation:** Global CSS tokens, resets, typography scales (`index.css`).
- **Primitives:** Zero-logic, layout-only React components (`PageShell`, `Surface`, `Stack`, `Inline`, `ContentContainer`).
- **Compositions:** Reusable structures combining primitives (`SplitLayout`, `MediaPanel`, `AuthLayout`).
- **Product:** Feature implementation (`Auth.tsx`), which orchestrates business logic and consumes compositions.

### 3. Primitive Philosophy
Primitives must:
- Have a single responsibility (e.g., `Stack` only handles vertical flow).
- Contain zero product-specific logic, imports, or text.
- Use only semantic tokens—no raw pixel values.
- Expose a minimal, stable public API.

### 4. Composition Philosophy
Compositions (like `SplitLayout`) should define structural relationships natively without relying on heavy JS calculations. Instead of monolithic prop drilling (e.g., `<MediaPanel src={img} />`), we use "layout slots" (e.g., `<MediaPanel><AuthHeroArtwork /></MediaPanel>`) to remain resilient against future rendering shifts (Canvas, Lottie, etc.).

### 5. Migration Strategy
1. **Foundation (Phase 1):** Semantic tokens defined. Legacy `--auth-*` tokens aliased.
2. **Primitives (Phase 2):** Build `PageShell`, `Surface`, `Stack`, `Inline`, `ContentContainer`.
3. **Auth Migration (Phase 3):** Build `MediaPanel` and `SplitLayout`. Refactor `Auth.tsx`.
4. **Stabilization (Phase 3.5):** Audit, document, freeze API, and capture baselines.
5. **Product Rollout (Phase 4):** Migrate remaining pages sequentially.

### Rules for Future Contributors
1. **Never invent component-specific tokens** (no `--button-padding`). Use semantic names (`--space-3`).
2. **Never hardcode raw pixels** in layout components.
3. **Do not nest `PageShell`** components.
4. **Do not use `Stack` for horizontal layouts;** use `Inline`.
5. **Do not pass domain-specific props** (e.g., `isLoggedIn`) to primitives.

## Consequences
- **Positive:** Guaranteed optical consistency across all viewport sizes. Minimal UI code footprint per page. Clear architectural boundaries.
- **Negative:** Steeper initial learning curve for engineers accustomed to inline Tailwind magic values. Requires strict PR discipline to enforce token usage.
