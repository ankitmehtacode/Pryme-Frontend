import { useRef, useEffect, memo, useCallback } from "react";
import { ShieldCheck } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SmartInput from "./SmartInput";

// Values are numbers so GSAP can calculate the math
const stats = [
  { value: 500, suffix: "Cr+", prefix: "₹", label: "Capital Disbursed" },
  { value: 24, suffix: "h", prefix: "", label: "Average Approval" },
  { value: 98, suffix: "%", prefix: "", label: "Success Rate" },
];

const HeroSection = memo(() => {
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
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
    // 1. Mouse Follow Glow (Hardware Accelerated)
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

    // 2. Aggressive Entrance Animation
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

    // Stagger text reveal
    if (headlineRef.current) {
      tl.fromTo(
        headlineRef.current.children,
        { y: 60, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, stagger: 0.15 },
        0.1
      );
    }

    // Fade up Smart Input & Stats Pill
    tl.fromTo(
      ".hero-fade-up",
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.1 },
      0.4
    );

    // 3. Live Counting Numbers Animation
    if (statsRef.current) {
      const numberElements = statsRef.current.querySelectorAll('.stat-number');
      
      numberElements.forEach((el, index) => {
        const targetValue = stats[index].value;
        
        gsap.fromTo(el, 
          { textContent: 0 }, 
          { 
            textContent: targetValue, 
            duration: 2.5, // Slow, premium tick up
            ease: "power3.out", 
            snap: { textContent: 1 }, // Forces whole numbers so no decimals flash
            delay: 0.8 // Waits for the pill to fade up first
          }
        );
      });
    }

  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      // FIXED BG COLORS: Explicitly White for light mode, Pure Black for dark mode
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-white dark:bg-[#030303] pt-24 pb-16"
    >
      {/* --- Ambient Glows & 160 IQ CSS 3D Orbs --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        {/* Dynamic Green Glow attached to mouse */}
        <div 
          ref={glowRef}
          className="absolute w-[30rem] md:w-[45rem] h-[30rem] md:h-[45rem] bg-[#2aac64]/15 dark:bg-[#2aac64]/10 rounded-full blur-[100px] md:blur-[140px] mix-blend-screen will-change-transform"
        />
        
        {/* Pure CSS 3D Glass Sphere 1 (Top Left) */}
        <div className="absolute top-[15%] left-[10%] w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-white/40 to-white/5 dark:from-white/10 dark:to-transparent backdrop-blur-md border border-white/40 dark:border-white/10 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.1),0_15px_30px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_-10px_20px_rgba(255,255,255,0.05),0_15px_30px_rgba(0,0,0,0.5)] animate-float-slow" />
        
        {/* Pure CSS 3D Glass Sphere 2 (Bottom Right) */}
        <div className="absolute bottom-[20%] right-[10%] w-24 h-24 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-[#2aac64]/30 to-white/20 dark:from-[#2aac64]/20 dark:to-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-[inset_0_-8px_16px_rgba(0,0,0,0.1),0_10px_20px_rgba(42,172,100,0.1)] dark:shadow-[inset_0_-8px_16px_rgba(255,255,255,0.05),0_10px_20px_rgba(0,0,0,0.5)] animate-float-medium blur-[1px]" />
      </div>

      {/* --- Main Content --- */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
        
        {/* Premium Tagline Overline */}
        <div className="hero-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#2aac64] animate-pulse" />
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-slate-800 dark:text-white/80 uppercase">
            Unfair Financial Advantage
          </span>
        </div>
        
        {/* Massive Aggressive Typography */}
        <h1 
          ref={headlineRef} 
          className="flex flex-col text-[3.5rem] sm:text-6xl md:text-7xl lg:text-[6rem] font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] mb-8"
        >
          <span className="block will-change-transform">INSTANT CAPITAL.</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#2aac64] via-emerald-500 to-[#166534] dark:from-[#2aac64] dark:via-[#4ade80] dark:to-[#2aac64] will-change-transform pb-2">
            ZERO FRICTION.
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="hero-fade-up text-base sm:text-lg md:text-xl text-slate-600 dark:text-white/50 font-medium max-w-2xl mb-12 leading-relaxed tracking-tight">
          Bypass the bureaucracy. Compare premium rates from 15+ top-tier banks, calculate EMIs instantly, and unlock your financial trajectory today.
        </p>

        {/* Smart Command Bar */}
        <div className="hero-fade-up w-full max-w-2xl mb-8 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#2aac64]/20 to-[#ffd600]/20 rounded-[2rem] blur-lg opacity-50 dark:opacity-30"></div>
          <div className="relative bg-white/90 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-2 shadow-2xl">
            <SmartInput />
          </div>
        </div>

        {/* --- DYNAMIC STATS PILL WITH LIVE COUNTING --- */}
        <div ref={statsRef} className="hero-fade-up mt-8 w-full max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-evenly gap-8 md:gap-4 bg-white/50 dark:bg-white/5 backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 rounded-3xl md:rounded-full py-6 md:py-4 px-8 shadow-2xl shadow-emerald-900/5 dark:shadow-none">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center w-full relative">
                <p className="flex items-center text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                  <span>{stat.prefix}</span>
                  {/* The GSAP Counter hooks into this specific span with tabular-nums */}
                  <span className="stat-number tabular-nums">{stat.value}</span>
                  <span className="text-[#2aac64]">{stat.suffix}</span>
                </p>
                <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-1">
                  {stat.label}
                </p>
                
                {/* Minimalist Divider Line (Desktop) */}
                {i !== stats.length - 1 && (
                  <div className="hidden md:block absolute right-[-10%] top-1/2 -translate-y-1/2 w-px h-10 bg-slate-300 dark:bg-white/10" />
                )}
                
                {/* Minimalist Divider Line (Mobile) */}
                {i !== stats.length - 1 && (
                  <div className="block md:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-px bg-slate-200 dark:bg-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Security Signal */}
        <div className="hero-fade-up mt-12 flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4 text-[#2aac64]" /> Bank Grade Security
        </div>

      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;