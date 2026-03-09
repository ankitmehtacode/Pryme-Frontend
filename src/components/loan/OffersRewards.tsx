import { Gift, Percent, Tag, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Offer {
  id: string;
  type: "discount" | "cashback" | "reward" | "gift";
  title: string;
  description: string;
  bank?: string;
  validTill?: string;
}

const defaultOffers: Offer[] = [
  {
    id: "1",
    type: "discount",
    title: "50% Off Processing Fee",
    description: "Apply through PRYME and get 50% off on processing charges",
    bank: "HDFC Bank",
    validTill: "31 Dec 2024"
  },
  {
    id: "2",
    type: "cashback",
    title: "₹2,000 Cashback",
    description: "Get ₹2,000 cashback on first EMI payment",
    bank: "ICICI Bank",
    validTill: "15 Jan 2025"
  },
  {
    id: "3",
    type: "gift",
    title: "Amazon Gift Card",
    description: "Get ₹500 Amazon gift card on loan disbursement",
    bank: "Axis Bank",
    validTill: "31 Dec 2024"
  },
  {
    id: "4",
    type: "reward",
    title: "Loyalty Points",
    description: "Earn 5000 reward points on successful loan approval",
    bank: "SBI",
    validTill: "Ongoing"
  }
];

const OffersRewards = ({ offers = defaultOffers }: { offers?: Offer[] }) => {
  const getOfferIcon = (type: Offer["type"]) => {
    switch (type) {
      case "discount": return Percent;
      case "cashback": return Tag;
      case "gift": return Gift;
      case "reward": return Sparkles;
    }
  };

  const getOfferStyling = (type: Offer["type"]) => {
    switch (type) {
      case "discount": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)] group-hover:shadow-[0_0_25px_rgba(52,211,153,0.2)]";
      case "cashback": return "text-primary bg-primary/10 border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)] group-hover:shadow-[0_0_25px_rgba(var(--primary),0.2)]";
      case "gift": return "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.1)] group-hover:shadow-[0_0_25px_rgba(251,191,36,0.2)]";
      case "reward": return "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(96,165,250,0.1)] group-hover:shadow-[0_0_25px_rgba(96,165,250,0.2)]";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
  };

  return (
    <div className="bg-white/5 dark:bg-[#0a0a0a]/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden h-full">
      
      {/* Ambient Inner Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-inner flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-amber-500/20 animate-pulse mix-blend-overlay" />
          <Gift className="w-6 h-6 text-amber-500 relative z-10" />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Offers & Rewards</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Exclusive algorithms unlocked</p>
        </div>
      </div>

      {/* Offers Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-10"
      >
        {offers.map((offer) => {
          const Icon = getOfferIcon(offer.type);
          const styling = getOfferStyling(offer.type);
          
          return (
            <motion.div 
              variants={itemVariants}
              key={offer.id} 
              className="bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.5rem] p-5 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer group flex flex-col h-full"
            >
              {/* Icon Top */}
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-5 border transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3", styling)}>
                <Icon className="w-6 h-6" />
              </div>
              
              {/* Content */}
              <h4 className="font-semibold text-base md:text-lg text-slate-900 dark:text-white mb-2 leading-tight tracking-tight">
                {offer.title}
              </h4>
              <p className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed mb-6 flex-1">
                {offer.description}
              </p>
              
              {/* Footer Meta */}
              <div className="mt-auto pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
                {offer.bank && (
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                    {offer.bank}
                  </span>
                )}
                {offer.validTill && (
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                    Valid: {offer.validTill}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default OffersRewards;