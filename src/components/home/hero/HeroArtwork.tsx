import React from "react";
import HeroIllustration from "../HeroIllustration";
import heroBankImg from "@/assets/hero-bank-building.png";

interface HeroArtworkProps {
  currentOffer?: any;
}

export const HeroArtwork: React.FC<HeroArtworkProps> = ({ currentOffer }) => {
  return (
    <div className="hidden lg:flex items-center justify-center relative h-full">
      <HeroIllustration
        src={currentOffer?.heroImageUrl || heroBankImg}
        alt={currentOffer?.heroImageUrl ? `${currentOffer?.bank} hero illustration` : "Professional walking toward a bank building"}
      />
    </div>
  );
};
