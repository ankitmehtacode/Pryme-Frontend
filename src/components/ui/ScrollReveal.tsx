import { useRef, useEffect, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "scale";
  delay?: number;
  duration?: number;
  distance?: number;
  stagger?: number;
  className?: string;
}

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 1,
  distance = 60,
  stagger = 0,
  className = "",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = stagger > 0 ? el.children : el;

    const initial =
      direction === "scale"
        ? { opacity: 0, scale: 0.85 }
        : { opacity: 0, y: distance };

    const final =
      direction === "scale"
        ? { opacity: 1, scale: 1 }
        : { opacity: 1, y: 0 };

    const ctx = gsap.context(() => {
      gsap.fromTo(targets, initial, {
        ...final,
        duration,
        delay,
        stagger: stagger > 0 ? stagger : undefined,
        ease: "expo.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    }, el);

    return () => ctx.revert();
  }, [direction, delay, duration, distance, stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
