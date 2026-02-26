import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Shield, Clock, CheckCircle, Building2, ArrowRight, Star, TrendingUp, AlertCircle, Info } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoanApplicationForm from "@/components/loan/LoanApplicationForm";
import EMICalculator from "@/components/loan/EMICalculator";
import BankComparisonTable from "@/components/loan/BankComparisonTable";
import EligibilityScore from "@/components/loan/EligibilityScore";
import CibilTips from "@/components/loan/CibilTips";
import OffersRewards from "@/components/loan/OffersRewards";
import RequiredDocuments from "@/components/loan/RequiredDocuments";
import BankerContact from "@/components/loan/BankerContact";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const Apply = () => {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [tenure, setTenure] = useState(5);
  const [showComparison, setShowComparison] = useState(false);
  const [applicationData, setApplicationData] = useState<{
    cibilScore: number;
    monthlyIncome: number;
    productType: string;
  } | null>(null);

  // Mock bank offers - in production this would come from an API
  const bankOffers = useMemo(() => {
    const offers = [
      {
        id: "hdfc",
        bankName: "HDFC Bank",
        maxLoanAmount: 5000000,
        roi: 10.5,
        processingFee: "1% + GST",
        emi: 10724,
        approvalProbability: 85,
        processingTime: "24-48 hours",
        featured: true,
      },
      {
        id: "sbi",
        bankName: "State Bank of India",
        maxLoanAmount: 3500000,
        roi: 10.25,
        processingFee: "0.5% + GST",
        emi: 10649,
        approvalProbability: 82,
        processingTime: "3-5 days",
      },
      {
        id: "icici",
        bankName: "ICICI Bank",
        maxLoanAmount: 4000000,
        roi: 10.75,
        processingFee: "1.5% + GST",
        emi: 10799,
        approvalProbability: 78,
        processingTime: "48-72 hours",
      },
      {
        id: "axis",
        bankName: "Axis Bank",
        maxLoanAmount: 4500000,
        roi: 11.0,
        processingFee: "1.25% + GST",
        emi: 10874,
        approvalProbability: 72,
        processingTime: "48 hours",
      },
      {
        id: "kotak",
        bankName: "Kotak Mahindra",
        maxLoanAmount: 4000000,
        roi: 10.85,
        processingFee: "1% + GST",
        emi: 10799,
        approvalProbability: 75,
        processingTime: "24-48 hours",
      },
    ];

    // Sort by ROI and mark the lowest as recommended
    const sorted = [...offers].sort((a, b) => a.roi - b.roi);
    return sorted.map((offer, index) => ({
      ...offer,
      recommended: index === 0,
    }));
  }, []);

  const handleFormSubmit = (data: any) => {
    setApplicationData({
      cibilScore: data.cibilScore,
      monthlyIncome: data.monthlyIncome,
      productType: data.productType,
    });
    setLoanAmount(data.loanAmount);
    setTenure(data.loanTenure);
    setShowComparison(true);
    
    // Scroll to comparison section
    setTimeout(() => {
      document.getElementById("comparison-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleApplyDirect = (bankId: string) => {
    const bank = bankOffers.find(b => b.id === bankId);
    toast({
      title: "Redirecting to Bank",
      description: `Opening ${bank?.bankName} application page...`,
    });
  };

  const handleApplyWithPyrme = (bankId: string) => {
    const bank = bankOffers.find(b => b.id === bankId);
    toast({
      title: "Application Started",
      description: `Your application with ${bank?.bankName} through PRYME has been initiated. Our RM will contact you shortly.`,
    });
  };

  // Calculate eligibility score based on user data
  const calculateEligibilityScore = () => {
    if (!applicationData) return 70;
    
    let score = 0;
    // CIBIL contribution (40%)
    score += ((applicationData.cibilScore - 300) / 600) * 40;
    // Income-Loan ratio contribution (40%)
    const ratio = loanAmount / (applicationData.monthlyIncome * 12);
    score += Math.max(0, (1 - ratio / 10) * 40);
    // Base score (20%)
    score += 20;
    
    return Math.min(100, Math.round(score));
  };

  const features = [
    { icon: Shield, label: "Secure & Encrypted", color: "text-success" },
    { icon: Clock, label: "2 Min Application", color: "text-trust-foreground" },
    { icon: CheckCircle, label: "24 Hour Approval", color: "text-primary" },
    { icon: Building2, label: "15+ Partner Banks", color: "text-info" },
  ];

  return (
    <>
      <Helmet>
        <title>Compare & Apply for Loans - PRYME | Best Rates from 15+ Banks</title>
        <meta
          name="description"
          content="Compare loan offers from top banks. Apply for personal, business, or home loans with PRYME. Quick approval, competitive rates, and exclusive rewards."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1">
          {/* Page Header */}
          <section className="hero-gradient py-12 md:py-16 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-medium text-primary uppercase tracking-widest">
                    Loan Comparison
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  Compare & Apply for Loans
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                  Get personalized loan offers from 15+ banks. Compare rates, check eligibility, and apply instantly with zero paperwork hassle.
                </p>
                <div className="flex flex-wrap gap-3">
                  {features.map((feature) => (
                    <div 
                      key={feature.label}
                      className="flex items-center gap-2 text-sm text-foreground bg-card border border-border px-4 py-2.5 rounded-full"
                    >
                      <feature.icon className={`w-4 h-4 ${feature.color}`} />
                      <span className="font-medium">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Application Section */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Form - Takes 2 columns */}
                <div className="lg:col-span-2">
                  <LoanApplicationForm 
                    onAmountChange={setLoanAmount} 
                    onFormSubmit={handleFormSubmit}
                  />
                </div>

                {/* Sidebar */}
                <div className="space-y-6 lg:sticky lg:top-24" id="emi-calculator">
                  <EMICalculator loanAmount={loanAmount} showTerminology />
                  
                  {/* Show CIBIL Tips dynamically based on form progress */}
                  {applicationData && applicationData.cibilScore < 750 && (
                    <CibilTips />
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Bank Comparison Section - Shows after form submission */}
          {showComparison && (
            <section id="comparison-section" className="py-12 md:py-16 trust-gradient border-y border-border">
              <div className="container mx-auto px-4">
                <div className="mb-8">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        Best Loan Offers For You
                      </h2>
                      <p className="text-muted-foreground">
                        Based on your profile, here are the best matching offers
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full">
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-success">
                        {bankOffers.length} Banks Matched
                      </span>
                    </div>
                  </div>
                </div>

                <BankComparisonTable
                  offers={bankOffers}
                  loanAmount={loanAmount}
                  tenure={tenure}
                  onApplyDirect={handleApplyDirect}
                  onApplyWithPyrme={handleApplyWithPyrme}
                />

                {/* Info callout */}
                <div className="mt-6 p-4 bg-info/10 border border-info/20 rounded-xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-info shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">How we select offers</p>
                    <p className="text-muted-foreground">
                      Offers are sorted by interest rate. The "Recommended" badge indicates the best rate available. 
                      Actual rates may vary based on credit assessment by the bank.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Additional Info Section */}
          {showComparison && applicationData && (
            <section className="py-12 md:py-16">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <EligibilityScore
                    score={calculateEligibilityScore()}
                    cibilScore={applicationData.cibilScore}
                    monthlyIncome={applicationData.monthlyIncome}
                    loanAmount={loanAmount}
                  />
                  <RequiredDocuments productType={applicationData.productType} />
                  <BankerContact />
                </div>
              </div>
            </section>
          )}

          {/* Offers & Rewards Section */}
          <section className="py-12 md:py-16 trust-gradient border-t border-border" id="rewards">
            <div className="container mx-auto px-4">
              <div className="mb-8 text-center">
                <span className="inline-block text-xs font-medium text-primary uppercase tracking-widest mb-3">
                  Exclusive Deals
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Offers & Rewards
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Unlock exclusive cashbacks, processing fee waivers, and reward points
                </p>
              </div>
              <OffersRewards />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Apply;
