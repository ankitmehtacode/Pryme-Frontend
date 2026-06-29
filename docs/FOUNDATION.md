# Pryme UI Foundation

The Pryme UI Foundation is a multi-layered design system intended to unify the spatial, typographic, and interactive language across the entire authenticated product (Auth, Dashboard, Profile, Admin, etc.).

## 4-Tier Architecture

To support future themes, white-labeling, and corporate branding, we strictly decouple Brand tokens from components using four layers:

1. **Brand Layer**: Hardcoded core values (e.g., `--brand-primary`).
2. **Theme Layer**: Maps Brand tokens to Theme slots (e.g., `--theme-primary: var(--brand-primary)`).
3. **Semantic Layer**: Gives the tokens meaning (e.g., `--color-primary: var(--theme-primary)`).
4. **Component Layer**: Consumes only Semantic tokens.

## Token Naming Rules

Never invent component-specific tokens like `card-padding`, `auth-padding`, or `button-space`. This leads to chaos.

Always use semantic names describing *intent*:
- `--layout-page-inline`
- `--space-4`
- `--surface-radius`
- `--motion-standard`

## Implementation Rules

### No Raw Pixels
Never use raw pixel values or milliseconds inside layout components.
- ❌ `padding: 24px`
- ✅ `padding: var(--space-4)`
- ❌ `transition-duration: 250ms`
- ✅ `transition-duration: var(--motion-standard)`
- ❌ `border-radius: 24px`
- ✅ `border-radius: var(--surface-radius)`

### Where does this component belong?
Every component must answer which layer it belongs to:
- **Foundation**: CSS tokens, Reset, Typography scale.
- **Primitive**: Pure CSS structural abstractions (`PageShell`, `Surface`, `Stack`, `Inline`). No product logic.
- **Composition**: Reusable combinations of primitives (`SplitLayout`, `AuthLayout`). 
- **Feature/Page**: Orchestrators of business logic (`Auth.tsx`). Zero layout responsibility.

If the answer isn't obvious, the component belongs in the wrong layer.

## API Freeze & Maturity Model

Component APIs are frozen and tracked via a Maturity Model to prevent breaking changes in consuming pages.

| Component | Maturity Level | Promoted in | Notes |
| :--- | :--- | :--- | :--- |
| `PageShell` | Stable | v1.0.0-rc.1 | Handles page centering, outer spacing, and viewport padding. |
| `Surface` | Stable | v1.0.0-rc.1 | Elevated container with radius, shadow, and background. |
| `Stack` | Stable | v1.0.0-rc.1 | Vertical spacing primitive. |
| `Inline` | Stable | v1.0.0-rc.1 | Horizontal layout primitive. |
| `ContentContainer` | Stable | v1.0.0-rc.1 | Constrains readable content width. |
| `SplitLayout` | Stable | v1.0.0 | Promoted after Dashboard proving ground. |
| `MediaPanel` | Stable | v1.0.0 | Promoted after Dashboard proving ground. |

*Experimental components may have their internal implementation adjusted based on integration feedback, but the public API should remain stable.*
