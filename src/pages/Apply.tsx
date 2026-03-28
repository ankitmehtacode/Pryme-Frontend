import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LeadCaptureGate, { isLeadCaptured } from "@/components/auth/LeadCaptureGate";
import { Helmet } from "react-helmet-async";
import { Shield, Clock, CheckCircle, CheckCircle2, TrendingUp, Info, LockKeyhole, Sparkles, ChevronRight, ShieldCheck } from "lucide-react";
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
import ProgressiveContinuationForm from "@/components/loan/ProgressiveContinuationForm";
import RequiredDocuments from "@/components/loan/RequiredDocuments";
import BankerContact from "@/components/loan/BankerContact";
import AnalysisLoader from "@/components/loan/AnalysisLoader";

const spring: any = { type: "spring", stiffness: 120, damping: 24, mass: 0.8 };

const Apply = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loanAmount, setLoanAmount] = useState(500000);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [pendingBankId, setPendingBankId] = useState<string | null>(null);
  const [tenure, setTenure] = useState(5);
  const [showComparison, setShowComparison] = useState(false);
  const [activeContinuationBankId, setActiveContinuationBankId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormFocused, setIsFormFocused] = useState(false);

  // ─── Form focus handlers for glassmorphic effect ──────────────────
  const handleFormFocus = useCallback(() => setIsFormFocused(true), []);
  const handleFormBlur = useCallback((e: React.FocusEvent) => {
    const formContainer = e.currentTarget;
    if (!formContainer.contains(e.relatedTarget as Node)) {
      setIsFormFocused(false);
    }
  }, []);
  
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
    navigate("/offers", {
      state: {
        cibilScore: applicationData?.cibilScore,
        productType: applicationData?.productType,
        monthlyIncome: applicationData?.monthlyIncome,
        loanAmount: loanAmount,
        fullName: localStorage.getItem("pryme_lead_name") || "Guest",
      },
    });
  };

  const handleApplyDirect = (bankId: string) => {
    const bank = bankOffers.find(b => b.id === bankId);
    toast({ title: "Redirecting to Bank", description: `Opening ${bank?.bankName} application page...` });
  };

  // 🧠 THE CORE GATEWAY: Pushes intent -> Auth -> Inline Progressive Continuation
  const handleApplyWithPyrme = async (bankId: string) => {
    const bank = bankOffers.find(b => b.id === bankId);
    
    // Cache exact target to resolve later
    localStorage.setItem("pryme_target_bank", bank?.bankName || "Pryme Aggregator");

    if (!isLeadCaptured() && !user) {
        // High-intent action intercepted: Trigger the Auth Gate now
        setPendingBankId(bankId);
        setShowAuthGate(true);
        return;
    }

    // Step 3: Trigger Progressive Continuation Form directly beneath instead of hard reload
    setActiveContinuationBankId(bankId);
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
    { icon: Shield, label: "256-bit Encrypted", color: "text-violet-500" },
    { icon: CheckCircle, label: "Real-time Offers", color: "text-primary dark:text-[#7c3aed]" },
  ];

  return (
    <>
      <Helmet>
        <title>Apply for Loans | PRYME Intelligent Aggregator</title>
        <meta name="description" content="Compare loan offers from top banks. Apply for personal, business, or home loans securely." />
      </Helmet>

      {showAuthGate && (
        <LeadCaptureGate 
          onCaptured={() => {
            setShowAuthGate(false);
            if (pendingBankId) {
              handleApplyWithPyrme(pendingBankId);
            }
          }} 
        />
      )}

      <AnalysisLoader 
        isVisible={isAnalyzing} 
        onComplete={handleAnalysisComplete}
        data={applicationData}
      />

      {/* 🧠 UI FIX: Changed hardcoded black `#0a0a0a` to semantic adaptive `bg-slate-50 dark:bg-[#0a0a0a]` */}
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0a] selection:bg-primary/20 selection:text-primary relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-violet-500/5 dark:bg-[#2e1065]/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[40%] right-[-10%] w-[40vw] h-[40vw] bg-violet-500/5 dark:bg-[#2e1065]/10 blur-[120px] rounded-full pointer-events-none" />

        <Header />

        <main className="flex-1 w-full pt-20 relative z-10">
          <AnimatePresence mode="wait">
            {!showComparison ? (
              <motion.section 
                key="application-form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)", transition: { duration: 0.4 } }}
                className="py-8 md:py-12"
              >
                <div className="container mx-auto px-4 max-w-7xl">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    <div 
                      className="lg:col-span-5 space-y-10 lg:sticky lg:top-24 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{
                        filter: isFormFocused ? "blur(3px)" : "blur(0px)",
                        opacity: isFormFocused ? 0.5 : 1,
                      }}
                    >
                      <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card dark:bg-[#0a0a0a] border border-border dark:border-[#7c3aed]/20 shadow-sm mb-6 mt-2">
                          <LockKeyhole className="w-3.5 h-3.5 text-primary dark:text-[#7c3aed]" />
                          <span className="text-[10px] font-bold text-muted-foreground dark:text-slate-300 uppercase tracking-widest">
                            Bank-Grade Security Protocol Active
                          </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 tracking-tight leading-tight">
                          Intelligent Loan <span className="text-primary dark:text-[#7c3aed]">Matchmaking.</span>
                        </h1>
                        <p className="text-base text-muted-foreground mb-8 font-medium max-w-md leading-relaxed">
                          Enter your details once. Let our algorithm scan 15+ top-tier banks to fetch your pre-approved limits and lowest interest rates instantly.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {features.map((feature) => (
                            <div key={feature.label} className="flex items-center gap-2 text-[10px] font-bold text-foreground bg-card dark:bg-transparent border border-border dark:border-white/10 px-3 py-2 rounded-full shadow-sm">
                              <feature.icon className={`w-3.5 h-3.5 ${feature.color}`} />
                              <span className="tracking-widest uppercase">{feature.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6 hidden lg:block">
                        <div className="bg-card dark:bg-[#111] border border-border dark:border-white/5 p-6 rounded-[2rem] shadow-xl">
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

                    <div 
                      className="lg:col-span-7 w-full space-y-8"
                      onFocus={handleFormFocus}
                      onBlur={handleFormBlur}
                      tabIndex={-1}
                      style={{ outline: "none" }}
                    >
                      <motion.div 
                        className="relative"
                        animate={{
                          boxShadow: isFormFocused 
                            ? "0 8px 60px -12px rgba(124, 58, 237, 0.12), 0 0 0 1px rgba(124, 58, 237, 0.08)" 
                            : "0 4px 30px -8px rgba(0,0,0,0.08)",
                        }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        style={{ borderRadius: "2rem" }}
                      >
                        <motion.div 
                          className="absolute -inset-px rounded-[2rem] pointer-events-none z-0"
                          animate={{
                            opacity: isFormFocused ? 1 : 0,
                            background: isFormFocused 
                              ? "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(124,58,237,0.02) 40%, rgba(124,58,237,0.08) 100%)"
                              : "none",
                          }}
                          transition={{ duration: 0.6 }}
                        />
                        <div className="relative bg-card dark:bg-[#111] border border-border dark:border-white/5 p-6 md:p-8 rounded-[2rem] shadow-2xl overflow-hidden z-10">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 dark:bg-[#7c3aed]/5 blur-[60px] rounded-full pointer-events-none" />
                          <LoanApplicationForm
                            onAmountChange={setLoanAmount}
                            onFormSubmit={handleFormSubmit}
                          />
                        </div>
                      </motion.div>

                      <div className="space-y-6 lg:hidden">
                        <div className="bg-card dark:bg-[#111] border border-border dark:border-white/5 p-6 rounded-[2rem] shadow-xl">
                          <EMICalculator loanAmount={loanAmount} showTerminology={false} />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.section>
            ) : (
              <motion.div


                id="comparison-dashboard"
                initial={{ opacity: 0, y: 60, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={spring}
                className="w-full relative z-20 pb-20"
              >
                <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 dark:via-[#7c3aed]/30 to-transparent mb-16" />

                <div className="container mx-auto px-4 max-w-7xl space-y-8">
                  {/* ── SECTION A: Psychological Anchors (Top Fold) ────────────────── */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
                    {/* Main Approval Anchor */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-primary/10 to-transparent dark:from-[#7c3aed]/10 border border-primary/20 dark:border-[#7c3aed]/20 p-6 md:p-8 rounded-[2rem] shadow-lg relative overflow-hidden backdrop-blur-xl flex flex-col justify-center">
                      <div className="absolute top-0 right-0 p-6 opacity-20">
                        <CheckCircle className="w-24 h-24 text-primary dark:text-[#7c3aed]" />
                      </div>
                      <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-[#7c3aed]/10 border border-primary/30 text-[10px] font-bold text-primary dark:text-[#7c3aed] uppercase tracking-widest">
                          <Sparkles className="w-3.5 h-3.5" /> High Approval Odds
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                          78% Probability
                        </h2>
                        <p className="text-sm font-medium text-muted-foreground">
                          Based on your CIBIL and entered income.
                        </p>
                        
                        <div className="mt-6 w-full h-2 rounded-full bg-secondary overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "78%" }}
                            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Secondary Anchors */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <div className="bg-card/60 dark:bg-slate-900/40 border border-border p-6 rounded-[2rem] shadow-sm backdrop-blur-xl flex flex-col justify-center">
                        <div className="w-10 h-10 rounded-[1rem] bg-amber-500/10 flex items-center justify-center mb-4">
                          <TrendingUp className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Pre-approved Range</p>
                        <p className="text-xl font-bold text-foreground">₹{(loanAmount * 0.9).toLocaleString('en-IN')} – ₹{(loanAmount * 1.5).toLocaleString('en-IN')}</p>
                      </div>

                      <div className="bg-card/60 dark:bg-slate-900/40 border border-border p-6 rounded-[2rem] shadow-sm backdrop-blur-xl flex flex-col justify-center">
                        <div className="w-10 h-10 rounded-[1rem] bg-emerald-500/10 flex items-center justify-center mb-4">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Pryme Score</p>
                        <p className="text-xl font-bold text-foreground">82 / 100</p>
                      </div>

                      <div className="sm:col-span-2 bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex items-center gap-4">
                        <Clock className="w-6 h-6 text-blue-500 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-blue-900 dark:text-blue-400">Estimated Disbursal: 24-48 hrs</p>
                          <p className="text-[11px] font-medium text-blue-700/70 dark:text-blue-300/60 mt-0.5">Physical document pickup available in your pin code.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── SECTION B: Smart Nudges ────────────────────────────── */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 py-2">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 border border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" /> {bankOffers.length} Lenders Match Your Profile
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5" /> No impact on credit score
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider hidden md:flex">
                      <LockKeyhole className="w-3.5 h-3.5" /> 256-bit Encryption
                    </div>
                  </div>

                  {/* ── SECTION C: Loan Comparison Matrix OR Progressive Form ──────────────────── */}

                  <AnimatePresence mode="wait">
                    {activeContinuationBankId ? (
                      <motion.div
                        key="continuation-form"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={spring}
                      >
                        {(() => {
                          const bank = bankOffers.find(b => b.id === activeContinuationBankId);
                          if (!bank) return null;
                          return (
                            <ProgressiveContinuationForm
                              bankId={bank.id}
                              bankName={bank.bankName}
                              loanAmount={loanAmount}
                              emi={bank.emi}
                              roi={bank.roi}
                              productType={applicationData?.productType || "Personal Loan"}
                              onCancel={() => setActiveContinuationBankId(null)}
                              onComplete={() => {
                                toast({ title: "Pipeline Secured", description: "All documents verified. Redirecting to your portfolio tracking dashboard..." });
                                navigate("/dashboard");
                              }}
                            />
                          );
                        })()}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="comparison-table"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={spring}
                        className="bg-card text-card-foreground rounded-[2rem] border border-border shadow-2xl overflow-hidden"
                      >
                        <BankComparisonTable
                          offers={bankOffers}
                          loanAmount={loanAmount}
                          tenure={tenure}
                          onApplyDirect={handleApplyDirect}
                          onApplyWithPyrme={handleApplyWithPyrme}
                        />
                        <div className="p-4 bg-secondary/50 dark:bg-slate-900 border-t border-border flex items-start gap-3">
                          <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide leading-relaxed">
                            Offers are sorted by interest rate. The "Recommended" badge indicates the mathematically best rate available based on your entered parameters. Final rates are subject to physical document verification.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {applicationData && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-[2rem] p-6 shadow-xl h-full">
                        <RequiredDocuments productType={applicationData.productType} />
                      </div>
                      <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-[2rem] p-6 shadow-xl h-full flex flex-col justify-center">
                        <BankerContact />
                      </div>
                    </div>
                  )}

                  <div className="pt-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-foreground tracking-tight">Exclusive PRYME Rewards</h3>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Apply through us to get these benefits.</p>
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