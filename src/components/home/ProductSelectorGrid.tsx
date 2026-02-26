import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Wallet, Briefcase, Home, Building2, Car, GraduationCap } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

// Register GSAP
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const products = [
  { 
    icon: Wallet, 
    title: "Personal Loan", 
    desc: "Quick disbursement with flexible EMIs.", 
    rate: "10.5%", 
    amount: "₹40 Lakh",
    link: "/apply?type=personal", 
    color: "text-[#2aac64]", // Brand Green
    bg: "bg-emerald-50"
  },
  { 
    icon: Briefcase, 
    title: "Business Loan", 
    desc: "Fuel growth with working capital.", 
    rate: "12.0%", 
    amount: "₹2 Crore",
    link: "/apply?type=business", 
    color: "text-[#2aac64]",
    bg: "bg-emerald-50"
  },
  { 
    icon: Home, 
    title: "Home Loan", 
    desc: "Industry-best rates for your dream home.", 
    rate: "8.50%", 
    amount: "₹5 Crore",
    link: "/apply?type=home", 
    color: "text-[#2aac64]",
    bg: "bg-emerald-50"
  },
  { 
    icon: Building2, 
    title: "Prop. Loan", 
    desc: "Unlock value with high LTV ratios.", 
    rate: "9.50%", 
    amount: "₹3 Crore",
    link: "/apply?type=lap", 
    color: "text-[#2aac64]",
    bg: "bg-emerald-50"
  },
  { 
    icon: Car, 
    title: "Auto Loan", 
    desc: "Drive your dream car today.", 
    rate: "8.75%", 
    amount: "₹1 Crore",
    link: "/apply?type=car", 
    color: "text-[#2aac64]",
    bg: "bg-emerald-50"
  },
  { 
    icon: GraduationCap, 
    title: "Education", 
    desc: "Invest in your future globally.", 
    rate: "9.55%", 
    amount: "₹1.5 Crore",
    link: "/apply?type=education", 
    color: "text-[#2aac64]",
    bg: "bg-emerald-50"
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
    <section ref={containerRef} className="py-32 overflow-hidden bg-slate-50 relative">
      {/* Background decoration - Green Accent Line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent" />
      
      <div className="container mx-auto px-4 mb-20 text-center relative z-10">
        <span className="inline-block text-xs font-bold text-[#2aac64] uppercase tracking-[0.2em] mb-4 opacity-80">
            Loan Products
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
          Financial Solutions <br />
          <span className="text-slate-400">Engineered for Scale</span>
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Choose from our range of precision-crafted loan products designed 
            to meet your specific capital requirements.
        </p>
      </div>

      {/* Drifting Rows Wrapper */}
      <div className="flex flex-col gap-8 w-full">
        
        {/* Row 1: Drifts Left */}
        <div 
            ref={row1Ref} 
            className="flex gap-6 w-[140%] -ml-[10%] px-4 items-center"
        >
          {products.slice(0, 3).map((product, idx) => (
            <ProductCard key={`r1-${idx}`} product={product} />
          ))}
          {/* Duplicate for visual continuity */}
          {products.slice(3, 6).map((product, idx) => (
            <ProductCard key={`r1-dup-${idx}`} product={product} />
          ))}
        </div>

        {/* Row 2: Drifts Right */}
        <div 
            ref={row2Ref} 
            className="flex gap-6 w-[140%] -ml-[25%] px-4 items-center justify-end"
        >
          {products.slice(3, 6).map((product, idx) => (
            <ProductCard key={`r2-${idx}`} product={product} />
          ))}
          {products.slice(0, 3).map((product, idx) => (
            <ProductCard key={`r2-dup-${idx}`} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ProductCard = ({ product }: { product: any }) => (
  <Link 
    to={product.link}
    className="group relative flex-shrink-0 w-[320px] md:w-[400px] bg-white p-8 rounded-3xl border border-slate-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(42,172,100,0.15)] transition-all duration-500 hover:-translate-y-2 overflow-hidden"
  >
    {/* Abstract Hover Shape - Green Tint */}
    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-[100px] -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-125 opacity-50" />
    
    <div className="relative z-10">
      {/* Icon */}
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110",
        product.bg
      )}>
        <product.icon className={cn("w-7 h-7 transition-colors duration-300", product.color)} />
      </div>
      
      {/* Content */}
      <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">{product.title}</h3>
      <p className="text-slate-500 font-medium mb-8 leading-relaxed h-12">{product.desc}</p>
      
      {/* Footer Metrics */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Interest</p>
          {/* Gold Accent for Rate */}
          <p className="text-xl font-bold text-[#ffd600]">{product.rate}</p>
        </div>
        
        <div className="text-right mr-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Max Amount</p>
          <p className="text-lg font-bold text-slate-900">{product.amount}</p>
        </div>

        {/* Floating Action Button - Green on Hover */}
        <div className="w-12 h-12 rounded-full border border-slate-100 bg-white flex items-center justify-center text-slate-400 group-hover:bg-[#2aac64] group-hover:border-[#2aac64] group-hover:text-white transition-all duration-300 shadow-sm">
          <ArrowRight className="w-5 h-5 -ml-0.5" />
        </div>
      </div>
    </div>
  </Link>
);

export default ProductSelectorGrid;