import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * useIsMobile — Responsive breakpoint hook.
 *
 * PERF AUDIT (Principal Engineer):
 * ────────────────────────────────
 * Previous version used `window.innerWidth` inside the change callback.
 * `window.innerWidth` triggers a FORCED SYNCHRONOUS LAYOUT (reflow) because
 * the browser must calculate the current layout to return the value.
 * If this fires during a scroll or resize animation frame, it stalls the
 * compositor thread.
 *
 * Fix: Use `event.matches` from MediaQueryList — this is a pre-computed
 * boolean that the browser maintains internally. Zero layout cost.
 *
 * Additionally: The initial value uses `undefined` → `boolean` which causes
 * a flash/re-render on mount. Changed to use `mql.matches` immediately via
 * lazy initializer to avoid the hydration mismatch dance.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // SSR guard — default to false on server
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
  });

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // PERF: Use event.matches (pre-computed) instead of window.innerWidth (forces reflow)
    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    // Sync initial state (handles SSR mismatch)
    setIsMobile(mql.matches);

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
