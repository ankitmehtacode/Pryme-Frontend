import { useRef, useEffect, memo, useCallback } from "react";
import { Shield, CheckCircle, TrendingUp, Clock, Star } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";
import SmartInput from "./SmartInput";
import prymeLogo from "@/assets/pryme-logo.png";

// Register GSAP Plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const stats = [
  { value: 500, suffix: "Cr+", prefix: "₹", label: "Loans Disbursed", icon: TrendingUp },
  { value: 24, suffix: " Hrs", prefix: "", label: "Avg. Approval", icon: Clock },
  { value: 98, suffix: ".5%", prefix: "", label: "Success Rate", icon: CheckCircle },
];

const HeroSection = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroLogoRef = useRef<HTMLImageElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Parallax blobs tracking mouse
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // GSAP blob parallax ticker
  useEffect(() => {
    const quickX1 = gsap.quickTo(blob1Ref.current, "x", { duration: 1.5, ease: "power3.out" });
    const quickY1 = gsap.quickTo(blob1Ref.current, "y", { duration: 1.5, ease: "power3.out" });
    const quickX2 = gsap.quickTo(blob2Ref.current, "x", { duration: 2, ease: "power3.out" });
    const quickY2 = gsap.quickTo(blob2Ref.current, "y", { duration: 2, ease: "power3.out" });

    const tick = () => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = mouseRef.current.x - cx;
      const dy = mouseRef.current.y - cy;
      quickX1(-dx * 0.05);
      quickY1(-dy * 0.05);
      quickX2(dx * 0.04);
      quickY2(dy * 0.04);
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  // Main entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "back.out(1.7)" } });

      // Logo entrance: start huge, settle at display size
      tl.fromTo(
        heroLogoRef.current,
        { scale: 3, opacity: 0, rotateY: 180 },
        { scale: 1, opacity: 1, rotateY: 0, duration: 1.4, ease: "expo.out" },
        0
      );

      // Gold Trust Badge Pop-in
      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 },
        0.3
      );

      // Headline character animation with SplitType
      if (headlineRef.current) {
        const split = new SplitType(headlineRef.current, { types: "chars,words" });
        if (split.chars) {
          gsap.set(split.chars, { y: "100%", opacity: 0 });
          tl.to(
            split.chars,
            {
              y: "0%",
              opacity: 1,
              duration: 0.8,
              ease: "back.out(1.7)",
              stagger: 0.02,
            },
            0.4
          );
        }
      }

      // Subtitle
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        0.8
      );

      // Smart input
      tl.fromTo(
        inputRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        1.0
      );

      // Stats cards
      if (statsRef.current) {
        const cards = statsRef.current.querySelectorAll(".stat-card-item");
        tl.fromTo(
          cards,
          { opacity: 0, y: 50, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.4)", stagger: 0.1 },
          1.2
        );
      }

      // ScrollTrigger: Logo shrinks and flies to header as user scrolls
      // This synchronizes perfectly with the Header.tsx animation
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "+=200",
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;
          // As p goes from 0 to 1, logo fades out and moves up
          gsap.set(heroLogoRef.current, {
            scale: 1 - p * 0.6,
            opacity: 1 - p, 
            y: -p * 100,
            rotateY: p * 15,
          });
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative overflow-hidden min-h-[95vh] flex items-center bg-slate-50/50">
      
      {/* Background Blobs - Updated to Brand Green & Gold */}
      <div
        ref={blob1Ref}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] will-change-transform opacity-40 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(42, 172, 100, 0.15) 0%, rgba(255,255,255,0) 70%)" }}
      />
      <div
        ref={blob2Ref}
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-[150px] will-change-transform opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255, 214, 0, 0.12) 0%, rgba(255,255,255,0) 70%)" }}
      />

      <div className="container relative mx-auto px-4 py-24 md:py-32 text-center">
        
        {/* Hero logo - starts large, docks to header on scroll */}
        <div className="flex justify-center mb-8" style={{ perspective: "1000px" }}>
          <img
            ref={heroLogoRef}
            src={prymeLogo}
            alt="PRYME"
            className="h-24 md:h-32 w-auto object-contain will-change-transform drop-shadow-2xl"
            style={{ transformStyle: "preserve-3d" }}
          />
        </div>

        {/* Premium Gold Trust Signal */}
        <div ref={badgeRef} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200/60 rounded-full mb-10 opacity-0 shadow-sm shadow-amber-100">
          <Star className="w-3.5 h-3.5 text-[#ffd600] fill-[#ffd600]" />
          <span className="text-xs font-bold text-amber-700 tracking-wide uppercase">
            Gold Standard Lending Partners
          </span>
        </div>

        {/* Headline with SplitType character animation */}
        <h1
          ref={headlineRef}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[0.95] tracking-tight overflow-hidden text-slate-900"
          style={{ clipPath: "inset(0 0 0 0)" }}
        >
          <span className="inline-block">Smart Loans.</span>
          <br />
          {/* Brand Green Gradient */}
          <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#2aac64] via-emerald-500 to-[#2aac64] bg-[length:200%_auto] animate-shimmer">
            Better Future.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-slate-500 mb-12 leading-relaxed max-w-2xl mx-auto opacity-0 font-medium"
        >
          Compare rates from 15+ banks, calculate EMIs instantly, and get
          personalized loan offers — all in one place.
        </p>

        {/* Smart Command Bar */}
        <div ref={inputRef} className="mb-24 opacity-0 relative z-20">
          <SmartInput />
        </div>

        {/* Stats cards - Green Accents */}
        <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto relative z-10">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="stat-card-item group bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200/50 p-6 hover:border-[#2aac64]/30 hover:shadow-lg transition-all duration-300 opacity-0"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#2aac64] transition-colors duration-300">
                <stat.icon className="w-6 h-6 text-[#2aac64] group-hover:text-white transition-colors" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{stat.prefix}{stat.value}{stat.suffix}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;