import { Star, ShieldCheck, Activity } from "lucide-react";
import { motion } from "framer-motion";
import CircularGallery from "@/components/ui/CircularGallery";
import { cn } from "@/lib/utils";

const TestimonialsSlider = () => {
  const testimonials = [
    {
      id: 1,
      name: "Rajesh Kumar",
      role: "Business Owner",
      location: "Mumbai",
      rating: 5,
      quote: "PRYME made my business loan application seamless. Got approval in just 24 hours with the best interest rate in the market. Highly recommend!",
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

  // Map to the exact prop structure required by ReactBits CircularGallery
  const galleryItems = testimonials.map((t) => ({
    image: t.image,
    quote: t.quote,
    name: t.name,
    role: `${t.role}, ${t.location}`,
  }));

  return (
    <section className="py-24 md:py-32 bg-[#030303] relative overflow-hidden z-10 border-t border-white/5">
      
      {/* 🧠 Holographic Background Engine */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none mix-blend-overlay" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-20">
        
        {/* Header Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-xl">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-[10px] md:text-xs font-medium text-slate-300 uppercase tracking-[0.2em]">
              Verified Algorithm Success
            </span>
          </div>
          <h2 className="text-2xl md:text-xl lg:text-2xl font-semibold text-white mb-6 tracking-tighter">
            Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Thousands.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            See what our customers have to say about their experience with the PRYME financial algorithm.
          </p>
        </motion.div>

        {/* 🧠 WebGL Circular Gallery (Holographic Masking Applied) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          // The mask-image makes the edges of the canvas fade smoothly into the black background
          className="relative h-[450px] md:h-[550px] w-full max-w-7xl mx-auto"
          style={{ maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)', WebkitMaskImage: '-webkit-radial-gradient(center, ellipse cover, black 40%, transparent 80%)' }}
        >
          <CircularGallery
            items={galleryItems}
            bend={3}
            textColor="#ffffff" // Force white text for dark mode WebGL canvas
            borderRadius={0.05}
            scrollSpeed={1.5} // Slightly slower for a more premium, heavy feel
            scrollEase={0.05}
          />
        </motion.div>

        {/* Floating Trust Indicators Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-4xl mx-auto mt-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-evenly gap-6 md:gap-12 p-6 md:p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
            
            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
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
    </section>
  );
};

export default TestimonialsSlider;