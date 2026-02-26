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
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  { 
    icon: UserCheck, 
    title: "Instant Verification", 
    desc: "Our AI engine verifies your KYC and income documents in real-time.",
    color: "text-indigo-600",
    bg: "bg-indigo-50"
  },
  { 
    icon: Zap, 
    title: "Smart Approval", 
    desc: "Get sanctions from multiple banking partners instantly tailored to your profile.",
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  { 
    icon: Banknote, 
    title: "Rapid Disbursal", 
    desc: "Funds transferred directly to your bank account within 24 hours.",
    color: "text-purple-600",
    bg: "bg-purple-50"
  }
];

const ProcessSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. The Timeline Line Animation
      // This grows the blue line as you scroll through the section
      gsap.fromTo(lineRef.current, 
        { height: "0%" },
        {
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: triggerRef.current,
            start: "top center",
            end: "bottom center",
            scrub: 0.5, // Physics-based smoothing
          }
        }
      );

      // 2. Card Stagger Animation
      // Cards slide in from the right with a spring effect
      const cards = gsap.utils.toArray(".process-card");
      cards.forEach((card: any) => {
        gsap.fromTo(card,
          { opacity: 0, x: 50, scale: 0.95 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%", // Trigger when card enters bottom 15% of viewport
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-start">
          
          {/* Left Side: Sticky Content 
              This stays fixed while the user reads through the steps
          */}
          <div className="lg:w-1/3 lg:sticky lg:top-32 self-start">
            <span className="inline-block text-xs font-bold text-blue-600 uppercase tracking-[0.2em] mb-4">
              The Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-[1.1] tracking-tight">
              Velocity is our <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">
                Currency.
              </span>
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-8">
              We've stripped away the bureaucracy of traditional banking. 
              No branch visits, no waiting rooms, just pure engineering efficiency.
            </p>
            
            <div className="hidden lg:block p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-semibold text-slate-700">System Operational</span>
                </div>
                <p className="text-xs text-slate-400">Avg. Approval Time: 24m 12s</p>
            </div>
          </div>

          {/* Right Side: Timeline Track */}
          <div ref={triggerRef} className="lg:w-2/3 relative pl-8 lg:pl-16">
            
            {/* The Vertical Line Track */}
            <div className="absolute left-[3px] lg:left-[43px] top-8 bottom-20 w-[2px] bg-slate-100">
              {/* The Filling Animation Bar */}
              <div ref={lineRef} className="w-full bg-blue-600 rounded-full" />
            </div>

            <div className="space-y-16">
              {steps.map((step, idx) => (
                <div key={idx} className="process-card relative flex items-start gap-8 group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[9px] lg:-left-[41px] top-8 w-6 h-6 rounded-full border-4 border-white bg-slate-200 shadow-sm z-10 transition-colors duration-500 group-hover:bg-blue-600 group-hover:scale-110" />
                  
                  {/* Content Card */}
                  <div className="flex-1 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-100 transition-all duration-500 hover:-translate-y-1">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:rotate-6", step.bg)}>
                      <step.icon className={cn("w-7 h-7", step.color)} />
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                    <p className="text-slate-500 leading-relaxed font-medium">
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