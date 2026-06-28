import { useRef, useCallback } from "react";

/**
 * useZoomCorrection — React hook to automatically adjust absolute/fixed
 * positioned elements when document-level CSS zoom is active.
 *
 * This hook returns a callback ref to set up a MutationObserver on the element
 * when it mounts, correcting absolute coordinates (left, top, transform translate)
 * by dividing them by the active document zoom factor.
 */
export function useZoomCorrection() {
  const observerRef = useRef<MutationObserver | null>(null);

  const refCallback = useCallback((el: HTMLElement | null) => {
    // Cleanup previous observer if any
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

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

      // 1. Correct left offset
      if (leftStyle && leftStyle.endsWith("px") && !leftStyle.includes("calc")) {
        const val = parseFloat(leftStyle);
        if (!isNaN(val)) {
          el.style.left = `calc(${val}px / ${zoom})`;
        }
      }

      // 2. Correct top offset
      if (topStyle && topStyle.endsWith("px") && !topStyle.includes("calc")) {
        const val = parseFloat(topStyle);
        if (!isNaN(val)) {
          el.style.top = `calc(${val}px / ${zoom})`;
        }
      }

      // 3. Correct transform translate3d/translate coordinates
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

    // Initial check on mount
    adjustPosition();

    // Observe layout/position styling updates by Floating UI
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          adjustPosition();
        }
      }
    });

    observer.observe(el, { attributes: true, attributeFilter: ["style"] });
    observerRef.current = observer;
  }, []);

  return refCallback;
}
