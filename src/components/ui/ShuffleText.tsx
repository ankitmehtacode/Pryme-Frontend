import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const CHARS = "!@#$%^&*()_+{}:\"<>?|[];',./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

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
  const [displayText, setDisplayText] = useState(() => {
    // 🧠 FIX: Pre-scramble the text so it occupies the exact correct DOM width immediately
    let initialArr = "";
    for (let i = 0; i < text.length; i++) {
        initialArr += text[i] === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return initialArr;
  });

  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    // Wait for the requested delay before starting
    const startTimer = setTimeout(() => {
      setIsAnimating(true);
      
      const length = text.length;
      let iterations = 0;
      const totalSteps = 30; // 🧠 Increased steps for a smoother, longer matrix effect
      const stepDuration = duration / totalSteps;
      
      const interval = setInterval(() => {
        setDisplayText((prev) => {
          const resolvedCount = Math.floor((iterations / totalSteps) * length);
          
          let nextString = "";
          for (let i = 0; i < length; i++) {
            // If we've resolved past this character, show the real character
            if (i < resolvedCount) {
              nextString += text[i];
            } 
            // If it's a space, keep it a space so wrapping doesn't jump
            else if (text[i] === " ") {
              nextString += " ";
            }
            // Otherwise show a random hacker character
            else {
              nextString += CHARS[Math.floor(Math.random() * CHARS.length)];
            }
          }
          return nextString;
        });

        iterations++;

        if (iterations > totalSteps) {
          clearInterval(interval);
          setDisplayText(text); // Ensure exactly correct at the end
          setIsAnimating(false);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [text, delay, duration]);

  // 🧠 FIX: Always render the text. The pre-scrambled state prevents layout collapse.
  // Adding empty motion props so React recognizes it if wrapped in motion context.
  return (
    <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`${className} inline-block whitespace-pre-wrap font-mono tracking-tight`}
    >
      {displayText}
    </motion.span>
  );
};
