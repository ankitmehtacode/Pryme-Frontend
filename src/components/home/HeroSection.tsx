import { useRef, useEffect, memo, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Sparkles, Percent, ChevronRight } from "lucide-react";
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
    desc: "• Zero documentation for salary accounts\n• Funds disbursed within 3 hours", 
    tag: "FAST TRACK APPROVAL", icon: Sparkles,
    bgClass: "from-[#97144d] via-[#6b0f38] to-[#3d0920]",
    bgImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1400&auto=format&fit=crop",
  },
  { 
    id: "icici-cashback", bank: "ICICI BANK", logo: iciciLogo,
    title: "Get ₹5,000 Instant Cashback on Approval", 
    desc: "• Direct credit to your account on 1st EMI\n• 100% Digital Process & Fast Approval", 
    tag: "EXCLUSIVE PRYME OFFER", icon: Zap,
    bgClass: "from-[#1e3a8a] via-[#172554] to-[#0c1a3d]",
    bgImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1400&auto=format&fit=crop",
  },
  { 
    id: "hdfc-holi", bank: "HDFC BANK", logo: null,
    title: "25% Off Processing Fees + Lowest Rates", 
    desc: "• Interest Rates starting at 10.25%*\n• Zero pre-closure charges after 12 months", 
    tag: "LIMITED TIME OFFER", icon: Percent,
    bgClass: "from-[#004b87] via-[#003560] to-[#001b30]",
    bgImage: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?q=80&w=1400&auto=format&fit=crop",
  }
];

const marqueeOffers = [
  { text: "25% off on HDFC", color: "#004b87" },
  { text: "₹5,000 Cashback ICICI", color: "#f58220" },
  { text: "Pre-Approved ₹50L Axis", color: "#97144d" },
  { text: "10.25%* Interest Rate", color: "#2aac64" },
  { text: "Zero Documentation", color: "#8b5cf6" },
  { text: "3hr Disbursal", color: "#06b6d4" },
  { text: "No Pre-closure Fee", color: "#f59e0b" },
  { text: "Salary A/C Special", color: "#ec4899" },
];

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

        {/* Background slider */}
        <AnimatePresence mode="wait">
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className={`absolute inset-0 z-0 bg-gradient-to-br ${offer.bgClass}`}
          >
            <img src={offer.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.16] mix-blend-overlay pointer-events-none" />
            <div className="absolute right-8 md:right-16 bottom-12 md:bottom-20 w-32 md:w-52 h-32 md:h-52 opacity-[0.04] text-white pointer-events-none -rotate-12">
              <offer.icon className="w-full h-full" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Readability overlays */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/70 via-black/40 to-black/20 pointer-events-none" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none" />

        {/* Mouse glow (desktop) */}
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none hidden md:block">
          <div className="flex items-center justify-center w-full h-full">
            <div ref={glowRef} className="absolute w-[22rem] h-[22rem] bg-[#2aac64]/8 rounded-full blur-[100px] mix-blend-screen will-change-transform" />
          </div>
        </div>

        {/* Content: Left text + Right offer card */}
        <div className="relative z-10 w-full px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-6 sm:py-8 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-8">
          
          {/* LEFT: Text */}
          <div className="flex-1 max-w-xl flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="flex -space-x-1.5">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] rounded-full bg-white/10 border-[1.5px] border-white/20 flex items-center justify-center">
                    <span className="text-[5px] sm:text-[6px] font-bold text-emerald-400">{String.fromCharCode(64 + i)}</span>
                  </div>
                ))}
              </div>
              <p className="text-[8px] sm:text-[9px] md:text-[10px] text-white/60 font-medium">
                <span className="text-emerald-400 font-semibold">10,000+</span> applications processed
              </p>
            </div>

            <p className="text-[9px] sm:text-[10px] md:text-[11px] font-normal text-white/50 tracking-[0.15em] uppercase mb-1 sm:mb-1.5">
              Bypass the bureaucracy.
            </p>
            
            <h1 className="text-[1.75rem] sm:text-[2.25rem] md:text-[3rem] lg:text-[3.5rem] font-light tracking-tighter leading-[0.92] mb-2 sm:mb-3 text-white">
              <span className="inline"><ShuffleText text="INSTANT CAPITAL." delay={100} duration={800} /></span>{" "}
              <span className="text-[#2aac64] drop-shadow-[0_0_12px_rgba(42,172,100,0.25)] inline"><ShuffleText text="ZERO FRICTION." delay={800} duration={1200} /></span>
            </h1>
            
            <p className="text-[9px] sm:text-[10px] md:text-xs text-white/50 font-normal leading-relaxed max-w-sm md:max-w-md mb-3 sm:mb-4">
              Compare rates from 15+ banks, calculate your EMI, and apply in under 5 minutes.
            </p>

            <Link 
              to="/apply" 
              className="inline-flex items-center gap-2 bg-[#2aac64] hover:bg-[#239b57] text-white px-5 py-2 sm:px-6 sm:py-2.5 rounded-full font-semibold text-[10px] sm:text-[11px] md:text-xs tracking-wide transition-all hover:scale-[1.03] active:scale-[0.98] group w-max"
            >
              Apply Now <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* RIGHT: Offer Card with left/right arrows on edges */}
          <div className="w-full md:w-[44%] lg:w-[40%] xl:w-[38%] flex items-center justify-center relative">
            


            {/* Offer card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={offer.id + "-card"}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-[420px] mr-12 sm:mr-14 bg-black/25 backdrop-blur-md rounded-2xl border border-white/[0.1] p-4 sm:p-5 md:p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="bg-[#facc15] text-[#422006] text-[7px] sm:text-[8px] font-bold uppercase tracking-widest px-2 sm:px-2.5 py-1 rounded shadow-[0_0_10px_rgba(250,204,21,0.3)] flex items-center gap-1 ring-1 ring-[#facc15]/50">
                    <Zap className="w-2.5 h-2.5 fill-current" /> {offer.tag}
                  </div>
                  <span className="bg-black/30 text-white/90 text-[7px] sm:text-[8px] font-bold px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-widest border border-white/10 backdrop-blur-md flex items-center justify-center min-w-[55px] flex-shrink-0">
                    {offer.logo ? (
                      <img src={offer.logo} alt={offer.bank} className="h-3 sm:h-3.5 w-auto object-contain brightness-0 invert" />
                    ) : (
                      offer.bank
                    )}
                  </span>
                </div>
                
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#fde047] leading-tight tracking-tight mb-2 drop-shadow-md">
                  {offer.title}
                </h3>
                
                <p className="text-[8px] sm:text-[9px] md:text-[10px] font-medium text-white/60 whitespace-pre-line leading-relaxed mb-3">
                  {offer.desc}
                </p>

                {/* Card footer: dots + CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <div className="flex gap-1.5">
                    {initialOffers.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === activeIndex 
                            ? "bg-[#facc15] w-5 shadow-[0_0_6px_rgba(250,204,21,0.5)]" 
                            : "bg-white/20 w-1.5 hover:bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                  <Link 
                    to="/apply" 
                    className="bg-black/40 backdrop-blur-md text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-[8px] sm:text-[9px] md:text-[10px] hover:bg-black/60 transition-all flex items-center gap-1.5 border border-white/15 hover:border-white/30 shadow-lg group active:scale-95"
                  >
                    Apply Now <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-70 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Next arrow — transparent glass */}
            <button onClick={handleNext} className="absolute right-0 md:-right-5 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15] text-white/70 hover:text-white hover:bg-white/[0.18] hover:border-white/30 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group shadow-lg">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* Marquee bar */}
        <div className="relative z-10 w-full bg-black/50 backdrop-blur-md border-t border-white/[0.06]">
          <div className="hero-marquee-track flex items-center py-2.5 sm:py-3 md:py-3.5 gap-4 sm:gap-5">
            {[...marqueeOffers, ...marqueeOffers].map((o, i) => (
              <div key={i} className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-default">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: o.color, boxShadow: `0 0 6px ${o.color}60` }} />
                <span className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold text-white/70 whitespace-nowrap tracking-wide">{o.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .hero-banner-inner { min-height: 320px; }
        @media (min-width: 768px) { .hero-banner-inner { height: 52vh; max-height: 480px; min-height: 360px; } }
        @media (min-width: 1024px) { .hero-banner-inner { height: 50vh; max-height: 460px; } }
        .hero-marquee-track { animation: heroMarqueeScroll 25s linear infinite; width: max-content; }
        .hero-marquee-track:hover { animation-play-state: paused; }
        @keyframes heroMarqueeScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;