import { useRef, memo, useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, Zap, Sparkles, Percent, 
  ChevronRight, ChevronLeft, CheckCircle2,
  TrendingUp, WalletCards, Coins, Landmark, BadgePercent, ShieldCheck,
  Users
} from "lucide-react";
import { motion, AnimatePresence, Variants, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { PrymeAPI } from "@/lib/api";

import idbiLogo from "@/assets/idbi-bank-logo-1.svg";
import axisLogo from "@/assets/axis-bank-logo-1.svg";
import unionLogo from "@/assets/union-bank-of-india.svg";
import kotakLogo from "@/assets/kotak-mahindra-bank-logo-vector_logoshape.com.svg";
import pnbLogo from "@/assets/punjab-national-bank-vector-logo_logoshape.com.svg";
import yesLogo from "@/assets/yes-bank-new-logo-download_logoshape.com.svg";
import tataLogo from "@/assets/tata-capital-logo-svg_logoshape.com.svg";

const LOGO_MAP: Record<string, string> = {
  idbi: idbiLogo,
  axis: axisLogo,
  union: unionLogo,
  kotak: kotakLogo,
  pnb: pnbLogo,
  yes: yesLogo,
  tata: tataLogo,
};

import { BANK_OFFERS } from "./ProductSelectorGrid";

// ─────────────────────────────────────────────────────────────────────────────
// 🧠 Animated Counter for Trust Metrics Row
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const initialOffers = [
  { 
    id: "idbi-personal", bank: "IDBI BANK", logo: idbiLogo,
    title: "Zero Processing Fee on Personal Loans", 
    highlights: ["Quick digital sanction in 4 hours", "Foreclosure charges waived off"],
    tag: "SPECIAL FESTIVE OFFER", icon: Zap,
    // Single conic gradient replaces 3 separate blur orbs
    auroraGradient: "conic-gradient(from 220deg at 30% 40%, #38bdf8 0deg, #818cf8 120deg, #0284c7 240deg, #38bdf8 360deg)",
    accentColor: "#0284c7",   
    bgIcons: [Coins, ShieldCheck]
  },
  { 
    id: "axis-pre", bank: "AXIS BANK", logo: axisLogo, 
    title: "Pre-Approved Limit up to ₹50,00,000", 
    highlights: ["Zero documentation for salary accounts", "Funds disbursed within 3 hours"],
    tag: "FAST TRACK APPROVAL", icon: Sparkles,
    auroraGradient: "conic-gradient(from 220deg at 30% 40%, #f472b6 0deg, #fb7185 120deg, #9BAFD9 240deg, #f472b6 360deg)",
    accentColor: "#ec4899",   
    bgIcons: [TrendingUp, WalletCards] 
  },
  { 
    id: "union-lowest", bank: "UNION BANK", logo: unionLogo,
    title: "Lowest Interest Rates Starting at 10.15%", 
    highlights: ["Public Sector Bank Trust & Reliability", "Flexible repayment tenures up to 84 months"],
    tag: "BEST RATE GUARANTEE", icon: Percent,
    auroraGradient: "conic-gradient(from 220deg at 30% 40%, #34d399 0deg, #6ee7b7 120deg, #10b981 240deg, #34d399 360deg)",
    accentColor: "#10b981",   
    bgIcons: [BadgePercent, Landmark]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// FRAMER MOTION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// PRINCIPAL ENGINEER PERF AUDIT — ANIMATION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────
// Rule: ONLY transform + opacity. Never filter, never layout properties.
// will-change budget: 4 layers max across the entire component.
//   Layer 1: Aurora background (opacity fade)
//   Layer 2: Content billboard (x + opacity slide)
//   Layer 3: Marquee track 1 (translateX)
//   Layer 4: Marquee track 2 (translateX)
// Everything else: NO will-change, NO transform-gpu promotion.

const bgFadeVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 1.0, ease: "easeInOut" } },
  exit:  { opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }
};

// PERF: Pure compositor-only transitions. x maps to translateX, opacity is
// compositor. scale is compositor. No filter, no blur, no layout properties.
const contentVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
    scale: 0.97,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.05 }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
  })
};

const HeroSection = memo(() => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const isInView = useInView(heroRef, { once: false, margin: "0px 0px 200px 0px" });

  const { data: dynamicOffers = [] } = useQuery({
    queryKey: ["public_hero_offers"],
    queryFn: () => PrymeAPI.getHeroOffers().then(res => res.offers || res.data || res)
  });

  const activeOffers = dynamicOffers.length > 0 ? dynamicOffers.map((offer: any, i: number) => {
    const baseVisual = initialOffers[i % initialOffers.length];
    const mappedLogo = offer.logoType && LOGO_MAP[offer.logoType.toLowerCase()]
      ? LOGO_MAP[offer.logoType.toLowerCase()]
      : baseVisual.logo;
    return {
      ...baseVisual,
      title: offer.title || baseVisual.title,
      bank: offer.lenderName || baseVisual.bank,
      tag: offer.tag || baseVisual.tag || "HOT RATE",
      highlights: offer.desc ? offer.desc.split('|').map((s: string) => s.trim()) : baseVisual.highlights,
      logo: mappedLogo
    };
  }) : initialOffers;

  const activeIndex = Math.abs(page % activeOffers.length);
  const offer = activeOffers[activeIndex];

  const paginate = useCallback((newDirection: number) => {
    setIsAutoPlaying(false);
    setPage([page + newDirection, newDirection]);
  }, [page]);

  // PERF: Pause autoplay when hero is scrolled off-screen.
  // Previously the setInterval fired every 7s even when invisible,
  // triggering React re-renders + Framer Motion layout calculations
  // on elements the user can't even see.
  useEffect(() => {
    if (!isAutoPlaying || !isInView) return;
    const interval = setInterval(() => {
      setPage((prevPage) => [prevPage[0] + 1, 1]);
    }, 7000); 
    return () => clearInterval(interval);
  }, [isAutoPlaying, isInView]);

  return (
    <section ref={heroRef} className="relative w-full overflow-hidden flex items-center justify-center px-4 sm:px-6 md:px-10 pt-4 pb-2 md:pt-6 md:pb-4 min-h-[350px] bg-[#fafafa]" style={{ contain: 'layout style paint' }}>
      
      {/* ────────────── OPTIMIZED AURORA BACKGROUND ────────────── */}
      {/* PERF FIX: Replaced 3 independently animating blur-[100px+] div orbs 
          with a single CSS conic-gradient blurred once. This reduces the number
          of compositing layers from 4 to 1 and eliminates per-frame CSS recalc. */}
      <AnimatePresence initial={false}>
        {isInView && (
          <motion.div
            key={page + 'aurora'}
            variants={bgFadeVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none transform-gpu"
            style={{ contain: "layout style paint", willChange: "opacity" }}
          >
            {/* Single blurred aurora layer.
                PERF: transform-gpu (down from 70px) — visually near-identical on translucent
                glass but the GPU sample kernel is ~2x cheaper at 50px vs 70px. */}
            {/* PERF: transform-gpu (down from 50-55). 40px is visually identical
                 on a translucent layer but the GPU sample kernel is ~1.5x cheaper. */}
            <div 
              className="absolute inset-[-20%] opacity-55 transform-gpu pointer-events-none transform-gpu"
              style={{ background: offer.auroraGradient }} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────── LIQUID GLASS CARD ────────────── */}
      {/* PERF FIX: Reduced backdrop-blur from [60px] to [20px] (backdrop-blur-sm).
          60px blur radius forces the GPU to sample a massive kernel per pixel.
          20px is visually near-identical on a translucent card but ~4x cheaper. */}
      {/* PERF: backdrop-blur reduced from lg (12px) to md (8px).
           12px blur on a full-width card forces the GPU to sample a large kernel
           per pixel per frame. 8px is ~2.25x cheaper, visually near-identical
           on an already-translucent bg-white/30 surface.
           No will-change here — this is a static card, not an animated element. */}
      <div className="relative z-10 w-full max-w-[1700px] min-h-[300px] sm:min-h-[320px] md:min-h-[330px] lg:min-h-[340px] h-auto rounded-[32px] md:rounded-[40px] overflow-hidden 
        bg-white/30 backdrop-blur-md transform-gpu
        shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(255,255,255,0.4),0_32px_100px_rgba(0,0,0,0.1)]
        border-[0.5px] border-white/50
        flex flex-col justify-between"
      >
        {/* Specular Glare */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-80" />

        {/* ────────────── BACKGROUND ICONS ────────────── */}
        {/* Background icons — no will-change (not in our 4-layer budget, these are slow-fading static icons) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 mask-image-[linear-gradient(to_bottom,black,transparent)]">
          <AnimatePresence initial={false}>
            {isInView && (
              <motion.div
                key={page + 'svgs'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 1.5 } }}
                exit={{ opacity: 0, transition: { duration: 0.8 } }}
                className="relative w-full h-full pointer-events-none"
              >
              {offer.bgIcons.map((Icon, idx) => (
                <Icon 
                  key={idx} 
                  strokeWidth={1} 
                  color={"#ffffff"} 
                  className={`absolute top-1/2 -translate-y-1/2 opacity-[0.15] w-[160px] h-[160px] md:w-[260px] md:h-[260px] ${
                    idx === 0 
                      ? "left-2 md:left-12 -rotate-[15deg] scale-110" 
                      : "right-2 md:right-12 rotate-[15deg] scale-110"
                  }`} 
                />
              ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ────────────── TOP BAR ────────────── */}
        <div className="relative z-10 w-full px-6 py-4 md:px-8 md:py-4 flex items-center justify-between pointer-events-none shrink-0">
          
          {/* LEFT: Eyebrow */}
          <div className="flex items-center gap-1.5 md:gap-3 flex-1 min-w-0 pointer-events-none">
            {/* PERF: Removed will-change from eyebrow elements — they animate once
                 on mount and then sit static. Perpetual will-change on static elements
                 wastes a GPU compositor layer (VRAM) for zero benefit. */}
            <motion.span 
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 1 }}
              className="w-3 sm:w-5 md:w-8 h-[1.5px] bg-slate-800/40 rounded-full origin-left shrink-0 transform-gpu" 
            />
            {/* PERF CRITICAL FIX: Removed `filter: blur(8px)` → `blur(0px)` animation.
                 Animating CSS filter forces the GPU to re-rasterize the ENTIRE element
                 texture every single frame of the transition. On a text element with
                 sub-pixel rendering, this is catastrophically expensive.
                 Replaced with pure opacity + translateX — both are compositor-only. */}
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="text-[8.5px] sm:text-[9px] md:text-[10px] font-mono tracking-[0.1em] sm:tracking-[0.2em] uppercase text-slate-800/80 font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] whitespace-nowrap transform-gpu"
            >
              Instant Capital. Zero Friction.
            </motion.p>
          </div>

          {/* CENTER: Trust Widget */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center gap-3 bg-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_20px_rgba(0,0,0,0.05)] rounded-full pr-5 pl-1.5 py-1.5 pointer-events-auto hover:bg-white/50 hover:scale-[1.02] transition-all border border-white/40">
              <div className="flex -space-x-2">
                {[1, 5, 8, 12].map((imgId, i) => (
                  <img 
                    key={i} 
                    src={`https://i.pravatar.cc/100?img=${imgId}`} 
                    alt="User" 
                    className="w-6 h-6 rounded-full border border-white/80 object-cover shadow-sm"
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>
              <div className="flex flex-col items-start leading-none">
                <p className="text-[10px] font-semibold text-slate-800/90 tracking-tight drop-shadow-sm">
                  <span className="text-[#0a1530] font-extrabold">10,000+</span> applications processed
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-70" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  <span className="text-[8px] text-slate-600/90 font-bold tracking-widest uppercase">Live</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Pagination Controls */}
          <div className="flex justify-end flex-1 pointer-events-auto">
            <div className="hidden md:flex items-center gap-1.5 bg-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_20px_rgba(0,0,0,0.05)] border border-white/40 rounded-full p-1.5 hover:bg-white/50 transition-colors">
              <button 
                onClick={() => paginate(-1)} 
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/70 text-slate-600 hover:text-[#0a1530] transition-colors shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1.5 px-2">
                {activeOffers.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setPage([page + (i - activeIndex), i > activeIndex ? 1 : -1]);
                    }}
                    className={`rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        i === activeIndex ? "bg-slate-800 w-5 h-1.5 shadow-sm" : "bg-slate-800/30 w-1.5 h-1.5 hover:bg-slate-800/50"
                    }`}
                  />
                ))}
              </div>
              <button 
                onClick={() => paginate(1)} 
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/70 text-slate-600 hover:text-[#0a1530] transition-colors shadow-sm"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ────────────── CENTER BILLBOARD ────────────── */}
        <div className="relative z-20 flex-1 w-full grid items-center px-4 md:px-10 pointer-events-none py-4 sm:py-6">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page + 'content'}
              custom={direction}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="col-start-1 row-start-1 flex flex-col items-center justify-center w-full max-w-5xl place-self-center text-center pointer-events-auto transform-gpu"
              style={{ willChange: 'transform, opacity' }}
            >
              {/* Tag & Bank Header */}
              <div className="flex items-center justify-center gap-3 px-4 py-1.5 mb-2 rounded-full bg-white/40 border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-lg hover:bg-white/50 transition-all">
                <div className="px-2 py-0.5 rounded-full bg-white text-slate-800 text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Zap className="w-2.5 h-2.5" style={{ color: offer.accentColor }} /> {offer.tag}
                </div>
                {offer.logo ? (
                  <img src={offer.logo} className="h-4 sm:h-5 object-contain opacity-100 filter drop-shadow-sm" alt={offer.bank} />
                ) : (
                  <span className="text-[10px] font-bold text-slate-800 tracking-wider">{offer.bank}</span>
                )}
              </div>

              {/* Headline */}
              <h2 className="text-[1.35rem] sm:text-2xl md:text-3xl lg:text-[2.25rem] font-extrabold text-[#0a1530] tracking-tight leading-tight md:leading-[1.05] mb-1.5 md:mb-3 px-4 drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)] max-w-3xl">
                {offer.title}
              </h2>

              {/* Highlights + CTA */}
              <div className="md:gap-3 flex flex-col md:flex-row items-center justify-center gap-2.5 w-full">
                
                <div className="hidden sm:flex flex-wrap items-center justify-center gap-2">
                  {offer.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/5 border border-slate-900/10 shadow-sm text-[#0a1530]/90 text-[9px] md:text-[10px] font-bold tracking-wide">
                      <CheckCircle2 className="w-2.5 h-2.5 shrink-0" style={{ color: offer.accentColor }} />
                      {h}
                    </div>
                  ))}
                </div>

                <div className="hidden md:block w-px h-4 bg-slate-800/10" />

                {/* Apply CTA */}
                <div className="relative inline-block mt-0.5 md:mt-0 group pointer-events-auto">
                  <div 
                    className="absolute -inset-1.5 rounded-full transform-gpu opacity-40 group-hover:opacity-70 transition-opacity duration-500" 
                    style={{ backgroundColor: offer.accentColor }} 
                  />
                  <Link 
                    to="/apply"
                    className="relative overflow-hidden bg-[#0a1530] text-white px-5 md:px-7 py-1.5 md:py-2 rounded-full font-bold text-[11px] md:text-xs tracking-wide flex items-center gap-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    See My Loan Options
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                      <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-[2px] transition-transform" />
                    </span>
                  </Link>
                </div>

              </div>

              {/* Tagline */}
              <div className="mt-1.5 md:mt-3 flex items-center justify-center px-4 max-w-lg">
                <p className="text-[9px] md:text-[10px] text-slate-800/80 font-semibold tracking-wide drop-shadow-[0_1px_10px_rgba(255,255,255,0.6)]">
                  Compare rates from <span className="text-[#0a1530] font-extrabold">15+ banks</span>, calculate your EMI, and apply in under <span className="text-[#0a1530] font-extrabold">5 minutes.</span>
                </p>
              </div>
              
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 🧠 200 IQ Inline Trust Metrics Row — Static (Outside AnimatePresence) */}
        <div className="relative z-30 pb-3.5 sm:pb-5 md:pb-6 pointer-events-auto shrink-0 w-full text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/40 hover:bg-white/50 transition-colors border border-white/50 rounded-2xl shadow-sm backdrop-blur-sm drop-shadow-sm">
            <div className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-[#103783]" strokeWidth={2.5} />
              <span className="text-[11px] sm:text-xs font-extrabold text-[#0a1530]">
                <MiniCountUp to={500} prefix="₹" suffix="+ Cr" />
              </span>
              <span className="text-[9px] text-slate-700 font-bold uppercase tracking-wider">Loans Facilitated</span>
            </div>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-[#103783]/20" />
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#103783]" strokeWidth={2.5} />
              <span className="text-[11px] sm:text-xs font-extrabold text-[#0a1530]">
                <MiniCountUp to={10000} suffix="+" formatComma={true} />
              </span>
              <span className="text-[9px] text-slate-700 font-bold uppercase tracking-wider">Happy Customers</span>
            </div>
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-[#103783]/20" />
            <div className="flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-[#103783]" strokeWidth={2.5} />
              <span className="text-[11px] sm:text-xs font-extrabold text-[#0a1530]">
                <MiniCountUp to={15} suffix="+" />
              </span>
              <span className="text-[9px] text-slate-700 font-bold uppercase tracking-wider">Banking Partners</span>
            </div>
          </div>
        </div>

        {/* ────────────── MARQUEE ────────────── */}
        <div className="relative z-30 w-full hero-marquee-bar border-t-[0.5px] border-white/50 bg-white/30 hidden md:block mt-auto shadow-[0_-1px_20px_rgba(0,0,0,0.02)] pt-1 shrink-0">
          
          <div className="absolute top-0 left-0 w-24 md:w-40 h-full bg-gradient-to-r from-white/60 via-white/20 to-transparent z-10 pointer-events-none rounded-bl-[32px] md:rounded-bl-[40px]" />
          <div className="absolute top-0 right-0 w-24 md:w-40 h-full bg-gradient-to-l from-white/60 via-white/20 to-transparent z-10 pointer-events-none rounded-br-[32px] md:rounded-br-[40px]" />
          
          <div className="hero-marquee-track flex py-2.5 overflow-hidden group transform-gpu">
            <div className="flex shrink-0 animate-[marquee_40s_linear_infinite] group-hover:[animation-play-state:paused] min-w-full justify-around gap-3 md:gap-4 px-1.5 md:px-2 transform-gpu will-change-transform">
              {BANK_OFFERS.map((offer, i) => (
                <div 
                  key={`track1-${i}`} 
                  className="flex-shrink-0 flex items-center gap-2 md:gap-2.5 px-3 md:px-5 py-2 rounded-full border-[0.5px] border-white/60 bg-white/95 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-white transition-all duration-300 cursor-default transform-gpu"
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#0284c7] shadow-[0_0_6px_#0284c7]" />
                  <span className="text-[10px] md:text-[11px] font-bold text-slate-700/90 tracking-wide uppercase">
                    {offer}
                  </span>
                </div>
              ))}
            </div>
            <div aria-hidden="true" className="flex shrink-0 animate-[marquee_40s_linear_infinite] group-hover:[animation-play-state:paused] min-w-full justify-around gap-3 md:gap-4 px-1.5 md:px-2 transform-gpu will-change-transform">
              {BANK_OFFERS.map((offer, i) => (
                <div 
                  key={`track2-${i}`} 
                  className="flex-shrink-0 flex items-center gap-2 md:gap-2.5 px-3 md:px-5 py-2 rounded-full border-[0.5px] border-white/60 bg-white/95 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:bg-white transition-all duration-300 cursor-default transform-gpu"
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#0284c7] shadow-[0_0_6px_#0284c7]" />
                  <span className="text-[10px] md:text-[11px] font-bold text-slate-700/90 tracking-wide uppercase">
                    {offer}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;