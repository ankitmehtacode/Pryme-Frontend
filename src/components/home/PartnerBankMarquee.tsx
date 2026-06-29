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
import sbiLogo from "@/assets/sbi.svg";
import bobLogo from "@/assets/bob.svg";
import scLogo from "@/assets/sc.svg";
import indusindLogo from "@/assets/indusind.svg";
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

      {/* PERF FIX: Replaced max-w-[100vw] with w-full.
           100vw includes scrollbar width on Windows/Linux (17px) → horizontal overflow.
           w-full respects the parent's content-box → no overflow ever. */}
      <div className="relative flex w-full overflow-hidden py-0">

        {/* Wide luminous edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-52 bg-gradient-to-r from-slate-50 via-slate-50/80 dark:from-[#030303] dark:via-[#030303]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-52 bg-gradient-to-l from-slate-50 via-slate-50/80 dark:from-[#030303] dark:via-[#030303]/80 to-transparent z-10 pointer-events-none" />

        {/* Ambient glow behind the track */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[60%] h-[80px] bg-primary/[0.03] dark:bg-primary/[0.05] transform-gpu rounded-full" />
        </div>

        {/* Marquee Track */}
        <div className="flex w-full group overflow-hidden">
          <div className="flex shrink-0 animate-marquee whitespace-nowrap items-center min-w-full justify-around px-4 group-hover:[animation-play-state:paused] py-1">
            {banks.map((bank, index) => (
              <div
                key={`track1-${index}`}
                className="mx-8 sm:mx-12 flex-shrink-0 flex items-center gap-3 group/item cursor-pointer relative py-3"
              >
                {/* PERF: transition-[background-color] only, not transition-all */}
                <div className="absolute inset-0 -inset-x-4 -inset-y-2 rounded-full bg-primary/0 group-hover/item:bg-primary/[0.04] transition-[background-color] duration-300 pointer-events-none" />

                <img
                  src={bank.logo}
                  alt={bank.name}
                  className={`relative object-contain select-none opacity-70 group-hover/item:opacity-100 group-hover/item:scale-105 transition-[opacity,transform] duration-300 ease-out ${
                    bank.logo.includes("google") ? "h-[28px] sm:h-[34px] w-auto rounded-md shadow-sm" : "h-[32px] sm:h-[42px] w-auto max-w-[150px] sm:max-w-[180px]"
                  }`}
                />

                {bank.logo.includes("google") && (
                  <span className="text-[17px] sm:text-[20px] font-extrabold text-slate-700/80 group-hover/item:text-[#0a1530] tracking-tight whitespace-nowrap transition-colors duration-300">
                    {bank.name}
                  </span>
                )}
              </div>
            ))}
          </div>
          {/* PERF: aria-hidden duplicate track — blur-2xl removed.
              Original had blur-2xl on hover on 9 items = up to 9 active GPU blur
              compositing operations in a scrolling loop. The visual hover effect
              on track 1 (above) is already sufficient. This track is invisible
              to screen readers; it exists only to make the marquee loop seamless. */}
          <div aria-hidden="true" className="flex shrink-0 animate-marquee whitespace-nowrap items-center min-w-full justify-around px-4 group-hover:[animation-play-state:paused] py-1">
            {banks.map((bank, index) => (
              <div
                key={`track2-${index}`}
                className="mx-8 sm:mx-12 flex-shrink-0 flex items-center gap-3 group/item cursor-pointer relative py-3"
              >
                <img
                  src={bank.logo}
                  alt=""
                  className={`relative object-contain select-none opacity-70 group-hover/item:opacity-95 transition-opacity duration-300 ease-out ${
                    bank.logo.includes("google") ? "h-[28px] sm:h-[34px] w-auto rounded-md shadow-sm" : "h-[32px] sm:h-[42px] w-auto max-w-[150px] sm:max-w-[180px]"
                  }`}
                />

                {bank.logo.includes("google") && (
                  <span className="text-[17px] sm:text-[20px] font-extrabold text-slate-700/80 tracking-tight whitespace-nowrap">
                    {bank.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Header */}
      <Container size="xl" className="mt-6 mb-2 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-4 border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Lending Partners
        </span>
        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-[0.3em] mt-3">
          TRUSTED BY OVER 15+ PREMIUM BANKS & NBFCs
        </p>
      </Container>
    </div>
  );
});

PartnerBankMarquee.displayName = "PartnerBankMarquee";
export default PartnerBankMarquee;