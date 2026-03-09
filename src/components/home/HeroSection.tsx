import { useRef, useEffect, memo, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Percent, Zap, Sparkles, Activity } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion } from "framer-motion";
import CardSwap, { Card } from "@/components/ui/CardSwap";
import { ShuffleText } from "@/components/ui/ShuffleText";

// Connect the available bank logos
import iciciLogo from "@/assets/icici.svg";
import axisLogo from "@/assets/axis-bank-logo-1.svg";

// 🧠 Dynamic Offers Payload configured exactly to the screenshot reference
const initialOffers = [
  { 
    id: "axis-pre", 
    bank: "AXIS BANK",
    logo: axisLogo, 
    title: "Pre-Approved Limit\nup to ₹50,00,000", 
    desc: "• Zero documentation for salary accounts\n• Funds disbursed within 3 hours", 
    tag: "FAST TRACK APPROVAL",
    icon: Sparkles,
    bgClass: "bg-[#4c1d95]", // Deep purple
  },
  { 
    id: "icici-cashback", 
    bank: "ICICI BANK", 
    logo: iciciLogo,
    title: "Get ₹5,000 Instant\nCashback on Approval", 
    desc: "• Direct credit to your account on 1st EMI\n• 100% Digital Process & Fast Approval", 
    tag: "EXCLUSIVE PRYME OFFER",
    icon: Zap,
    bgClass: "bg-[#1e3a8a]", // Deep blue
  },
  { 
    id: "hdfc-holi", 
    bank: "HDFC BANK", 
    logo: null,
    title: "Holi Special Sale: 25% Off\nProcessing Fees", 
    desc: "• Lowest Interest Rates starting at 10.25%*\n• Zero pre-closure charges after 12 months", 
    tag: "NEED URGENT FUNDS THIS MONTH?",
    icon: Percent,
    bgClass: "bg-[#0f462b]", // Exact dark green from screenshot
  }
];

const HeroSection = memo(() => {
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

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

    // 2. Pure Typography Entrance Animation (Removed to let ShuffleText handle visibility)
    // Left empty so other timeline items can still be added if needed
  }, { scope: containerRef });

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
            
            <p className="text-base md:text-xl lg:text-2xl font-medium text-slate-300 tracking-tight leading-none mb-2">
              Bypass the bureaucracy.
            </p>
            
            <h1 className="text-[2.75rem] md:text-[4rem] lg:text-[4.5rem] font-semibold tracking-tighter leading-[0.95] mb-3">
              <span className="block text-white">
                <ShuffleText text="INSTANT" delay={100} duration={800} />
              </span>
              <span className="block text-white">
                <ShuffleText text="CAPITAL." delay={600} duration={800} />
              </span>
              <span className="block text-[#2aac64] drop-shadow-[0_0_15px_rgba(42,172,100,0.3)]">
                <ShuffleText text="ZERO FRICTION." delay={1200} duration={1200} />
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
            <span className="text-[9px] font-medium text-[#2aac64] uppercase tracking-widest animate-pulse">LIVE BANK OFFERS</span>
            <span className="text-[9px] text-slate-500">Tap card to cycle</span>
          </div>

          {/* Wrapper height massively reduced to force the next section up */}
          <motion.div 
            className="relative w-full max-w-[460px] lg:max-w-[500px] h-[160px] md:h-[190px] mt-4 z-40"
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, -1, 0]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <CardSwap
              width={460}
              height={190}
              cardDistance={16}
              verticalDistance={16}
              delay={4000}
              pauseOnHover={true}
              easing="elastic"
            >
              {initialOffers.map((offer) => {
                const Icon = offer.icon;
                return (
                  <Card key={offer.id} className="p-0 border-0 rounded-[1.25rem] overflow-hidden cursor-pointer shadow-2xl">
                    <div className={`relative w-full h-full ${offer.bgClass} flex flex-col p-4 overflow-hidden border border-white/10`}>
                      
                      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
                      <div className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10 pointer-events-none transform -rotate-12">
                        <Icon className="w-full h-full text-white" />
                      </div>

                      <div className="relative z-10 flex justify-between items-start mb-2">
                        <div className="bg-[#facc15] text-[#422006] text-[8px] md:text-[9px] font-semibold uppercase tracking-wider px-2 py-1 rounded-sm flex items-center gap-1 shadow-sm">
                          <Zap className="w-3 h-3 fill-current" /> {offer.tag}
                        </div>
                        <span className="bg-black/30 text-white/90 text-[8px] font-medium px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/5 backdrop-blur-md flex items-center justify-center min-w-[80px]">
                          {offer.logo ? (
                            <img src={offer.logo} alt={offer.bank} className="h-3 w-auto object-contain drop-shadow-md brightness-0 invert" />
                          ) : (
                            offer.bank
                          )}
                        </span>
                      </div>

                      <div className="relative z-10 flex-1 flex flex-col justify-center">
                        <h3 className="text-base md:text-lg lg:text-xl font-semibold text-[#fde047] leading-tight tracking-tight mb-1 drop-shadow-sm">
                          {offer.title}
                        </h3>
                        <p className="text-[9px] md:text-[11px] font-medium text-white/90 whitespace-pre-line leading-snug">
                          {offer.desc}
                        </p>
                      </div>

                      <div className="relative z-10 mt-auto pt-1 flex justify-between items-center">
                        <Link to="/apply" onClick={(e) => e.stopPropagation()} className="bg-[#111] text-white px-4 py-1.5 rounded-full font-medium text-[10px] shadow-xl hover:bg-black transition-colors flex items-center gap-1.5 border border-white/10 w-max group z-50 outline-none focus:ring-2 focus:ring-[#2aac64]">
                          Apply Now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <div className="flex items-center gap-1 text-[8px] text-[#2aac64] font-medium tracking-widest uppercase opacity-80 backdrop-blur-sm bg-black/20 px-2 py-1 rounded border border-[#2aac64]/20 animate-pulse">
                          <Activity className="w-3 h-3" /> Live
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </CardSwap>
          </motion.div>
        </div>

      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;