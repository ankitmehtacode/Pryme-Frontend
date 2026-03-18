import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollReveal from "@/components/ui/ScrollReveal";
import OffersRewards from "@/components/loan/OffersRewards";
import { Gift, Sparkles, Coins, Zap } from "lucide-react";

const RewardsCalculatorPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0a]">
      <Helmet>
        <title>Rewards Calculator | PRYME Consulting</title>
        <meta name="description" content="Calculate your rewards and perks for your loan application." />
      </Helmet>
      
      <Header />
      
      <SmoothScroll>
        <main className="flex-1 pt-24 md:pt-32">
          <section className="container mx-auto px-4 pb-24">
            <ScrollReveal direction="up">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-6 border border-primary/20">
                  <Gift className="w-4 h-4" />
                  Privilege Engine
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-8 tracking-tight">
                  Reward <span className="text-primary italic">Tier</span> Analytics
                </h1>
              </div>
            </ScrollReveal>

            <div className="max-w-5xl mx-auto">
              <div className="bg-card text-card-foreground rounded-[2.5rem] border border-border p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                <OffersRewards />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                {[
                  { icon: Coins, title: "Cashbacks", text: "Direct statement credits on successful disbursement." },
                  { icon: Sparkles, title: "Gold Tier", text: "Exclusive access to airport lounges and concierge." },
                  { icon: Zap, title: "Instant Vouchers", text: "Receive brand vouchers instantly upon approval." }
                ].map((item, i) => (
                  <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                    <div className="p-6 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
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

export default RewardsCalculatorPage;
