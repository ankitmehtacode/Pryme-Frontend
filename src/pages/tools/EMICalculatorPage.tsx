import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollReveal from "@/components/ui/ScrollReveal";
import EMICalculator from "@/components/loan/EMICalculator";
import { Calculator, TrendingDown, Percent, Calendar } from "lucide-react";

const EMICalculatorPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0a]">
      <Helmet>
        <title>EMI Calculator | PRYME Consulting</title>
        <meta name="description" content="Calculate your monthly loan payments with precision." />
      </Helmet>
      
      <Header />
      
      <SmoothScroll>
        <main className="flex-1 pt-24 md:pt-32">
          <section className="container mx-auto px-4 pb-24">
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-6 border border-primary/20">
                  <Calculator className="w-4 h-4" />
                  Financial Engine
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-8 tracking-tight">
                  Loan <span className="text-primary italic">Precision</span> Tool
                </h1>
              </div>
            </ScrollReveal>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8">
                <div className="bg-card text-card-foreground rounded-[2.5rem] border border-border p-4 md:p-8 shadow-2xl">
                  <EMICalculator loanAmount={500000} showTerminology={true} />
                </div>
              </div>
              
              <div className="lg:col-span-4 space-y-6">
                {[
                  { icon: Percent, title: "Variable Interest", text: "Rates can vary by bank. Use this tool to find your threshold." },
                  { icon: TrendingDown, title: "Amortization", text: "Understand how your principal reduces over the loan tenure." },
                  { icon: Calendar, title: "Tenure Impact", text: "Small changes in years can save lakhs in total interest." }
                ].map((item, i) => (
                  <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                    <div className="p-6 rounded-3xl bg-secondary/50 border border-border backdrop-blur-md transition-all hover:bg-white dark:hover:bg-white/10">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.text}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </SmoothScroll>
    </div>
  );
};

export default EMICalculatorPage;
