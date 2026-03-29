import { useRef, useEffect, memo, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, Zap, Sparkles, Percent, 
  ChevronRight, ChevronLeft, CheckCircle2,
  TrendingUp, WalletCards, Coins, Landmark, BadgePercent, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

import idbiLogo from "@/assets/idbi-bank-logo-1.svg";
import axisLogo from "@/assets/axis-bank-logo-1.svg";
import unionLogo from "@/assets/union-bank-of-india.svg";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const initialOffers = [
  { 
    id: "idbi-personal", bank: "IDBI BANK", logo: idbiLogo,
    title: "Zero Processing Fee on Personal Loans", 
    highlights: ["Quick digital sanction in 4 hours", "Foreclosure charges waived off"],
    tag: "SPECIAL FESTIVE OFFER", icon: Zap,
    aurora1: "#38bdf8", // Sky blue orb
    aurora2: "#818cf8", // Indigo orb
    aurora3: "#0284c7", // Deep blue orb
    accentColor: "#0284c7",   
    bgIcons: [Coins, ShieldCheck]
  },
  { 
    id: "axis-pre", bank: "AXIS BANK", logo: axisLogo, 
    title: "Pre-Approved Limit up to ₹50,00,000", 
    highlights: ["Zero documentation for salary accounts", "Funds disbursed within 3 hours"],
    tag: "FAST TRACK APPROVAL", icon: Sparkles,
    aurora1: "#f472b6", // Pink orb
    aurora2: "#fb7185", // Rose orb
    aurora3: "#c084fc", // Purple orb
    accentColor: "#ec4899",   
    bgIcons: [TrendingUp, WalletCards] 
  },
  { 
    id: "union-lowest", bank: "UNION BANK", logo: unionLogo,
    title: "Lowest Interest Rates Starting at 10.15%", 
    highlights: ["Public Sector Bank Trust & Reliability", "Flexible repayment tenures up to 84 months"],
    tag: "BEST RATE GUARANTEE", icon: Percent,
    aurora1: "#34d399", // Emerald orb
    aurora2: "#6ee7b7", // Teal orb
    aurora3: "#10b981", // Green orb
    accentColor: "#10b981",   
    bgIcons: [BadgePercent, Landmark]
  }
];

const marqueeOffers = [
  { text: "Zero Processing Fee IDBI", color: "#0284c7" },
  { text: "10.15%* on Union Bank", color: "#10b981" },
  { text: "Pre-Approved ₹50L Axis", color: "#ec4899" },
  { text: "Public Trust via Union", color: "#059669" },
  { text: "Zero Documentation", color: "#8b5cf6" },
  { text: "4hr Disbursal", color: "#06b6d4" },
  { text: "No Pre-closure Fee", color: "#f59e0b" },
  { text: "Salary A/C Special", color: "#ec4899" },
];

// ─────────────────────────────────────────────────────────────────────────────
// FRAMER MOTION VARIANTS
// ─────────────────────────────────────────────────────────────────────────────
const bgFadeVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 1.5, ease: "easeInOut" } },
  exit: { opacity: 0, transition: { duration: 1.2, ease: "easeInOut" } }
};

const contentVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    scale: 0.96,
    filter: "blur(4px)"
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    scale: 0.96,
    filter: "blur(4px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  })
};

const HeroSection = memo(() => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const activeIndex = Math.abs(page % initialOffers.length);
  const offer = initialOffers[activeIndex];

  const paginate = useCallback((newDirection: number) => {
    setIsAutoPlaying(false);
    setPage([page + newDirection, newDirection]);
  }, [page]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setPage((prevPage) => [prevPage[0] + 1, 1]);
    }, 7000); 
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    // Outer Container is incredibly light/white to maximize the vivid liquid colors underneath
    <section className="relative w-full overflow-hidden flex items-center justify-center px-4 sm:px-6 md:px-10 pt-4 pb-2 md:pt-6 md:pb-4 min-h-[350px] bg-[#fafafa]">
      
      {/* ────────────────── LIQUID AURORA BACKGROUND ────────────────── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={page + 'aurora'}
          variants={bgFadeVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        >
          {/* Massive, slow-pulsing liquid color orbs */}
          <div 
            className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] rounded-full blur-[100px] md:blur-[140px] opacity-60 animate-[pulse_8s_ease-in-out_infinite]" 
            style={{ backgroundColor: offer.aurora1 }} 
          />
          <div 
            className="absolute bottom-[-30%] right-[-10%] w-[70%] h-[90%] rounded-full blur-[120px] opacity-50 animate-[pulse_12s_ease-in-out_infinite_reverse]" 
            style={{ backgroundColor: offer.aurora2 }} 
          />
          <div 
            className="absolute top-[10%] right-[20%] w-[40%] h-[60%] rounded-full blur-[90px] opacity-50 animate-[pulse_10s_ease-in-out_infinite]" 
            style={{ backgroundColor: offer.aurora3 }} 
          />
          
          {/* Extremely fine noise grain to give the liquid a hyper-realistic physical texture */}
          <div 
            className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none" 
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.7'/%3E%3C/svg%3E\")" }} 
          />
        </motion.div>
      </AnimatePresence>

      {/* ────────────────── TOP 1% LIQUID GLASS CARD ────────────────── */}
      {/* 
        This is the masterpiece:
        - bg-white/20 for high transparency allowing aurora to bleed through
        - backdrop-blur-[60px] completely liquefies the orbs underneath
        - Complex inner shadows to create the 3D Apple-style edge bevel
      */}
      <div className="relative z-10 w-full max-w-[1700px] h-[300px] sm:h-[320px] md:h-[330px] lg:h-[340px] rounded-[32px] md:rounded-[40px] overflow-hidden 
        bg-white/20 backdrop-blur-[60px] 
        shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(255,255,255,0.4),0_32px_100px_rgba(0,0,0,0.1)]
        border-[0.5px] border-white/50
        flex flex-col justify-between"
      >
        {/* Specular Glare (the light bouncing off the glass surface) */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-80" />

        {/* ────────────────── FIT-TO-WINDOW SVGS ────────────────── */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 mask-image-[linear-gradient(to_bottom,black,transparent)]">
          <AnimatePresence initial={false}>
            <motion.div
              key={page + 'svgs'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 1.5 } }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
              className="relative w-full h-full"
            >
              {offer.bgIcons.map((Icon, idx) => (
                <Icon 
                  key={idx} 
                  strokeWidth={1} 
                  color={"#ffffff"} 
                  className={`absolute top-1/2 -translate-y-1/2 opacity-[0.15] mix-blend-overlay w-[160px] h-[160px] md:w-[260px] md:h-[260px] filter drop-shadow-lg transition-transform duration-1000 ${
                    idx === 0 
                      ? "left-2 md:left-12 -rotate-[15deg] scale-110" 
                      : "right-2 md:right-12 rotate-[15deg] scale-110"
                  }`} 
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ────────────────── TOP BAR ────────────────── */}
        <div className="relative z-10 w-full px-6 py-4 md:px-8 md:py-4 flex items-center justify-between pointer-events-none">
          
          {/* LEFT: Eyebrow - Slow Blur Reveal Cinematic Entrance */}
          <div className="flex items-center gap-2 md:gap-3 flex-1">
            <motion.span 
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 1 }}
              className="w-5 md:w-8 h-[1.5px] bg-slate-800/40 rounded-full origin-left shrink-0" 
            />
            <motion.p 
              initial={{ opacity: 0, filter: "blur(8px)", x: -10 }}
              animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
              transition={{ duration: 3, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="text-[9px] md:text-[10px] font-mono tracking-[0.2em] uppercase text-slate-800/80 font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
            >
              Instant Capital. Zero Friction.
            </motion.p>
          </div>

          {/* CENTER: 10,000+ Trust Widget - Made ultra-glassy */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center gap-3 bg-white/30 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_20px_rgba(0,0,0,0.05)] rounded-full pr-5 pl-1.5 py-1.5 pointer-events-auto hover:bg-white/50 hover:scale-[1.02] transition-all border border-white/40">
              <div className="flex -space-x-2">
                {[1, 5, 8, 12].map((imgId, i) => (
                  <img 
                    key={i} 
                    src={`https://i.pravatar.cc/100?img=${imgId}`} 
                    alt="User" 
                    className="w-6 h-6 rounded-full border border-white/80 object-cover shadow-sm"
                  />
                ))}
              </div>
              <div className="flex flex-col items-start leading-none">
                <p className="text-[10px] font-semibold text-slate-800/90 tracking-tight drop-shadow-sm">
                  <span className="text-slate-900 font-extrabold">10,000+</span> applications processed
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

          {/* RIGHT: Slider Pagination Controls */}
          <div className="flex justify-end flex-1 pointer-events-auto">
            <div className="hidden md:flex items-center gap-2 bg-white/30 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_20px_rgba(0,0,0,0.05)] border border-white/40 rounded-full p-1.5 hover:bg-white/50 transition-colors">
              <button 
                onClick={() => paginate(-1)} 
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/70 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1.5 px-2">
                {initialOffers.map((_, i) => (
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
                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/70 text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ────────────────── CENTER BILLBOARD CANVAS ────────────────── */}
        <div className="relative z-20 flex-1 w-full flex flex-col items-center justify-center px-4 md:px-10 overflow-hidden pointer-events-none md:-mt-2">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page + 'content'}
              custom={direction}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute flex flex-col items-center justify-center w-full max-w-5xl text-center pointer-events-auto"
            >
              {/* Tag & Bank Header - Ultra Glassy */}
              <div className="flex items-center justify-center gap-3 px-4 py-1.5 mb-2 md:mb-3 rounded-full bg-white/30 backdrop-blur-3xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-lg hover:bg-white/40 transition-all">
                <div className="px-2 py-0.5 rounded-full bg-white text-slate-800 text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Zap className="w-2.5 h-2.5" style={{ color: offer.accentColor }} /> {offer.tag}
                </div>
                {offer.logo ? (
                  <img src={offer.logo} className="h-4 sm:h-5 object-contain opacity-100 filter drop-shadow-sm mix-blend-multiply" alt={offer.bank} />
                ) : (
                  <span className="text-[10px] font-bold text-slate-800 tracking-wider">{offer.bank}</span>
                )}
              </div>

              {/* Massive Cinematic Offer Headline - Contrast boosted */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-4 md:mb-5 px-4 drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)] max-w-4xl">
                {offer.title}
              </h2>

              {/* Highlights + CTA Array */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 w-full mt-2">
                
                {/* Highlights - Deep glass style */}
                <div className="hidden sm:flex flex-wrap items-center justify-center gap-3">
                  {offer.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/5 backdrop-blur-xl border border-slate-900/10 shadow-sm text-slate-900/90 text-[10px] md:text-[11.5px] font-bold tracking-wide">
                      <CheckCircle2 className="w-3 h-3" style={{ color: offer.accentColor }} />
                      {h}
                    </div>
                  ))}
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px h-6 bg-slate-800/10" />

                {/* Apply CTA - Elevated 3D Feel */}
                <div className="relative inline-block mt-2 md:mt-0 group pointer-events-auto">
                  <div 
                    className="absolute -inset-1.5 rounded-full blur-[12px] opacity-40 group-hover:opacity-70 transition-opacity duration-500" 
                    style={{ backgroundColor: offer.accentColor }} 
                  />
                  <Link 
                    to="/apply"
                    className="relative overflow-hidden bg-slate-900 text-white px-6 md:px-8 py-2 md:py-2.5 rounded-full font-bold text-xs md:text-sm tracking-wide flex items-center gap-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    Apply Now
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-[2px] transition-transform" />
                    </span>
                  </Link>
                </div>

              </div>

              {/* Platform Pitch Anchored beneath the CTA */}
              <div className="mt-4 flex items-center justify-center px-4 max-w-lg">
                <p className="text-[10px] md:text-[11px] text-slate-800/80 font-semibold tracking-wide drop-shadow-[0_1px_10px_rgba(255,255,255,0.6)]">
                  Compare rates from <span className="text-slate-900 font-extrabold">15+ banks</span>, calculate your EMI, and apply in under <span className="text-slate-900 font-extrabold">5 minutes.</span>
                </p>
              </div>
              
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ────────────────── MARQUEE TOP 1% GLASS ────────────────── */}
        <div className="relative z-30 w-full hero-marquee-bar border-t-[0.5px] border-white/50 bg-white/20 backdrop-blur-md hidden md:block mt-auto shadow-[0_-1px_20px_rgba(0,0,0,0.02)] pt-1">
          
          <div className="absolute top-0 left-0 w-24 md:w-40 h-full bg-gradient-to-r from-white/60 via-white/20 to-transparent z-10 pointer-events-none rounded-bl-[32px] md:rounded-bl-[40px] mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-24 md:w-40 h-full bg-gradient-to-l from-white/60 via-white/20 to-transparent z-10 pointer-events-none rounded-br-[32px] md:rounded-br-[40px] mix-blend-overlay" />
          
          <div className="hero-marquee-track flex items-center py-2.5 gap-3 md:gap-4 px-4 overflow-hidden">
            <div className="flex animate-[marquee_35s_linear_infinite] whitespace-nowrap gap-3 md:gap-4 hover:[animation-play-state:paused]">
              {[...marqueeOffers, ...marqueeOffers].map((o, i) => (
                <div 
                  key={`${o.text}-${i}`} 
                  className="flex-shrink-0 flex items-center gap-2 md:gap-2.5 px-3 md:px-5 py-2 rounded-full border-[0.5px] border-white/60 bg-white/40 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-0.5 hover:bg-white/60 transition-all duration-300 cursor-default group"
                >
                  <span 
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.2)] group-hover:scale-125 transition-transform" 
                    style={{ backgroundColor: o.color, boxShadow: `0 0 10px ${o.color}` }} 
                  />
                  <span className="text-[10px] md:text-[11px] font-bold text-slate-700/90 group-hover:text-slate-900 tracking-wide transition-colors">{o.text}</span>
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