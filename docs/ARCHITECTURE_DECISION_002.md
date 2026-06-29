# Architecture Decision Record: 002

## Title: Content-Driven Layout Architecture

**Status:** Accepted
**Date:** 2026-06-30

### Context
Historically, web layouts have been constructed around arbitrary "viewport breakpoints" (e.g., `sm:`, `md:`, `lg:`, `xl:` corresponding to 640px, 768px, 1024px, 1280px). This forces design decisions based on external device dimensions rather than internal content logic, leading to fragile layouts that break at unanticipated sizes (e.g., ultra-wides or unusual laptop scaling factors) and requiring complex media-query overrides.

As the Pryme platform scales to support dashboards, auth flows, and marketing pages, maintaining a cohesive UI across all permutations of screen width requires a more robust approach.

### Decision
We are adopting a **Content-Driven Layout Architecture**.

**Core Philosophy:**
Layouts respond to content, not devices.

Everything else derives from that single principle.

### Implications

1. **Intrinsic Sizing over Fixed Widths:** We will prioritize CSS `minmax()`, `clamp()`, and `auto-fit` over fixed percentage splits or pixel widths.
2. **Character-based Typography Limits:** Text constraints will be driven by optimal reading lengths (e.g., `max-width: 38ch`) rather than pixel values (`max-width: 500px`).
3. **Container Queries:** Components will adapt based on the space available to them in their container (`@container`), allowing a single component to render correctly in both a narrow sidebar and a wide main content area without any prop drilling or external media queries.
4. **Optical Scaling Priority:** When horizontal space decreases, responsiveness must follow a strict optical sequence:
   - **First:** Typography adjusts (fluid downscaling).
   - **Second:** Whitespace compresses (fluid margins/gaps).
   - **Third:** Grid columns wrap or rearrange.
   - **Last:** Hero artwork or supplementary visuals shrink/hide.

This philosophy establishes the foundation for the Enterprise v1.0 Layout System and strictly forbids viewport-listeners or JS-driven layout re-renders.
