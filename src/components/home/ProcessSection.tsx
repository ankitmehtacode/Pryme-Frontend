import { useRef, useEffect } from "react";
import { FileText, UserCheck, Zap, Banknote } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

// Ensure GSAP plugin is registered safely
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const steps = [
  { 
    icon: FileText, 
    title: "Digital Application", 
    desc: "Complete our intelligent 2-minute form. No physical paperwork required.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20"
  },
  { 
    icon: UserCheck, 
    title: "Instant Verification", 
    desc: "Our AI engine verifies your KYC and income documents in real-time.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20"
  },
  { 
    icon: Zap, 
    title: "Smart Approval", 
    desc: "Get sanctions from multiple banking partners instantly tailored to your profile.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20"
  },
  { 
    icon: Banknote, 
    title: "Rapid Disbursal", 
    desc: "Funds transferred directly to your bank account within 24 hours.",
    color: "text-blue-400",
    bg: "bg-blue-700/10",
    border: "border-blue-700/20"
  }
];

const ProcessSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. The Timeline Line Animation
      gsap.fromTo(lineRef.current, 
        { height: "0%" },
        {
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: triggerRef.current,
            start: "top center",
            end: "bottom center",
            scrub: 0.5,
          }
        }
      );

      // 2. Card Stagger Animation (Upgraded ease)
      const cards = gsap.utils.toArray(".process-card");
      cards.forEach((card: any) => {
        gsap.fromTo(card,
          { opacity: 0, x: 50, scale: 0.95 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.8,
            ease: "expo.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-[#030303] relative overflow-hidden z-10 border-t border-white/5" style={{ contain: "content" }}>
      
      {/* 🧠 Premium Ambient Cyber-Glow */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/10 blur-[50px] rounded-full pointer-events-none -translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
          
          {/* Left Side: Sticky Copywriting Block */}
          <div className="lg:w-1/3 lg:sticky lg:top-32 self-start">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded border border-primary/30 bg-primary/10 text-[10px] font-medium text-primary uppercase tracking-[0.3em] mb-6 shadow-sm">
              The Process
            </span>
            <h2 className="text-2xl md:text-xl lg:text-2xl font-medium text-white mb-6 leading-[1.1] tracking-tighter">
              Simple. Fast. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary animate-gradient bg-[length:200%_auto]">
                Transparent.
              </span>
            </h2>
            <p className="text-slate-200 text-lg leading-relaxed mb-10 font-normal">
              We've removed the complexity of traditional banking. 
              No branch visits, no waiting rooms, just a streamlined digital process.
            </p>
            
            {/* Trust Image Card */}
            <div className="hidden lg:block rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop&auto=format&q=80" 
                alt="Business professionals reviewing financial documents" 
                className="w-full h-48 object-cover opacity-60"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                  Join thousands of professionals who've secured better rates through PRYME.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: GSAP Timeline Track */}
          <div ref={triggerRef} className="lg:w-2/3 relative pl-8 lg:pl-16">
            
            {/* The Vertical Track Background (Glass Groove) */}
            <div className="absolute left-[15px] lg:left-[31px] top-12 bottom-12 w-[2px] bg-gradient-to-b from-transparent via-white/10 to-transparent">
              {/* 🧠 Neon Comet Line (Powered by GSAP) */}
              <div 
                ref={lineRef} 
                className="w-full relative overflow-visible rounded-full bg-gradient-to-b from-transparent via-blue-500/80 to-cyan-400" 
              >
                {/* Comet Head Glowing Core */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-8 bg-cyan-200 rounded-full shadow-[0_0_20px_5px_rgba(34,211,238,0.9),0_0_40px_10px_rgba(59,130,246,0.6)] blur-[0.5px]" />
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[3px] h-12 bg-gradient-to-t from-transparent to-cyan-300 blur-sm opacity-90" />
              </div>
            </div>

            <div className="space-y-12 md:space-y-16">
              {steps.map((step, idx) => (
                <div key={idx} className="process-card relative flex flex-col sm:flex-row items-start gap-6 sm:gap-8 group">
                  
                  {/* Elegant Neon Pulse Node */}
                  <div className="absolute -left-[22px] lg:-left-[38px] top-12 w-3 h-3 rounded-full border border-white/20 bg-[#030303] z-10 transition-all duration-700 group-hover:bg-cyan-400 group-hover:border-cyan-300 group-hover:shadow-[0_0_25px_6px_rgba(34,211,238,0.9)] group-hover:scale-[1.8]" />
                  
                  {/* Premium Dark Glassmorphic Content Card */}
                  <div className="flex-1 w-full bg-white/5 p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-primary/40 hover:bg-white/10 hover:shadow-[0_20px_40px_-15px_rgba(16,55,131,0.3)] transition-all duration-500">
                    <div className="flex items-center gap-5 mb-4">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-500 group-hover:scale-110", step.bg, step.border)}>
                        <step.icon className={cn("w-6 h-6", step.color)} />
                      </div>
                      <h3 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-medium pl-[76px] sm:pl-0">
                      {step.desc}
                    </p>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProcessSection;