import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Wallet, Home, Briefcase, Building2, Car, GraduationCap } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const products = [
  {
    title: "Personal Loan",
    icon: Wallet,
    href: "/apply?type=personal",
    rate: "10.49%",
    limit: "₹50L",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "group-hover:border-blue-500/50",
  },
  {
    title: "Home Loan",
    icon: Home,
    href: "/apply?type=home",
    rate: "8.35%",
    limit: "₹5Cr",
    color: "from-[#2aac64]/20 to-emerald-500/20",
    border: "group-hover:border-[#2aac64]/50",
  },
  {
    title: "Business Loan",
    icon: Briefcase,
    href: "/apply?type=business",
    rate: "11.25%",
    limit: "₹2Cr",
    color: "from-[#ffd600]/20 to-amber-500/20",
    border: "group-hover:border-[#ffd600]/50",
  },
  {
    title: "Loan Against Property",
    icon: Building2,
    href: "/apply?type=lap",
    rate: "9.50%",
    limit: "₹10Cr",
    color: "from-purple-500/20 to-fuchsia-500/20",
    border: "group-hover:border-purple-500/50",
  },
  { 
    title: "Auto Loan", 
    icon: Car,
    href: "/apply?type=car", 
    rate: "8.75%", 
    limit: "₹1Cr",
    color: "from-rose-500/20 to-pink-500/20",
    border: "group-hover:border-rose-500/50",
  },
  { 
    title: "Education", 
    icon: GraduationCap, 
    href: "/apply?type=education", 
    rate: "9.55%", 
    limit: "₹1.5Cr",
    color: "from-indigo-500/20 to-violet-500/20",
    border: "group-hover:border-indigo-500/50",
  }
];

const ProductSelectorGrid = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Row 1 Drifts Left (slower, heavier feel)
      gsap.to(row1Ref.current, {
        xPercent: -15,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5 // Smooth catch-up
        }
      });

      // Row 2 Drifts Right
      gsap.to(row2Ref.current, {
        xPercent: 5, // Starts slightly offset, moves right
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-32 bg-white dark:bg-[#030303] overflow-hidden relative">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#2aac64]" />
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-slate-800 dark:text-white/80 uppercase">
              Financial Arsenal
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
            CHOOSE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2aac64] to-[#166534] dark:from-[#2aac64] dark:to-[#4ade80]">WEAPON.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 dark:text-white/50 font-medium max-w-2xl mx-auto tracking-tight">
            Premium capital limits with the lowest industry interest rates. Select your product to begin.
          </p>
        </div>
      </div>

      {/* Drifting Rows Wrapper */}
      <div className="flex flex-col gap-8 w-full pb-10">
        
        {/* Row 1: Drifts Left */}
        <div 
            ref={row1Ref} 
            className="flex gap-6 w-[140%] -ml-[10%] px-4 items-center"
        >
          {products.slice(0, 4).map((product, idx) => (
            <ProductCard key={`r1-${idx}`} product={product} />
          ))}
          {/* Duplicate for visual continuity */}
          {products.slice(4, 6).map((product, idx) => (
            <ProductCard key={`r1-dup-${idx}`} product={product} />
          ))}
          <ProductCard key="fill-1" product={products[0]} />
        </div>

        {/* Row 2: Drifts Right */}
        <div 
            ref={row2Ref} 
            className="flex gap-6 w-[140%] -ml-[25%] px-4 items-center justify-end"
        >
          {products.slice(2, 6).map((product, idx) => (
            <ProductCard key={`r2-${idx}`} product={product} />
          ))}
          {/* Duplicate for visual continuity */}
          {products.slice(0, 2).map((product, idx) => (
            <ProductCard key={`r2-dup-${idx}`} product={product} />
          ))}
          <ProductCard key="fill-2" product={products[3]} />
        </div>

      </div>
    </section>
  );
};

// Extracted "CRED-Style" Glass Card Component
const ProductCard = ({ product }: { product: any }) => (
  <Link 
    to={product.href}
    className={`group relative flex-shrink-0 w-[320px] md:w-[380px] overflow-hidden rounded-[2rem] bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-emerald-900/20 ${product.border}`}
  >
    {/* Holographic Glare Effect */}
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${product.color} mix-blend-overlay pointer-events-none`} />
    <div className="absolute -inset-[100%] top-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] dark:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] translate-x-[-100%] group-hover:animate-shimmer pointer-events-none" />

    <div className="relative z-10 flex flex-col h-full">
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-8 text-slate-900 dark:text-white group-hover:scale-110 transition-transform duration-300">
        <product.icon className="w-7 h-7" />
      </div>
      
      {/* Title */}
      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-8">
        {product.title}
      </h3>
      
      {/* Footer Metrics */}
      <div className="mt-auto space-y-6">
        <div className="flex justify-between items-end border-b border-slate-100 dark:border-white/5 pb-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Starting At</p>
            {/* The Gold Accent Rate */}
            <p className="text-3xl font-black text-[#ffd600]">{product.rate}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Max Limit</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{product.limit}</p>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#2aac64] transition-colors">
          <span className="tracking-wide">Check Eligibility</span>
          <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-[#2aac64] group-hover:border-[#2aac64] group-hover:text-white transition-all duration-300">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  </Link>
);

export default ProductSelectorGrid;