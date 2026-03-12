import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollReveal from "@/components/ui/ScrollReveal";
import OffersMarquee from "@/components/home/OffersMarquee";
import { Gift, Zap, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Offers = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0a]">
      <Helmet>
        <title>Exclusive Offers | PRYME Consulting</title>
        <meta name="description" content="Limited time loan offers, cashbacks, and rewards from our partner banks." />
      </Helmet>
      
      <Header />
      
      <SmoothScroll>
        <main className="flex-1 pt-24 md:pt-32">
          <section className="pb-24">
            <ScrollReveal direction="up">
              <div className="container mx-auto px-4 max-w-4xl text-center mb-16">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-6 border border-primary/20">
                  <Gift className="w-4 h-4" />
                  Member Perks
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-slate-900 dark:text-white mb-8 tracking-tight">
                  Premium <span className="text-primary italic">Incentives</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                  Our scale allows us to negotiate exclusive rates and zero-processing fee deals that you won't find on bank websites.
                </p>
              </div>
            </ScrollReveal>

            <div className="py-12 bg-white/50 dark:bg-white/5 backdrop-blur-md border-y border-slate-200 dark:border-white/10 mb-20">
              <OffersMarquee />
            </div>

            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {[
                  { icon: Zap, title: "Zero Processing Fees", bank: "HDFC Bank Special", text: "Available for Home Loans above ₹50L. Valid until end of month.", color: "from-blue-500/10 to-blue-600/10" },
                  { icon: Sparkles, title: "0.25% ROI Reduction", bank: "Standard Chartered", text: "Exclusive for PRYME customers with CIBIL > 800. Instant application.", color: "from-emerald-500/10 to-emerald-600/10" },
                  { icon: Gift, title: "₹5000 Amazon Voucher", bank: "Personal Loan Perk", text: "Get rewarded for your first successful disbursement through our platform.", color: "from-amber-500/10 to-amber-600/10" },
                  { icon: TrendingUp, title: "Double Rewards Points", bank: "Credit Card Offer", text: "Apply for a premium card and get 2x points on all digital spends for 90 days.", color: "from-purple-500/10 to-purple-600/10" }
                ].map((offer, i) => (
                  <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                    <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${offer.color} border border-slate-200 dark:border-white/10 flex flex-col md:flex-row gap-8 items-center transition-all hover:scale-[1.02]`}>
                      <div className="w-24 h-24 rounded-3xl bg-white dark:bg-black/50 flex items-center justify-center shrink-0 shadow-lg border border-white/20">
                        <offer.icon className="w-10 h-10 text-primary" />
                      </div>
                      <div className="text-center md:text-left flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80 mb-2 block">{offer.bank}</span>
                        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">{offer.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">{offer.text}</p>
                        <Button className="rounded-xl h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20">Claim Deal</Button>
                      </div>
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

export default Offers;
