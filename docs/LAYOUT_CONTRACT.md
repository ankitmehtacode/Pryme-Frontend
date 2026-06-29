# Layout Ownership Contract

This document defines the strict layout architecture rules for the PRYME frontend. Every layer has exactly ONE job.

## Rule of One
Every responsibility must have exactly ONE owner. If two components own the same responsibility, the architecture is wrong.

- **Viewport** → `PageShell`
- **Background / Theme / Environment** → `Surface`
- **Vertical Spacing / Rhythm / Flow** → `Section`
- **Width / Max-Width / Centering** → `Container`
- **Content / Internal Grids / Logic** → `Component`
- **UI Bounds / Local Padding** → `Card`
- **Typography** → Tokens
- **Motion** → Motion tokens
- **Decorations** → `Surface`

## Layout Layers

1. **PageShell**: Owns the viewport, global scroll context, and full-page layout boundaries.
2. **Surface**: Owns the visual environment. This includes background color, themes (light/dark/muted/inverse), backdrop blur, ambient gradients, noise textures, decorative SVGs, and z-index context. Surface transitions must never jump; they dictate fade or divider rules.
3. **Section**: Owns vertical rhythm (padding-block), semantic grouping for layout flow, and container query scope. Never handles horizontal constraints.
4. **Container**: Owns max-width constraints via semantic sizes (`readable`, `content`, `wide`, `expanded`, `full`) and auto-centering (`margin-inline: auto`). Never applies vertical spacing.
5. **Component**: Owns business logic, feature presentation, and internal component grids (using `<Stack>` or explicit internal structures). Remains completely layout-agnostic regarding its place on the page.
6. **Card**: Owns UI boundaries, local padding (breathing room), borders, and local shadows.

## Design Review Gates (PR Checklist)
Every frontend PR, particularly those affecting the homepage or core pages, must satisfy this checklist:

- [ ] No nested `Container`s
- [ ] No nested `Section`s
- [ ] One `PageShell` at the root
- [ ] One `Surface` owns each background (no `bg-*` painted directly inside feature components)
- [ ] `Container` never owns spacing (`py-*`, `gap-*`, `my-*`)
- [ ] `Section` never owns width (`max-w-*`, `px-*`)
- [ ] No `max-w-*` inside features
- [ ] No `mx-auto` inside features
- [ ] No page padding inside features (`py-24`, etc.)
- [ ] Components remain completely layout-agnostic
