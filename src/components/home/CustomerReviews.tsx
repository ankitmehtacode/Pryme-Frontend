import { memo, useRef } from "react";
import { Star, Quote } from "lucide-react";
import { motion, useMotionValue, useTransform, useAnimationFrame, useInView } from "framer-motion";

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

const allReviews = [...reviews, ...reviews];

const ReviewCard = memo(({ review }: { review: typeof reviews[0] }) => {
  return (
    <div className="w-[320px] md:w-[380px] flex-shrink-0 relative group">
      {/* Card */}
      <div className="h-full bg-white/[0.03] border border-white/[0.06] p-6 rounded-2xl flex flex-col gap-4 transition-all duration-500 hover:border-[#103783]/30 hover:bg-white/[0.05]">
        
        {/* Top: brand gradient accent line */}
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#103783]/40 to-transparent" />

        {/* Quote icon */}
        <Quote className="w-5 h-5 text-[#103783]/40 -scale-x-100 shrink-0" />
        
        {/* Review text */}
        <p className="text-slate-300 text-sm leading-relaxed flex-1">
          {review.text}
        </p>

        {/* Stars */}
        <div className="flex gap-0.5">
          {[...Array(review.rating)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-[#9BAFD9] text-[#9BAFD9]" />
          ))}
        </div>
        
        {/* Author */}
        <div className="flex flex-col gap-0.5 pt-4 border-t border-white/[0.06]">
          <p className="text-sm font-medium text-white">{review.name}</p>
          <p className="text-[11px] text-[#9BAFD9]/70 uppercase tracking-wider">{review.role}</p>
        </div>
      </div>
    </div>
  );
});
ReviewCard.displayName = "ReviewCard";

const CustomerReviews = () => {
  const progress = useMotionValue(0);
  const isHovered = useRef(false);
  const isDragging = useRef(false);
  const rangeRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, margin: "200px" });

  // 200 IQ Perf: Manual animation loop directly drives CSS variable and transform, 
  // keeping the entire 60fps operation completely off the React render cycle.
  useAnimationFrame((time, delta) => {
    if (!isInView) return; // 🧠 Silicon Valley Perf: Pause loop entirely when off-screen
    if (!isDragging.current && !isHovered.current) {
      let current = progress.get();
      current += delta * 0.0012; // Base marquee speed
      if (current >= 100) current -= 100; // Perfect loop boundary
      if (current < 0) current += 100;
      progress.set(current);
      
      if (rangeRef.current && wrapperRef.current) {
        rangeRef.current.value = current.toString();
        wrapperRef.current.style.setProperty('--value', `${current}%`);
      }
    }
  });

  const handleDrag = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    progress.set(val);
    if (wrapperRef.current) {
      wrapperRef.current.style.setProperty('--value', `${val}%`);
    }
  };

  // x1 scrolls left (0% -> -50%)
  const x1 = useTransform(progress, [0, 100], ["0%", "-50%"]);
  // x2 scrolls right (-50% -> 0%)
  const x2 = useTransform(progress, [0, 100], ["-50%", "0%"]);

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32 overflow-hidden relative bg-[#030303]"
      style={{ contain: "content" }}
      onMouseEnter={() => isHovered.current = true}
      onMouseLeave={() => isHovered.current = false}
    >
      {/* Section Header */}
      <div className="container mx-auto px-4 mb-14 text-center relative z-10">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#103783]/30 bg-[#103783]/10 text-xs font-semibold text-[#9BAFD9] uppercase tracking-[0.3em] mb-6">
          Verified Success
        </span>
        <h2 className="text-white tracking-tight mb-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 3.25rem)' }}>
          <span className="font-normal">Don't just take </span>
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#103783] to-[#9BAFD9]">our word</span>
          <span className="font-normal"> for it.</span>
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto leading-relaxed" style={{ fontSize: 'clamp(0.875rem, 1.8vw, 1rem)' }}>
          Real stories from people who found better rates, faster approvals, and zero hassle.
        </p>
      </div>

      {/* Marquee Tracks */}
      <div className="relative z-10 flex flex-col gap-5">
        {/* Track 1 — scrolls left visually */}
        <div className="flex overflow-hidden group pl-4">
          {/* pr-5 added to precisely account for the 24th gap, ensuring mathematically perfect -50% looping */}
          <motion.div style={{ x: x1 }} className="flex gap-5 shrink-0 min-w-max pr-5 transform-gpu will-change-transform">
            {allReviews.map((review, idx) => <ReviewCard key={`t1a-${idx}`} review={review} />)}
            {allReviews.map((review, idx) => <ReviewCard key={`t1b-${idx}`} review={review} />)}
          </motion.div>
        </div>

        {/* Track 2 — scrolls right visually */}
        <div className="flex overflow-hidden group pl-4">
          <motion.div style={{ x: x2 }} className="flex gap-5 shrink-0 min-w-max pr-5 transform-gpu will-change-transform">
            {[...allReviews].reverse().map((review, idx) => <ReviewCard key={`t2a-${idx}`} review={review} />)}
            {[...allReviews].reverse().map((review, idx) => <ReviewCard key={`t2b-${idx}`} review={review} />)}
          </motion.div>
        </div>
      </div>

      {/* 200 IQ Scrub Slider */}
      <div className="mt-14 container mx-auto px-4 max-w-md relative z-30 flex flex-col items-center gap-4">
        <p className="text-[9px] uppercase tracking-[0.2em] text-[#9BAFD9]/50 font-bold">Slide to explore reviews</p>
        <div className="w-full relative flex items-center" ref={wrapperRef}>
          {/* Custom Range Track Background */}
          <div className="absolute inset-0 h-1.5 bg-white/5 rounded-full pointer-events-none" />
          {/* Custom Range Fill */}
          <div 
            className="absolute left-0 h-1.5 bg-gradient-to-r from-[#103783] to-[#9BAFD9] rounded-full pointer-events-none" 
            style={{ width: "var(--value, 0%)" }}
          />
          <input 
            ref={rangeRef}
            type="range" 
            min="0" 
            max="100" 
            step="0.01"
            defaultValue="0"
            onMouseDown={() => isDragging.current = true}
            onMouseUp={() => isDragging.current = false}
            onTouchStart={() => isDragging.current = true}
            onTouchEnd={() => isDragging.current = false}
            onChange={handleDrag}
            className="w-full absolute inset-0 appearance-none bg-transparent h-1.5 outline-none cursor-grab active:cursor-grabbing z-10
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
              [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(155,175,217,0.8)] 
              [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125
              [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
              [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:shadow-[0_0_15px_rgba(155,175,217,0.8)]"
          />
        </div>
      </div>

      {/* Edge fades — matched to exact bg color */}
      <div className="absolute top-0 bottom-0 left-0 w-24 md:w-40 bg-gradient-to-r from-[#030303] to-transparent z-20 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-24 md:w-40 bg-gradient-to-l from-[#030303] to-transparent z-20 pointer-events-none" />
    </section>
  );
};

export default CustomerReviews;
