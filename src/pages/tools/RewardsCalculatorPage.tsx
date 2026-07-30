import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollReveal from "@/components/ui/ScrollReveal";
import OffersRewards from "@/components/loan/OffersRewards";
import { Gift, Sparkles, Coins, Zap } from "lucide-react";
import rewardsBgImg from "@/assets/rewards-bg.png";

const RewardsCalculatorPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080d1e]">
      <Helmet>
        <title>Rewards Calculator | PRYME Consulting</title>
        <meta name="description" content="Calculate your rewards and perks for your loan application." />
        <meta property="og:title" content="Rewards Calculator | PRYME Consulting" />
        <meta property="og:description" content="Calculate your rewards and perks for your loan application." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.prymeloans.in/rewards-calculator" />
        <meta property="og:image" content="https://www.prymeloans.in/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.prymeloans.in/rewards-calculator" />
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

            <div className="w-full max-w-5xl mx-auto relative rounded-[2rem] border border-slate-200/80 dark:border-[#103783]/20 overflow-hidden shadow-xl py-8 md:py-10 px-6 md:px-12 bg-[#edf4ff] dark:bg-[#0b1021]">
              {/* Background Image Layer with 75% opacity */}
              <div 
                className="absolute inset-0 bg-center bg-no-repeat bg-cover pointer-events-none opacity-75"
                style={{ 
                  backgroundImage: `url(${rewardsBgImg})`,
                  backgroundSize: "cover"
                }}
              />
              <div className="max-w-3xl mx-auto relative z-10">
                <OffersRewards />
              </div>
            </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 max-w-xl mx-auto">
                {[
                  { icon: Coins, title: "Cashbacks", text: "Direct statement credits on successful disbursement." },
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
          </section>
        </main>
        <Footer />
      </SmoothScroll>
    </div>
  );
};

export default RewardsCalculatorPage;
