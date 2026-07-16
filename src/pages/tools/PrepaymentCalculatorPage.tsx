import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollReveal from "@/components/ui/ScrollReveal";
import PrepaymentCalculator from "@/components/loan/PrepaymentCalculator";
import {
  TrendingDown,
  IndianRupee,
  Calendar,
  Percent,
  ArrowDownRight,
} from "lucide-react";

const PrepaymentCalculatorPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080d1e]">
      <Helmet>
        <title>Prepayment Calculator | PRYME Consulting</title>
        <meta
          name="description"
          content="Calculate how much you can save by prepaying your loan early. See interest savings and reduced tenure instantly."
        />
        <meta property="og:title" content="Prepayment Calculator | PRYME Consulting" />
        <meta property="og:description" content="Calculate how much you can save by prepaying your loan early. See interest savings and reduced tenure instantly." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.gopryme.tech/prepayment-calculator" />
        <meta property="og:image" content="https://www.gopryme.tech/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.gopryme.tech/prepayment-calculator" />
      </Helmet>

      <Header />

      <SmoothScroll>
        <main className="flex-1 pt-16 md:pt-20">
          <section className="container mx-auto px-4 pb-12">
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto text-center mb-6 md:mb-8">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium uppercase tracking-widest mb-4 border border-emerald-500/20">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Smart Savings
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-3 md:mb-4 tracking-tight">
                  Prepayment{" "}
                  <span className="text-emerald-600 dark:text-emerald-400 italic">
                    Savings
                  </span>{" "}
                  Calculator
                </h1>
                <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
                  Discover how a smart prepayment strategy can dramatically
                  reduce your total interest and loan tenure.
                </p>
              </div>
            </ScrollReveal>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-start">
              {/* Calculator Card */}
              <div className="lg:col-span-8">
                <PrepaymentCalculator showTerminology={true} />
              </div>

              {/* Side Info Cards */}
              <div className="lg:col-span-4 space-y-3 md:space-y-4">
                {[
                  {
                    icon: ArrowDownRight,
                    title: "Earlier = Better",
                    text: "Prepaying in the first few years saves the most interest since early EMIs are interest-heavy.",
                  },
                  {
                    icon: Percent,
                    title: "No Penalty on Floating",
                    text: "RBI mandates zero prepayment penalty on floating rate loans from banks. Check with NBFCs.",
                  },
                  {
                    icon: Calendar,
                    title: "Reduce Tenure, Not EMI",
                    text: "Keeping your EMI same after prepayment and reducing tenure saves more interest overall.",
                  },
                  {
                    icon: IndianRupee,
                    title: "Tax Benefits",
                    text: "Prepayment on home loans qualifies for tax deduction under Section 80C up to ₹1.5 Lakh.",
                  },
                ].map((item, i) => (
                  <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                    <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-secondary/50 border border-border backdrop-blur-md transition-all hover:bg-white dark:hover:bg-white/10 shadow-sm">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2 md:mb-3">
                        <item.icon className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h4 className="font-semibold text-sm md:text-base text-foreground mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {item.text}
                      </p>
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

export default PrepaymentCalculatorPage;
