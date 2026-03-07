import { Helmet } from "react-helmet-async";

// Layout & Core Utilities
import Header from "@/components/layout/Header";
import SmoothScroll from "@/components/SmoothScroll";
import Footer from "@/components/layout/Footer";

// Home Components
import HeroSection from "@/components/home/HeroSection";
import OffersMarquee from "@/components/home/OffersMarquee"; 
import ProductSelectorGrid from "@/components/home/ProductSelectorGrid";
import PartnerBankMarquee from "@/components/home/PartnerBankMarquee"; 
import ProcessSection from "@/components/home/ProcessSection";
import TrustMonologue from "@/components/home/TrustMonologue";
import TestimonialsSlider from "@/components/home/TestimonialsSlider";

// Loan Utility Components (Paisabazaar Dashboards)
import EMICalculator from "@/components/loan/EMICalculator";
import EligibilityScore from "@/components/loan/EligibilityScore";

const Index = () => {
  return (
    <>
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

      {/* 🧠 Fail-proof wrapper: If SmoothScroll crashes, the ErrorBoundary in App.tsx catches it */}
      <SmoothScroll>
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
          <Header />
          
          <main className="flex-1 w-full pt-16 md:pt-20">
            
            {/* 1. Hero Section */}
            <HeroSection />

            {/* 🧠 2. The Urgency Ribbon (Offers/Cashbacks) */}
            {/* Placed immediately under the hero to create transactional FOMO */}
            <div className="relative z-20 w-full border-b border-border shadow-sm">
              <OffersMarquee />
            </div>

            {/* 3. The Interactive Product Grid */}
            <div id="products" className="scroll-mt-24 relative z-10">
              <ProductSelectorGrid />
            </div>

            {/* 🧠 4. Partner Bank Marquee (Shifted Down) */}
            {/* Acts as a trust anchor after they have seen the products */}
            <section className="py-12 bg-slate-50 dark:bg-slate-900/40 border-y border-border relative z-10">
              <div className="container mx-auto px-4 text-center mb-6">
                <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
                  Integrated with India's Top Financial Institutions
                </p>
              </div>
              <PartnerBankMarquee />
            </section>

            {/* 🧠 5. The Split Utility Section (Data Density) */}
            {/* Paisabazaar layout: Calculators and scores side-by-side */}
            <section className="py-20 md:py-28 bg-background relative z-10">
              <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-16">
                  <span className="inline-block text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">
                    Financial Planning
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4 tracking-tighter">
                    Calculate & Evaluate
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Check your EMIs and assess your eligibility in real-time before initiating an application.
                  </p>
                </div>

                {/* CRO Grid: 60/40 Split for Data Heavy Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                  
                  {/* Left Section: EMI Calculator */}
                  <div className="lg:col-span-7 w-full shadow-2xl shadow-primary/5 rounded-3xl">
                    {/* Passing default props to prevent undefined crashes inside EMICalculator */}
                    <EMICalculator loanAmount={500000} showTerminology={true} />
                  </div>
                  
                  {/* Right Section: Eligibility / Context */}
                  <div className="lg:col-span-5 w-full">
                    {/* Passing default props to prevent undefined crashes inside EligibilityScore */}
                    <EligibilityScore score={75} cibilScore={750} monthlyIncome={50000} loanAmount={500000} />
                  </div>
                  
                </div>
              </div>
            </section>

            {/* 6. Closing Funnel Elements */}
            <div className="relative z-10">
              <ProcessSection />
              <TrustMonologue />
              <TestimonialsSlider />
            </div>

          </main>
          
          <Footer />
        </div>
      </SmoothScroll>
    </>
  );
};

export default Index;