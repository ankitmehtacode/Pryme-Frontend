import React, { memo, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Columns } from "@/components/layout/Primitives";
import { HeroContent } from "./hero/HeroContent";
import { HeroArtwork } from "./hero/HeroArtwork";
import { HeroCarousel } from "./hero/HeroCarousel";

const HeroSection = memo(() => {
  const heroRef = useRef<HTMLElement>(null);
  const isInView = useInView(heroRef, { once: false, margin: "0px 0px 200px 0px" });
  const [currentOffer, setCurrentOffer] = useState<any>(null);

  return (
    <div
      ref={heroRef as any}
      className="w-full relative z-10 h-full flex flex-col justify-start pt-2 lg:pt-4"
      style={{ minBlockSize: "var(--landing-hero-height, clamp(392px, 43vh, 490px))" }}
    >
      {/* ════════════════════════════════════════════════════════════
          MAIN HERO GRID — 2-Column Split Panel via <Columns>
          Left: Static text | Right: Illustration + Offer cards
          ════════════════════════════════════════════════════════════ */}
      <Columns 
        preset="hero" 
        className="pt-2 md:pt-3 lg:pt-2 pb-2 md:pb-2 lg:pb-1 min-h-0 lg:min-h-[310px] w-full"
        style={{ gap: "var(--landing-hero-gap, var(--space-lg))" }}
      >
        {/* ─────── LEFT PANEL: Static Marketing Content ─────── */}
        <HeroContent />

        {/* ─────── RIGHT PANEL: Illustration + Offer Cards (direct child — no wrapper) ─────── */}
        <HeroArtwork currentOffer={currentOffer}>
          <HeroCarousel isInView={isInView} onActiveOfferChange={setCurrentOffer} />
        </HeroArtwork>
      </Columns>
    </div>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;
