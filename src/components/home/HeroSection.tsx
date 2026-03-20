import { useRef, useEffect, memo, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Percent, Zap, Sparkles, Activity } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion } from "framer-motion";
import CardSwap, { Card } from "@/components/ui/CardSwap";
import { ShuffleText } from "@/components/ui/ShuffleText";
import { Button } from "@/components/ui/button";

// Connect the available bank logos
import iciciLogo from "@/assets/icici.svg";
import axisLogo from "@/assets/axis-bank-logo-1.svg";

// 🧠 Dynamic Offers using elegant semantic variables for Light/Dark themes
const initialOffers = [
  { 
    id: "axis-pre", 
    bank: "AXIS BANK",
    logo: axisLogo, 
    title: "Pre-Approved Limit\nup to ₹50,00,000", 
    desc: "• Zero documentation for salary accounts\n• Funds disbursed within 3 hours", 
    tag: "FAST TRACK APPROVAL",
    icon: Sparkles,
    bgClass: "from-[#4c1d95] to-[#3b0764]", // Deep purple
  },
  { 
    id: "icici-cashback", 
    bank: "ICICI BANK", 
    logo: iciciLogo,
    title: "Get ₹5,000 Instant\nCashback on Approval", 
    desc: "• Direct credit to your account on 1st EMI\n• 100% Digital Process & Fast Approval", 
    tag: "EXCLUSIVE PRYME OFFER",
    icon: Zap,
    bgClass: "from-[#1e3a8a] to-[#172554]", // Deep blue
  },
  { 
    id: "hdfc-holi", 
    bank: "HDFC BANK", 
    logo: null,
    title: "Holi Special Sale: 25% Off\nProcessing Fees", 
    desc: "• Lowest Interest Rates starting at 10.25%*\n• Zero pre-closure charges after 12 months", 
    tag: "NEED URGENT FUNDS THIS MONTH?",
    icon: Percent,
    bgClass: "from-[#0f462b] to-[#022c22]", // Exact dark green
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
      className="relative w-full flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] pt-16 md:pt-20 pb-0 border-b border-slate-200 dark:border-white/5 z-10"
    >
      {/* Background Layers */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Ambient Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06] dark:opacity-[0.04]"
        >
          <source src="https://videos.pexels.com/video-files/3130284/3130284-sd_640_360_30fps.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlay to preserve text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 via-slate-50/70 to-slate-50 dark:from-[#0a0a0a]/95 dark:via-[#0a0a0a]/80 dark:to-[#0a0a0a]" />
        {/* Subtle dynamic green glow */}
        <div className="flex items-center justify-center w-full h-full">
          <div 
            ref={glowRef}
            className="absolute w-[25rem] h-[25rem] bg-[#2aac64]/10 rounded-full blur-[120px] mix-blend-screen will-change-transform"
          />
        </div>
      </div>

      {/* Tightly packed horizontal flex container with reduced vertical gap for mobile */}
      <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 relative z-10 flex flex-col xl:flex-row items-center justify-between gap-6 xl:gap-4 mb-4 md:mb-8">
        
        {/* 🧠 LEFT COLUMN: Ultra-Compressed Typography */}
        <div className="w-full xl:w-[50%] flex flex-col items-center xl:items-start text-center xl:text-left z-20">
          <div ref={headlineRef} className="w-full max-w-[550px]">
            
            <p className="text-base md:text-xl lg:text-2xl font-normal text-muted-foreground tracking-tight leading-none mb-2">
              Bypass the bureaucracy.
            </p>
            
            <h1 className="text-[2.75rem] md:text-[4rem] lg:text-[4.5rem] font-light tracking-tighter leading-[0.95] mb-3">
              <span className="block text-foreground">
                <ShuffleText text="INSTANT" delay={100} duration={800} />
              </span>
              <span className="block text-foreground">
                <ShuffleText text="CAPITAL." delay={600} duration={800} />
              </span>
              <span className="block text-[#2aac64] drop-shadow-[0_0_15px_rgba(42,172,100,0.3)]">
                <ShuffleText text="ZERO FRICTION." delay={1200} duration={1200} />
              </span>
            </h1>
            
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-normal leading-snug max-w-[90%] mx-auto xl:mx-0">
              Compare rates from 15+ banks, calculate your EMI, and apply in under 5 minutes.
            </p>
            
            {/* Social Proof Micro-copy (Zeigarnik + Social Proof) */}
            <div className="flex items-center gap-2 mt-3 mx-auto xl:mx-0 w-max">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full bg-emerald-500/20 border-2 border-slate-50 dark:border-[#0a0a0a] flex items-center justify-center">
                    <span className="text-[7px] font-bold text-emerald-600 dark:text-emerald-400">{String.fromCharCode(64 + i)}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">10,000+</span> applications processed this quarter
              </p>
            </div>
            
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
                    <div className={`relative w-full h-full bg-gradient-to-br ${offer.bgClass} flex flex-col p-5 overflow-hidden border border-white/10 ring-1 ring-inset ring-white/5`}>
                      
                      {/* Subtle elegant pattern */}
                      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
                      
                      {/* Icon watermark */}
                      <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 text-white pointer-events-none transform -rotate-12 blur-[1px]">
                        <Icon className="w-full h-full" />
                      </div>

                      <div className="relative z-10 flex justify-between items-start mb-4">
                        <div className="bg-[#facc15] text-[#422006] text-[8px] md:text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded shadow-[0_0_15px_rgba(250,204,21,0.3)] flex items-center gap-1.5 ring-1 ring-[#facc15]/50">
                          <Zap className="w-3.5 h-3.5 fill-current" /> {offer.tag}
                        </div>
                        <span className="bg-black/40 text-white/90 text-[9px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest border border-white/10 backdrop-blur-md flex items-center justify-center min-w-[80px] shadow-sm">
                          {offer.logo ? (
                            <img src={offer.logo} alt={offer.bank} className="h-3.5 w-auto object-contain drop-shadow-md brightness-0 invert" />
                          ) : (
                            offer.bank
                          )}
                        </span>
                      </div>

                      <div className="relative z-10 flex-1 flex flex-col justify-center">
                        <h3 className="text-lg md:text-xl lg:text-[22px] font-bold text-[#fde047] leading-tight tracking-tight mb-2 drop-shadow-md">
                          {offer.title}
                        </h3>
                        <p className="text-[10px] md:text-xs font-semibold text-blue-50/90 whitespace-pre-line leading-relaxed drop-shadow-sm">
                          {offer.desc}
                        </p>
                      </div>

                      <div className="relative z-10 mt-auto pt-4 flex justify-end items-center">
                        <Link to="/apply" onClick={(e) => e.stopPropagation()} className="bg-black/50 backdrop-blur-md text-white px-6 py-2.5 rounded-full font-bold text-[11px] hover:bg-black/70 transition-all flex items-center gap-2 border border-white/20 hover:border-white/40 shadow-lg w-max group z-50 outline-none focus:ring-2 focus:ring-[#facc15]" aria-label="Apply for this loan offer">
                          Apply Now <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                        </Link>
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