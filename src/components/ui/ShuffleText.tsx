import { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

interface ShuffleTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

export const ShuffleText = ({ 
  text, 
  className = "", 
  delay = 0,
  duration = 1000 // Total time to reveal
}: ShuffleTextProps) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        controls.start("visible");
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [isInView, controls, delay]);

  const durationSec = duration / 1000;
  // Calculate stagger step precisely to ensure it completes within requested duration
  const stagger = Math.max(durationSec / Math.max(text.length, 1), 0.015);
  const characters = text.split("");

  return (
    <motion.span 
      ref={containerRef}
      className={`inline-block whitespace-pre-wrap tracking-tight ${className}`}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger }
        }
      }}
    >
      {characters.map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : "normal" }}
          variants={{
            hidden: { 
              opacity: 0, 
              y: 12, 
              filter: "blur(6px)" 
            },
            visible: { 
              opacity: 1, 
              y: 0, 
              filter: "blur(0px)",
              transition: { 
                type: "spring", 
                damping: 24, 
                stiffness: 120 
              }
            }
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};
