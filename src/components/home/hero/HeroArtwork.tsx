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
      className="hidden lg:flex items-center justify-center relative h-full w-full order-2 z-0"
      style={{
        maxInlineSize: "var(--landing-artwork-width, clamp(620px, 58vw, 920px))",
        minBlockSize: "calc(var(--landing-hero-height, 430px) - 28px)",
        overflow: "visible",
        transform: "translate(0px, -15px)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ transform: "translateX(-192px)", zIndex: -1 }}>
        <HeroIllustration
          src={heroBankImg}
          alt="Professional walking toward a bank building"
        />
      </div>
      {children && (
        <div
          className="absolute z-20"
          style={{
            insetInlineStart: "calc(var(--offer-anchor-left, clamp(320px, 28vw, 420px)) + 60px)",
            insetBlockEnd: "36px",
            inlineSize: "var(--landing-offer-width, 380px)",
            blockSize: "var(--landing-offer-height, 318px)",
            overflow: "visible",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};
