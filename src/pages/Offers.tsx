import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Building2, TrendingUp, ShieldCheck, ArrowRight,
  Clock, IndianRupee, Percent, Zap, Loader2,
  Gift, Sparkles
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollReveal from "@/components/ui/ScrollReveal";
import OffersMarquee from "@/components/home/OffersMarquee";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

// ==========================================
// TYPES & INTERFACES
// ==========================================
interface BankOffer {
  id: string;
  bankName: string;
  logoColor: string;
  interestRate: number;
  processingFee: number;
  maxTenure: number;
  approvalOdds: number;
  tag?: string;
}

interface LeadDataPayload {
  leadId?: string;
  cibilScore: number;
  productType: string;
  monthlyIncome: number;
  loanAmount: number;
  fullName: string;
}

export default function Offers() {
  const location = useLocation();
  const navigate = useNavigate();

  // 🧠 THE FORK: Did they come from the Application Form or the Nav Bar?
  const leadData = location.state as LeadDataPayload | null;

  // ==========================================
  // SCENARIO B: LEAD CONVERSION MATRIX LOGIC
  // ==========================================
  const [isLocking, setIsLocking] = useState<string | null>(null);

  const dynamicOffers = useMemo(() => {
    if (!leadData) return [];

    const baseRate = leadData.cibilScore >= 750 ? 10.25 : leadData.cibilScore >= 650 ? 12.5 : 15.0;
    const baseOdds = leadData.cibilScore >= 750 ? 98 : leadData.cibilScore >= 650 ? 82 : 45;

    return [
      { id: "bank_1_hdfc", bankName: "HDFC Bank", logoColor: "bg-blue-600", interestRate: baseRate, processingFee: 1.5, maxTenure: 5, approvalOdds: baseOdds, tag: "Best Match" },
      { id: "bank_2_icici", bankName: "ICICI Bank", logoColor: "bg-orange-500", interestRate: baseRate + 0.25, processingFee: 1.0, maxTenure: 5, approvalOdds: Math.max(10, baseOdds - 5), tag: "Lowest Fee" },
      { id: "bank_3_axis", bankName: "Axis Bank", logoColor: "bg-rose-700", interestRate: baseRate + 0.5, processingFee: 2.0, maxTenure: 7, approvalOdds: Math.max(10, baseOdds + 2) },
      { id: "bank_4_kotak", bankName: "Kotak Mahindra", logoColor: "bg-red-600", interestRate: baseRate + 0.75, processingFee: 1.5, maxTenure: 5, approvalOdds: Math.max(10, baseOdds - 10) }
    ].sort((a, b) => a.interestRate - b.interestRate);
  }, [leadData]);

  const calculateEMI = (principal: number, rate: number, tenureYears: number) => {
    const r = rate / (12 * 100);
    const n = tenureYears * 12;
    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const handleSelectOffer = async (offer: BankOffer) => {
    if (!leadData) return;
    setIsLocking(offer.id);

    try {
      // Future API Hook: PrymeAPI.updateLeadOffer(leadData.leadId, offer.id);
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Offer Locked Successfully",
        description: `Your application with ${offer.bankName} is secured. Please create your portal account to track it.`,
      });

      // 🧠 ROUTING HANDSHAKE: Send user to /auth to create their client portal
      navigate("/auth", { state: { emailHint: "", intent: "track_lead", leadId: leadData.leadId } });

    } catch (error) {
      toast({ title: "Connection Error", description: "Failed to lock offer. Please try again.", variant: "destructive" });
      setIsLocking(null);
    }
  };

  // ==========================================
  // RENDER SCENARIO A: PUBLIC MARKETING PAGE (No state passed)
  // ==========================================
  if (!leadData) {
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
                    <Gift className="w-4 h-4" /> Member Perks
                  </span>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-8 tracking-tight">
                    Premium <span className="text-primary italic">Incentives</span>
                  </h1>
                  <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                    Our scale allows us to negotiate exclusive rates and zero-processing fee deals that you won't find on bank websites.
                  </p>
                </div>
              </ScrollReveal>

              <div className="py-12 bg-secondary/50 backdrop-blur-md border-y border-border mb-20">
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
                      <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${offer.color} border border-border flex flex-col md:flex-row gap-8 items-center transition-all hover:scale-[1.02]`}>
                        <div className="w-24 h-24 rounded-3xl bg-card text-card-foreground/50 flex items-center justify-center shrink-0 shadow-lg border border-white/20">
                          <offer.icon className="w-10 h-10 text-primary" />
                        </div>
                        <div className="text-center md:text-left flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80 mb-2 block">{offer.bank}</span>
                          <h3 className="text-2xl font-semibold text-foreground mb-3">{offer.title}</h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-6">{offer.text}</p>
                          <Button onClick={() => navigate('/apply')} className="rounded-xl h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20">Claim Deal</Button>
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
  }

  // ==========================================
  // RENDER SCENARIO B: LEAD CONVERSION MATRIX 
  // (State was passed from LoanApplicationForm)
  // ==========================================
  const heroOffer = dynamicOffers[0];
  const alternativeOffers = dynamicOffers.slice(1);

  return (
    <div className="min-h-screen bg-[#030303] text-white flex flex-col font-sans selection:bg-primary/30">
      <Helmet>
        <title>Your Personalized Matrix | PRYME</title>
      </Helmet>
      <Header />

      <main className="flex-1 pt-28 pb-20 px-4 md:px-8 relative overflow-hidden">
        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 space-y-12">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-4">
              <ShieldCheck className="w-4 h-4" /> Matrix Decrypted
            </div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight">
              Your <span className="text-primary font-medium">Curated</span> Matches
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
              Based on your verified CIBIL of <strong className="text-white">{leadData.cibilScore}</strong>, we have locked in {dynamicOffers.length} institutional offers for ₹{leadData.loanAmount.toLocaleString('en-IN')}.
            </p>
          </motion.div>

          {/* THE HERO OFFER */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="relative p-[1px] rounded-[2rem] bg-gradient-to-b from-primary/50 to-white/5 overflow-hidden group">
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl" />
            <div className="bg-[#0a0a0a] rounded-[2rem] p-6 md:p-10 relative h-full w-full flex flex-col md:flex-row gap-8 items-center justify-between">

              <div className="flex-1 space-y-6 w-full">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${heroOffer.logoColor} flex items-center justify-center shadow-lg shadow-black/50`}>
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-semibold">{heroOffer.bankName}</h2>
                      {heroOffer.tag && <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">{heroOffer.tag}</span>}
                    </div>
                    <p className="text-emerald-400 text-sm font-medium flex items-center gap-1.5 mt-1">
                      <TrendingUp className="w-4 h-4" /> {heroOffer.approvalOdds}% Pre-Approval Probability
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-1">Interest Rate</p>
                    <p className="text-2xl font-semibold flex items-center gap-1 text-white">{heroOffer.interestRate}<Percent className="w-4 h-4 text-slate-400" /></p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-1">Monthly EMI</p>
                    <p className="text-2xl font-semibold flex items-center gap-1 text-white"><IndianRupee className="w-4 h-4 text-slate-400" />{calculateEMI(leadData.loanAmount, heroOffer.interestRate, heroOffer.maxTenure).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-1">Max Tenure</p>
                    <p className="text-2xl font-semibold flex items-center gap-1 text-white">{heroOffer.maxTenure} <span className="text-sm text-slate-400 font-normal">Yrs</span></p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-1">Processing</p>
                    <p className="text-2xl font-semibold flex items-center gap-1 text-white">{heroOffer.processingFee}<Percent className="w-4 h-4 text-slate-400" /></p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto md:min-w-[240px] flex flex-col items-center justify-center p-6 rounded-3xl bg-white/5 border border-white/10 shrink-0">
                <Button onClick={() => handleSelectOffer(heroOffer)} disabled={isLocking !== null} className="w-full bg-primary hover:bg-[#239b57] text-white py-6 rounded-xl text-lg font-semibold shadow-[0_0_20px_rgba(42,172,100,0.3)] transition-all hover:scale-[1.02]">
                  {isLocking === heroOffer.id ? <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Locking...</span> : <span className="flex items-center gap-2"><Zap className="w-5 h-5" /> Secure Offer</span>}
                </Button>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-4 flex items-center gap-1"><Clock className="w-3 h-3" /> Expires in 24h</p>
              </div>

            </div>
          </motion.div>

          {/* ALTERNATIVE MATRIX OPTIONS */}
          <div className="space-y-6 pt-8">
            <h3 className="text-lg font-medium text-slate-300 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-slate-700" /> Alternative Matrix Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {alternativeOffers.map((offer, index) => (
                <motion.div key={offer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + (index * 0.1) }} className="bg-[#111] border border-white/5 hover:border-white/15 rounded-2xl p-6 transition-colors group flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${offer.logoColor} flex items-center justify-center`}><Building2 className="w-5 h-5 text-white" /></div>
                      <div>
                        <h4 className="font-semibold text-white">{offer.bankName}</h4>
                        <p className="text-xs text-slate-400">{offer.approvalOdds}% Approval Odds</p>
                      </div>
                    </div>
                    {offer.tag && <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-700 px-2 py-0.5 rounded">{offer.tag}</span>}
                  </div>
                  <div className="space-y-4 mb-6 flex-1">
                    <div className="flex justify-between items-center"><span className="text-sm text-slate-500">Interest Rate</span><span className="font-semibold text-white">{offer.interestRate}%</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-slate-500">Processing Fee</span><span className="font-semibold text-white">{offer.processingFee}%</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-slate-500">EMI ({offer.maxTenure} yrs)</span><span className="font-semibold text-white">₹{calculateEMI(leadData.loanAmount, offer.interestRate, offer.maxTenure).toLocaleString('en-IN')}</span></div>
                  </div>
                  <Button onClick={() => handleSelectOffer(offer)} disabled={isLocking !== null} variant="outline" className="w-full bg-transparent border-white/10 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                    {isLocking === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="flex items-center gap-2">Select <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></span>}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}