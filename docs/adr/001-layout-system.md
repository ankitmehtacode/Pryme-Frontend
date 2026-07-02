# ADR 001: Layout System Architecture

## Context
A persistent full-bleed layout clipping bug appeared across the application on all desktop viewports. Dark background sections (e.g., Process, Testimonials, Trust) exhibited a strict clipping on the left side, failing to stretch edge-to-edge as intended. 

After investigation, the root cause was discovered to be an architectural flaw in layout primitive ownership. Specifically, `PageShell` owned `paddingInline`. Because `width: 100%` on full-bleed `Surface` elements resolves against the content box of their parent, every `Surface` inside `PageShell` was constrained by the padding, resulting in clipping.

## Decision
To ensure this issue never reoccurs and to establish a robust, responsive foundation, we are enforcing a strict separation of concerns within the layout primitives hierarchy.

The canonical component hierarchy for the layout must be:
```
PageShell
    └── Header
    └── Main
            └── Surface (owns background only)
                    └── Section (owns vertical rhythm only)
                            └── Container (owns horizontal rhythm only)
                                    └── Content
```

### Component Responsibilities & Invariants

#### `PageShell`
- **Owns:** Page flow, minimum heights, outer bounds.
- **Never Owns:** Horizontal padding (`paddingInline`, `px-*`), max-width constraints.

#### `Surface`
- **Owns:** Background colors, themes, decorative layers.
- **Never Owns:** Horizontal padding (`paddingInline`, `px-*`), max-width, typography.
- *Note: This applies to page-level surfaces. Nested surfaces acting as cards must still delegate padding to internal containers or use safe box models.*

#### `Section`
- **Owns:** Vertical rhythm (`padding-block`, `py-*`), container query contexts.
- **Never Owns:** Horizontal padding or constraints.

#### `Container` (The single source of truth for horizontal spacing)
- **Owns:** Horizontal gutters (`paddingInline`, `px-*`), `max-width`, auto-centering.
- **Never Owns:** Vertical spacing, background colors, flex/grid alignment.

## Consequences & Actions Taken
1. **Removed duplicate abstractions:** `ContentContainer` was functionally identical to `Container` and has been permanently removed. All usages were migrated to `Container`.
2. **Fixed padding ownership:** `PageShell` no longer applies `paddingInline`. Instead, `paddingInline` is exclusively provided by `Container`.
3. **Data attributes for testing:** Added `data-surface`, `data-section`, and `data-container` to the DOM to ensure end-to-end testing (Playwright) remains robust against CSS class refactors.
4. **Expanded regression tests:** Playwright suites now verify layout alignment natively up to ultra-wide breakpoints (3440px), checking both that surfaces are full-bleed and that containers align on a strict grid.

## Anti-Patterns to Avoid
- ❌ `PageShell`, `Surface`, or `Section` owning horizontal padding.
- ❌ Using custom utility classes (e.g., `px-4`) instead of standard `Container` sizes.
- ❌ Nesting multiple `PageShell`s.
