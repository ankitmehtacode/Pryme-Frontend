import { Shield, Lock, Key, Eye } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TrustMonologue = () => {
  const securityFeatures = [
    {
      icon: Lock,
      title: "Zero-Trace Processing",
      description: "Your data never persists beyond your session",
      tooltip: "Data exists only in volatile memory during processing and is automatically cleared when your session ends.",
    },
    {
      icon: Key,
      title: "Cryptographic Shredding",
      description: "Data destroyed post-session",
      tooltip: "All data is cryptographically destroyed using secure deletion protocols after your session concludes.",
    },
    {
      icon: Eye,
      title: "Zero Visibility Architecture",
      description: "We cannot see your data",
      tooltip: "By design, not policy — our architecture ensures we have no access to your sensitive information.",
    },
    {
      icon: Shield,
      title: "Bank-Grade Encryption",
      description: "256-bit AES encryption",
      tooltip: "Military-grade encryption protects all data transmissions between your browser and our servers.",
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section className="py-16 md:py-24 trust-gradient">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Monologue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <span className="inline-block text-xs font-medium text-primary uppercase tracking-widest mb-4">
              Our Promise
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium text-foreground leading-tight mb-8" style={{ letterSpacing: '-0.02em' }}>
              Why Trust Us?
            </h2>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto neo-card-inset p-8 rounded-2xl"
            >
              <p className="font-display text-lg md:text-xl text-muted-foreground leading-relaxed italic">
                "In an age of digital noise, we engineer silence. Your data is transient,
                processed securely, and cryptographically shredded post-session.
                We are the fortress for your financial future."
              </p>
            </motion.div>
          </motion.div>

          {/* Security Features Grid */}
          <TooltipProvider>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
            >
              {securityFeatures.map((feature) => (
                <Tooltip key={feature.title}>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ y: -4 }}
                      className="group bg-card rounded-xl border border-border/50 p-5 transition-all duration-300 hover:shadow-elevated cursor-help text-center"
                    >
                      <motion.div
                        whileHover={{ rotate: [0, -8, 8, 0] }}
                        transition={{ duration: 0.4 }}
                        className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-all duration-300"
                      >
                        <feature.icon className="w-7 h-7 text-primary" strokeWidth={2} />
                      </motion.div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">{feature.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </motion.div>
          </TooltipProvider>
        </div>
      </div>
    </section>
  );
};

export default TrustMonologue;
