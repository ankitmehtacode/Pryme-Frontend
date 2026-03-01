import { memo } from "react";

const banks = [
  { name: "HDFC Bank", domain: "hdfcbank.com" },
  { name: "ICICI Bank", domain: "icicibank.com" },
  { name: "Axis Bank", domain: "axisbank.com" },
  { name: "Kotak Mahindra", domain: "kotak.com" },
  { name: "Standard Chartered", domain: "sc.com" },
  { name: "Yes Bank", domain: "yesbank.in" },
  { name: "Bajaj Finserv", domain: "bajajfinserv.in" },
  { name: "Tata Capital", domain: "tatacapital.com" },
];

const PartnerBankMarquee = memo(() => {
  return (
    <section className="w-full bg-white dark:bg-[#030303] border-y border-slate-100 dark:border-white/5 py-12 overflow-hidden relative z-10">
      
      {/* Label */}
      <div className="container mx-auto px-4 mb-10 text-center">
        <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
          TRUSTED BY OVER 15+ PREMIUM LENDING PARTNERS
        </p>
      </div>
      
      {/* Infinite Loop Container */}
      <div className="relative flex w-full max-w-[100vw] overflow-hidden">
        
        {/* CSS Gradients to create the "fading into nothingness" effect on the edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-white dark:from-[#030303] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-white dark:from-[#030303] to-transparent z-10 pointer-events-none" />

        {/* Content Track */}
        <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] items-center">
          {/* Repeat list 3x to ensure seamless looping on ultra-wide monitors */}
          {[...banks, ...banks, ...banks].map((bank, index) => (
            <div 
              key={index} 
              className="mx-8 sm:mx-12 flex items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer"
            >
              {/* Uses Clearbit API to fetch real corporate logos magically */}
              <img 
                src={`https://logo.clearbit.com/${bank.domain}`} 
                alt={bank.name} 
                className="h-8 sm:h-10 w-auto object-contain dark:brightness-200 dark:contrast-200 hover:dark:brightness-100 hover:dark:contrast-100 transition-all duration-500"
                onError={(e) => {
                  // Fallback: If adblocker blocks Clearbit, show the text instead
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden text-xl font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                {bank.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

PartnerBankMarquee.displayName = "PartnerBankMarquee";
export default PartnerBankMarquee;