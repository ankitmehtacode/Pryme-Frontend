import React from "react";
import { Helmet } from "react-helmet-async";
import { Building2, ShieldCheck } from "lucide-react";

// Layout & Core Utilities
import Header from "@/components/layout/Header";
import SmoothScroll from "@/components/SmoothScroll";
import Footer from "@/components/layout/Footer";

// Home Components
import HeroSection from "@/components/home/HeroSection";
import ProductSelectorGrid from "@/components/home/ProductSelectorGrid";
import PartnerBankMarquee from "@/components/home/PartnerBankMarquee"; 
import ProcessSection from "@/components/home/ProcessSection";
import TrustMonologue from "@/components/home/TrustMonologue";
import TestimonialsSlider from "@/components/home/TestimonialsSlider";
import CustomerReviews from "@/components/home/CustomerReviews";

// Loan Utility Components (Paisabazaar Dashboards)
import EMICalculator from "@/components/loan/EMICalculator";
import EligibilityScore from "@/components/loan/EligibilityScore";
import PrepaymentCalculator from "@/components/loan/PrepaymentCalculator";

// 🧠 1. NATIVE ERROR BOUNDARY: Localized crash protection. 
class LocalErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any, errorInfo: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Index Page Component Crash:", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-10 font-mono">
          <h2 className="text-xl text-destructive font-medium mb-4">UI Component Crash Prevented</h2>
          <pre className="bg-muted p-6 rounded-xl border border-destructive/50 max-w-4xl w-full overflow-auto text-sm text-foreground">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const Index = () => {
  return (
    <LocalErrorBoundary>
      <Helmet>
        <title>PRYME - Compare & Apply for Loans | Best Rates from 15+ Banks</title>
        <meta
          name="description"
          content="Compare loan offers from 15+ banks. Personal loans, business loans, home loans with competitive rates. Quick approval, transparent process. Apply now!"
        />
        <meta name="keywords" content="personal loan, business loan, home loan, loan against property, compare loans, best interest rates, quick loan approval" />
        <meta property="og:title" content="PRYME - Compare & Apply for Loans | Best Rates from 15+ Banks" />
        <meta property="og:description" content="Compare loan offers from 15+ banks. Quick approval, transparent process." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://pryme.in" />
      </Helmet>

      {/* Safe Smooth Scrolling wrapper */}
      <SmoothScroll>
        <div className="min-h-screen flex flex-col bg-[#0a0a0a] selection:bg-primary/20 selection:text-primary overflow-hidden">
          
          <Header />
          
          <main className="flex-1 w-full pt-16 md:pt-20">
            
            {/* 🧠 1. HERO SECTION: The Billboard */}
            <div className="relative z-30">
              <HeroSection />
            </div>

            {/* 🧠 2. THE DYNAMIC PRODUCT GRID (Restored normal layout flow to prevent clipping) */}
            <div id="products" className="relative z-20 pt-4 md:pt-8 bg-[#0a0a0a]">
              <ProductSelectorGrid />
            </div>

            {/* 🧠 3. STATIC PARTNERSHIP BAR (Authority Anchor) */}
            <section className="py-10 md:py-14 bg-[#050505] border-y border-white/5 relative z-10">
              <div className="container mx-auto px-4 text-center mb-8">
                <p className="text-[10px] md:text-xs font-medium tracking-[0.3em] text-slate-500 uppercase flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Trusted by over 15+ Premium Lending Partners
                </p>
              </div>
              <PartnerBankMarquee />
            </section>

            {/* 🧠 4. PAISABAZAAR TERMINAL: EMI & Eligibility Split */}
            <section className="py-20 md:py-32 bg-slate-50 dark:bg-[#030303] relative z-10 border-b border-white/5">
              {/* Subtle background glow to connect the sections */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

              <div className="container mx-auto px-4 max-w-[1400px] relative z-10">
                <div className="text-center mb-16 md:mb-20">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-6 border border-primary/20">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Financial Planning
                  </span>
                  <h2 className="text-2xl md:text-xl lg:text-2xl font-semibold text-slate-900 dark:text-white mb-6 tracking-tighter">
                    Calculate & Evaluate
                  </h2>
                  <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                    Run the math before you apply. Check your EMIs and assess your approval probability instantly.
                  </p>
                </div>

                {/* 60/40 CRO Data Grid Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                  
                  {/* Left: The Calculator + MIGRATED STATS */}
                  <div className="lg:col-span-7 w-full flex flex-col gap-8">
                    
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 p-2 md:p-4 transition-all duration-500">
                      <EMICalculator loanAmount={500000} showTerminology={true} />
                    </div>

                    {/* 🧠 THE STATS BLOCK (Moved perfectly under the EMI Calculator) */}
                    <div className="grid grid-cols-3 gap-4 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-slate-200 dark:border-white/10 shadow-xl">
                      <div className="text-center border-r border-slate-200 dark:border-white/10">
                        <p className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white tracking-tighter">
                          ₹500<span className="text-primary">Cr+</span>
                        </p>
                        <p className="text-[10px] md:text-xs font-medium text-slate-500 uppercase mt-2 tracking-widest">Capital Disbursed</p>
                      </div>
                      <div className="text-center border-r border-slate-200 dark:border-white/10">
                        <p className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white tracking-tighter">
                          24<span className="text-primary">h</span>
                        </p>
                        <p className="text-[10px] md:text-xs font-medium text-slate-500 uppercase mt-2 tracking-widest">Avg Approval</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white tracking-tighter">
                          98<span className="text-primary">%</span>
                        </p>
                        <p className="text-[10px] md:text-xs font-medium text-slate-500 uppercase mt-2 tracking-widest">Success Rate</p>
                      </div>
                    </div>

                  </div>
                  
                  {/* Right: The Data Context */}
                  <div className="lg:col-span-5 w-full space-y-6">
                    <EligibilityScore score={82} cibilScore={750} monthlyIncome={85000} loanAmount={500000} />
                    <PrepaymentCalculator />
                    
                    {/* Trust Mini-Card under Eligibility */}
                    <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 backdrop-blur-md shadow-inner">
                      <h4 className="text-primary font-semibold text-lg mb-2 flex items-center gap-2">
                        <Building2 className="w-5 h-5" /> Real-Time Analytics
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                        These metrics are calculated using the exact proprietary algorithms deployed by top-tier Indian banks to assess creditworthiness.
                      </p>
                    </div>
                  </div>
                  
                </div>
              </div>
            </section>

            {/* 5. BOTTOM OF FUNNEL: Closing the deal (Process & Trust) */}
            <div className="relative z-10 bg-slate-50 dark:bg-[#030303]">
              <ProcessSection />
              <TrustMonologue />
              <CustomerReviews />
            </div>

          </main>
          
          <Footer />
        </div>
      </SmoothScroll>
    </LocalErrorBoundary>
  );
};

export default Index;