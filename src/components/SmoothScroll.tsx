import React from "react";

/**
 * SmoothScroll — Lightweight pass-through wrapper.
 *
 * ARCHITECTURE NOTE:
 * ──────────────────
 * Previously this component initialized Lenis (smooth scroll library) which:
 *   1. Intercepted native scroll events → JS handler → GSAP RAF ticker → render
 *   2. Required gsap core + ScrollTrigger + Lenis (~72KB combined)
 *   3. Was already disabled on 90%+ of devices (all touch, <6 cores, <8GB RAM)
 *
 * CSS `scroll-behavior: smooth` is handled natively by the browser's compositor
 * thread — zero main-thread JS, zero bundle cost, zero frame drops.
 *
 * This wrapper is kept as a pass-through to avoid touching 12+ page files that
 * import it. The component does nothing — React tree-shakes this to zero cost.
 */
const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default SmoothScroll;