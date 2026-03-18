import { memo } from "react";
import iciciLogo from "@/assets/icici.svg";
import axisLogo from "@/assets/axis-bank-logo-1.svg";
import idbiLogo from "@/assets/idbi-bank-logo-1.svg";
import unionLogo from "@/assets/union-bank-of-india.svg";
import kotakLogo from "@/assets/kotak-mahindra-bank-logo-vector_logoshape.com.svg";
import yesLogo from "@/assets/yes-bank-new-logo-download_logoshape.com.svg";
import pnbLogo from "@/assets/punjab-national-bank-vector-logo_logoshape.com.svg";
import tataLogo from "@/assets/tata-capital-logo-svg_logoshape.com.svg";

export const banks = [
  { name: "ICICI Bank", logo: iciciLogo },
  { name: "Axis Bank", logo: axisLogo },
  { name: "IDBI Bank", logo: idbiLogo },
  { name: "Union Bank", logo: unionLogo },
  { name: "Kotak Mahindra", logo: kotakLogo },
  { name: "Yes Bank", logo: yesLogo },
  { name: "Punjab National", logo: pnbLogo },
  { name: "Tata Capital", logo: tataLogo },
  { name: "Standard Chartered", logo: idbiLogo },
  { name: "Citi Bank", logo: iciciLogo },
  { name: "IndusInd Bank", logo: axisLogo },
  { name: "HSBC", logo: kotakLogo },
  { name: "IDFC First", logo: yesLogo },
];

const PartnerBankMarquee = memo(() => {
  return (
    <div className="w-full overflow-hidden relative">

      {/* Section Header */}
      <div className="container mx-auto px-4 mb-12 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-4 border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Lending Partners
        </span>
        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-[0.3em] mt-3">
          TRUSTED BY OVER 15+ PREMIUM BANKS & NBFCs
        </p>
      </div>

      {/* Marquee — Free‐floating logos, original brand colours */}
      <div className="relative flex w-full max-w-[100vw] overflow-hidden py-4">

        {/* Wide luminous edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-52 bg-gradient-to-r from-slate-50 via-slate-50/80 dark:from-[#030303] dark:via-[#030303]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-52 bg-gradient-to-l from-slate-50 via-slate-50/80 dark:from-[#030303] dark:via-[#030303]/80 to-transparent z-10 pointer-events-none" />

        {/* Ambient glow behind the track */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[60%] h-[80px] bg-primary/[0.03] dark:bg-primary/[0.05] blur-[80px] rounded-full" />
        </div>

        {/* Marquee Track */}
        <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] items-center min-w-[200%]">
          {[...banks, ...banks, ...banks, ...banks].map((bank, index) => (
            <div
              key={index}
              className="mx-8 sm:mx-12 flex-shrink-0 group cursor-pointer relative py-3"
            >
              {/* Hover bloom — soft green radial glow */}
              <div className="absolute inset-0 -inset-x-6 -inset-y-3 rounded-full bg-primary/0 group-hover:bg-primary/[0.07] blur-2xl transition-all duration-700 pointer-events-none" />

              {/* Logo — Full original brand colours, no filters */}
              <img
                src={bank.logo}
                alt={bank.name}
                className="relative h-[32px] sm:h-[42px] w-auto max-w-[150px] sm:max-w-[180px] object-contain select-none
                  opacity-70 group-hover:opacity-100
                  group-hover:scale-110
                  group-hover:drop-shadow-[0_0_25px_rgba(42,172,100,0.2)]
                  transition-all duration-500 ease-out"
              />

            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

PartnerBankMarquee.displayName = "PartnerBankMarquee";
export default PartnerBankMarquee;