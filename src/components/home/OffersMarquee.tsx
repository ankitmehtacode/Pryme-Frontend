import { Percent, Tag, Zap, Gift, Sparkles } from "lucide-react";

const offers = [
  { id: 1, text: "HDFC Personal Loan @ 10.49% ROI", icon: Percent, color: "text-emerald-500" },
  { id: 2, text: "Zero Processing Fee for Salaried Pros", icon: Tag, color: "text-blue-500" },
  { id: 3, text: "Instant Disbursal in 2 Hours", icon: Zap, color: "text-amber-500" },
  { id: 4, text: "Flat ₹5,000 Amazon Voucher on LAP", icon: Gift, color: "text-purple-500" },
  { id: 5, text: "SBI Home Loan starting at 8.35%", icon: Sparkles, color: "text-emerald-500" },
];

const OffersMarquee = () => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-3 shadow-lg relative overflow-hidden">
      {/* Edge Gradients for Smooth In/Out */}
      <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />

      <div className="marquee">
        <div className="marquee-content flex items-center">
          {/* Duplicate the array twice for an infinite seamless loop */}
          {[...offers, ...offers, ...offers].map((offer, index) => {
            const Icon = offer.icon;
            return (
              <div 
                key={index} 
                className="flex items-center gap-2.5 mx-8 shrink-0 group cursor-pointer"
              >
                <div className={`p-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm ${offer.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide uppercase group-hover:text-primary transition-colors">
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