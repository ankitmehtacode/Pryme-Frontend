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
    <div ref={heroRef as any} className="w-full relative z-10 h-full flex flex-col justify-center">
      {/* ════════════════════════════════════════════════════════════
          MAIN HERO GRID — 2-Column Split Panel via <Columns>
          Left: Static text | Right: Illustration + Offer cards
          ════════════════════════════════════════════════════════════ */}
      <Columns 
        preset="hero" 
        className="pt-4 md:pt-12 lg:pt-8 pb-3 md:pb-6 lg:pb-8 min-h-0 lg:min-h-[480px] w-full"
      >
        {/* ─────── LEFT PANEL: Static Marketing Content ─────── */}
        <HeroContent />

        {/* ─────── RIGHT PANEL: Illustration + Offer Cards ─────── */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 order-2 lg:order-2 w-full lg:h-full mt-6 lg:mt-0">
          {/* Center: Bank Building Illustration */}
          <HeroArtwork currentOffer={currentOffer} />

          {/* Right: Rotating Offer Cards */}
          <HeroCarousel isInView={isInView} onActiveOfferChange={setCurrentOffer} />
        </div>
      </Columns>
    </div>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;
