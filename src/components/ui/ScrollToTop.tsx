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
          {/* Pill-shaped sleek button — CRED-inspired elevated glassmorphism */}
          <div className="
            flex items-center justify-center w-11 h-11 rounded-full
            bg-white dark:bg-[#0d1829]
            border border-slate-200 dark:border-[#103783]/30
            shadow-lg shadow-slate-200/60 dark:shadow-[#03070f]/80
            hover:bg-slate-50 dark:hover:bg-[#103783]
            hover:border-[#103783]/30 dark:hover:border-[#1e56c7]/50
            hover:shadow-[0_8px_30px_rgba(16,55,131,0.12)] dark:hover:shadow-[0_8px_30px_rgba(30,86,199,0.35)]
            transition-all duration-300 ease-out
            cursor-pointer
          ">
            <ChevronUp 
              className="w-5 h-5 text-[#103783] dark:text-white/80 group-hover:text-[#1e56c7] dark:group-hover:text-white group-hover:scale-110 transition-all duration-300" 
              strokeWidth={3} 
            />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
});

ScrollToTop.displayName = "ScrollToTop";
export default ScrollToTop;
