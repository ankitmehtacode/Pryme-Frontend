import { useState, useEffect, useCallback, useRef, memo } from "react";
import { ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ScrollToTop — Floating button that appears after scrolling down.
 *
 * PERF AUDIT (Principal Engineer):
 * ────────────────────────────────
 * Previous version called `setVisible(window.scrollY > 400)` on EVERY scroll
 * event. Even with { passive: true }, this triggers a React state update →
 * reconciliation → potential re-render on every single scroll pixel.
 *
 * On a page that scrolls 5000px at 60fps, that's ~300 React re-renders per
 * second of scrolling. useState only bails out if the value is Object.is equal,
 * but the comparison + scheduler overhead still exists.
 *
 * Fix: Use a ref to track the last-known state and only call setState when
 * the boolean actually TRANSITIONS (crosses the 400px threshold). This reduces
 * setState calls from ~300/second to exactly 2 per scroll session (one show,
 * one hide).
 */
const ScrollToTop = memo(() => {
  const [visible, setVisible] = useState(false);
  const wasVisibleRef = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const shouldBeVisible = window.scrollY > 400;
      // PERF: Only trigger React re-render when the boolean TRANSITIONS
      if (shouldBeVisible !== wasVisibleRef.current) {
        wasVisibleRef.current = shouldBeVisible;
        setVisible(shouldBeVisible);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.92 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 group outline-none"
          aria-label="Scroll to top"
        >
          {/* Pill-shaped sleek button — CRED-inspired */}
          <div className="
            flex items-center justify-center w-9 h-9 rounded-full
            bg-foreground/[0.08] dark:bg-white/[0.08]
            border border-foreground/[0.06] dark:border-white/[0.08]
            shadow-[0_2px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.3)]
            hover:bg-foreground/[0.12] dark:hover:bg-white/[0.12]
            hover:border-primary/20
            hover:shadow-[0_4px_30px_rgba(42,172,100,0.1)]
            transition-all duration-300 ease-out
            cursor-pointer
          ">
            <ChevronUp 
              className="w-4 h-4 text-foreground/50 dark:text-white/40 group-hover:text-primary transition-colors duration-300" 
              strokeWidth={2.5} 
            />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
});

ScrollToTop.displayName = "ScrollToTop";
export default ScrollToTop;
