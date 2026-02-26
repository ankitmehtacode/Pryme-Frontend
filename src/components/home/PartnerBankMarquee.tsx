import { memo } from "react";

const banks = [
  "HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra", 
  "Bank of Baroda", "IndusInd Bank", "IDFC First", "Bajaj Finserv", "Tata Capital"
];

const PartnerBankMarquee = memo(() => {
  return (
    <section className="w-full bg-white border-y border-slate-100 py-12 overflow-hidden relative z-10">
      
      {/* Label */}
      <div className="container mx-auto px-4 mb-10 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          Powered by India's Financial Giants
        </p>
      </div>
      
      {/* Infinite Loop Container 
        Uses the .marquee class from index.css for the mask-image fade effect
      */}
      <div className="marquee">
        {/* Content Track 
          Uses .marquee-content from index.css for the infinite animation
        */}
        <div className="marquee-content">
          {/* Repeat list 3x to ensure seamless looping on ultra-wide monitors */}
          {[...banks, ...banks, ...banks].map((bank, i) => (
            <span 
              key={i} 
              className="text-2xl md:text-4xl font-bold text-slate-300 hover:text-blue-900 transition-colors duration-500 cursor-default whitespace-nowrap select-none"
            >
              {bank}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
});

PartnerBankMarquee.displayName = "PartnerBankMarquee";
export default PartnerBankMarquee;