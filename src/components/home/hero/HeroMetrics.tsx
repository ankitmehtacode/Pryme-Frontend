import React, { useRef, useState, useEffect } from "react";
import { Users, Building2, Smile } from "lucide-react";
import { motion, useInView } from "framer-motion";

const MiniCountUp = ({ to, prefix = "", suffix = "", formatComma = false }: { to: number, prefix?: string, suffix?: string, formatComma?: boolean }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    const duration = 1500;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * to));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(to);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, to]);

  return (
    <span ref={ref}>
      {prefix}
      {formatComma ? count.toLocaleString("en-IN") : count}
      {suffix}
    </span>
  );
};

export const HeroMetrics = () => {
  return (
    <>
      {/* ── MOBILE metrics: compact inline row ── */}
      <div className="md:hidden flex items-center justify-start gap-3 mt-2 pt-2 border-t border-slate-100/60">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0a1530]">
          <Smile className="w-3 h-3 text-amber-400 fill-amber-400/30" />
          100%
        </span>
        <span className="w-px h-3 bg-slate-200" />
        <span className="text-[10px] font-bold text-[#0a1530]">1k+ Users</span>
        <span className="w-px h-3 bg-slate-200" />
        <span className="text-[10px] font-bold text-[#0a1530]">₹250Cr+ Loans</span>
      </div>

      {/* ── DESKTOP metrics: super-compact horizontal stack with vertically stacked values and descriptions ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="hidden md:flex flex-row items-center justify-start gap-x-6 sm:gap-x-7 lg:gap-x-8 mt-4 pt-3 border-t border-slate-100/80 w-full"
      >
        {/* Metric 1: Customers */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5.5 h-5.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Users className="w-3 h-3 text-[#103783]" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <p className="text-xs font-extrabold text-[#0a1530] tracking-tight" style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif' }}>
              <MiniCountUp to={1000} suffix="+" formatComma={true} />
            </p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 whitespace-nowrap">Trusted Customer</p>
          </div>
        </div>

        {/* Metric 2: Loans */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5.5 h-5.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Building2 className="w-3 h-3 text-[#103783]" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <p className="text-xs font-extrabold text-[#0a1530] tracking-tight" style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif' }}>
              <MiniCountUp to={250} prefix="₹" suffix="+ Cr" />
            </p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 whitespace-nowrap">Loan Facilitated</p>
          </div>
        </div>

        {/* Metric 3: Rating */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5.5 h-5.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Smile className="w-3 h-3 text-amber-400 fill-amber-400/30" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <p className="text-xs font-extrabold text-[#0a1530] tracking-tight" style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif' }}>
              100%
            </p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 whitespace-nowrap">Happy Customer</p>
          </div>
        </div>
      </motion.div>
    </>
  );
};
