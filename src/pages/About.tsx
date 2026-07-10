import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { 
  Info, Target, Map,
  Layers, BrainCircuit, Eye, Lock, 
  CheckCircle2
} from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#080d1e] selection:bg-primary/20">
      <Helmet>
        <title>About Us | PRYME</title>
        <meta name="description" content="At PRYME, we help you compare loan options, understand your estimated eligibility, and choose the option that best fits your needs." />
      </Helmet>
      
      <Header />
      
      <SmoothScroll>
        <main className="flex-1 pt-24">
          
          {/* HERO SECTION */}
          <section className="relative container mx-auto px-4 pb-6 pt-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[120px] bg-primary/5 blur-[60px] rounded-full pointer-events-none" />
            
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight flex items-center justify-center gap-2 flex-wrap">
                  <span>Making Loans</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500 pb-1">
                    Easier to Understand
                  </span>
                </h1>
              </div>
            </ScrollReveal>
          </section>

          {/* WHY PRYME SECTION */}
          <section className="pb-16 bg-white dark:bg-[#080d1e] relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10 max-w-6xl">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <ScrollReveal direction="up">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Why PRYME?</h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-primary to-indigo-500 mx-auto rounded-full" />
                </ScrollReveal>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Feature 1 */}
                <ScrollReveal direction="up" delay={0.1}>
                  <div className="group p-6 rounded-2xl bg-white dark:bg-[#121a30] border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 cursor-default transition-all duration-300 h-full flex flex-col">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-all duration-300">
                      <Layers className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Compare Multiple Loan Options</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm flex-1">
                      Explore and compare loan products from multiple banks and financial institutions in one place.
                    </p>
                  </div>
                </ScrollReveal>

                {/* Feature 2 (Double Wide) */}
                <ScrollReveal direction="up" delay={0.2} className="lg:col-span-2">
                  <div className="group p-6 rounded-2xl bg-white dark:bg-[#121a30] border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 cursor-default transition-all duration-300 h-full flex flex-col md:flex-row gap-5 items-start relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-24 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-500" />
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center relative z-10 group-hover:scale-110 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-all duration-300">
                      <BrainCircuit className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div className="relative z-10 flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">Advanced Eligibility Assessment</h3>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                        Unlike traditional eligibility checks that often rely only on income, PRYME uses an Intelligence-Based Eligibility Engine that considers multiple lender-specific assessment methods, including various surrogate programs wherever applicable. This allows PRYME to provide a more comprehensive estimate of your potential eligibility across different lenders.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>

                {/* Feature 3 */}
                <ScrollReveal direction="up" delay={0.3}>
                  <div className="group p-6 rounded-2xl bg-white dark:bg-[#121a30] border border-slate-100 dark:border-white/5 hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 cursor-default transition-all duration-300 h-full flex flex-col">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-all duration-300">
                      <Eye className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Transparent Before You Apply</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm flex-1">
                      Understand your estimated eligibility before proceeding with a lender, helping you make informed decisions.
                    </p>
                  </div>
                </ScrollReveal>

                {/* Feature 4 */}
                <ScrollReveal direction="up" delay={0.4}>
                  <div className="group p-6 rounded-2xl bg-white dark:bg-[#121a30] border border-slate-100 dark:border-white/5 hover:border-rose-500/30 hover:shadow-xl hover:shadow-rose-500/5 hover:-translate-y-1 cursor-default transition-all duration-300 h-full flex flex-col">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 transition-all duration-300">
                      <Lock className="w-6 h-6 text-rose-500 dark:text-rose-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Privacy First</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm flex-1">
                      Your privacy comes first. PRYME is designed to minimise unnecessary data collection and give you control over how and when your information is shared.
                    </p>
                  </div>
                </ScrollReveal>

                {/* Feature 5 */}
                <ScrollReveal direction="up" delay={0.5}>
                  <div className="group p-6 rounded-2xl bg-white dark:bg-[#121a30] border border-slate-100 dark:border-white/5 hover:border-sky-500/30 hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1 cursor-default transition-all duration-300 h-full flex flex-col">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-sky-100 dark:group-hover:bg-sky-500/20 transition-all duration-300">
                      <CheckCircle2 className="w-6 h-6 text-sky-500 dark:text-sky-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Simple & Easy to Understand</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm flex-1">
                      No confusing financial jargon—just straightforward information that helps you choose the loan that's right for you.
                    </p>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>

          {/* MISSION & VISION SECTION */}
          <section className="py-10 container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mission */}
              <ScrollReveal direction="up">
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-[#121a30] border border-slate-100 dark:border-white/5 h-full flex flex-col items-center text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 relative z-10">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3 relative z-10">Our Mission</h2>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed relative z-10">
                    To make borrowing <span className="font-semibold text-slate-900 dark:text-white">simple, transparent, and accessible</span> for everyone by helping borrowers understand their options before they apply.
                  </p>
                </div>
              </ScrollReveal>

              {/* Vision */}
              <ScrollReveal direction="up" delay={0.1}>
                <div className="p-8 rounded-2xl bg-slate-50 dark:bg-[#121a30] border border-slate-100 dark:border-white/5 h-full flex flex-col items-center text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 relative z-10">
                    <Map className="w-6 h-6 text-indigo-500" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3 relative z-10">Our Vision</h2>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed relative z-10">
                    To become India's most trusted platform for discovering, comparing, and understanding financial products through <span className="font-semibold text-slate-900 dark:text-white">transparency, technology, and responsible innovation.</span>
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* A QUICK NOTE (DISCLAIMER) SECTION */}
          <section className="container mx-auto px-4 pb-12 max-w-6xl">
            <ScrollReveal direction="up">
              <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-800/30 flex flex-col md:flex-row gap-5 items-start">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">A Quick Note</h3>
                  <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p>
                      The eligibility displayed on PRYME is an estimate based on the information you provide and the lending policies available to us, including applicable lender-specific eligibility programs and surrogate assessment methods.
                    </p>
                    <p>
                      Final approval, loan amount, interest rate, tenure, and other loan terms are determined solely by the respective lender after their independent assessment. Lenders may also offer personalised terms based on additional information, internal policies, or discretionary evaluation.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>

        </main>
        <Footer />
      </SmoothScroll>
    </div>
  );
};

export default About;
