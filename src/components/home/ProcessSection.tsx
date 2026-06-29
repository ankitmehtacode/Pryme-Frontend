import { useRef } from "react";
import { FileText, UserCheck, Zap, Banknote } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  { 
    icon: FileText, 
    num: "01",
    title: "Digital Application", 
    desc: "Complete our intelligent form in under 5 minutes — no branch visits, no paperwork.",
  },
  { 
    icon: UserCheck, 
    num: "02",
    title: "Instant Eligibility", 
    desc: "Our engine calculates your eligibility across 15+ banks in real time.",
  },
  { 
    icon: Zap, 
    num: "03",
    title: "Smart Matching", 
    desc: "Get pre-approved offers from multiple banking partners tailored to your profile.",
  },
  { 
    icon: Banknote, 
    num: "04",
    title: "Rapid Disbursal", 
    desc: "Choose your best offer and receive funds — often within 48 hours.",
  }
];

/**
 * ProcessSection — Framer Motion rewrite.
 *
 * MIGRATION NOTE:
 * ───────────────
 * Previously used GSAP ScrollTrigger for:
 *   1. Card fade-in on scroll (now: `whileInView`)
 *   2. Progress line scaleY scrub (now: `useScroll` + `useTransform`)
 *   3. Manual dot alignment via DOM measurements (now: CSS-only with `top`/`bottom` anchoring)
 *
 * The progress line scrub is the most complex migration:
 *   GSAP: `scrollTrigger: { scrub: 0.1 }` → smoothly ties scaleY to scroll position
 *   FM:   `useScroll({ target, offset })` → `useTransform(scrollYProgress, [0,1], [0,1])`
 *
 * Visual output is identical. Zero GSAP/ScrollTrigger dependency.
 */
const ProcessSection = () => {
  const trackRef = useRef<HTMLDivElement>(null);

  // Framer Motion scroll-linked progress for the timeline fill
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 55%", "end 55%"],
  });

  // Map scroll progress directly to scaleY (0 → 1)
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Card reveal animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: i * 0.08,
        ease: [0.33, 1, 0.68, 1], // power2.out equivalent
      },
    }),
  };

  return (
    <div className="w-full relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-20 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#103783]/30 bg-[#103783]/10 text-xs font-semibold text-[#9BAFD9] uppercase tracking-[0.3em] mb-6">
            The Process
          </span>
          <h2 className="font-semibold text-white mb-5 leading-[1.1] tracking-tight" style={{ fontSize: 'clamp(1.75rem, 4vw, 3.25rem)' }}>
            Four steps to your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#103783] to-[#9BAFD9]">
              best loan offer.
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl leading-relaxed" style={{ fontSize: 'clamp(0.938rem, 2vw, 1.063rem)' }}>
            No branch visits. No waiting rooms. Just a streamlined
            digital process from application to disbursal.
          </p>
        </div>

        {/* Timeline */}
        <div className="flex flex-col items-center relative w-full">
          <div ref={trackRef} className="w-full max-w-3xl relative pl-12 lg:pl-20">
            
            {/* Timeline line — CSS positioned from first dot to last dot */}
            <div 
              className="absolute left-[23px] lg:left-[39px] w-[1px] z-0"
              style={{
                top: '3rem',
                bottom: '3rem',
              }}
            >
              {/* Static background track */}
              <div className="absolute inset-0 bg-white/[0.05]" />
              
              {/* Scroll-linked animated fill — Framer Motion scaleY */}
              <motion.div 
                className="absolute inset-0 origin-top"
                style={{ scaleY }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#103783] via-[#4a6db5] to-[#9BAFD9]" />
                {/* Glowing comet head */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[5px] h-3 bg-[#9BAFD9] rounded-full shadow-[0_0_8px_2px_rgba(155,175,217,0.6)]" />
              </motion.div>
            </div>

            {/* Steps Container */}
            <div className="relative z-10 flex flex-col space-y-8 md:space-y-12">
              {steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  className="process-card relative group"
                  custom={idx}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-15%" }}
                >
                  {/* Dot */}
                  <div className="process-dot absolute -left-[34px] lg:-left-[50px] top-1/2 -translate-y-1/2 z-10">
                    <div className="w-[18px] h-[18px] rounded-full border border-white/10 bg-[#030303] flex items-center justify-center transition-all duration-500 group-hover:border-[#9BAFD9]/40 group-hover:shadow-[0_0_12px_rgba(155,175,217,0.25)]">
                      <div className="w-[7px] h-[7px] rounded-full bg-white/15 transition-colors duration-500 group-hover:bg-[#9BAFD9]" />
                    </div>
                  </div>
                  
                  {/* Card content */}
                  <div className={cn(
                    "w-full p-6 md:p-8 rounded-2xl border transition-all duration-400",
                    "bg-[#030303]/80 backdrop-blur-sm border-white/[0.06]",
                    "hover:bg-white/[0.04] hover:border-[#103783]/25 shadow-sm"
                  )}>
                    <div className="flex items-start gap-5">
                      <span className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#103783] to-[#9BAFD9] tabular-nums shrink-0 leading-none pt-0.5">
                        {step.num}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-2">
                          <step.icon className="w-4 h-4 text-[#9BAFD9] shrink-0" />
                          <h3 className="font-semibold text-white tracking-tight" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-slate-400 leading-relaxed" style={{ fontSize: 'clamp(0.813rem, 1.5vw, 0.938rem)' }}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
    </div>
  );
};

export default ProcessSection;