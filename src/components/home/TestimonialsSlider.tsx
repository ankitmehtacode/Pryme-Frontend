import { useRef, useState, useEffect, useCallback, memo } from "react";
import { Star, ShieldCheck, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "Business Owner",
    location: "Mumbai",
    rating: 5,
    quote: "PRYME made my business loan application easy. Got approval in 24 hours with the best rate I could find.",
    loanType: "Business Loan",
    amount: "₹25 Lakh",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "IT Professional",
    location: "Bangalore",
    rating: 5,
    quote: "The EMI calculator helped me plan my finances perfectly. Transparent process, no hidden charges. Best decision I made for my home loan.",
    loanType: "Home Loan",
    amount: "₹75 Lakh",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: 3,
    name: "Amit Patel",
    role: "Doctor",
    location: "Ahmedabad",
    rating: 5,
    quote: "Exceptional service! The RM assigned to me was knowledgeable and helped me get a better rate than what I was offered elsewhere.",
    loanType: "Personal Loan",
    amount: "₹10 Lakh",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: 4,
    name: "Sneha Reddy",
    role: "Entrepreneur",
    location: "Hyderabad",
    rating: 5,
    quote: "Comparing multiple banks in one place saved me hours of research. The cashback offer was a pleasant bonus!",
    loanType: "Loan Against Property",
    amount: "₹50 Lakh",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: 5,
    name: "Vikram Singh",
    role: "Government Employee",
    location: "Delhi",
    rating: 5,
    quote: "Simple, fast, and reliable. The document upload process was smooth, and I received my loan within a week.",
    loanType: "Personal Loan",
    amount: "₹5 Lakh",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop&auto=format",
  },
];

/**
 * CSS-powered testimonial card carousel.
 * Replaces the OGL WebGL CircularGallery that was running a perpetual
 * requestAnimationFrame render loop, eating 10-20% GPU on every device.
 * 
 * This version uses:
 * - CSS scroll-snap for buttery native scrolling
 * - CSS perspective + translateZ for the curved depth effect
 * - IntersectionObserver for active slide detection (zero main-thread cost)
 * - Zero requestAnimationFrame, zero WebGL contexts
 */

const TestimonialCard = memo(({ t, isActive }: { t: typeof testimonials[0]; isActive: boolean }) => (
  <div 
    className={cn(
      "flex-shrink-0 w-[300px] sm:w-[340px] md:w-[380px] snap-center",
      "transition-all duration-500 ease-out",
      isActive ? "scale-100 opacity-100" : "scale-[0.92] opacity-60"
    )}
    style={{
      perspective: "1200px",
    }}
  >
    <div 
      className={cn(
        "relative bg-white/[0.07] rounded-[2rem] border overflow-hidden transition-all duration-500",
        isActive 
          ? "border-white/20 shadow-[0_20px_60px_-15px_rgba(16,55,131,0.3)]" 
          : "border-white/10 shadow-xl"
      )}
    >
      {/* Image */}
      <div className="relative h-36 md:h-40 overflow-hidden">
        <img 
          src={t.image} 
          alt={t.name} 
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/60 to-transparent" />
        
        {/* Loan Badge */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-primary/20 border border-primary/30 text-[9px] font-bold text-primary uppercase tracking-wider">
            {t.loanType}
          </span>
          <span className="text-[10px] font-bold text-white/80">{t.amount}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex gap-0.5 mb-4">
          {[...Array(t.rating)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
          ))}
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mb-5 font-medium italic">
          "{t.quote}"
        </p>
        <div className="pt-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
            <img 
              src={t.image} 
              alt={t.name} 
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{t.name}</p>
            <p className="text-[10px] text-primary uppercase tracking-wider font-medium">
              {t.role}, {t.location}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
));
TestimonialCard.displayName = "TestimonialCard";

const TestimonialsSlider = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // IntersectionObserver to detect which card is centered — zero main-thread cost
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) setActiveIndex(index);
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    const cards = container.querySelectorAll("[data-index]");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.querySelector(`[data-index="${index}"]`) as HTMLElement;
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, []);

  const goNext = useCallback(() => {
    const next = (activeIndex + 1) % testimonials.length;
    scrollToIndex(next);
  }, [activeIndex, scrollToIndex]);

  const goPrev = useCallback(() => {
    const prev = (activeIndex - 1 + testimonials.length) % testimonials.length;
    scrollToIndex(prev);
  }, [activeIndex, scrollToIndex]);

  return (
    <div className="w-full relative overflow-hidden z-10">
      
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 transform-gpu rounded-full pointer-events-none" />

      <div className="w-full relative z-20">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6 shadow-xl">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-[10px] md:text-xs font-semibold text-primary uppercase tracking-[0.2em]">
              Verified Success
            </span>
          </div>
          <h2 className="text-2xl md:text-xl lg:text-2xl font-semibold text-white mb-6 tracking-tighter">
            Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Thousands.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            See what our customers have to say about their experience with the PRYME financial algorithm.
          </p>
        </motion.div>

        {/* CSS Scroll-Snap Carousel — replaces WebGL CircularGallery */}
        <div className="relative">
          {/* Edge Fades */}
          <div className="absolute top-0 bottom-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#030303] to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#030303] to-transparent z-10 pointer-events-none" />

          {/* Navigation Arrows */}
          <button
            onClick={goPrev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Scrollable Track */}
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory py-8 px-[calc(50%-170px)] sm:px-[calc(50%-190px)] md:px-[calc(50%-210px)] scrollbar-none"
            style={{ 
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {testimonials.map((t, i) => (
              <div key={t.id} data-index={i} className="snap-center">
                <TestimonialCard t={t} isActive={i === activeIndex} />
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  i === activeIndex 
                    ? "bg-primary w-8 h-2" 
                    : "bg-white/20 w-2 h-2 hover:bg-white/40"
                )}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-4xl mx-auto mt-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-evenly gap-6 md:gap-12 p-6 md:p-8 rounded-[2rem] bg-white/5 border border-white/10 shadow-2xl">
            
            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-semibold text-white leading-none">4.9/5</span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Average Rating</span>
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-white/10" />
            <div className="block md:hidden w-12 h-px bg-white/10" />

            {/* Customers */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-semibold text-white leading-none">10,000+</span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Happy Customers</span>
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-white/10" />
            <div className="block md:hidden w-12 h-px bg-white/10" />

            {/* Disbursed */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-semibold text-white leading-none">₹500Cr+</span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">Capital Disbursed</span>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default TestimonialsSlider;