import { useState, memo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Assets safely imported from local directory
import cardPersonal from "@/assets/card-personal.png";
import cardBusiness from "@/assets/card-business.png";
import cardHome from "@/assets/card-home.png";
import cardEducation from "@/assets/card-education.png";

const products = [
  {
    id: "personal",
    label: "Personal",
    image: cardPersonal,
    title: "Personal Loan",
    description: "Quick disbursement for your personal needs with flexible EMIs.",
    rate: "10.49%",
    maxAmount: "₹50 Lakh",
    tenure: "Up to 5 Years",
    href: "/apply?type=personal",
    accent: "148, 62%, 42%", // PRYME Emerald
    features: ["No collateral required", "Instant approval in 2 mins", "Flexible repayment options"],
  },
  {
    id: "business",
    label: "Business",
    image: cardBusiness,
    title: "Business Loan",
    description: "Fuel your business growth with competitive rates and minimal documentation.",
    rate: "11.25%",
    maxAmount: "₹2 Crore",
    tenure: "Up to 7 Years",
    href: "/apply?type=business",
    accent: "217, 91%, 60%", // Trust Blue
    features: ["Collateral-free up to ₹75L", "Quick disbursal in 48 hrs", "Overdraft facility available"],
  },
  {
    id: "home",
    label: "Home Loan",
    image: cardHome,
    title: "Home Loan",
    description: "Make your dream home a reality with industry-best interest rates.",
    rate: "8.35%",
    maxAmount: "₹5 Crore",
    tenure: "Up to 30 Years",
    href: "/apply?type=home",
    accent: "48, 100%, 50%", // Premium Gold
    features: ["Balance transfer option", "Top-up loan available", "Tax benefits up to ₹3.5L"],
  },
  {
    id: "education",
    label: "Education",
    image: cardEducation,
    title: "Education Loan",
    description: "Invest in your future with affordable, zero-stress education financing.",
    rate: "9.55%",
    maxAmount: "₹1.5 Crore",
    tenure: "Up to 15 Years",
    href: "/apply?type=education",
    accent: "270, 70%, 60%", // Wealth Purple
    features: ["Moratorium during study", "Covers tuition + living", "Tax benefit under Sec 80E"],
  },
];

const spring = { type: "spring" as const, stiffness: 140, damping: 22, mass: 0.7 };

const ProductSelectorGrid = memo(() => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = products.find((p) => p.id === selectedId);
  const selectedIndex = products.findIndex((p) => p.id === selectedId);
  const rowRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  // 🧠 Auto-scroll logic: Centers the active card, then gently scrolls to show details
  useEffect(() => {
    if (selectedId && rowRef.current) {
      const container = rowRef.current;
      const card = container.children[selectedIndex] as HTMLElement;
      if (card) {
        const scrollLeft = card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
        
        // Wait for the AnimatePresence height expansion to start, then scroll into view
        setTimeout(() => {
          detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 150);
      }
    }
  }, [selectedId, selectedIndex]);

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-slate-50/50 dark:bg-[#030303] transition-colors duration-300">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#2aac64]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-0 md:px-4 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={spring}
          className="text-center mb-12 px-4"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2aac64]/10 text-[#2aac64] text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-[#2aac64] animate-pulse" />
            Financial Arsenal
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
            CHOOSE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2aac64] to-[#166534] dark:from-[#2aac64] dark:to-[#4ade80]">WEAPON.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto tracking-tight">
            Premium capital limits with the lowest industry interest rates. Select your product to reveal intel.
          </p>
        </motion.div>

        {/* 🧠 3D Scrollable Isometric Card Row */}
        <div
          ref={rowRef}
          className="flex items-end gap-6 md:gap-10 max-w-6xl mx-auto mb-10 overflow-x-auto px-8 md:px-12 py-8 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {products.map((product, index) => {
            const isActive = selectedId === product.id;
            const hasSelection = selectedId !== null;
            const isInactive = hasSelection && !isActive;

            return (
              <motion.button
                key={product.id}
                onClick={() => setSelectedId(isActive ? null : product.id)}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: index * 0.1 }}
                className="relative flex flex-col items-center cursor-pointer group snap-center shrink-0"
                style={{ perspective: "1200px" }}
                layout
              >
                {/* The 3D Expanding Card */}
                <motion.div
                  className="relative rounded-[2rem] overflow-hidden"
                  animate={{
                    // When active, card expands. When inactive, it shrinks and blurs out of focus.
                    width: isActive ? 220 : isInactive ? 130 : 180,
                    height: isActive ? 220 : isInactive ? 130 : 180,
                    filter: isInactive ? "blur(4px) brightness(0.6)" : "blur(0px) brightness(1)",
                    opacity: isInactive ? 0.6 : 1,
                    y: isActive ? -20 : 0,
                    rotateY: isActive ? 0 : index % 2 === 0 ? -10 : 10,
                    rotateX: isActive ? 0 : 8,
                    boxShadow: isActive
                      ? `0 40px 80px -20px hsla(${product.accent}, 0.8)`
                      : "0 20px 40px -15px rgba(0,0,0,0.3)",
                  }}
                  whileHover={!isActive ? { 
                    scale: isInactive ? 0.95 : 1.05, 
                    y: -10, 
                    filter: isInactive ? "blur(2px) brightness(0.8)" : "blur(0px) brightness(1)",
                    opacity: isInactive ? 0.8 : 1,
                  } : undefined}
                  whileTap={{ scale: 0.95 }}
                  transition={{ ...spring, filter: { duration: 0.4 }, opacity: { duration: 0.3 } }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent z-10 pointer-events-none mix-blend-overlay" />
                  
                  <img
                    src={product.image}
                    alt={product.label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    draggable={false}
                  />

                  {/* Active glowing ring */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={spring}
                        className="absolute inset-0 rounded-[2rem] z-20 pointer-events-none"
                        style={{
                          border: `3px solid hsla(${product.accent}, 1)`,
                          boxShadow: `inset 0 0 30px hsla(${product.accent}, 0.3)`
                        }}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Floating Label */}
                <motion.span
                  animate={{
                    opacity: isInactive ? 0.35 : 1,
                    scale: isActive ? 1.1 : isInactive ? 0.9 : 1,
                    y: isActive ? 12 : 0,
                    color: isActive ? `hsla(${product.accent}, 1)` : "currentColor",
                  }}
                  transition={spring}
                  className={`mt-6 px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-colors duration-300 ${
                    isActive 
                      ? "bg-white dark:bg-slate-800 shadow-xl" 
                      : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                  }`}
                >
                  {product.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>

        {/* 🧠 DYNAMIC HEIGHT EXPANSION PANEL (Push-Down Layout) */}
        <div ref={detailsRef} className="max-w-5xl mx-auto px-4 relative w-full" style={{ perspective: "1200px" }}>
          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                key={selected.id}
                // The crucial height animation that smoothly pushes the page content down
                initial={{ opacity: 0, height: 0, rotateX: -15, y: -40, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", rotateX: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, height: 0, rotateX: 10, y: -20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 130, damping: 22 }}
                className="origin-top"
              >
                <div 
                  className="glass-panel w-full rounded-[2.5rem] md:rounded-[3rem] overflow-hidden relative shadow-2xl mt-4 mb-8"
                  style={{ boxShadow: `0 30px 80px -20px hsla(${selected.accent}, 0.25)` }}
                >
                  <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.15] transition-colors duration-1000 pointer-events-none" style={{ background: `radial-gradient(circle at 100% 0%, hsla(${selected.accent}, 1) 0%, transparent 60%)` }} />
                  <div className="absolute top-0 left-[10%] right-[10%] h-[1px]" style={{ background: `linear-gradient(90deg, transparent, hsla(${selected.accent}, 0.5), transparent)` }} />

                  <div className="relative p-6 md:p-12 flex flex-col md:flex-row gap-8 md:gap-10">
                    
                    {/* Left Column */}
                    <div className="flex-1 space-y-6 flex flex-col justify-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-sm font-bold shadow-inner border border-slate-200 dark:border-slate-700 w-max">
                        <span style={{ color: `hsla(${selected.accent}, 1)` }}>{selected.label} Profile</span>
                      </div>
                      
                      <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                        {selected.title}
                      </h3>
                      
                      <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-md">
                        {selected.description}
                      </p>

                      <div className="pt-4">
                        <Link
                          to={selected.href}
                          className="inline-flex items-center gap-3 rounded-full text-white px-8 py-4 text-base font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 w-full md:w-auto justify-center group/btn"
                          style={{ backgroundColor: `hsla(${selected.accent}, 1)` }}
                        >
                          Start Application <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex-1 w-full bg-white/40 dark:bg-slate-900/40 rounded-[2rem] p-6 md:p-8 border border-white/40 dark:border-slate-700/50 shadow-inner backdrop-blur-xl flex flex-col justify-center">
                      <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-slate-200/50 dark:border-slate-700/50">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block">Starting Rate</span>
                          <p className="text-3xl md:text-4xl font-black holographic-text">{selected.rate}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 block">Max Limit</span>
                          <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">{selected.maxAmount}</p>
                        </div>
                      </div>

                      <ul className="space-y-4 md:space-y-5">
                        {selected.features.map((feature, i) => (
                          <motion.li
                            key={feature}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1, type: "spring" }}
                            className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-semibold text-sm md:text-base"
                          >
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-white dark:bg-slate-800" style={{ color: `hsla(${selected.accent}, 1)` }}>
                              <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </div>
                            {feature}
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
});

ProductSelectorGrid.displayName = "ProductSelectorGrid";
export default ProductSelectorGrid;