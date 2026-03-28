import { useRef, useEffect, memo, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Sparkles, Percent, ChevronRight, CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "framer-motion";
import { ShuffleText } from "@/components/ui/ShuffleText";

import iciciLogo from "@/assets/icici.svg";
import axisLogo from "@/assets/axis-bank-logo-1.svg";

const initialOffers = [
  { 
    id: "axis-pre", bank: "AXIS BANK", logo: axisLogo, 
    title: "Pre-Approved Limit up to ₹50,00,000", 
    highlights: ["Zero documentation for salary accounts", "Funds disbursed within 3 hours"],
    tag: "FAST TRACK APPROVAL", icon: Sparkles,
    bgClass: "from-[#97144d] via-[#6b0f38] to-[#3d0920]",
    bgImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1400&auto=format&fit=crop",
    accentColor: "#f472b6",
    accentGlow: "rgba(244,114,182,0.12)",
  },
  { 
    id: "icici-cashback", bank: "ICICI BANK", logo: iciciLogo,
    title: "Get ₹5,000 Instant Cashback on Approval", 
    highlights: ["Direct credit to your account on 1st EMI", "100% Digital Process & Fast Approval"],
    tag: "EXCLUSIVE PRYME OFFER", icon: Zap,
    bgClass: "from-[#1e3a8a] via-[#172554] to-[#0c1a3d]",
    bgImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1400&auto=format&fit=crop",
    accentColor: "#60a5fa",
    accentGlow: "rgba(96,165,250,0.12)",
  },
  { 
    id: "hdfc-holi", bank: "HDFC BANK", logo: null,
    title: "25% Off Processing Fees + Lowest Rates", 
    highlights: ["Interest Rates starting at 10.25%*", "Zero pre-closure charges after 12 months"],
    tag: "LIMITED TIME OFFER", icon: Percent,
    bgClass: "from-[#004b87] via-[#003560] to-[#001b30]",
    bgImage: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?q=80&w=1400&auto=format&fit=crop",
    accentColor: "#34d399",
    accentGlow: "rgba(52,211,153,0.12)",
  }
];

const marqueeOffers = [
  { text: "25% off on HDFC", color: "#3b82f6" },
  { text: "₹5,000 Cashback ICICI", color: "#f97316" },
  { text: "Pre-Approved ₹50L Axis", color: "#ec4899" },
  { text: "10.25%* Interest Rate", color: "#10b981" },
  { text: "Zero Documentation", color: "#8b5cf6" },
  { text: "3hr Disbursal", color: "#06b6d4" },
  { text: "No Pre-closure Fee", color: "#f59e0b" },
  { text: "Salary A/C Special", color: "#ec4899" },
];

/* Staggered reveal variants — Onething-style cinematic entrance */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
import { Variants } from "framer-motion";

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const HeroSection = memo(() => {
  const containerRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handler = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % initialOffers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = useCallback(() => setActiveIndex((p) => (p + 1) % initialOffers.length), []);

  useGSAP(() => {
    const glow = glowRef.current;
    if (!glow) return;
    const xTo = gsap.quickTo(glow, "x", { duration: 0.8, ease: "power3" });
    const yTo = gsap.quickTo(glow, "y", { duration: 0.8, ease: "power3" });
    const tick = () => {
      xTo(mouseRef.current.x - window.innerWidth / 2);
      yTo(mouseRef.current.y - window.innerHeight / 2);
    };
    gsap.ticker.add(tick);
  }, { scope: containerRef });

  const offer = initialOffers[activeIndex];

  return (
    <section ref={containerRef} className="hero-banner-section relative w-full z-10 overflow-hidden">
      <div className="hero-banner-inner relative w-full">

        {/* Background slider with cinematic cross-dissolve */}
        <AnimatePresence mode="wait">
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute inset-0 z-0 bg-gradient-to-br ${offer.bgClass}`}
          >
            <img src={offer.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.12] mix-blend-overlay pointer-events-none" />
            {/* Noise texture for depth */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")" }} />
            <div className="absolute right-8 md:right-16 bottom-12 md:bottom-20 w-32 md:w-52 h-32 md:h-52 opacity-[0.03] text-white pointer-events-none -rotate-12">
              <offer.icon className="w-full h-full" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Deep cinematic overlays — layered for realism */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/75 via-black/40 to-black/15 pointer-events-none" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
        {/* Vignette effect */}
        <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)" }} />

        {/* Mouse glow (desktop) — organic feel */}
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none hidden md:block">
          <div className="flex items-center justify-center w-full h-full">
            <div ref={glowRef} className="absolute w-[28rem] h-[28rem] bg-[#7c3aed]/6 rounded-full blur-[120px] mix-blend-screen will-change-transform" />
          </div>
        </div>

        {/* ─── Content: Left text + Right offer card ─── */}
        <div className="relative z-10 w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 md:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-10">
          
          {/* LEFT: Cinematic Text Block */}
          <motion.div 
            className="flex-1 max-w-xl flex flex-col justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow with accent line */}
            <motion.div variants={fadeUpVariant} className="flex items-center gap-2.5 mb-2 sm:mb-3">
              <div className="w-5 sm:w-7 h-px bg-gradient-to-r from-[#7c3aed] to-transparent" />
              <p className="text-[8px] sm:text-[9px] md:text-[10px] font-medium text-white/40 tracking-[0.2em] uppercase">
                Bypass the bureaucracy
              </p>
            </motion.div>
            
            {/* Headline — dramatic weight contrast */}
            <motion.h1 variants={fadeUpVariant} className="text-[1.75rem] sm:text-[2.25rem] md:text-[3rem] lg:text-[3.5rem] tracking-tighter leading-[0.92] mb-2.5 sm:mb-3.5 text-white">
              <span className="font-extralight inline"><ShuffleText text="INSTANT CAPITAL." delay={100} duration={800} /></span>{" "}
              <span className="font-medium text-[#7c3aed] drop-shadow-[0_0_20px_rgba(124,58,237,0.2)] inline"><ShuffleText text="ZERO FRICTION." delay={800} duration={1200} /></span>
            </motion.h1>
            
            {/* Subtext — airy & refined */}
            <motion.p variants={fadeUpVariant} className="text-[9px] sm:text-[10px] md:text-xs text-white/40 font-normal leading-relaxed max-w-sm md:max-w-md mb-4 sm:mb-5">
              Compare rates from 15+ banks, calculate your EMI, and apply in under 5 minutes.
            </motion.p>

            {/* Social proof — refined with separator */}
            <motion.div variants={fadeUpVariant} className="flex items-center gap-3">
              <div className="flex -space-x-1.5">
                {[1,2,3,4].map(i => (
                  <div 
                    key={i} 
                    className="w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] rounded-full flex items-center justify-center border-2 border-black/60"
                    style={{ 
                      background: `linear-gradient(135deg, rgba(124,58,237,${0.15 + i * 0.05}) 0%, rgba(124,58,237,${0.05 + i * 0.03}) 100%)`,
                    }}
                  >
                    <span className="text-[6px] sm:text-[7px] font-bold text-violet-400/90">{String.fromCharCode(64 + i)}</span>
                  </div>
                ))}
              </div>
              <div className="w-px h-5 bg-white/10" />
              <div className="flex flex-col gap-0.5">
                <p className="text-[9px] sm:text-[10px] md:text-[11px] text-white/60 font-medium leading-none">
                  <span className="text-violet-400 font-semibold tabular-nums">10,000+</span> applications processed
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-50" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-400" />
                  </span>
                  <span className="text-[7px] sm:text-[8px] text-white/30 font-medium tracking-widest uppercase">Live</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT: Premium Offer Card — elevated glassmorphism */}
          <div className="w-full md:w-[44%] lg:w-[40%] xl:w-[38%] flex items-center justify-center relative">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={offer.id + "-card"}
                initial={{ opacity: 0, x: 40, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -40, scale: 0.97 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="hero-offer-card w-full max-w-[420px] mr-12 sm:mr-14 relative group"
              >
                {/* Animated gradient border */}
                <div className="absolute -inset-px rounded-[18px] hero-gradient-border opacity-50 group-hover:opacity-80 transition-opacity duration-600" />
                
                {/* Card body — absolute fixed height to lock all cards perfectly to Axis bank size */}
                <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-2xl rounded-[18px] p-4 sm:p-5 md:p-6 overflow-hidden border border-white/[0.06] flex flex-col justify-between h-[230px] sm:h-[250px]">
                  {/* Ambient glow — top-right accent */}
                  <div 
                    className="absolute -top-8 -right-8 w-40 h-40 rounded-full blur-[60px] pointer-events-none transition-all duration-700" 
                    style={{ backgroundColor: offer.accentGlow }}
                  />
                  {/* Shimmer sweep on hover */}
                  <div className="absolute inset-0 hero-card-shimmer rounded-[18px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  {/* Header: Tag + Bank logo */}
                  <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 relative z-10">
                    <div className="bg-gradient-to-r from-[#facc15] to-[#eab308] text-[#422006] text-[6.5px] sm:text-[7.5px] font-extrabold uppercase tracking-[0.06em] px-2.5 sm:px-3 py-[5px] rounded-md flex items-center gap-1.5 shadow-[0_2px_16px_rgba(250,204,21,0.2),inset_0_1px_0_rgba(255,255,255,0.25)]">
                      <Zap className="w-2.5 h-2.5 fill-current" /> {offer.tag}
                    </div>
                    <div className="bg-white/[0.06] backdrop-blur-sm text-white/75 text-[7px] sm:text-[8px] font-semibold px-3 py-1.5 rounded-lg uppercase tracking-[0.1em] border border-white/[0.06] flex items-center justify-center min-w-[55px] flex-shrink-0">
                      {offer.logo ? (
                        <img src={offer.logo} alt={offer.bank} className="h-3 sm:h-3.5 w-auto object-contain brightness-0 invert opacity-80" />
                      ) : (
                        offer.bank
                      )}
                    </div>
                  </div>
                  
                  <h3 className="relative z-10 text-[15px] sm:text-lg md:text-xl lg:text-[1.35rem] font-semibold text-white/95 leading-snug tracking-tight mb-3 line-clamp-2">
                    {offer.title}
                  </h3>
                  
                  {/* Highlights with subtle left accent — pushed to fill remaining space */}
                  <div className="relative z-10 flex flex-col gap-2 mb-4 pl-2.5 border-l border-white/[0.06] flex-1">
                    {offer.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 opacity-70" style={{ color: offer.accentColor }} />
                        <span className="text-[8px] sm:text-[9px] md:text-[10px] font-medium text-white/80 leading-snug">{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer — dots + CTA — pushed to bottom naturally */}
                  <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/[0.05] mt-auto">
                    <div className="flex gap-2">
                      {initialOffers.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveIndex(i)}
                          aria-label={`View offer ${i + 1}`}
                          className={`rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            i === activeIndex 
                              ? "bg-white w-6 h-[5px] shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                              : "bg-white/10 w-[5px] h-[5px] hover:bg-white/25"
                          }`}
                        />
                      ))}
                    </div>
                    <Link 
                      to="/apply" 
                      className="hero-card-cta relative overflow-hidden bg-white/[0.07] backdrop-blur-sm text-white/90 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-[8px] sm:text-[9px] md:text-[10px] tracking-wide transition-all flex items-center gap-2 border border-white/[0.1] hover:border-white/25 hover:bg-white/[0.12] group/cta active:scale-[0.97]"
                    >
                      Apply Now 
                      <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/10 flex items-center justify-center group-hover/cta:bg-white/20 transition-colors">
                        <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover/cta:translate-x-[1px] transition-transform" />
                      </span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Next arrow — refined */}
            <button 
              onClick={handleNext} 
              aria-label="Next offer"
              className="absolute right-0 md:-right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/[0.08] text-white/40 hover:text-white/90 hover:bg-white/[0.1] hover:border-white/20 flex items-center justify-center transition-all duration-400 hover:scale-110 active:scale-95 group"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* ─── Marquee Bar — minimal & clean ─── */}
        <div className="relative z-10 w-full hero-marquee-bar">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          {/* Left/right fade masks */}
          <div className="absolute top-0 left-0 w-16 sm:w-24 h-full bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-16 sm:w-24 h-full bg-gradient-to-l from-black/80 to-transparent z-10 pointer-events-none" />
          
          <div className="hero-marquee-track flex items-center py-2.5 sm:py-3 gap-2.5 sm:gap-3">
            {[...marqueeOffers, ...marqueeOffers].map((o, i) => (
              <div 
                key={i} 
                className="flex-shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-[6px] sm:py-2 rounded-full border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-400 cursor-default group/pill"
              >
                <span 
                  className="w-[5px] h-[5px] rounded-full flex-shrink-0 transition-shadow duration-400 group-hover/pill:shadow-[0_0_8px_var(--dot-color)]" 
                  style={{ backgroundColor: o.color, ["--dot-color" as string]: `${o.color}80` }} 
                />
                <span className="text-[8.5px] sm:text-[9.5px] md:text-[10.5px] font-medium text-white/40 group-hover/pill:text-white/70 whitespace-nowrap tracking-wide transition-colors duration-400">{o.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .hero-banner-inner { min-height: 280px; }
        @media (min-width: 768px) { .hero-banner-inner { min-height: 340px; } }
        @media (min-width: 1024px) { .hero-banner-inner { min-height: 320px; } }

        .hero-marquee-bar {
          background: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.6) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .hero-marquee-track { 
          animation: heroMarqueeScroll 35s linear infinite; 
          width: max-content; 
        }
        .hero-marquee-track:hover { animation-play-state: paused; }
        @keyframes heroMarqueeScroll { 
          0% { transform: translateX(0); } 
          100% { transform: translateX(-50%); } 
        }

        /* Rotating gradient border on offer card */
        .hero-gradient-border {
          background: conic-gradient(
            from var(--border-angle, 0deg),
            transparent 20%,
            rgba(255,255,255,0.12) 40%,
            rgba(124,58,237,0.15) 50%,
            rgba(255,255,255,0.12) 60%,
            transparent 80%
          );
          animation: rotateBorder 6s linear infinite;
        }
        @property --border-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes rotateBorder {
          to { --border-angle: 360deg; }
        }

        /* Shimmer sweep */
        .hero-card-shimmer {
          background: linear-gradient(
            105deg, 
            transparent 30%, 
            rgba(255,255,255,0.04) 45%, 
            rgba(255,255,255,0.07) 50%, 
            rgba(255,255,255,0.04) 55%, 
            transparent 70%
          );
          background-size: 250% 100%;
          animation: cardShimmer 4s ease-in-out infinite;
        }
        @keyframes cardShimmer {
          0%, 100% { background-position: 250% 0; }
          50% { background-position: -250% 0; }
        }

        .hero-offer-card {
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hero-offer-card:hover {
          transform: translateY(-3px);
        }

        /* CTA micro-interaction */
        .hero-card-cta::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          transition: left 0.5s ease;
        }
        .hero-card-cta:hover::after {
          left: 120%;
        }
      `}</style>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;