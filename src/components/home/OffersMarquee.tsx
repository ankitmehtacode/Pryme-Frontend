import { Percent, Tag, Zap, Gift, Sparkles, Star, Car } from "lucide-react";

// Import Bank Logos
import hdfcLogo from "@/assets/card-personal.png"; // Fallback or find hdfc svg if available, using personal as placeholder if not
import iciciLogo from "@/assets/icici.svg";
import axisLogo from "@/assets/axis-bank-logo-1.svg";
import sbiLogo from "@/assets/card-home.png"; // Fallback
import kotakLogo from "@/assets/kotak-mahindra-bank-logo-vector_logoshape.com.svg";
import yesLogo from "@/assets/yes-bank-new-logo-download_logoshape.com.svg";
import pnbLogo from "@/assets/punjab-national-bank-vector-logo_logoshape.com.svg";
import tataLogo from "@/assets/tata-capital-logo-svg_logoshape.com.svg";

const offers = [
  { id: 1, bank: "HDFC", text: "HDFC Personal Loan @ 10.49% ROI", icon: Percent, logo: null, color: "text-emerald-500" },
  { id: 2, bank: "ICICI", text: "Zero Processing Fee for Salaried Pros", icon: Tag, logo: iciciLogo, color: "text-blue-500" },
  { id: 3, bank: "AXIS", text: "Instant Disbursal in 2 Hours", icon: Zap, logo: axisLogo, color: "text-amber-500" },
  { id: 4, bank: "TATA", text: "Flat ₹5,000 Voucher on LAP", icon: Gift, logo: tataLogo, color: "text-purple-500" },
  { id: 5, bank: "KOTAK", text: "Kotak Home Loan starting at 8.35%", icon: Sparkles, logo: kotakLogo, color: "text-emerald-500" },
  { id: 6, bank: "YES", text: "Yes Bank Pre-Approved Credit Cards", icon: Star, logo: yesLogo, color: "text-blue-500" },
  { id: 7, bank: "PNB", text: "PNB Lowest Auto Loan Rates", icon: Car, logo: pnbLogo, color: "text-amber-500" },
];

const OffersMarquee = () => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-3 shadow-lg relative overflow-hidden">
      {/* Edge Gradients for Smooth In/Out */}
      <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />

      <div className="relative flex w-full max-w-[100vw] overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] items-center min-w-full">
          {/* Duplicate the array multipe times for an infinite seamless loop */}
          {[...offers, ...offers, ...offers, ...offers].map((offer, index) => {
            const Icon = offer.icon;
            return (
              <div 
                key={index} 
                className="flex items-center gap-2.5 mx-8 shrink-0 group cursor-pointer"
              >
                {/* Logo or Icon */}
                <div className="flex items-center justify-center h-8 min-w-[3rem] px-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm transition-all duration-300 group-hover:bg-white dark:group-hover:bg-slate-700">
                  {offer.logo ? (
                     <img 
                       src={offer.logo} 
                       alt={offer.bank} 
                       className="h-4 w-auto object-contain dark:brightness-0 dark:invert opacity-80 group-hover:opacity-100 transition-opacity" 
                     />
                  ) : (
                     <Icon className={`w-4 h-4 ${offer.color} opacity-80 group-hover:opacity-100`} />
                  )}
                </div>
                
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 tracking-wide uppercase group-hover:text-primary transition-colors">
                  {offer.text}
                </span>
                <span className="mx-4 text-slate-300 dark:text-slate-700">•</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OffersMarquee;