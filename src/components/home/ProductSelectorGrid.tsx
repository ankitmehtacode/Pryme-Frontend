import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Silk from "@/components/ui/Silk";

// Assets safely imported from local directory
import cardPersonal from "@/assets/card-personal.png";
import cardBusiness from "@/assets/card-business.png";
import cardHome from "@/assets/card-home.png";
import cardEducation from "@/assets/card-education.png";

const products = [
  {
    id: "personal",
    label: "PERSONAL LOAN",
    image: cardPersonal,
    tag: "CASHBACK",
    href: "/apply?type=personal",
    accent: "148, 62%, 42%", 
  },
  {
    id: "business",
    label: "BUSINESS LOAN",
    image: cardBusiness,
    tag: "LOWEST RATES",
    href: "/apply?type=business",
    accent: "217, 91%, 60%", 
  },
  {
    id: "home",
    label: "HOME LOAN",
    image: cardHome,
    tag: "PRE-APPROVED",
    href: "/apply?type=home",
    accent: "48, 100%, 50%", 
  },
  {
    id: "education",
    label: "EDUCATION LOAN",
    image: cardEducation,
    tag: "100% FUNDING",
    href: "/apply?type=education",
    accent: "270, 70%, 60%", 
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const spring = { type: "spring" as const, stiffness: 140, damping: 22, mass: 0.7 };

const ProductSelectorGrid = memo(() => {
  return (
    <section className="relative z-30 flex flex-col items-center justify-center bg-transparent pb-10 pt-0 overflow-x-clip">
      
      {/* 🧠 Silk Background Animation (PRO UI/UX Blending) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none mix-blend-screen opacity-80"
        style={{ 
          width: '1400px', 
          height: '1000px',
          maskImage: 'radial-gradient(circle at center, black 20%, transparent 60%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 20%, transparent 60%)'
        }}
      >
        <Silk
          speed={2.3}
          scale={0.7}
          color="#0f462b"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>

      {/* 🧠 Tightly nested against the Hero */}
      <div className="container mx-auto px-4 max-w-[1300px] relative z-20">
        
        {/* Ambient glow centered behind the products */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[150px] bg-[#2aac64]/10 blur-[100px] rounded-full pointer-events-none" />

        {/* 🧠 CLIPPING ERADICATED: 
            Changed to flex-wrap. NO overflow classes anywhere. 
            This guarantees zero clipping, and easily supports 6+ products. */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10 pt-6 relative z-10"
        >
          {products.map((product, index) => (
            <motion.div 
              key={product.id} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...spring, delay: index * 0.1 }}
            >
              <Link 
                to={product.href}
                className="relative flex flex-col items-center cursor-pointer group outline-none"
                style={{ perspective: "1000px" }} 
              >
                {/* 🧠 SIZE ADJUSTED to prevent clipping: larger dimensions and object-cover */}
                <motion.div
                  className="relative w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[160px] md:h-[160px] aspect-square shrink-0 rounded-2xl md:rounded-[1.5rem]"
                  initial={{ rotateY: index % 2 === 0 ? -10 : 10, rotateX: 8, y: 0 }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -6, 
                    rotateY: 0, 
                    rotateX: 0,
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={spring}
                  style={{ transformStyle: "preserve-3d", zIndex: 10 }}
                >
                  
                  {/* The Image Container */}
                  <div className="absolute inset-0 rounded-2xl md:rounded-[1.5rem] overflow-hidden bg-[#111] border border-white/10 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)] group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,1)] transition-shadow duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-white/10 z-10 pointer-events-none mix-blend-overlay" />
                    <img
                      src={product.image}
                      alt={product.label}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 z-0"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>

                  {/* Ribbon Tag (Floats safely above without clipping) */}
                  {product.tag && (
                    <div 
                      className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0f462b] text-[#4ade80] border border-[#166534] text-[7px] md:text-[8px] font-semibold uppercase tracking-wider px-2 py-1 rounded shadow-xl whitespace-nowrap z-30 transition-transform duration-300 group-hover:-translate-y-1"
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

                {/* Typography perfectly aligned below */}
                <span className="mt-4 text-center text-[9px] sm:text-[10px] md:text-[11px] font-medium text-slate-400 group-hover:text-white transition-colors duration-300 leading-tight uppercase tracking-widest relative z-10">
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
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-[9px] font-medium text-[#2aac64] uppercase tracking-[0.3em] bg-[#2aac64]/10 border border-[#2aac64]/20 px-3 py-1 rounded-full mb-3">
            Financial Arsenal
          </span>
          <h2 className="text-2xl md:text-2xl lg:text-xl font-semibold text-white tracking-tighter mb-3 uppercase leading-none">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2aac64] to-emerald-400">Weapon.</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 font-medium max-w-lg mx-auto">
            Premium capital limits with the lowest industry interest rates. Select your product to instantly initiate the protocol.
          </p>
        </motion.div>
      </div>

    </section>
  );
});

ProductSelectorGrid.displayName = "ProductSelectorGrid";
export default ProductSelectorGrid;