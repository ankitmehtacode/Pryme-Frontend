import { useRef, useEffect, memo, useCallback, useState } from "react";
import { ArrowRight, Percent, Zap, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "framer-motion";

// 🧠 Dynamic Offers Payload configured exactly to the screenshot reference
const initialOffers = [
  { 
    id: "hdfc-holi", 
    bank: "HDFC BANK", 
    title: "Holi Special Sale: 25% Off\nProcessing Fees", 
    desc: "• Lowest Interest Rates starting at 10.25%*\n• Zero pre-closure charges after 12 months", 
    tag: "NEED URGENT FUNDS THIS MONTH?",
    icon: Percent,
    bgClass: "bg-[#0f462b]", // Exact dark green from screenshot
    shadowClass: "shadow-[0_20px_40px_rgba(15,70,43,0.3)]"
  },
  { 
    id: "icici-cashback", 
    bank: "ICICI BANK", 
    title: "Get ₹5,000 Instant\nCashback on Approval", 
    desc: "• Direct credit to your account on 1st EMI\n• 100% Digital Process & Fast Approval", 
    tag: "EXCLUSIVE PRYME OFFER",
    icon: Zap,
    bgClass: "bg-[#1e3a8a]", // Deep blue
    shadowClass: "shadow-[0_20px_40px_rgba(30,58,138,0.3)]"
  },
  { 
    id: "axis-pre", 
    bank: "AXIS BANK", 
    title: "Pre-Approved Limit\nup to ₹50,00,000", 
    desc: "• Zero documentation for salary accounts\n• Funds disbursed within 3 hours", 
    tag: "FAST TRACK APPROVAL",
    icon: Sparkles,
    bgClass: "bg-[#4c1d95]", // Deep purple
    shadowClass: "shadow-[0_20px_40px_rgba(76,29,149,0.3)]"
  }
];

const HeroSection = memo(() => {
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const [offers, setOffers] = useState(initialOffers);

  // Track Mouse for ambient glow
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useGSAP(() => {
    // 1. Mouse Follow Glow
    const glow = glowRef.current;
    if (glow) {
      const xTo = gsap.quickTo(glow, "x", { duration: 0.8, ease: "power3" });
      const yTo = gsap.quickTo(glow, "y", { duration: 0.8, ease: "power3" });

      const tick = () => {
        xTo(mouseRef.current.x - window.innerWidth / 2);
        yTo(mouseRef.current.y - window.innerHeight / 2);
      };
      gsap.ticker.add(tick);
    }

    // 2. Pure Typography Entrance Animation
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

    if (headlineRef.current) {
      tl.fromTo(
        headlineRef.current.children,
        { y: 20, opacity: 0, filter: "blur(5px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, stagger: 0.1 },
        0.1
      );
    }
  }, { scope: containerRef });

  // 🧠 ReactBits Card Swap Logic
  const handleSwap = () => {
    setOffers((prev) => {
      const newOffers = [...prev];
      const topOffer = newOffers.shift();
      if (topOffer) newOffers.push(topOffer);
      return newOffers;
    });
  };

  return (
    <section 
      ref={containerRef} 
      // 🧠 1. BLANK SPACE REMOVED: pt-24 drops to pt-16/20. pb-6 dropped to pb-0!
      // 🧠 2. CLIPPING FIXED: "overflow-hidden" completely removed from this wrapper so the Product Grid can overlap it safely.
      className="relative w-full flex items-center justify-center bg-[#0a0a0a] pt-16 md:pt-20 pb-0 border-b border-white/5 z-10"
    >
      {/* Background Layers (Overflow hidden isolated here so the glow doesn't cause horizontal scrolling) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        {/* Subtle dynamic green glow */}
        <div 
          ref={glowRef}
          className="absolute w-[25rem] h-[25rem] bg-[#2aac64]/10 rounded-full blur-[120px] mix-blend-screen will-change-transform"
        />
      </div>

      {/* Tightly packed horizontal flex container with reduced vertical gap for mobile */}
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 relative z-10 flex flex-col xl:flex-row items-center justify-between gap-6 xl:gap-4 mb-4 md:mb-8">
        
        {/* 🧠 LEFT COLUMN: Ultra-Compressed Typography */}
        <div className="w-full xl:w-[50%] flex flex-col items-center xl:items-start text-center xl:text-left z-20">
          <div ref={headlineRef} className="w-full max-w-[550px]">
            
            <p className="text-base md:text-xl lg:text-2xl font-bold text-slate-300 tracking-tight leading-none mb-2">
              Bypass the bureaucracy.
            </p>
            
            <h1 className="text-[2.75rem] md:text-[4rem] lg:text-[4.5rem] font-black tracking-tighter leading-[0.95] mb-3">
              <span className="block text-white">INSTANT</span>
              <span className="block text-white">CAPITAL.</span>
              <span className="block text-[#2aac64] drop-shadow-[0_0_15px_rgba(42,172,100,0.3)]">
                ZERO FRICTION.
              </span>
            </h1>
            
            <p className="text-xs md:text-sm text-slate-400 font-medium leading-snug max-w-[90%] mx-auto xl:mx-0">
              Compare premium rates from 15+ top-tier banks, calculate EMIs instantly, and unlock your financial trajectory today.
            </p>
            
          </div>
        </div>

        {/* 🧠 RIGHT COLUMN: Compact Card Swap Engine */}
        <div className="w-full xl:w-[50%] h-[200px] md:h-[220px] shrink-0 relative z-20 flex items-center justify-center perspective-[1200px] mt-2 xl:mt-0">
          
          {/* Aligned tightly to the top to save space */}
          <div className="absolute top-0 right-4 flex flex-col items-end z-30 pointer-events-none">
            <span className="text-[9px] font-bold text-[#2aac64] uppercase tracking-widest animate-pulse">LIVE BANK OFFERS</span>
            <span className="text-[9px] text-slate-500">Tap card to cycle</span>
          </div>

          {/* Wrapper height massively reduced to force the next section up */}
          <div className="relative w-full max-w-[460px] lg:max-w-[500px] h-[160px] md:h-[190px] mt-4">
            <AnimatePresence mode="popLayout">
              {offers.map((offer, index) => {
                const isTop = index === 0;
                const Icon = offer.icon;

                return (
                  <motion.div
                    key={offer.id}
                    layout
                    onClick={isTop ? handleSwap : undefined}
                    initial={false}
                    animate={{
                      y: index * 14, // Tighter visual stacking height
                      scale: 1 - index * 0.05,
                      zIndex: offers.length - index,
                      opacity: 1 - index * 0.15,
                    }}
                    transition={{ type: "spring", stiffness: 280, damping: 25 }}
                    className={`absolute top-0 w-full h-full rounded-[1.25rem] transform-gpu origin-top will-change-transform ${isTop ? 'cursor-pointer hover:-translate-y-1 transition-transform duration-300' : 'pointer-events-none'}`}
                  >
                    <div className={`relative w-full h-full ${offer.bgClass} border border-white/10 rounded-[1.25rem] flex flex-col p-4 overflow-hidden ${isTop ? offer.shadowClass : ''}`}>
                      
                      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
                      <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10 pointer-events-none transform -rotate-12">
                        <Icon className="w-full h-full text-white" />
                      </div>

                      <div className="relative z-10 flex justify-between items-start mb-2">
                        <div className="bg-[#facc15] text-[#422006] text-[8px] md:text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-sm flex items-center gap-1 shadow-sm">
                          <Zap className="w-3 h-3 fill-current" /> {offer.tag}
                        </div>
                        <span className="bg-black/30 text-white/90 text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest border border-white/5 backdrop-blur-md">
                          {offer.bank}
                        </span>
                      </div>

                      <div className="relative z-10 flex-1 flex flex-col justify-center">
                        <h3 className="text-base md:text-lg lg:text-xl font-black text-[#fde047] leading-tight tracking-tight mb-1 drop-shadow-sm">
                          {offer.title}
                        </h3>
                        <p className="text-[9px] md:text-[11px] font-medium text-white/90 whitespace-pre-line leading-snug">
                          {offer.desc}
                        </p>
                      </div>

                      {isTop && (
                        <div className="relative z-10 mt-auto pt-1">
                          <button className="bg-[#111] text-white px-4 py-1.5 rounded-full font-bold text-[10px] shadow-xl hover:bg-black transition-colors flex items-center gap-1.5 border border-white/10 w-max">
                            Apply Now <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;