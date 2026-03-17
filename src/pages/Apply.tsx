import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import LeadCaptureGate, { isLeadCaptured } from "@/components/auth/LeadCaptureGate";
import { Helmet } from "react-helmet-async";
import { Shield, Clock, CheckCircle, CheckCircle2, TrendingUp, Info, LockKeyhole, Sparkles, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

// Core Layout & Utilities
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { PrymeAPI } from "@/lib/api"; // 🧠 ARCHITECTURE FIX: Import explicit gateway engine

// Loan Components
import LoanApplicationForm from "@/components/loan/LoanApplicationForm";
import EMICalculator from "@/components/loan/EMICalculator";
import BankComparisonTable from "@/components/loan/BankComparisonTable";
import EligibilityScore from "@/components/loan/EligibilityScore";
import CibilTips from "@/components/loan/CibilTips";
import OffersRewards from "@/components/loan/OffersRewards";
import RequiredDocuments from "@/components/loan/RequiredDocuments";
import BankerContact from "@/components/loan/BankerContact";
import AnalysisLoader from "@/components/loan/AnalysisLoader";

const spring: any = { type: "spring", stiffness: 120, damping: 24, mass: 0.8 };

const Apply = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loanAmount, setLoanAmount] = useState(500000);
  const [hasAccess, setHasAccess] = useState(isLeadCaptured());
  const [tenure, setTenure] = useState(5);
  const [showComparison, setShowComparison] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🧠 State Persistence Matrix
  const [applicationData, setApplicationData] = useState<{
    cibilScore: number;
    monthlyIncome: number;
    productType: string;
    phone?: string; 
    name?: string; 
  } | null>(null);

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

  const handleFormSubmit = async (data: any) => {
    const leadName = localStorage.getItem("pryme_lead_name") || "Guest";
    const leadPhone = localStorage.getItem("pryme_lead_phone") || "";

    setApplicationData({
      cibilScore: data.cibilScore,
      monthlyIncome: data.monthlyIncome,
      productType: data.productType,
      phone: leadPhone,
      name: leadName
    });
    setLoanAmount(data.loanAmount);
    setTenure(data.loanTenure);

    // 1. Silent Local Cache (Picked up by Dashboard 25% stage)
    localStorage.setItem("pryme_pending_application", JSON.stringify({
        loanType: data.productType,
        employmentType: data.employmentType || "SALARIED", 
        loanAmount: data.loanAmount
    }));

    // 2. 🧠 SILENT DATABASE INGESTION: Hit Java PublicLeadController BEFORE comparison
    try {
        const leadRes = await PrymeAPI.submitLead({
          fullName: leadName,
          phone: leadPhone,
          productType: data.productType,
          loanAmount: data.loanAmount,
          cibilScore: data.cibilScore,
          monthlyIncome: data.monthlyIncome
        });
        
        // 3. CAPTURE THE UUID FOR THE GATEKEEPER ELEVATION
        if (leadRes?.lead?.id) {
            localStorage.setItem("pryme_pending_lead_id", leadRes.lead.id);
        }
    } catch (error) {
        console.warn("Silent lead capture sync failed.", error);
    }

    setIsAnalyzing(true);
  };

  const handleAnalysisComplete = () => {
    setIsAnalyzing(false);
    setShowComparison(true);

    setTimeout(() => {
      document.getElementById("comparison-dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleApplyDirect = (bankId: string) => {
    const bank = bankOffers.find(b => b.id === bankId);
    toast({ title: "Redirecting to Bank", description: `Opening ${bank?.bankName} application page...` });
  };

  // 🧠 THE CORE GATEWAY: Pushes intent -> Auth -> Dashboard Progressive Profile
  const handleApplyWithPyrme = async (bankId: string) => {
    const bank = bankOffers.find(b => b.id === bankId);
    
    // Cache exact target to resolve in Dashboard Stage 3
    localStorage.setItem("pryme_target_bank", bank?.bankName || "Pryme Aggregator");

    if (!user) {
        // 🧠 The Toggle Notification (Google / Auth Switch)
        toast({ 
          title: "Save Your Progress 🔒", 
          description: "Sign in with Google or Email to secure your limits and continue your application.",
          action: (
            <Button onClick={() => navigate("/auth?redirect=/dashboard")} className="bg-blue-600 text-white hover:bg-blue-700">
               Sign In & Continue
            </Button>
          ),
          duration: 10000,
        });
        
        // Auto-eject to auth if they don't click manually
        setTimeout(() => navigate("/auth?redirect=/dashboard"), 3000);
        return;
    }

    // If logged in, execute Elevation Protocol immediately and drop them into the Dashboard Matrix
    setIsSubmitting(true);
    try {
      const leadId = localStorage.getItem("pryme_pending_lead_id");
      if (leadId) {
         await PrymeAPI.elevateLead(leadId, user.id);
         localStorage.removeItem("pryme_pending_lead_id");
      }
      toast({ title: "Pipeline Secured", description: "Redirecting to your application portal..." });
      navigate("/dashboard");
    } catch (error) {
      toast({ title: "Routing Handshake", description: "Loading Client Portal..." });
      navigate("/dashboard");
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

      {!hasAccess && <LeadCaptureGate onCaptured={() => setHasAccess(true)} />}

      <AnalysisLoader 
        isVisible={isAnalyzing} 
        onComplete={handleAnalysisComplete}
        data={applicationData}
      />

      <div className="min-h-screen flex flex-col bg-[#0a0a0a] selection:bg-primary/20 selection:text-primary relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#0f462b]/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[40%] right-[-10%] w-[40vw] h-[40vw] bg-[#0f462b]/10 blur-[120px] rounded-full pointer-events-none" />

        <Header />

        <main className="flex-1 w-full pt-20 relative z-10">
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4 max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                <div className="lg:col-span-5 space-y-10 lg:sticky lg:top-24">
                  <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a0a0a] border border-[#2aac64]/20 shadow-sm mb-6 mt-2">
                      <LockKeyhole className="w-3.5 h-3.5 text-[#2aac64]" />
                      <span className="text-[10px] font-medium text-slate-300 uppercase tracking-widest">
                        Bank-Grade Security Protocol Active
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-6 tracking-tight leading-tight">
                      Intelligent Loan <span className="text-[#2aac64]">Matchmaking.</span>
                    </h1>
                    <p className="text-base text-slate-400 mb-8 font-medium max-w-md leading-relaxed">
                      Enter your details once. Let our algorithm scan 15+ top-tier banks to fetch your pre-approved limits and lowest interest rates instantly.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {features.map((feature) => (
                        <div key={feature.label} className="flex items-center gap-2 text-[10px] text-white bg-transparent border border-white/10 px-3 py-2 rounded-full shadow-sm">
                          <feature.icon className={`w-3.5 h-3.5 ${feature.color}`} />
                          <span className="font-medium tracking-widest uppercase">{feature.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6 hidden lg:block">
                    <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] shadow-xl">
                      <EMICalculator loanAmount={loanAmount} showTerminology={false} />
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

                <div className="lg:col-span-7 w-full space-y-8">
                  <div className="bg-[#111] border border-white/5 p-6 md:p-8 rounded-[2rem] shadow-2xl relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#2aac64]/5 blur-[60px] rounded-full pointer-events-none" />
                    <LoanApplicationForm
                      onAmountChange={setLoanAmount}
                      onFormSubmit={handleFormSubmit}
                    />
                  </div>

                  <div className="space-y-6 lg:hidden">
                    <div className="bg-[#111] border border-white/5 p-6 rounded-[2rem] shadow-xl">
                      <EMICalculator loanAmount={loanAmount} showTerminology={false} />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          <AnimatePresence>
            {showComparison && (
              <motion.div
                id="comparison-dashboard"
                initial={{ opacity: 0, y: 60, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={spring}
                className="w-full relative z-20 pb-20"
              >
                <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-16" />

                <div className="container mx-auto px-4 max-w-7xl space-y-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/40 dark:bg-slate-900/40 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-xl">
                    <div>
                      <div className="inline-flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                        <span className="text-sm font-medium text-primary uppercase tracking-widest">Analysis Complete</span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
                        Your Custom Loan Offers
                      </h2>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl">
                      <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-500 uppercase tracking-wider">Matches Found</p>
                        <p className="text-xl font-semibold text-emerald-800 dark:text-emerald-400 leading-none">{bankOffers.length} Banks</p>
                      </div>
                    </div>
                  </div>

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

                  <div className="pt-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Exclusive PRYME Rewards</h3>
                      <p className="text-slate-500 font-medium">Apply through us to get these benefits.</p>
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