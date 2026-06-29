# Pryme Engineering PR Checklist

Use this checklist as the objective standard for all Pull Requests touching the UI, Foundation, or Domain layers. This removes subjectivity from Staff Engineering reviews.

## 1. Architectural Fitness (Foundation)
- [ ] Uses **semantic tokens** only. No raw spacing/colors (e.g. `p-4`, `text-blue-500`) are introduced.
- [ ] Uses **layout primitives** (`PageShell`, `Surface`, `Stack`, `Inline`, `ContentContainer`, `SplitLayout`, `MediaPanel`) instead of defining ad-hoc grid/flex structures for high-level pages.
- [ ] No feature code or domain logic is imported into `src/components/layout`.
- [ ] Passes `npm run check:architecture`.

## 2. Accessibility (A11y)
- [ ] Can navigate all new interactive elements **using only the keyboard** (Tab/Shift+Tab).
- [ ] Focus states are clearly visible on all interactive elements.
- [ ] **Screen Reader Sanity Check**: `aria-labels` and `roles` are present where semantic HTML is insufficient.
- [ ] Meets **WCAG AA Color Contrast** ratios.
- [ ] Page handles **200% browser zoom** without overlapping or horizontal scrolling.
- [ ] Follows `prefers-reduced-motion` logic (no jarring animations if the user has requested reduced motion).

## 3. Performance
- [ ] New dependencies were verified for bundle size bloat.
- [ ] Avoids unnecessary re-renders in React (e.g. properly utilizing `memo`, `useMemo`, `useCallback` where provably needed).
- [ ] Images/Assets are optimized and lazy-loaded if offscreen.

## 4. Code Quality & Testing
- [ ] No ESLint/TypeScript warnings introduced.
- [ ] Follows the single responsibility principle for components.
- [ ] Visual regression testing approved (no unintended side-effects on existing pages).
- [ ] **Storybook**: If modifying or adding a foundation primitive, the Storybook story was updated.

## 5. Migration Strategy (If applicable)
- [ ] If this PR deprecates an old pattern, are all aliases and references properly documented or removed?

---
*By submitting this PR, the author confirms they have manually verified these points.*
