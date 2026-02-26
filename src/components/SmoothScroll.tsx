import React, { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger immediately to avoid race conditions
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // 1. Initialize Lenis with Physics-Based Config
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential easing for "luxury" feel
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // 2. Sync Lenis scroll events with GSAP ScrollTrigger
    // This tells ScrollTrigger to update whenever Lenis scrolls
    lenis.on("scroll", ScrollTrigger.update);

    // 3. Connect GSAP Ticker to Lenis RAF
    // We define the function separately to ensure we can remove it correctly on unmount
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);

    // 4. Disable lag smoothing in GSAP to prevent jumps during heavy renders
    gsap.ticker.lagSmoothing(0);

    // 5. Cleanup Function
    return () => {
      gsap.ticker.remove(update); // Proper cleanup
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;