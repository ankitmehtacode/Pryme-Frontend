import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { PrymeAPI } from "@/lib/api";
import { initialOffers, LOGO_MAP } from "./HeroOffers";
import { OfferCard } from "./OfferCard";

const containerVariants: Variants = {
  enter: { 
    opacity: 0, 
    x: 45, 
    rotateY: 8,
    scale: 0.97,
  },
  center: { 
    opacity: 1, 
    x: 0, 
    rotateY: 0,
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 320,
      damping: 28,
      mass: 0.8,
      staggerChildren: 0.05,
      delayChildren: 0.06
    } 
  },
  exit: { 
    opacity: 0, 
    x: -45, 
    rotateY: -8,
    scale: 0.97,
    transition: { 
      duration: 0.28, 
      ease: [0.25, 1, 0.5, 1] 
    } 
  }
};

interface HeroCarouselProps {
  isInView: boolean;
  onActiveOfferChange?: (offer: any) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ isInView, onActiveOfferChange }) => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // ── Dynamic offers from API ────────────────────────────────────────────
  // Overrides the app-wide 5-minute default staleTime (see AppProviders.tsx)
  // -- these banners are admin-editable and time-sensitive (festive offers,
  // deletions), so a visitor who's been on the homepage for a while should
  // pick up a change soon after it happens rather than needing a hard
  // reload to escape a 5-minute-stale cached copy.
  const { data: dynamicOffers = [] } = useQuery({
    queryKey: ["public_hero_offers"],
    queryFn: () => PrymeAPI.getHeroOffers().then(res => res.offers || res.data || res),
    staleTime: 1000 * 30, // 30 seconds
  });

  const activeOffers = useMemo(() => {
    return dynamicOffers.length > 0 ? dynamicOffers.map((offer: any, i: number) => {
      const baseVisual = initialOffers[i % initialOffers.length];
      const mappedLogo = offer.logoType && LOGO_MAP[offer.logoType.toLowerCase()]
        ? LOGO_MAP[offer.logoType.toLowerCase()]
        : baseVisual.logo;
      return {
        ...baseVisual,
        title: offer.title || baseVisual.title,
        bank: offer.lenderName || baseVisual.bank,
        tag: offer.tag || baseVisual.tag || "HOT RATE",
        headline: offer.headline || baseVisual.headline,
        amount: offer.amount || baseVisual.amount,
        highlights: offer.desc ? offer.desc.split('|').map((s: string) => s.trim()) : baseVisual.highlights,
        cta: offer.cta || baseVisual.cta,
        logo: mappedLogo,
        bannerImageUrl: offer.bannerImageUrl || baseVisual.bannerImageUrl || null,
        heroImageUrl: offer.heroImageUrl || baseVisual.heroImageUrl || null,
        targetUrl: offer.targetUrl || "/apply",
      };
    }) : initialOffers.map(o => ({ ...o, bannerImageUrl: o.bannerImageUrl, heroImageUrl: null as string | null, targetUrl: "/apply" }));
  }, [dynamicOffers]);

  const totalSlides = activeOffers.length;
  const activeIndex = Math.abs(page % totalSlides);
  const currentOffer = activeOffers[activeIndex];

  useEffect(() => {
    if (onActiveOfferChange && currentOffer) {
      onActiveOfferChange(currentOffer);
    }
  }, [currentOffer, onActiveOfferChange]);

  const paginate = useCallback((newDirection: number) => {
    setIsAutoPlaying(false);
    setPage([page + newDirection, newDirection]);
  }, [page]);

  // PERF: Pause autoplay when hero is scrolled off-screen
  useEffect(() => {
    if (!isAutoPlaying || !isInView) return;
    const interval = setInterval(() => {
      setPage((prevPage) => [prevPage[0] + 1, 1]);
    }, 3500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isInView]);

  return (
    <div
      className="w-full flex flex-col gap-2 relative justify-between h-full shrink-0"
      style={{ inlineSize: "var(--landing-offer-width, 360px)", overflow: "visible" }}
    >

      {/* Ambient brand glow behind the card (Intensified layered system) */}
      {currentOffer && (
        <>
          {/* Inner core intense glow */}
          <div 
            className="absolute -inset-8 rounded-[40px] blur-2xl opacity-40 dark:opacity-35 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] mix-blend-multiply dark:mix-blend-screen"
            style={{
              background: `radial-gradient(circle at center, ${currentOffer.accentColor} 0%, transparent 65%)`,
            }}
          />
          {/* Outer atmospheric soft glow */}
          <div 
            className="absolute -inset-20 rounded-[60px] blur-[80px] opacity-20 dark:opacity-15 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] mix-blend-multiply dark:mix-blend-screen"
            style={{
              background: `radial-gradient(circle at center, ${currentOffer.accentColor} 0%, transparent 70%)`,
            }}
          />
        </>
      )}

      {/* Animated single card */}
      <div
        className="relative min-h-[200px] lg:min-h-0 z-10"
        style={{ blockSize: "var(--landing-offer-height, 302px)" }}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeIndex}
            variants={containerVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex flex-col transform-gpu"
            style={{ willChange: 'transform, opacity' }}
          >
            {currentOffer && (
              <OfferCard offer={currentOffer} compact={false} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination dots + controls — below the card, attached to it */}
      <div className="flex items-center justify-end gap-1.5 mt-1 z-10 shrink-0">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIsAutoPlaying(false);
              setPage([i, i > activeIndex ? 1 : -1]);
            }}
            className={`rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              i === activeIndex
                ? "bg-[#103783] w-5 h-1.5"
                : "bg-slate-300 w-1.5 h-1.5 hover:bg-slate-400"
            }`}
            aria-label={`Show offer ${i + 1}`}
          />
        ))}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => paginate(-1)}
            className="w-6 h-6 rounded-full flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-[#103783] transition-colors shadow-sm"
            aria-label="Previous offers"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="w-6 h-6 rounded-full flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-[#103783] transition-colors shadow-sm"
            aria-label="Next offers"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
