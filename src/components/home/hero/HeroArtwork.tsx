import React from "react";
import HeroIllustration from "../HeroIllustration";
import heroBankImg from "@/assets/hero-bank-building.png";

interface HeroArtworkProps {
  currentOffer?: any;
  children?: React.ReactNode;
}

export const HeroArtwork: React.FC<HeroArtworkProps> = ({ currentOffer, children }) => {
  return (
    <div 
      className="hidden lg:flex items-center justify-center relative h-full w-full order-2"
      style={{
        maxInlineSize: "clamp(620px, 58vw, 920px)",
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      <HeroIllustration
        src={currentOffer?.heroImageUrl || heroBankImg}
        alt={currentOffer?.heroImageUrl ? `${currentOffer?.bank} hero illustration` : "Professional walking toward a bank building"}
      />
      {children && (
        <div 
          className="absolute z-20"
          style={{
            insetInlineEnd: "var(--offer-anchor-right, clamp(24px, 4%, 64px))",
            insetBlockEnd: "var(--offer-anchor-bottom, clamp(32px, 8%, 96px))",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};
