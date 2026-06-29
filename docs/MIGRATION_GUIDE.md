# Pryme UI Foundation — Migration Guide

This guide details how to migrate existing authenticated pages to the new Pryme UI Foundation.

## Philosophy
The UI Foundation separates **layout** from **feature logic**. Pages should no longer contain raw Tailwind spacing classes, custom grid definitions, or pixel values for layout. Instead, pages compose generic primitives (`PageShell`, `Surface`, `Stack`, `Inline`, `ContentContainer`) to establish spatial relationships.

## Architecture Overview
The foundation consists of 4 token tiers (Brand → Theme → Semantic → Component) and layout primitives.
- **`PageShell`:** Manages page centering, max-width, and outer padding.
- **`Surface`:** Elevated container (radius, shadow, background).
- **`Stack`:** Vertical spacing.
- **`Inline`:** Horizontal layout (side-by-side).
- **`ContentContainer`:** Width constraint for optimal reading.
- **`SplitLayout`:** Intrinsic side-by-side grid.
- **`MediaPanel`:** Slot for media rendering.

## Migration Checklist
Follow these steps for every page migration:
1. Wrap the entire page in `<PageShell>`.
2. Replace nested semantic containers with `<ContentContainer>` or `<Surface>`.
3. Replace vertical flex/grid utilities with `<Stack>`.
4. Replace horizontal flex utilities with `<Inline>`.
5. Remove all raw padding/margin values (e.g., `p-8`, `mt-4`). Use semantic gap/padding tokens if necessary, but prefer primitive defaults.
6. Remove any domain-specific layout logic from the primitives.

## Before → After Examples

### Bad (Old Layout)
```tsx
<div className="min-h-screen bg-gray-50 px-4 py-8">
  <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
    <div className="flex flex-col space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="flex justify-between items-center mt-6">
        <span>Dark Mode</span>
        <Switch />
      </div>
    </div>
  </div>
</div>
```

### Good (New Primitive Composition)
```tsx
<PageShell>
  <ContentContainer width="readable">
    <Surface className="p-[var(--space-section)]">
      <Stack gap="var(--space-4)">
        <h1 className="text-[length:var(--text-heading)] font-bold">Settings</h1>
        <Inline justify="space-between" align="center">
          <span>Dark Mode</span>
          <Switch />
        </Inline>
      </Stack>
    </Surface>
  </ContentContainer>
</PageShell>
```

## Common Mistakes & Anti-patterns
- ❌ **Nesting multiple `PageShell`s:** Break out inner layouts using `Surface` or `ContentContainer`.
- ❌ **Using `Stack` for horizontal layouts:** Use `Inline` instead.
- ❌ **Applying raw spacing utilities:** Avoid `p-4` or `mt-8`. Use `gap="var(--space-4)"` or `className="p-[var(--space-4)]"`.
- ❌ **Feature logic inside primitives:** `Stack` should not know if a user `isLoggedIn`.

## FAQ
**Q: What if a primitive doesn't support my exact layout need?**
A: Discuss it in an architecture review. Do not hack around it with raw CSS. If the primitive is lacking, we will update the primitive for everyone.

**Q: Can I use `grid` directly?**
A: Natively defined grids are permitted inside feature-specific components (e.g., a complex data table), but high-level page layouts should use Foundation primitives.

## Troubleshooting
- **Spacing feels off:** Ensure you are using semantic spacing tokens (`var(--space-*)`), not Tailwind's default numbered spacing.
- **Components are overflowing:** Verify `ContentContainer` or `SplitLayout` is being used to constrain width instead of fixed pixel widths.

## Definition of Done (Migration PR Checklist)
Include this checklist in your Migration PR description:
- [ ] Uses only semantic tokens.
- [ ] Uses only approved primitives.
- [ ] No raw spacing values (e.g., `mt-4`, `p-8px`).
- [ ] No feature logic inside primitives.
- [ ] Visual regression approved.
- [ ] **Accessibility (Mandatory)**:
  - [ ] Keyboard-only navigation works seamlessly.
  - [ ] Focus visibility is clear and intentional.
  - [ ] Screen reader sanity check (ARIA labels, roles).
  - [ ] Color contrast meets WCAG AA standards.
  - [ ] Respects `prefers-reduced-motion`.
  - [ ] Supports up to **200% browser zoom** without horizontal scrolling or breaking layouts.
- [ ] Performance unchanged (no bundle bloat).
- [ ] No duplicated layout code.
