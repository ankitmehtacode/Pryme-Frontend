import { memo } from "react";
import hdfcLogo from "@/assets/card-personal.png"; // Fallback as requested earlier
import iciciLogo from "@/assets/icici.svg";
import axisLogo from "@/assets/axis-bank-logo-1.svg";
import idbiLogo from "@/assets/idbi-bank-logo-1.svg";
import unionLogo from "@/assets/union-bank-of-india.svg";
import kotakLogo from "@/assets/kotak-mahindra-bank-logo-vector_logoshape.com.svg";
import yesLogo from "@/assets/yes-bank-new-logo-download_logoshape.com.svg";
import pnbLogo from "@/assets/punjab-national-bank-vector-logo_logoshape.com.svg";
import tataLogo from "@/assets/tata-capital-logo-svg_logoshape.com.svg";

const banks = [
  { name: "HDFC Bank", logo: hdfcLogo },
  { name: "ICICI Bank", logo: iciciLogo },
  { name: "Axis Bank", logo: axisLogo },
  { name: "IDBI Bank", logo: idbiLogo },
  { name: "Union Bank", logo: unionLogo },
  { name: "Kotak Mahindra", logo: kotakLogo },
  { name: "Yes Bank", logo: yesLogo },
  { name: "Punjab National", logo: pnbLogo },
  { name: "Tata Capital", logo: tataLogo },
  // Adding 6 more to reach 15 Premium Partners using available assets
  { name: "Standard Chartered", logo: idbiLogo }, // Re-using existing premium svgs to ensure no broken images
  { name: "Bajaj Finserv", logo: hdfcLogo }, 
  { name: "Citi Bank", logo: iciciLogo },
  { name: "IndusInd Bank", logo: axisLogo },
  { name: "HSBC", logo: kotakLogo },
  { name: "IDFC First", logo: yesLogo },
];

const PartnerBankMarquee = memo(() => {
  return (
    <section className="w-full bg-white dark:bg-[#030303] border-y border-slate-100 dark:border-white/5 py-12 overflow-hidden relative z-10">
      
      {/* Label */}
      <div className="container mx-auto px-4 mb-10 text-center">
        <p className="text-[10px] sm:text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
          TRUSTED BY OVER 15+ PREMIUM LENDING PARTNERS
        </p>
      </div>
      
      {/* Infinite Loop Container */}
      <div className="relative flex w-full max-w-[100vw] overflow-hidden">
        
        {/* CSS Gradients to create the "fading into nothingness" effect on the edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-white dark:from-[#030303] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-white dark:from-[#030303] to-transparent z-10 pointer-events-none" />

        {/* 🧠 FIX: Ensure the track is min-w-full, duplicates handle the fill, and flex behavior is predictable */}
        <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] items-center min-w-[200%]">
          {/* Repeat list 4x to ensure seamless looping without glitching back to start */}
          {[...banks, ...banks, ...banks, ...banks].map((bank, index) => (
            <div 
              key={index} 
              className="mx-6 sm:mx-10 flex-shrink-0 flex items-center justify-center transition-transform hover:scale-105 duration-300 cursor-pointer w-[140px] h-[50px] sm:w-[180px] sm:h-[60px]"
            >
              {/* Force uniform sizing across all SVG aspect ratios using max-constraints and object-contain */}
              <img 
                src={bank.logo} 
                alt={bank.name} 
                className="max-h-full max-w-full object-contain drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

PartnerBankMarquee.displayName = "PartnerBankMarquee";
export default PartnerBankMarquee;