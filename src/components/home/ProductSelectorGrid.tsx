import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/BackgroundBeams";

// Assets safely imported from local directory
import cardPersonal from "@/assets/card-personal.png";
import cardBusiness from "@/assets/card-business.png";
import cardHome from "@/assets/card-home.png";
import cardLap from "@/assets/card-lap.png";
import cardAuto from "@/assets/card-auto.svg";

const BANK_OFFERS = [
  "Lowest Interest Rates Starting at 10.15% at Kotak Bank",
  "Pre-approved Personal Loans up to ₹50 Lakhs from HDFC",
  "Zero Processing Fee on Auto Loans via SBI",
  "Instant Disbursal for Business Loans at ICICI",
  "Home Loan Balance Transfer at 8.45% from Axis Bank"
];

const products = [
  {
    id: "personal",
    label: "PERSONAL LOAN",
    image: cardPersonal,
    tag: "CASHBACK",
    href: "/apply?type=personal",
    accent: "148, 62%, 42%",
    bg: "#111",
    imgClass: "",
    overlay: "linear-gradient(to top right, rgba(0,0,0,0.8), rgba(0,0,0,0.2), rgba(255,255,255,0.1))",
    borderColor: "rgba(255,255,255,0.1)",
  },
  {
    id: "business",
    label: "BUSINESS LOAN",
    image: cardBusiness,
    tag: "LOWEST RATES",
    href: "/apply?type=business",
    accent: "217, 91%, 60%",
    bg: "#111",
    imgClass: "",
    overlay: "linear-gradient(to top right, rgba(0,0,0,0.8), rgba(0,0,0,0.2), rgba(255,255,255,0.1))",
    borderColor: "rgba(255,255,255,0.1)",
  },
  {
    id: "home",
    label: "HOME LOAN",
    image: cardHome,
    tag: "PRE-APPROVED",
    href: "/apply?type=home",
    accent: "48, 100%, 50%",
    bg: "#111",
    imgClass: "",
    overlay: "linear-gradient(to top right, rgba(0,0,0,0.8), rgba(0,0,0,0.2), rgba(255,255,255,0.1))",
    borderColor: "rgba(255,255,255,0.1)",
  },
  {
    id: "lap",
    label: "LOAN AGAINST PROPERTY",
    image: cardLap,
    tag: "HIGH VALUE",
    href: "/apply?type=lap",
    // Teal — matches bg baked into the image for seamless card edges
    accent: "174, 45%, 38%",
    bg: "#0d3330",
    imgClass: "",
    overlay: "linear-gradient(to top right, rgba(0,0,0,0.3), rgba(0,0,0,0.05), rgba(255,255,255,0.04))",
    borderColor: "rgba(45,160,140,0.25)",
  },
  {
    id: "auto",
    label: "AUTO LOAN",
    image: cardAuto,
    tag: "INSTANT APPROVAL",
    href: "/apply?type=auto",
    accent: "12, 90%, 55%",
    bg: "#111",
    imgClass: "",
    overlay: "linear-gradient(to top right, rgba(0,0,0,0.8), rgba(0,0,0,0.2), rgba(255,255,255,0.1))",
    borderColor: "rgba(255,255,255,0.1)",
  },
];

const spring = { type: "spring" as const, stiffness: 140, damping: 22, mass: 0.7 };

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: spring }
};

const imageVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: spring }
};

const headingInitial = { opacity: 0, y: 20 };
const headingWhileInView = { opacity: 1, y: 0 };
const headingTransition = { duration: 0.6 };
const viewportOnce = { once: true, margin: "-50px" };
const viewportHeading = { once: true };

const ProductSelectorGrid = memo(() => {
  return (
    <section className="relative z-30 flex flex-col items-center justify-center bg-transparent pb-10 pt-0 overflow-x-clip">
      
      {/* 🧠 4K React Bits Style Beams Background */}
      <BackgroundBeams />

      <div className="container mx-auto px-4 max-w-[1300px] relative z-20">

        {/* 🧠 CLIPPING ERADICATED: 
            Changed to flex-wrap. NO overflow classes anywhere. 
            This guarantees zero clipping, and easily supports 6+ products. */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10 pt-6 relative z-10"
        >
          {products.map((product) => (
            <motion.div 
              key={product.id} 
              variants={itemVariants}
            >
              <Link 
                to={product.href}
                className="relative flex flex-col items-center cursor-pointer group outline-none"
              >
                {/* PERF: will-change:transform on this wrapper tells the compositor to
                    pre-promote this element. hover:scale-105 then runs entirely on the
                    GPU with zero main-thread involvement. */}
                <motion.div
                  variants={imageVariants}
                  className="relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px] aspect-square shrink-0 rounded-2xl md:rounded-[1.5rem]
                    transition-transform duration-300 ease-out hover:scale-105 hover:-translate-y-1.5 active:scale-95"
                  style={{ willChange: "transform" }}
                >
                  
                  {/* PERF: Replaced box-shadow hover transition with a static shadow.
                      box-shadow transitions are paint-bound (not compositor-accelerated)
                      and cause a full repaint on every frame during hover on 6 cards.
                      The card already has hover:scale-105 which reads as "bigger+elevated"
                      — the shadow delta was imperceptible at this small card size. */}
                  <div
                    className="absolute inset-0 rounded-2xl md:rounded-[1.5rem] overflow-hidden shadow-[0_12px_24px_-8px_rgba(0,0,0,0.7)]"
                    style={{
                      backgroundColor: product.bg,
                      border: `1px solid ${product.borderColor}`,
                    }}
                  >
                    {/* Per-card overlay gradient */}
                    <div
                      className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay"
                      style={{ background: product.overlay }}
                    />
                    <img
                      src={product.image}
                      alt={product.label}
                      className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 z-0 ${product.imgClass}`}
                      loading="lazy"
                      draggable={false}
                    />
                  </div>

                  {/* Ribbon Tag */}
                  {product.tag && (
                    <div 
                      className="absolute -top-3 left-1/2 -translate-x-1/2 group-hover:-translate-y-1 bg-[#0a1f4d] text-[#4ade80] border border-[#166534] text-[7px] md:text-[8px] font-semibold uppercase tracking-wider px-2 py-1 rounded shadow-xl whitespace-nowrap z-30 transition-transform duration-300"
                    >
                      {product.tag}
                    </div>
                  )}

                  {/* Glowing Ring — opacity-only transition, compositor-safe */}
                  <div 
                    className="absolute inset-0 rounded-2xl md:rounded-[1.5rem] z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      border: `2px solid hsla(${product.accent}, 0.8)`,
                      boxShadow: `inset 0 0 20px hsla(${product.accent}, 0.4)`
                    }}
                  />
                </motion.div>

                <span className="mt-4 text-center text-[9px] sm:text-[10px] md:text-[11px] font-bold text-foreground/90 group-hover:text-primary transition-colors duration-300 leading-tight uppercase tracking-widest relative z-10 drop-shadow-sm">
                  {product.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Typography Section */}
      <div className="container mx-auto px-4 text-center mt-10 md:mt-12 relative z-10">
        <motion.div
          initial={headingInitial}
          whileInView={headingWhileInView}
          viewport={viewportHeading}
          transition={headingTransition}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-4 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Our Products
          </span>
          <h2 className="text-2xl md:text-2xl lg:text-xl font-semibold text-foreground tracking-tighter mb-6 uppercase leading-none">
            Find The Right <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#103783] to-blue-400">Loan.</span>
          </h2>
        </motion.div>
      </div>

      {/* Infinite Scrolling Offers Ticker */}
      <div className="w-full overflow-hidden mt-2 relative z-10 bg-primary/5 py-4 border-y border-primary/10">
        {/* Soft edge gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

        <div className="flex w-full group">
          <div className="flex animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap min-w-max">
            {BANK_OFFERS.map((offer, idx) => (
              <span key={idx} className="mx-8 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400 tracking-wider uppercase flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3 animate-pulse" />
                {offer}
              </span>
            ))}
          </div>
          <div className="flex animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap min-w-max" aria-hidden="true">
            {BANK_OFFERS.map((offer, idx) => (
              <span key={`dup-${idx}`} className="mx-8 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400 tracking-wider uppercase flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3 animate-pulse" />
                {offer}
              </span>
            ))}
          </div>
          {/* Third copy needed to guarantee extreme ultrawide screen loop perfection */}
          <div className="flex animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap min-w-max" aria-hidden="true">
            {BANK_OFFERS.map((offer, idx) => (
              <span key={`dup2-${idx}`} className="mx-8 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400 tracking-wider uppercase flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-3 animate-pulse" />
                {offer}
              </span>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
});

ProductSelectorGrid.displayName = "ProductSelectorGrid";
export default ProductSelectorGrid;