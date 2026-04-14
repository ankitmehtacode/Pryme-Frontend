import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/BackgroundBeams";

// Assets safely imported from local directory
import cardPersonal from "@/assets/card-personal.png";
import cardBusiness from "@/assets/card-business.png";
import cardHome from "@/assets/card-home.png";
import cardEducation from "@/assets/card-education.png";
import cardLap from "@/assets/card-lap.png";
import cardAuto from "@/assets/card-auto.svg";

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
    id: "education",
    label: "EDUCATION LOAN",
    image: cardEducation,
    tag: "100% FUNDING",
    href: "/apply?type=education",
    accent: "270, 70%, 60%",
    bg: "#111",
    imgClass: "",
    overlay: "linear-gradient(to top right, rgba(0,0,0,0.8), rgba(0,0,0,0.2), rgba(255,255,255,0.1))",
    borderColor: "rgba(255,255,255,0.1)",
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
                {/* 🧠 SIZE ADJUSTED to prevent clipping: larger dimensions and object-cover */}
                <motion.div
                  variants={imageVariants}
                  className="relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px] aspect-square shrink-0 rounded-2xl md:rounded-[1.5rem]
                    transition-transform duration-300 ease-out hover:scale-105 hover:-translate-y-1.5 active:scale-95"
                >
                  
                  {/* The Image Container — bg, overlay and border are all per-product */}
                  <div
                    className="absolute inset-0 rounded-2xl md:rounded-[1.5rem] overflow-hidden shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)] group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,1)] transition-shadow duration-500"
                    style={{
                      backgroundColor: product.bg,
                      border: `1px solid ${product.borderColor}`,
                    }}
                  >
                    {/* Per-card overlay gradient — LAP gets teal-tinted, others get standard dark */}
                    <div
                      className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay"
                      style={{ background: product.overlay }}
                    />
                    <img
                      src={product.image}
                      alt={product.label}
                      className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 z-0 ${product.imgClass}`}
                      loading="lazy"
                      draggable={false}
                    />
                  </div>

                  {/* Ribbon Tag (Floats safely above without clipping) */}
                  {product.tag && (
                    <div 
                      className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0a1f4d] text-[#4ade80] border border-[#166534] text-[7px] md:text-[8px] font-semibold uppercase tracking-wider px-2 py-1 rounded shadow-xl whitespace-nowrap z-30 transition-transform duration-300 group-hover:-translate-y-1"
                      style={{ transform: "translateZ(20px) translateX(-50%)" }} 
                    >
                      {product.tag}
                    </div>
                  )}

                  {/* Glowing Ring */}
                  <div 
                    className="absolute inset-0 rounded-2xl md:rounded-[1.5rem] z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
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
          <span className="inline-block text-[9px] font-medium text-[#103783] uppercase tracking-[0.3em] bg-[#103783]/10 border border-[#103783]/20 px-3 py-1 rounded-full mb-3">
            Our Products
          </span>
          <h2 className="text-2xl md:text-2xl lg:text-xl font-semibold text-foreground tracking-tighter mb-3 uppercase leading-none">
            Find The Right <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#103783] to-blue-400">Loan.</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-lg mx-auto">
            Competitive rates from 15+ banks. Select your product to get started in minutes.
          </p>
        </motion.div>
      </div>

    </section>
  );
});

ProductSelectorGrid.displayName = "ProductSelectorGrid";
export default ProductSelectorGrid;