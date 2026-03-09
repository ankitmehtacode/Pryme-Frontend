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
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20"
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
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20"
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
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-[#030303] relative overflow-hidden z-10 border-t border-white/5">
      
      {/* 🧠 Premium Ambient Cyber-Glow */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 -translate-x-1/2 mix-blend-screen" />

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
          
          {/* Left Side: Sticky Copywriting Block */}
          <div className="lg:w-1/3 lg:sticky lg:top-32 self-start">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded border border-primary/30 bg-primary/10 text-[10px] font-medium text-primary uppercase tracking-[0.3em] mb-6 shadow-sm">
              The Process
            </span>
            <h2 className="text-2xl md:text-xl lg:text-2xl font-semibold text-white mb-6 leading-[1.1] tracking-tighter">
              Velocity is our <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-primary animate-gradient bg-[length:200%_auto]">
                Currency.
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-10 font-medium">
              We've stripped away the bureaucracy of traditional banking. 
              No branch visits, no waiting rooms, just pure algorithmic efficiency.
            </p>
            
            {/* Operational Status Card */}
            <div className="hidden lg:block p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </div>
                <span className="text-sm font-medium text-slate-200 tracking-wide uppercase">System Operational</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-mono">Current Server Load: <span className="text-emerald-400">12%</span></p>
                <p className="text-xs text-slate-500 font-mono">Avg. API Response: <span className="text-emerald-400">0.4s</span></p>
              </div>
            </div>
          </div>

          {/* Right Side: GSAP Timeline Track */}
          <div ref={triggerRef} className="lg:w-2/3 relative pl-8 lg:pl-16">
            
            {/* The Vertical Track Background */}
            <div className="absolute left-[3px] lg:left-[43px] top-8 bottom-20 w-[2px] bg-white/5">
              {/* 🧠 The Filling Animation Bar (Powered by GSAP) */}
              <div 
                ref={lineRef} 
                className="w-full bg-gradient-to-b from-primary to-emerald-400 shadow-[0_0_15px_rgba(var(--primary),0.5)] rounded-full" 
              />
            </div>

            <div className="space-y-12 md:space-y-16">
              {steps.map((step, idx) => (
                <div key={idx} className="process-card relative flex flex-col sm:flex-row items-start gap-6 sm:gap-8 group">
                  
                  {/* Timeline Node (GSAP activates this as the line hits it) */}
                  <div className="absolute -left-[9px] lg:-left-[41px] top-8 w-6 h-6 rounded-full border-4 border-[#030303] bg-slate-700 z-10 transition-all duration-700 group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(var(--primary),0.6)] group-hover:scale-125" />
                  
                  {/* Glassmorphic Content Card */}
                  <div className="flex-1 w-full bg-white/5 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl hover:border-primary/30 hover:bg-white/10 transition-all duration-500">
                    <div className="flex items-center gap-5 mb-4">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-500 group-hover:scale-110", step.bg, step.border)}>
                        <step.icon className={cn("w-6 h-6", step.color)} />
                      </div>
                      <h3 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-slate-400 leading-relaxed font-medium pl-[76px] sm:pl-0">
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