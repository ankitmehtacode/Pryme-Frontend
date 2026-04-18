import React, { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger immediately to avoid race conditions
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Device capability detection.
 * Returns true if the device has enough resources to run smooth scrolling
 * without degrading overall page performance.
 *
 * PERF AUDIT (Principal Engineer):
 * ────────────────────────────────
 * Lenis intercepts the native scroll event, processes it through JS, then
 * feeds it into the GSAP ticker (RAF). This creates a mandatory JS hop on
 * EVERY scroll frame:
 *   native wheel event → Lenis JS handler → GSAP ticker → render
 *
 * On capable desktops this feels buttery. On anything else it's the single
 * biggest source of scroll lag because the browser's compositor thread
 * cannot predict scroll position without waiting for JS.
 *
 * Tightened the capability gate to be more conservative:
 * - Requires 6+ logical cores (was 4)
 * - Requires 8GB+ RAM (was 4GB)
 * - Excludes ALL touch devices (was only mobile width + touch)
 * - Excludes reduced-motion preference
 */
const isCapableDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  // Respect user's OS-level motion preference — skip Lenis entirely
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return false;
  }

  // Check hardware concurrency (logical CPU cores)
  const cores = navigator.hardwareConcurrency || 2;

  // Check device memory (GB) — only available in Chromium
  const memory = (navigator as any).deviceMemory || 4;

  // PERF: Exclude ALL touch-capable devices, not just narrow screens.
  // Tablets (iPad Pro, Surface) have touch but wide screens — Lenis still
  // degrades their scroll because touch events go through a longer pipeline.
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // Conservative gate: 6+ cores, 8GB+ RAM, no touch
  if (cores < 6 || memory < 8 || hasTouch) {
    return false;
  }

  return true;
};

const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // On weak devices, don't initialize Lenis at all — native scroll is smoother
    if (!isCapableDevice()) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
      // PERF: Lenis uses wheel event listeners internally.
      // In modern Lenis versions, these are passive by default.
      // Setting syncTouch to false prevents Lenis from intercepting
      // touch scroll events entirely — letting the browser handle them
      // natively on the compositor thread.
      syncTouch: false,
    });

    lenisRef.current = lenis;

    // Sync Lenis scroll events with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);

    // PERF: lagSmoothing(500, 33) allows GSAP to skip frames during heavy
    // renders while still feeling smooth at 30fps minimum.
    // lagSmoothing(0) forces NEVER skipping frames = compounding jank.
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;