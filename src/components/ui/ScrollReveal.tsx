import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "scale";
  delay?: number;
  duration?: number;
  distance?: number;
  stagger?: number;
  className?: string;
}

/**
 * ScrollReveal — Framer Motion drop-in replacement for the GSAP ScrollTrigger version.
 *
 * ARCHITECTURE NOTE:
 * ──────────────────
 * Previously this component used gsap.fromTo + ScrollTrigger which required:
 *   1. gsap core (~45KB)
 *   2. ScrollTrigger plugin (~15KB)
 *   3. Manual GSAP context + cleanup
 *
 * Framer Motion's `whileInView` achieves the identical visual effect using
 * IntersectionObserver under the hood — zero extra bundle, zero RAF overhead.
 *
 * `viewport={{ once: true }}` matches the old `toggleActions: "play none none none"`.
 * The "expo.out" easing is replicated with a cubic-bezier that matches GSAP's expo curve.
 */
export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 1,
  distance = 60,
  stagger = 0,
  className = "",
}: ScrollRevealProps) {
  // GSAP "expo.out" ≈ cubic-bezier(0.16, 1, 0.3, 1)
  const easing = [0.16, 1, 0.3, 1] as const;

  const initial =
    direction === "scale"
      ? { opacity: 0, scale: 0.85 }
      : { opacity: 0, y: distance };

  const animate =
    direction === "scale"
      ? { opacity: 1, scale: 1 }
      : { opacity: 1, y: 0 };

  // If stagger > 0, wrap children individually with staggered delays.
  // This replicates GSAP's stagger behavior on el.children.
  if (stagger > 0) {
    const childArray = Array.isArray(children) ? children : [children];
    return (
      <div className={className}>
        {childArray.map((child, i) => (
          <motion.div
            key={i}
            initial={initial}
            whileInView={animate}
            viewport={{ once: true, margin: "-12%" }}
            transition={{
              duration,
              delay: delay + i * stagger,
              ease: easing,
            }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: "-12%" }}
      transition={{
        duration,
        delay,
        ease: easing,
      }}
    >
      {children}
    </motion.div>
  );
}
