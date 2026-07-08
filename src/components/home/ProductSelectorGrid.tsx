import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/BackgroundBeams";
import { AutoGrid } from "@/components/layout/Primitives";

// Assets safely imported from local directory
// Assets safely imported from local directory
import product1 from "@/assets/card-auto.png"; // Car -> Auto
import product2 from "@/assets/card-personal.png"; // Wallet -> Personal
import product3 from "@/assets/card-home.png"; // House -> Home
import product4 from "@/assets/products/product-4.jpg"; // Briefcase -> Business
import product5 from "@/assets/card-lap.png"; // Building/House -> LAP
import product6 from "@/assets/card-balancetransfer.png"; // Balance Transfer

export const BANK_OFFERS = [
  "Lowest Interest Rates Starting at 10.15% at Kotak Bank",
  "Pre-approved Personal Loans up to ₹50 Lakhs from HDFC",
  "Zero Processing Fee on Auto Loans via SBI",
  "Instant Disbursal for Business Loans at ICICI",
  "Home Loan Balance Transfer at 8.45% from Axis Bank"
];

export const products = [
  {
    id: "home",
    label: "HOME LOAN",
    image: product3,
    tag: "PRE-APPROVED",
    href: "/apply?type=home",
    accent: "217, 91%, 60%",
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
    accent: "217, 91%, 60%",
    bg: "transparent",
    imgClass: "",
    overlay: "transparent",
    borderColor: "rgba(255,255,255,0.05)",
  },
  {
    id: "transfer",
    label: "BALANCE TRANSFER | TOP UP",
    image: product6,
    tag: "COMING SOON",
    href: "/apply?type=transfer",
    accent: "217, 91%, 60%",
    bg: "transparent",
    imgClass: "",
    overlay: "transparent",
    borderColor: "rgba(255,255,255,0.05)",
  },
  {
    id: "personal",
    label: "PERSONAL LOAN",
    image: product2,
    tag: "COMING SOON",
    href: "/apply?type=personal",
    accent: "217, 91%, 60%",
    bg: "transparent",
    imgClass: "",
    overlay: "transparent",
    borderColor: "rgba(255,255,255,0.05)",
  },
  {
    id: "business",
    label: "BUSINESS LOAN",
    image: product4,
    tag: "COMING SOON",
    href: "/apply?type=business",
    accent: "217, 91%, 60%",
    bg: "transparent",
    imgClass: "",
    overlay: "transparent",
    borderColor: "rgba(255,255,255,0.05)",
  },
  {
    id: "auto",
    label: "AUTO LOAN",
    image: product1,
    tag: "COMING SOON",
    href: "/apply?type=auto",
    accent: "217, 91%, 60%",
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
    <div className="w-full relative z-30 flex flex-col items-center justify-center bg-transparent pb-0 pt-0 overflow-x-clip">

      {/* 🧠 4K React Bits Style Beams Background */}
      <BackgroundBeams />

      {/* Typography Section */}
      <div className="w-full text-center pt-0 relative z-10 mb-8 md:mb-10 -mt-3 md:-mt-4">
        <motion.div
          initial={headingInitial}
          whileInView={headingWhileInView}
          viewport={viewportHeading}
          transition={headingTransition}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-widest border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Explore More Products
          </span>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-8 w-full justify-items-center relative z-10 pt-1">
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
                    className="relative w-[130px] h-[97px] sm:w-[160px] sm:h-[120px] md:w-[180px] md:h-[135px] lg:w-[var(--landing-product-card-width,200px)] lg:h-[var(--landing-product-card-height,150px)] aspect-[4/3] shrink-0 rounded-2xl md:rounded-[1.5rem]
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
          </div>
        </motion.div>
      </div>


    </div>
  );
});

ProductSelectorGrid.displayName = "ProductSelectorGrid";
export default ProductSelectorGrid;
