# Pryme Layout Manifest (v1.0)

This is the canonical layout manifest for the Pryme Frontend. It dictates the exact structural hierarchy and component contracts that govern all responsive behavior across the application. 

**No developer is permitted to invent their own layout hierarchy or circumvent these primitives using utility classes (e.g., `max-w-[1542px]`, `pt-[67px]`).**

## Canonical Hierarchy

Every page must conform to this exact nesting structure. Skipping levels or nesting identical levels is strictly prohibited.

```html
<PageShell>           <!-- Owns viewport, safe areas, global bleed -->
  <main>              <!-- Semantic wrapper -->
    <Section bleed>   <!-- Owns vertical rhythm (padding-block), container queries. 'bleed' disables inline padding -->
      <SectionBackground /> <!-- Owns visual environment (gradients, grids, paths) divorced from content -->
      <Container>     <!-- Owns max inline size constraint, auto-centering -->
        
        <!-- Choose one layout primitive for the section's contents -->
        <Columns preset="hero"> <!-- Preset-driven explicit grid layout -->
        <AutoGrid>    <!-- Intrinsic repeating grid (e.g., Product Cards) -->
        
        <!-- Or standard feature components if layout is trivial -->
        <FeatureComponent />
        
      </Container>
    </Section>
  </main>
</PageShell>
```

---

## Primitive Contracts

Every primitive has a rigid set of responsibilities. If you need a behavior that is prohibited by a primitive's contract, you are using the wrong primitive.

### 1. `<PageShell>`
- **Responsibilities:**
  - Viewport boundary bounds.
  - Page-level inline padding (safe areas).
- **Inputs:** `children`
- **Never Does:**
  - Background styling (colors/images).
  - Vertical spacing/rhythm.
  - Nested container widths.

### 2. `<Section>`
- **Responsibilities:**
  - Vertical rhythm (applies `--space-*` tokens via padding).
  - Defining `container-type: inline-size` contexts for container queries.
- **Inputs:** `spacing` (xs | sm | md | lg | xl | 2xl), `containerQuery` (boolean), `bleed` (boolean)
- **Never Does:**
  - Horizontal max-width constraints.
  - Side-by-side (Row) layouts.

### 3. `<SectionBackground>`
- **Responsibilities:**
  - Providing the visual environment (gradients, svgs, grids, particles) decoupled from layout constraints.
  - Uses `absolute inset-0` to fill its containing `<Section>`.
- **Inputs:** `variant` (hero, default, dark, light)
- **Never Does:**
  - Content positioning or constraints.
  - Accepting `children` props.

### 4. `<Container>`
- **Responsibilities:**
  - Maximum inline size constraint (`max-width`).
  - Auto-centering (`margin-inline: auto`).
- **Inputs:** `size` (xs | sm | md | lg | xl | 2xl | full)
- **Never Does:**
  - Vertical spacing/padding.
  - Grid or Flexbox alignments.

### 5. `<Columns>`
- **Responsibilities:**
  - Explicit CSS Grid column splits (e.g., side-by-side).
  - Overflow prevention (`min-width: 0`).
- **Inputs:** `preset` (hero, split, golden)
- **Never Does:**
  - Repeating lists or cards.
  - Vertical rhythm.

### 6. `<AutoGrid>`
- **Responsibilities:**
  - Intrinsic repeating grid items (`auto-fit`, `minmax`).
  - Gap spacing between repeating elements.
- **Inputs:** `minItemWidth` (string/token), `gap` (string/token)
- **Never Does:**
  - Explicit column counts (`grid-cols-3`).

---

## Architectural Laws (No Escape Hatches)

1. **Content-Driven Layout**: Layouts must respond to content intrinsic sizing (e.g., `minmax()`, `clamp()`), not just rigid viewport media queries. Never hardcode multiple page widths (`--page-width-faq`).
2. **Decoupled Environments**: A visual environment (backgrounds, complex SVGs) must be separated from layout constraints. Never bake a background into a feature component. Utilize `<SectionBackground>`.
3. **No Layout Re-renders from JS**: Do not use `window.addEventListener('resize')` or `ResizeObserver` to dictate component rendering widths. Use CSS Grid and `@container`.
4. **No Arbitrary Padding/Margins**: You cannot use `pt-[93px]` or `w-[1542px]`. If a token doesn't exist, either expand the token system or use the closest available token.
5. **Typography Constraints**: Text blocks must be constrained by `ch` units (e.g., `max-width: 38ch`), never by pixel values or percentages.
6. **Governance Rule (Rule of Three)**: A primitive must demonstrate reuse across at least three independent features before it becomes part of the Foundation primitives. Never introduce abstractions like `<Card>` or `<Page>` prematurely.
7. **Performance Limits**:
   - Maximum nesting depth of primitives: **6**.
   - No feature component > **250 LOC**.
   - No page > **150 LOC**.
8. **Evolution Rules**:
   - **Patch**: Bug fixes (no API changes).
   - **Minor**: New optional props to primitives.
   - **Major**: Modifying existing primitive contracts (requires architecture review).

## Optical Design Laws (Enterprise Responsive System v3.0)

To maintain Apple x Stripe grade optical layouts, the following visual laws are immutable:

1. **Optical Anchor Rule**: Every Hero must have exactly one primary visual anchor (e.g., Bank Building). Everything else (offer cards, badges, floating chips) must orbit that anchor. Nothing floats independently.
2. **Hero Height Contract**: The Hero section must never consume more than **70–72% of the initial viewport height**. The remaining viewport must always expose the subsequent sections (e.g., Products and Trust/Partners).
3. **Hero Artwork Rule**: Artwork must occupy **52–58%** of the available Hero width. It must never exceed 60% and never shrink below 45%.
4. **Progressive Scaling Hierarchy**: Desktop scaling must follow this exact order:
   1. Typography scales.
   2. Vertical rhythm interpolates.
   3. Gap interpolation.
   4. Artwork scaling.
   5. Container expansion.
5. **Optical Weight Budget (Hero)**: Future hero iterations must adhere to this weight distribution:
   - Headline: ≈18%
   - Whitespace: ≈12%
   - Illustration: ≈45%
   - Offer Card: ≈18%
   - Decorations: ≈7%

