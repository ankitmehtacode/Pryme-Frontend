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
 */
const isCapableDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  // Check hardware concurrency (logical CPU cores)
  const cores = navigator.hardwareConcurrency || 2;

  // Check device memory (GB) — only available in Chromium
  const memory = (navigator as any).deviceMemory || 4;

  // Check if this is a mobile device via touch + screen width heuristic
  const isMobile = window.matchMedia("(max-width: 768px)").matches && ("ontouchstart" in window);

  // Skip Lenis on: <4 cores, <4GB RAM, or mobile devices
  if (cores < 4 || memory < 4 || isMobile) {
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
    });

    lenisRef.current = lenis;

    // Sync Lenis scroll events with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);

    // FIXED: Use lagSmoothing(500, 33) instead of (0).
    // lagSmoothing(0) forces the browser to NEVER skip frames, causing
    // compounding jank on weak GPUs. (500, 33) allows GSAP to skip frames
    // during heavy renders while still feeling smooth at 30fps minimum.
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;