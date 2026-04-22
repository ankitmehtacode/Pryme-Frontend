import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ProductSelectorGrid from "@/components/home/ProductSelectorGrid";
import { Layers, Zap, Clock, TrendingUp } from "lucide-react";

const Services = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080d1e]">
      <Helmet>
        <title>Our Services | PRYME Consulting</title>
        <meta name="description" content="Comprehensive loan comparison and financial matchmaking services." />
      </Helmet>
      
      <Header />
      
      <SmoothScroll>
        <main className="flex-1 pt-24 md:pt-32">
          <section className="container mx-auto px-4 pb-24">
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-6 border border-primary/20">
                  <Layers className="w-4 h-4" />
                  Services Portfolio
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-8 tracking-tight">
                  Intelligence-Driven <span className="text-primary">Matchmaking</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                  We don't just list loans; we use proprietary algorithms to match you with the bank most likely to approve your profile at the lowest interest rate.
                </p>
              </div>
            </ScrollReveal>

            {/* Reuse the product grid for consistency */}
            <div className="mb-24">
              <ProductSelectorGrid />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Zap, title: "Instant Eligibility", text: "Check your borrowing power across 15+ banks in under 120 seconds." },
                { icon: Clock, title: "Fast Tracking", text: "Direct API integration with banks ensures your file moves to the front of the queue." },
                { icon: TrendingUp, title: "Rate Optimization", text: "Our systems constantly monitor bank policy changes to get you the newest rates." }
              ].map((item, i) => (
                <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                  <div className="p-8 rounded-[2rem] bg-card text-card-foreground border border-border shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-4">{item.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{item.text}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </SmoothScroll>
    </div>
  );
};

export default Services;
