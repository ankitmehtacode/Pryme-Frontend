import { memo } from "react";
import { Container } from "@/components/layout/Primitives";
import iciciLogo from "@/assets/icici.svg";
import axisLogo from "@/assets/axis-bank-logo-1.svg";
import idbiLogo from "@/assets/idbi-bank-logo-1.svg";
import unionLogo from "@/assets/union-bank-of-india.svg";
import kotakLogo from "@/assets/kotak-mahindra-bank-logo-vector_logoshape.com.svg";
import yesLogo from "@/assets/yes-bank-new-logo-download_logoshape.com.svg";
import pnbLogo from "@/assets/punjab-national-bank-vector-logo_logoshape.com.svg";
import tataLogo from "@/assets/tata-capital-logo-svg_logoshape.com.svg";
import hdfcLogo from "@/assets/hdfc.svg";
import sbiLogo from "@/assets/sbi-logo.svg";
import bobLogo from "@/assets/bob-logo.svg";
import scLogo from "@/assets/sc-logo.svg";
import indusindLogo from "@/assets/indusind-logo.svg";
import rblLogo from "@/assets/rbl-bank.svg";
import bajajLogo from "@/assets/bajaj-finserv.svg";
import ltLogo from "@/assets/lt-finance.svg";
import bandhanLogo from "@/assets/bandhan-bank.svg";
import abflLogo from "@/assets/abfl.svg";

export const banks = [
  { name: "Axis Bank", logo: axisLogo },
  { name: "IDBI Bank", logo: idbiLogo },
  { name: "HDFC Bank", logo: hdfcLogo },
  { name: "Union Bank", logo: unionLogo },
  { name: "State Bank of India", logo: sbiLogo },
  { name: "Bank of Baroda", logo: bobLogo },
  { name: "Standard Chartered", logo: scLogo },
  { name: "IndusInd Bank", logo: indusindLogo },
  { name: "RBL Bank", logo: rblLogo },
  { name: "ICICI Bank", logo: iciciLogo },
  { name: "Kotak Mahindra", logo: kotakLogo },
  { name: "Yes Bank", logo: yesLogo },
  { name: "Punjab National Bank", logo: pnbLogo },
  { name: "Tata Capital", logo: tataLogo },
  { name: "Bajaj Finserv", logo: bajajLogo },
  { name: "L&T Finance", logo: ltLogo },
  { name: "Bandhan Bank", logo: bandhanLogo },
  { name: "Aditya Birla Finance", logo: abflLogo },
];

const PartnerBankMarquee = memo(() => {
  return (
    <div className="w-full overflow-hidden relative">

      {/* Section Header */}
      <div className="w-full mb-6 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-4 border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Lending Partners
        </span>
        <p className="text-[clamp(0.6rem,1vw,0.75rem)] font-medium text-muted-foreground uppercase tracking-[0.3em] mt-3">
          TRUSTED BY OVER 15+ PREMIUM BANKS & NBFCs
        </p>
      </div>

      {/* PERF FIX: Replaced max-w-[100vw] with w-full.
           100vw includes scrollbar width on Windows/Linux (17px) → horizontal overflow.
           w-full respects the parent's content-box → no overflow ever. */}
      <div className="relative flex w-full overflow-hidden py-0">

        {/* Wide luminous edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-52 bg-gradient-to-r from-white via-white/80 dark:from-[#050505] dark:via-[#050505]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-52 bg-gradient-to-l from-white via-white/80 dark:from-[#050505] dark:via-[#050505]/80 to-transparent z-10 pointer-events-none" />


        {/* Marquee Track */}
        <div className="flex w-full group overflow-hidden">
          <div className="flex shrink-0 animate-marquee whitespace-nowrap items-center min-w-full justify-around px-4 group-hover:[animation-play-state:paused] py-1">
            {banks.map((bank, index) => (
              <div
                key={`track1-${index}`}
                className="mx-6 sm:mx-8 flex-shrink-0 flex items-center justify-center group/item cursor-pointer relative py-2"
              >
                {/* PERF: transition-[background-color] only, not transition-all */}
                <div className="absolute inset-0 -inset-x-2 -inset-y-1 rounded-full bg-primary/0 group-hover/item:bg-primary/[0.04] transition-[background-color] duration-300 pointer-events-none" />

                {/* Bounding box for uniform rendering */}
                <div className="w-[130px] h-[32px] sm:w-[170px] sm:h-[42px] flex items-center justify-center relative">
                  <img
                    src={bank.logo}
                    alt={bank.name}
                    className="max-w-full max-h-full object-contain select-none opacity-60 dark:opacity-50 group-hover/item:opacity-100 group-hover/item:scale-105 transition-all duration-300 ease-out"
                  />
                </div>
              </div>
            ))}
          </div>
          {/* PERF: aria-hidden duplicate track — blur-2xl removed. */}
          <div aria-hidden="true" className="flex shrink-0 animate-marquee whitespace-nowrap items-center min-w-full justify-around px-4 group-hover:[animation-play-state:paused] py-1">
            {banks.map((bank, index) => (
              <div
                key={`track2-${index}`}
                className="mx-6 sm:mx-8 flex-shrink-0 flex items-center justify-center group/item cursor-pointer relative py-2"
              >
                {/* Bounding box for uniform rendering */}
                <div className="w-[130px] h-[32px] sm:w-[170px] sm:h-[42px] flex items-center justify-center relative">
                  <img
                    src={bank.logo}
                    alt=""
                    className="max-w-full max-h-full object-contain select-none opacity-60 dark:opacity-50 group-hover/item:opacity-95 group-hover/item:scale-105 transition-all duration-300 ease-out"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

PartnerBankMarquee.displayName = "PartnerBankMarquee";
export default PartnerBankMarquee;