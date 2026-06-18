import React, { useEffect, useState, useRef } from "react";
import { Coins, Users, Landmark } from "lucide-react";
import TiltedCard from "./TiltedCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useInView } from "framer-motion";

interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatComma?: boolean;
}

const CountUp = ({
  from = 0,
  to,
  duration = 2,
  prefix = "",
  suffix = "",
  className = "",
  formatComma = false,
}: CountUpProps) => {
  const [count, setCount] = useState(from);
  const elementRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(elementRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      // Easing: easeOutExpo (fast start, slow end)
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = Math.floor(easedProgress * (to - from) + from);
      
      setCount(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(to);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, from, to, duration]);

  const formatNumber = (num: number) => {
    if (formatComma) {
      return num.toLocaleString("en-IN");
    }
    return num.toString();
  };

  return (
    <span ref={elementRef} className={className}>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
};

export default function TrustMetrics() {
  const metrics = [
    {
      id: "loans",
      icon: Coins,
      title: "Loans Facilitated",
      prefix: "₹",
      to: 500,
      suffix: "+ Cr",
      description: "Enabling dreams through massive capital deployment across sectors.",
      gradient: "from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5",
      iconColor: "text-blue-600 dark:text-blue-400",
      accentBg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      id: "customers",
      icon: Users,
      title: "Happy Customers",
      prefix: "",
      to: 10000,
      suffix: "+",
      formatComma: true,
      description: "Supporting individuals & businesses with transparent financial guidance.",
      gradient: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      accentBg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      id: "partners",
      icon: Landmark,
      title: "Banking Partners",
      prefix: "",
      to: 15,
      suffix: "+",
      description: "Collaborating with India's leading RBI-regulated banks & NBFCs.",
      gradient: "from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5",
      iconColor: "text-amber-600 dark:text-amber-400",
      accentBg: "bg-amber-50 dark:bg-amber-950/30",
    },
  ];

  return (
    <section className="py-10 md:py-14 relative bg-slate-50 dark:bg-[#080d1e] overflow-hidden border-b border-slate-200/50 dark:border-white/5">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 dark:bg-primary/2 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <ScrollReveal direction="up" duration={0.6}>
          <div className="text-center mb-8 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-3 border border-primary/20 dark:bg-primary/5 dark:border-primary/10">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Verified Scalability
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#0a1530] dark:text-white">
              Institutional Scale. Bulletproof Trust.
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {metrics.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <ScrollReveal key={metric.id} direction="up" delay={i * 0.1} duration={0.6}>
                <TiltedCard className="h-full">
                  <div className="relative h-full flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
                    {/* Glowing card border gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-2xl ${metric.accentBg} flex items-center justify-center mb-5 shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 ${metric.iconColor}`} strokeWidth={2} />
                      </div>
                      
                      <div className="text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-[#0a1530] dark:text-white tracking-tight mb-2 select-none font-sans">
                        <CountUp
                          to={metric.to}
                          prefix={metric.prefix}
                          suffix={metric.suffix}
                          formatComma={metric.formatComma}
                        />
                      </div>
                      
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm md:text-base mb-2">
                        {metric.title}
                      </h3>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        {metric.description}
                      </p>
                    </div>
                  </div>
                </TiltedCard>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
