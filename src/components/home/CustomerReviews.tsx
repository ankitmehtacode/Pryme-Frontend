import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Rahul Sharma",
    role: "Tech Entrepreneur",
    text: "PRYME got me a 50L unsecured loan in 4 hours. The UI is flawless and the rates were 2% lower than my base bank.",
    rating: 5,
  },
  {
    name: "Priya Desai",
    role: "Doctor",
    text: "Zero spam calls. My details were actually encrypted. I got 4 pre-approved offers instantly. Silicon Valley grade engineering indeed.",
    rating: 5,
  },
  {
    name: "Amit Patel",
    role: "Retail Business Owner",
    text: "The intelligent matchmaking saved me lakhs in processing fees. It directed me to the exact bank that favored my credit profile.",
    rating: 5,
  },
  {
    name: "Sneha Reddy",
    role: "Software Engineer",
    text: "Fastest personal loan journey I've ever experienced. No paperwork, just a seamless digital handshake.",
    rating: 5,
  },
  {
    name: "Vikram Singh",
    role: "Architect",
    text: "The EMI calculator and the instant offer comparison table are game absolute changers. Highly recommended.",
    rating: 5,
  },
  {
    name: "Neha Gupta",
    role: "Marketing Director",
    text: "Finally, a lending platform that doesn't feel like a scammy aggregator. PRYME is incredibly premium and trustworthy.",
    rating: 5,
  },
];

// Duplicate for infinite scroll effect
const allReviews = [...reviews, ...reviews];

const ReviewCard = ({ review }: { review: typeof reviews[0] }) => (
  <div className="w-[320px] md:w-[400px] flex-shrink-0 bg-white/5 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/20 dark:border-slate-800/50 p-6 rounded-2xl shadow-xl flex flex-col gap-4">
    <div className="flex gap-1">
      {[...Array(review.rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-[#2aac64] text-[#2aac64]" />
      ))}
    </div>
    <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed italic">
      "{review.text}"
    </p>
    <div className="mt-auto pt-4 border-t border-slate-200/10 dark:border-slate-700/50">
      <p className="font-semibold text-slate-900 dark:text-white">{review.name}</p>
      <p className="text-xs text-[#2aac64] uppercase tracking-wider mt-1">{review.role}</p>
    </div>
  </div>
);

const CustomerReviews = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up scroll-linked animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Track 1 moves left to right as you scroll down
  const x1 = useTransform(scrollYProgress, [0, 1], ["-20%", "5%"]);
  // Track 2 moves right to left as you scroll down
  const x2 = useTransform(scrollYProgress, [0, 1], ["5%", "-20%"]);

  return (
    <section 
      ref={containerRef}
      className="py-24 overflow-hidden relative bg-[#050505]"
    >
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#2aac64]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 mb-16 text-center relative z-10">
        <span className="inline-block text-[10px] md:text-xs font-semibold text-[#2aac64] uppercase tracking-[0.3em] mb-4">
          Verified Success
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight">
          Don't just take our word for it.
        </h2>
      </div>

      <div className="relative z-10 flex flex-col gap-6 md:gap-8">
        {/* Track 1 (Moves Right) */}
        <motion.div 
          style={{ x: x1 }}
          className="flex gap-6 md:gap-8 w-max pl-4"
        >
          {allReviews.map((review, idx) => (
            <ReviewCard key={`t1-${idx}`} review={review} />
          ))}
        </motion.div>

        {/* Track 2 (Moves Left) */}
        <motion.div 
          style={{ x: x2 }}
          className="flex gap-6 md:gap-8 w-max pl-4 ml-[-20vw]" // Offset starting position
        >
          {/* Reverse the array for variety on the second row */}
          {[...allReviews].reverse().map((review, idx) => (
            <ReviewCard key={`t2-${idx}`} review={review} />
          ))}
        </motion.div>
      </div>

      {/* Edge Fades for seamless exiting */}
      <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-[#050505] to-transparent z-20 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-[#050505] to-transparent z-20 pointer-events-none" />
    </section>
  );
};

export default CustomerReviews;
