import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Rahul Sharma",
    role: "Tech Entrepreneur",
    text: "Got a 50L loan approved in just 4 hours. The rates were actually 2% lower than what my bank offered directly. Very smooth experience.",
    rating: 5,
  },
  {
    name: "Priya Desai",
    role: "Doctor",
    text: "What surprised me was zero spam calls afterwards. I got 4 pre-approved offers instantly and my details were kept completely private.",
    rating: 5,
  },
  {
    name: "Amit Patel",
    role: "Retail Business Owner",
    text: "Saved over ₹80,000 in processing fees alone. The system matched me directly with the bank that best suited my credit profile.",
    rating: 5,
  },
  {
    name: "Sneha Reddy",
    role: "Software Engineer",
    text: "Fastest loan process I've experienced. Everything was digital, no paperwork needed. Funds were in my account the next day.",
    rating: 5,
  },
  {
    name: "Vikram Singh",
    role: "Architect",
    text: "The EMI calculator and instant comparison table saved me hours of research. I could see exactly what each bank was offering.",
    rating: 5,
  },
  {
    name: "Neha Gupta",
    role: "Marketing Director",
    text: "Finally, a lending platform that actually feels trustworthy. No hidden charges, no pressure tactics. Just a clean, transparent process.",
    rating: 5,
  },
];

// Duplicate for infinite scroll effect
const allReviews = [...reviews, ...reviews];

const ReviewCard = ({ review }: { review: typeof reviews[0] }) => (
  <div className="w-[320px] md:w-[400px] flex-shrink-0 bg-white/5 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/20 dark:border-slate-800/50 p-6 rounded-2xl shadow-xl flex flex-col gap-4">
    <div className="flex gap-1">
      {[...Array(review.rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-[#7c3aed] text-[#7c3aed]" />
      ))}
    </div>
    <p className="text-muted-foreground text-sm md:text-base leading-relaxed italic">
      "{review.text}"
    </p>
    <div className="mt-auto pt-4 border-t border-slate-200/10 dark:border-slate-700/50">
      <p className="font-semibold text-foreground">{review.name}</p>
      <p className="text-xs text-[#7c3aed] uppercase tracking-wider mt-1">{review.role}</p>
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
      {/* Background Photo */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1560472355-536de3962603?w=1400&h=800&fit=crop&auto=format&q=80" 
          alt="" 
          className="w-full h-full object-cover opacity-[0.05]" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-[#050505]" />
      </div>
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#7c3aed]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 mb-16 text-center relative z-10">
        <span className="inline-block text-[10px] md:text-xs font-semibold text-[#7c3aed] uppercase tracking-[0.3em] mb-4">
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
