import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Shield, Clock, CheckCircle, Building2, ArrowRight, Star, TrendingUp, AlertCircle, Info, LockKeyhole, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Core Layout & Utilities
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { toast } from "@/hooks/use-toast";
import { PrymeAPI } from "@/lib/api"; 

// Loan Components
import LoanApplicationForm from "@/components/loan/LoanApplicationForm";
import EMICalculator from "@/components/loan/EMICalculator";
import BankComparisonTable from "@/components/loan/BankComparisonTable";
import EligibilityScore from "@/components/loan/EligibilityScore";
import CibilTips from "@/components/loan/CibilTips";
import OffersRewards from "@/components/loan/OffersRewards";
import RequiredDocuments from "@/components/loan/RequiredDocuments";
import BankerContact from "@/components/loan/BankerContact";

const springConfig = { type: "spring", stiffness: 120, damping: 24, mass: 0.8 };

const Apply = () => {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [tenure, setTenure] = useState(5);
  const [showComparison, setShowComparison] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState<{
    cibilScore: number;
    monthlyIncome: number;
    productType: string;
  } | null>(null);

  // Bank offers data preserved exactly as requested
  const bankOffers = useMemo(() => {
    const offers = [
      { id: "hdfc", bankName: "HDFC Bank", maxLoanAmount: 5000000, roi: 10.5, processingFee: "1% + GST", emi: 10724, approvalProbability: 85, processingTime: "24-48 hours", featured: true },
      { id: "sbi", bankName: "State Bank of India", maxLoanAmount: 3500000, roi: 10.25, processingFee: "0.5% + GST", emi: 10649, approvalProbability: 82, processingTime: "3-5 days" },
      { id: "icici", bankName: "ICICI Bank", maxLoanAmount: 4000000, roi: 10.75, processingFee: "1.5% + GST", emi: 10799, approvalProbability: 78, processingTime: "48-72 hours" },
      { id: "axis", bankName: "Axis Bank", maxLoanAmount: 4500000, roi: 11.0, processingFee: "1.25% + GST", emi: 10874, approvalProbability: 72, processingTime: "48 hours" },
      { id: "kotak", bankName: "Kotak Mahindra", maxLoanAmount: 4000000, roi: 10.85, processingFee: "1% + GST", emi: 10799, approvalProbability: 75, processingTime: "24-48 hours" },
    ];
    const sorted = [...offers].sort((a, b) => a.roi - b.roi);
    return sorted.map((offer, index) => ({ ...offer, recommended: index === 0 }));
  }, []);

  const handleFormSubmit = (data: any) => {
    setApplicationData({
      cibilScore: data.cibilScore,
      monthlyIncome: data.monthlyIncome,
      productType: data.productType,
    });
    setLoanAmount(data.loanAmount);
    setTenure(data.loanTenure);
    
    // Smooth transition state
    setShowComparison(true);
    
    // 🧠 Wait for AnimatePresence to mount the DOM, then scroll into the dashboard seamlessly
    setTimeout(() => {
      document.getElementById("comparison-dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  const handleApplyDirect = (bankId: string) => {
    const bank = bankOffers.find(b => b.id === bankId);
    toast({ title: "Redirecting to Bank", description: `Opening ${bank?.bankName} application page...` });
  };

  const handleApplyWithPyrme = async (bankId: string) => {
    const bank = bankOffers.find(b => b.id === bankId);
    if (!applicationData) return;

    setIsSubmitting(true);
    try {
      const response = await PrymeAPI.submitApplication(applicationData.productType, loanAmount, applicationData.cibilScore);
      toast({
        title: "Application Submitted! 🎉",
        description: `Your Lead ID: ${response.applicationId}. A PRYME RM for ${bank?.bankName} will contact you shortly.`,
      });
    } catch (error) {
      toast({ title: "Submission Error", description: "Unable to reach the secure server.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEligibilityScore = () => {
    if (!applicationData) return 70;
    let score = ((applicationData.cibilScore - 300) / 600) * 40;
    const ratio = loanAmount / (applicationData.monthlyIncome * 12);
    score += Math.max(0, (1 - ratio / 10) * 40);
    score += 20;
    return Math.min(100, Math.round(score));
  };

  const features = [
    { icon: Shield, label: "256-bit Encrypted", color: "text-emerald-500" },
    { icon: Clock, label: "2 Min Process", color: "text-blue-500" },
    { icon: CheckCircle, label: "Real-time Offers", color: "text-primary" },
  ];

  return (
    <>
      <Helmet>
        <title>Apply for Loans | PRYME Intelligent Aggregator</title>
        <meta name="description" content="Compare loan offers from top banks. Apply for personal, business, or home loans securely." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#030303] selection:bg-primary/20 selection:text-primary relative overflow-hidden">
        
        {/* Ambient Glassmorphic Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#2aac64]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[40%] right-[-10%] w-[40vw] h-[40vw] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

        <Header />
        
        <main className="flex-1 w-full pt-20 relative z-10">
          
          {/* 1. Header & Intake Area */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 max-w-7xl">
              
              <div className="max-w-3xl mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
                  <LockKeyhole className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                    Bank-Grade Security Protocol Active
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-tight">
                  Intelligent Loan <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Matchmaking.</span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 font-medium">
                  Enter your details once. Let our algorithm scan 15+ top-tier banks to fetch your pre-approved limits and lowest interest rates instantly.
                </p>
                <div className="flex flex-wrap gap-4">
                  {features.map((feature) => (
                    <div key={feature.label} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-full shadow-sm">
                      <feature.icon className={`w-4 h-4 ${feature.color}`} />
                      <span className="font-bold tracking-wide">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🧠 Split Screen: Input Form vs Calculators */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                
                {/* Left: The existing form component, wrapped in glass */}
                <div className="lg:col-span-7 w-full bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 md:p-8 rounded-[2rem] shadow-2xl">
                  <LoanApplicationForm 
                    onAmountChange={setLoanAmount} 
                    onFormSubmit={handleFormSubmit}
                  />
                </div>
                
                {/* Right: The Calculators & Tips (Sticky) */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
                  <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-[2rem] shadow-xl">
                    <EMICalculator loanAmount={loanAmount} showTerminology />
                  </div>
                  <AnimatePresence>
                    {applicationData && applicationData.cibilScore < 750 && (
                      <motion.div
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        className="bg-amber-50/80 dark:bg-amber-950/30 backdrop-blur-xl border border-amber-200 dark:border-amber-900/50 rounded-[2rem] p-6 shadow-xl"
                      >
                        <CibilTips />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>
          </section>

          {/* 🧠 2. The Dynamic Single-Page Dashboard Reveal */}
          <AnimatePresence>
            {showComparison && (
              <motion.div
                id="comparison-dashboard"
                initial={{ opacity: 0, y: 60, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={springConfig}
                className="w-full relative z-20 pb-20"
              >
                {/* Divider Line */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-16" />

                <div className="container mx-auto px-4 max-w-7xl space-y-8">
                  
                  {/* Dashboard Header */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/40 dark:bg-slate-900/40 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-xl">
                    <div>
                      <div className="inline-flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                        <span className="text-sm font-bold text-primary uppercase tracking-widest">Analysis Complete</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        Your Custom Loan Offers
                      </h2>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl">
                      <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-wider">Matches Found</p>
                        <p className="text-xl font-black text-emerald-800 dark:text-emerald-400 leading-none">{bankOffers.length} Banks</p>
                      </div>
                    </div>
                  </div>

                  {/* The Preserved Comparison Table Component */}
                  <div className="bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                    <BankComparisonTable
                      offers={bankOffers}
                      loanAmount={loanAmount}
                      tenure={tenure}
                      onApplyDirect={handleApplyDirect}
                      onApplyWithPyrme={handleApplyWithPyrme}
                    />
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-start gap-3">
                      <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-sm font-medium text-slate-500">
                        Offers are sorted by interest rate. The "Recommended" badge indicates the mathematically best rate available based on your entered parameters. Final rates are subject to physical document verification.
                      </p>
                    </div>
                  </div>

                  {/* Supporting Analytics Grid */}
                  {applicationData && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-xl h-full">
                        <EligibilityScore
                          score={calculateEligibilityScore()}
                          cibilScore={applicationData.cibilScore}
                          monthlyIncome={applicationData.monthlyIncome}
                          loanAmount={loanAmount}
                        />
                      </div>
                      <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-xl h-full">
                        <RequiredDocuments productType={applicationData.productType} />
                      </div>
                      <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-6 shadow-xl h-full flex flex-col justify-center">
                        <BankerContact />
                      </div>
                    </div>
                  )}

                  {/* Rewards Section */}
                  <div className="pt-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Exclusive PRYME Rewards</h3>
                      <p className="text-slate-500 font-medium">Apply through us to unlock these benefits instantly.</p>
                    </div>
                    <OffersRewards />
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Apply;