import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789₹%#@&";

interface DecryptTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}

const DecryptText = ({ text, className = "", delay = 0, speed = 30 }: DecryptTextProps) => {
  const [displayed, setDisplayed] = useState(text.replace(/[^ ]/g, " "));
  const [started, setStarted] = useState(false);
  const iterRef = useRef(0);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    iterRef.current = 0;
    const interval = setInterval(() => {
      iterRef.current += 1;
      const resolved = iterRef.current / 3; // chars resolved so far

      setDisplayed(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < resolved) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (resolved >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [started, text, speed]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: started ? 1 : 0 }}
      transition={{ duration: 0.15 }}
      className={className}
      aria-label={text}
    >
      {displayed}
    </motion.span>
  );
};

export default DecryptText;
