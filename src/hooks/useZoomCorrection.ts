import { useRef, useEffect } from "react";

/**
 * useZoomCorrection — React hook to automatically adjust absolute/fixed
 * positioned elements when document-level CSS zoom is active.
 *
 * Why this is needed:
 * ──────────────────
 * When CSS `zoom` is active on `html` or `body` (e.g. `zoom: 0.8`), coordinate
 * calculation libraries like Floating UI / Popper.js compute coordinates relative
 * to the viewport, which are already scaled by the browser.
 * When they write these raw pixel coordinates to inline styles (e.g. `left: 500px`),
 * the browser applies the CSS zoom *again* to the inline style, rendering it at
 * `500 * 0.8 = 400px` (double-zoomed/misaligned).
 *
 * This hook acts as a MutationObserver proxy. It intercepts style mutations,
 * parses raw positioning coordinates (`left`, `top`, `transform`), divides them by
 * the active zoom factor, and updates them dynamically using `calc(value / zoom)`.
 */
export function useZoomCorrection() {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const getZoomFactor = () => {
      const zoomStr = getComputedStyle(document.documentElement).zoom;
      const zoom = parseFloat(zoomStr) || 1;
      return zoom;
    };

    let isAdjusting = false;

    const adjustPosition = () => {
      if (isAdjusting) return;

      const zoom = getZoomFactor();
      if (zoom === 1) return;

      isAdjusting = true;

      const leftStyle = el.style.left;
      const topStyle = el.style.top;
      const transformStyle = el.style.transform;

      // 1. Correct inline left
      if (leftStyle && leftStyle.endsWith("px") && !leftStyle.includes("calc")) {
        const val = parseFloat(leftStyle);
        if (!isNaN(val)) {
          el.style.left = `calc(${val}px / ${zoom})`;
        }
      }

      // 2. Correct inline top
      if (topStyle && topStyle.endsWith("px") && !topStyle.includes("calc")) {
        const val = parseFloat(topStyle);
        if (!isNaN(val)) {
          el.style.top = `calc(${val}px / ${zoom})`;
        }
      }

      // 3. Correct inline transform coordinates
      if (transformStyle && transformStyle.includes("translate") && !transformStyle.includes("calc")) {
        const newTransform = transformStyle.replace(/(-?\d+(?:\.\d+)?px)/g, (match) => {
          const val = parseFloat(match);
          if (!isNaN(val) && val !== 0) {
            return `calc(${val}px / ${zoom})`;
          }
          return match;
        });

        if (newTransform !== transformStyle) {
          el.style.transform = newTransform;
        }
      }

      isAdjusting = false;
    };

    // Initial check
    adjustPosition();

    // Listen to Floating UI style changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          adjustPosition();
        }
      }
    });

    observer.observe(el, { attributes: true, attributeFilter: ["style"] });

    return () => {
      observer.disconnect();
    };
  }, []);

  return elementRef;
}
