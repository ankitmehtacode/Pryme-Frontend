import { Shield, Lock, Trash2, EyeOff } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Interactive 3D Card Component
const TiltCard = ({ feature, index }: { feature: any; index: number }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // Rotate based on mouse position
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate normalized position (-0.5 to 0.5)
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative group bg-white/5 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200/20 dark:border-slate-800 p-6 transition-all duration-300 cursor-help text-center z-10"
        >
          {/* Card Border Hover Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2aac64]/0 via-[#2aac64]/0 to-[#2aac64]/0 group-hover:from-[#2aac64]/20 group-hover:via-transparent group-hover:to-[#2aac64]/5 rounded-2xl transition-all duration-500 pointer-events-none" />
          
          <motion.div
            style={{ translateZ: 40 }} // Pop out effect
            className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#2aac64]/10 transition-colors duration-300 shadow-inner overflow-hidden relative"
          >
             {/* Sweeping light effect inside icon circle */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_ease-in-out_infinite]" />
            <feature.icon className="w-8 h-8 text-[#2aac64] relative z-10" strokeWidth={2} />
          </motion.div>
          
          <motion.div style={{ translateZ: 30 }}>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-base">{feature.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {feature.description}
            </p>
          </motion.div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs bg-slate-900 text-white border-slate-700">
        <p className="text-sm">{feature.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const TrustMonologue = () => {
  // 🧠 Translated complex jargon into simple, trustworthy consumer language
  const securityFeatures = [
    {
      icon: Lock,
      title: "No Data Stored",
      description: "We don't keep your info",
      tooltip: "We only hold your details while matching you with banks. Once done, everything is wiped clean immediately.",
    },
    {
      icon: Trash2,
      title: "100% Deleted",
      description: "No traces left behind",
      tooltip: "We permanently erase your data after every single visit. No sneaky databases or marketing lists.",
    },
    {
      icon: EyeOff,
      title: "Total Privacy",
      description: "We can't see your details",
      tooltip: "Our system is built so that even our own team cannot access or read your personal financial details.",
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your connection is locked",
      tooltip: "We use the same high-end, military-grade security locks that your actual bank uses to protect your data.",
    },
  ];

  return (
    <section className="py-10 md:py-16 relative bg-[#030303] overflow-hidden">
      {/* Ambient Animated Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2aac64] blur-[150px] rounded-full pointer-events-none"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Trust Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-[#2aac64] text-xs font-semibold uppercase tracking-widest mb-6">
              <Shield className="w-4 h-4" />
              Your Privacy Protected
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight mb-8">
              Why Trust Us?
            </h2>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-3xl mx-auto bg-gradient-to-b from-white/10 to-transparent p-1 rounded-[2.5rem]"
            >
              <div className="bg-[#050505] rounded-[2.4rem] p-8 md:p-12 shadow-2xl">
                <p className="text-lg md:text-2xl text-slate-300 leading-relaxed font-medium">
                  “We take your privacy seriously. Your details are securely processed, instantly matched with banks, and completely deleted as soon as you leave. We do not save, sell, or share your personal information.”
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Interactive 3D Security Features Grid */}
          <TooltipProvider>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 perspective-[1200px]"
            >
              {securityFeatures.map((feature, idx) => (
                <TiltCard key={feature.title} feature={feature} index={idx} />
              ))}
            </div>
          </TooltipProvider>
        </div>
      </div>
    </section>
  );
};

export default TrustMonologue;
