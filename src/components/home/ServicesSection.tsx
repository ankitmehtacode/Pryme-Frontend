import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, Home, Building2, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const springConfig = { stiffness: 120, damping: 28, mass: 0.8 };

const ServicesSection = () => {
  const services = [
    {
      icon: Wallet,
      title: "Personal Loan",
      description: "Quick disbursement for your personal needs. Flexible EMIs starting from ₹2,000/month.",
      rate: "10.5%",
      maxAmount: "₹40 Lakh",
      href: "/apply?type=personal",
    },
    {
      icon: Briefcase,
      title: "Business Loan",
      description: "Fuel your business growth with competitive rates and minimal documentation.",
      rate: "12%",
      maxAmount: "₹2 Crore",
      href: "/apply?type=business",
    },
    {
      icon: Home,
      title: "Home Loan",
      description: "Make your dream home a reality with industry-best interest rates.",
      rate: "8.5%",
      maxAmount: "₹5 Crore",
      href: "/apply?type=home",
    },
    {
      icon: Building2,
      title: "Loan Against Property",
      description: "Unlock the value of your property with high loan-to-value ratios.",
      rate: "9.5%",
      maxAmount: "₹3 Crore",
      href: "/apply?type=lap",
    },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", ...springConfig }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-medium text-primary uppercase tracking-widest mb-4">
            Our Services
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4" style={{ letterSpacing: "-0.02em" }}>
            Financial Solutions for Every Need
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our range of loan products designed to meet your unique requirements
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", ...springConfig, delay: index * 0.08 }}
              whileHover={{ y: -3, transition: { type: "spring", stiffness: 300, damping: 20 } }}
              className="group relative bg-card/70 backdrop-blur-sm rounded-2xl border border-border/40 p-6 overflow-hidden transition-all duration-300 hover:border-primary/20 hover:shadow-[0_12px_40px_-15px_hsl(148_62%_42%/0.15)]"
            >
              {/* Ambient glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/12 transition-colors duration-300">
                  <service.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border/50">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Starting at</span>
                    <p className="text-lg font-bold holographic-text">{service.rate} p.a.</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Up to</span>
                    <p className="text-lg font-bold text-foreground">{service.maxAmount}</p>
                  </div>
                </div>

                {/* CTA */}
                <Button asChild variant="ghost" className="p-0 h-auto font-medium text-primary hover:text-primary/80 group/btn">
                  <Link to={service.href} className="flex items-center gap-2">
                    Apply Now
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
