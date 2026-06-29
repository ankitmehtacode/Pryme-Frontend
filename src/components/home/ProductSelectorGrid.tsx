import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/BackgroundBeams";
import { AutoGrid } from "@/components/layout/Primitives";

// Assets safely imported from local directory
// Assets safely imported from local directory
import product1 from "@/assets/products/product-1.jpg"; // Car -> Auto
import product2 from "@/assets/products/product-2.jpg"; // Wallet -> Personal
import product3 from "@/assets/products/product-3.jpg"; // House -> Home
import product4 from "@/assets/products/product-4.jpg"; // Briefcase -> Business
import product5 from "@/assets/products/product-5.png"; // Building/House -> LAP

export const BANK_OFFERS = [
  "Lowest Interest Rates Starting at 10.15% at Kotak Bank",
  "Pre-approved Personal Loans up to ₹50 Lakhs from HDFC",
  "Zero Processing Fee on Auto Loans via SBI",
  "Instant Disbursal for Business Loans at ICICI",
  "Home Loan Balance Transfer at 8.45% from Axis Bank"
];

export const products = [
  {
    id: "personal",
    label: "PERSONAL LOAN",
    image: product2,
    tag: "CASHBACK",
    href: "/apply?type=personal",
    accent: "148, 62%, 42%",
    bg: "transparent",
    imgClass: "",
    overlay: "transparent",
    borderColor: "rgba(255,255,255,0.05)",
  },
  {
    id: "business",
    label: "BUSINESS LOAN",
    image: product4,
    tag: "LOWEST RATES",
    href: "/apply?type=business",
    accent: "217, 91%, 60%",
    bg: "transparent",
    imgClass: "",
    overlay: "transparent",
    borderColor: "rgba(255,255,255,0.05)",
  },
  {
    id: "home",
    label: "HOME LOAN",
    image: product3,
    tag: "PRE-APPROVED",
    href: "/apply?type=home",
    accent: "48, 100%, 50%",
    bg: "transparent",
    imgClass: "",
    overlay: "transparent",
    borderColor: "rgba(255,255,255,0.05)",
  },
  {
    id: "lap",
    label: "LOAN AGAINST PROPERTY",
    image: product5,
    tag: "HIGH VALUE",
    href: "/apply?type=lap",
    accent: "174, 45%, 38%",
    bg: "transparent",
    imgClass: "",
    overlay: "transparent",
    borderColor: "rgba(255,255,255,0.05)",
  },
  {
    id: "auto",
    label: "AUTO LOAN",
    image: product1,
    tag: "INSTANT APPROVAL",
    href: "/apply?type=auto",
    accent: "12, 90%, 55%",
    bg: "transparent",
    imgClass: "",
    overlay: "transparent",
    borderColor: "rgba(255,255,255,0.05)",
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
    <section className="relative z-30 flex flex-col items-center justify-center bg-transparent pb-0 pt-0 overflow-x-clip">
      
      {/* 🧠 4K React Bits Style Beams Background */}
      <BackgroundBeams />

      {/* Typography Section */}
      <div className="w-full text-center pt-0 relative z-10">
        <motion.div
          initial={headingInitial}
          whileInView={headingWhileInView}
          viewport={viewportHeading}
          transition={headingTransition}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-4 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Explore More Products
          </span>
          <h2 className="text-2xl md:text-2xl lg:text-xl font-semibold text-foreground tracking-tighter mb-2 uppercase leading-none">
            Find The Right <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#103783] to-blue-400">Loan.</span>
          </h2>
        </motion.div>
      </div>

      <div className="w-full relative z-20 mt-1">

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="w-full"
        >
          <AutoGrid minItemWidth="clamp(180px, 16vw, 250px)" gap="lg" className="pt-2 relative z-10 justify-items-center">
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
                  className="relative w-[140px] h-[105px] sm:w-[160px] sm:h-[120px] md:w-[180px] md:h-[135px] lg:w-[200px] lg:h-[150px] aspect-[4/3] shrink-0 rounded-2xl md:rounded-[1.5rem]
                    transition-transform duration-300 ease-out hover:scale-105 hover:-translate-y-1.5 active:scale-95"
                  style={{ willChange: "transform" }}
                >
                  
                  {/* PERF: Replaced box-shadow hover transition with a static shadow.
                      box-shadow transitions are paint-bound (not compositor-accelerated)
                      and cause a full repaint on every frame during hover on 6 cards.
                      The card already has hover:scale-105 which reads as "bigger+elevated"
                      — the shadow delta was imperceptible at this small card size. */}
                  <div
                    className="absolute inset-0 rounded-2xl md:rounded-[1.5rem] overflow-hidden"
                    style={{
                      backgroundColor: product.bg,
                      border: `1px solid ${product.borderColor}`,
                    }}
                  >
                    {/* Per-card overlay gradient */}
                    <div
                      className="absolute inset-0 z-10 pointer-events-none"
                      style={{ background: product.overlay }}
                    />
                    <img
                      src={product.image}
                      alt={product.label}
                      className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-0 ${product.imgClass}`}
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
          </AutoGrid>
        </motion.div>
      </div>


    </section>
  );
});

ProductSelectorGrid.displayName = "ProductSelectorGrid";
export default ProductSelectorGrid;