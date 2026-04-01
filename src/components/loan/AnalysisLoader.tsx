import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnalysisLoaderProps {
  isVisible: boolean;
  onComplete: () => void;
  data: {
    cibilScore?: number;
    productType?: string;
    monthlyIncome?: number;
  } | null;
}

// ─── DOCUMENT ICON SVG ──────────────────────────────────────────────────────

const DocumentIcon = ({ index, activeIndex }: { index: number; activeIndex: number }) => {
  const isActive = index === activeIndex;

  return (
    <motion.div
      className="relative"
      animate={{
        scale: isActive ? 1.08 : 1,
        y: isActive ? -4 : 0,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Glow behind active document */}
      <motion.div
        className="absolute -inset-3 rounded-2xl bg-blue-500/20 blur-xl pointer-events-none"
        animate={{ opacity: isActive ? 0.8 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <svg
        width="72"
        height="92"
        viewBox="0 0 72 92"
        fill="none"
        className="relative z-10 drop-shadow-lg"
      >
        {/* Document body with dog-ear */}
        <path
          d="M4 8C4 3.58172 7.58172 0 12 0H48L68 20V84C68 88.4183 64.4183 92 60 92H12C7.58172 92 4 88.4183 4 84V8Z"
          className="fill-white/[0.07] dark:fill-white/[0.07]"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ color: isActive ? "rgba(139, 92, 246, 0.5)" : "rgba(255,255,255,0.1)" }}
        />

        {/* Dog-ear fold */}
        <path
          d="M48 0L68 20H56C51.5817 20 48 16.4183 48 12V0Z"
          className="fill-white/[0.04]"
          stroke="currentColor"
          strokeWidth="1"
          style={{ color: isActive ? "rgba(139, 92, 246, 0.3)" : "rgba(255,255,255,0.08)" }}
        />

        {/* Text lines */}
        {[
          { y: 34, w: 40 },
          { y: 44, w: 36 },
          { y: 54, w: 42 },
          { y: 64, w: 28 },
          { y: 74, w: 34 },
        ].map((line, i) => (
          <motion.rect
            key={i}
            x="14"
            y={line.y}
            width={line.w}
            height="3"
            rx="1.5"
            animate={{
              fill: isActive
                ? "rgba(139, 92, 246, 0.35)"
                : "rgba(255, 255, 255, 0.06)",
            }}
            transition={{ duration: 0.3 }}
          />
        ))}

        {/* Small icon placeholder top-left of text area */}
        <motion.rect
          x="14"
          y="24"
          width="10"
          height="3"
          rx="1.5"
          animate={{
            fill: isActive
              ? "rgba(139, 92, 246, 0.5)"
              : "rgba(255, 255, 255, 0.08)",
          }}
          transition={{ duration: 0.3 }}
        />
      </svg>
    </motion.div>
  );
};

// ─── MAGNIFYING GLASS SVG ────────────────────────────────────────────────────

const MagnifyingGlass = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
    {/* Glass circle */}
    <circle
      cx="24"
      cy="24"
      r="18"
      stroke="rgba(139, 92, 246, 0.6)"
      strokeWidth="3.5"
      fill="rgba(139, 92, 246, 0.06)"
    />
    {/* Inner lens shine */}
    <circle
      cx="24"
      cy="24"
      r="14"
      stroke="rgba(139, 92, 246, 0.15)"
      strokeWidth="1"
      fill="none"
    />
    {/* Handle */}
    <line
      x1="38"
      y1="38"
      x2="52"
      y2="52"
      stroke="rgba(139, 92, 246, 0.5)"
      strokeWidth="4"
      strokeLinecap="round"
    />
    {/* Lens glare */}
    <path
      d="M16 16C18 14 21 13 24 13"
      stroke="rgba(255,255,255,0.15)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// ─── STATUS TEXT STEPS ───────────────────────────────────────────────────────

const STATUS_MESSAGES = [
  "Scanning your documents...",
  "Verifying credit profile...",
  "Matching with lender algorithms...",
  "Locking best offers for you...",
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const AnalysisLoader = ({ isVisible, onComplete, data }: AnalysisLoaderProps) => {
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (!isVisible) {
      setActiveDocIndex(0);
      setStatusIndex(0);
      return;
    }

    // Clear any existing timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // Total animation duration: ~3.5s
    // Cycle through 3 documents, then complete
    const schedule = [
      { time: 0, doc: 0, status: 0 },
      { time: 800, doc: 1, status: 1 },
      { time: 1600, doc: 2, status: 2 },
      { time: 2400, doc: 0, status: 3 },
      { time: 3000, doc: 1, status: 3 },
    ];

    schedule.forEach(({ time, doc, status }) => {
      const t = setTimeout(() => {
        setActiveDocIndex(doc);
        setStatusIndex(status);
      }, time);
      timeoutsRef.current.push(t);
    });

    // Complete after full scan
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 3800);
    timeoutsRef.current.push(completeTimeout);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [isVisible, onComplete]);

  // Magnifying glass x-position mapped to active document
  const glassPositions = [-90, 0, 90];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a]/95 backdrop-blur-2xl px-6 overflow-hidden"
        >
          {/* Ambient background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/[0.06] blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-blue-800/[0.04] blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[20%] right-[20%] w-[250px] h-[250px] bg-blue-700/[0.04] blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* ── Documents + Magnifying Glass Area ─────────────────────── */}
            <div className="relative mb-12">
              {/* Three documents in a row */}
              <div className="flex items-end gap-6 md:gap-8">
                {[0, 1, 2].map((i) => (
                  <DocumentIcon key={i} index={i} activeIndex={activeDocIndex} />
                ))}
              </div>

              {/* Magnifying glass overlay — moves across documents */}
              <motion.div
                className="absolute -top-4 left-1/2 pointer-events-none z-20"
                animate={{
                  x: glassPositions[activeDocIndex],
                  marginLeft: "-28px",
                }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 20,
                  mass: 0.8,
                }}
              >
                <MagnifyingGlass />
              </motion.div>

              {/* Scan line effect */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none"
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* ── Status Text ──────────────────────────────────────────── */}
            <div className="h-8 relative flex items-center justify-center mb-8">
              <AnimatePresence mode="wait">
                <motion.p
                  key={statusIndex}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="text-sm md:text-base font-medium text-slate-400 tracking-wide"
                >
                  {STATUS_MESSAGES[statusIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* ── Progress Dots ────────────────────────────────────────── */}
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="rounded-full"
                  animate={{
                    width: activeDocIndex === i ? 24 : 6,
                    height: 6,
                    backgroundColor:
                      activeDocIndex === i
                        ? "rgba(139, 92, 246, 0.8)"
                        : "rgba(255, 255, 255, 0.1)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              ))}
            </div>

            {/* ── Sub-context Data Ledger ──────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-12 flex items-center gap-8 md:gap-12 px-6 py-4 rounded-2xl border border-white/[0.04] bg-white/[0.02]"
            >
              {[
                { label: "CREDIT SCORE", value: data?.cibilScore || "—" },
                { label: "PRODUCT", value: data?.productType?.replace(/_/g, " ") || "—" },
                { label: "STATUS", value: "ENCRYPTED" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <p className="text-[9px] font-medium text-white/20 tracking-[0.2em] mb-1 uppercase">
                    {stat.label}
                  </p>
                  <p className="text-xs font-semibold text-white/60 tabular-nums">
                    {stat.value}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnalysisLoader;