import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Info, Target, Users, ShieldCheck } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0a]">
      <Helmet>
        <title>About Us | PRYME Consulting</title>
        <meta name="description" content="Learn about PRYME - India's most advanced loan comparison platform." />
      </Helmet>
      
      <Header />
      
      <SmoothScroll>
        <main className="flex-1 pt-24 md:pt-32">
          <section className="container mx-auto px-4 pb-24">
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-6 border border-primary/20">
                  <Info className="w-4 h-4" />
                  Our Story
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-900 dark:text-white mb-8 tracking-tight">
                  Democratizing Credit for <span className="text-primary italic">Every Indian</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                  PRYME was born from a simple observation: the loan process in India is stuck in the 20th century. We're here to fix it through code, data, and transparency.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {[
                { icon: Target, title: "Mission", text: "To simplify complex financial decisions through technology-driven clarity." },
                { icon: Users, title: "Team", text: "A collective of finance experts and engineers building for India's future." },
                { icon: ShieldCheck, title: "Trust", text: "Bank-grade security and unbiased advice at every step of your journey." }
              ].map((item, i) => (
                <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                  <div className="p-8 rounded-[2rem] bg-white dark:bg-[#050505] border border-slate-200 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all h-full">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{item.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{item.text}</p>
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

export default About;
