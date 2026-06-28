import React, { useRef, useEffect, useState, lazy, Suspense } from "react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Helmet } from "react-helmet-async";
import { Building2 } from "lucide-react";
import { motion, useInView } from "framer-motion";

// 🧠 Animated Counter Hook — drives the number-tick animation
const useAnimatedCounter = (target: number, duration: number = 2000, startOnView: boolean = false, isInView: boolean = true) => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    if (startOnView) hasAnimated.current = true;

    let startTime: number | null = null;
    let animationId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        animationId = requestAnimationFrame(step);
      }
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [target, duration, isInView, startOnView]);

  return count;
};

// Layout & Core Utilities (above-the-fold — must be eager)
import Header from "@/components/layout/Header";
import SmoothScroll from "@/components/SmoothScroll";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";

// Above-the-fold components (eager)
import HeroSection from "@/components/home/HeroSection";
import ProductSelectorGrid from "@/components/home/ProductSelectorGrid";
import PartnerBankMarquee from "@/components/home/PartnerBankMarquee"; 

// Below-the-fold components (lazy-loaded — won't block initial paint)
const ProcessSection = lazy(() => import("@/components/home/ProcessSection"));
const TrustMonologue = lazy(() => import("@/components/home/TrustMonologue"));
const TestimonialsSlider = lazy(() => import("@/components/home/TestimonialsSlider"));
const CustomerReviews = lazy(() => import("@/components/home/CustomerReviews"));

import { BookOpen, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { blogs } from "@/data/blogs";

// Loan Utility Components (below-the-fold — lazy-loaded)
const EMICalculator = lazy(() => import("@/components/loan/EMICalculator"));
const PrepaymentCalculator = lazy(() => import("@/components/loan/PrepaymentCalculator"));
const OffersRewards = lazy(() => import("@/components/loan/OffersRewards"));
const CibilTips = lazy(() => import("@/components/loan/CibilTips"));

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
        <link rel="canonical" href="https://www.gopryme.tech" />
      </Helmet>

      {/* Safe Smooth Scrolling wrapper */}
      <SmoothScroll>
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080d1e] selection:bg-primary/20 selection:text-primary overflow-hidden">
          
          <Header />
          
          <main className="flex-1 w-full pt-16 md:pt-20">
            
            {/* 🧠 1. HERO SECTION: The Billboard */}
            <div className="relative z-30">
              <HeroSection />
            </div>

            {/* 🧠 2. THE DYNAMIC PRODUCT GRID & PARTNERS REGION */}
            <ScrollReveal direction="up" duration={0.8}>
            <div id="products" className="section-contained relative z-20 pt-0 md:pt-3 bg-slate-50 dark:bg-[#080d1e] hidden md:block">
              <ProductSelectorGrid />
            </div>
            </ScrollReveal>

            {/* 🧠 3. STATIC PARTNERSHIP BAR — visible on all breakpoints */}
            <div className="section-contained relative z-20 pt-0 pb-0 bg-slate-50 dark:bg-[#080d1e]">
              <PartnerBankMarquee />
            </div>

            {/* 🧠 4. PAISABAZAAR TERMINAL: EMI & Eligibility Split */}
            <Suspense fallback={<div className="min-h-[200px]" />}>
            <section className="section-contained pt-2 pb-8 md:pt-4 md:pb-16 lg:pt-6 lg:pb-20 bg-slate-50 dark:bg-[#030303] relative z-10">
              {/* Gradient section divider */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/30 dark:via-white/10 to-transparent" />
              {/* Subtle background glow to connect the sections */}
              <div className="absolute top-0 left-1/2 w-full max-w-4xl h-[400px] bg-primary/5 transform-gpu rounded-full pointer-events-none" style={{ transform: "translate3d(-50%, -30%, 0)", willChange: "transform" }} />

              <ScrollReveal direction="up" duration={1} stagger={0.15}>
              <div className="container mx-auto px-4 max-w-[1400px] relative z-10">
                <div className="text-center mb-4 md:mb-8 lg:mb-10">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-3 border border-primary/20">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Financial Planning
                  </span>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-foreground mb-2 md:mb-3 tracking-tighter">
                    Calculate & Evaluate
                  </h2>
                  <p className="text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal">
                    Run the math before you apply. Check your EMIs and assess your approval probability instantly.
                  </p>
                </div>

                {/* Full Width Stack: EMI & Prepayment (Side-by-Side) -> Rewards */}
                <div className="flex flex-col gap-6 md:gap-14 lg:gap-16 items-start w-full">
                  
                  {/* Grid layout for Calculators side by side on large screens */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 md:gap-14 lg:gap-8 w-full items-start">
                    {/* EMI Calculator */}
                    <div className="w-full">
                      <EMICalculator loanAmount={500000} showTerminology={true} />
                    </div>
                    
                    {/* Prepayment Calculator */}
                    <div className="w-full">
                      <PrepaymentCalculator />
                    </div>
                  </div>
                  
                  {/* Rewards Calculator */}
                  <div className="w-full">
                    <OffersRewards />
                  </div>

                  {/* Trust Mini-Card */}
                  <div className="w-full max-w-3xl mx-auto bg-primary/5 dark:bg-[#103783]/5 border border-primary/20 dark:border-[#103783]/20 rounded-[2rem] p-5 md:p-6 lg:p-8 shadow-inner text-center">
                    <h4 className="text-primary dark:text-[#103783] font-bold text-base md:text-lg mb-2 md:mb-3 flex items-center justify-center gap-2.5">
                      <Building2 className="w-5 h-5 shrink-0" /> Calculator Analytics
                    </h4>
                    <p className="text-xs md:text-sm text-muted-foreground dark:text-slate-400 font-medium leading-relaxed">
                      These metrics are calculated using standard banking formulas to give you an overview of your monthly obligations.
                    </p>
                  </div>
                  
                </div>
              </div>
              </ScrollReveal>
            </section>
            </Suspense>

            {/* 5. BOTTOM OF FUNNEL: Closing the deal (Process & Trust) */}
            <Suspense fallback={<div className="min-h-[200px]" />}>
            <div className="relative z-10 bg-slate-50 dark:bg-[#030303]">
              <div className="section-contained">
                <ProcessSection />
              </div>
              <ScrollReveal direction="up" duration={1}>
                <div className="section-contained">
                  <TrustMonologue />
                </div>
              </ScrollReveal>
              <div className="section-contained">
                <CustomerReviews />
              </div>

              {/* 🧠 6. BLOG PREVIEW: Financial Intelligence (Flowchart Placement) */}
              <section className="section-contained py-10 md:py-16 lg:py-24 container mx-auto px-4">
                <div className="flex flex-col items-center justify-center text-center mb-12">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-4 border border-primary/20">
                    <BookOpen className="w-4 h-4" />
                    Pryme Insights
                  </span>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight">Financial Intelligence</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {blogs.slice(0, 3).map((blog, i) => (
                    <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                      <Link to={`/blogs/${blog.slug}`} className="group block">
                        <div className="rounded-3xl overflow-hidden mb-6 aspect-video relative">
                          <img src={blog.img} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" decoding="async" />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                          <Clock className="w-3.5 h-3.5" /> {blog.date}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">{blog.title}</h3>
                      </Link>
                    </ScrollReveal>
                  ))}
                </div>
                <div className="flex justify-center mt-12">
                  <Button asChild variant="outline" className="text-primary border-primary/20 hover:bg-primary/5 gap-2 rounded-full px-6 text-sm">
                    <Link to="/blogs">View All Articles <ArrowRight className="w-3.5 h-3.5" /></Link>
                  </Button>
                </div>
              </section>

              {/* Generic FAQ Accordion */}
              <section className="section-contained py-10 md:py-16 container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-10">
                  <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { q: "What is PRYME?", a: "PRYME is a loan comparison and aggregation platform that helps you find the most competitive loan rates from 15+ trusted banks and NBFCs in minutes." },
                    { q: "Is PRYME a direct lender?", a: "No, PRYME acts as a technology facilitator and connector. We match your profile with our RBI-regulated lending partners." },
                    { q: "Is my data secure?", a: "Yes. In accordance with strict RBI guidelines and PII standards, your session data is encrypted, processed only for bank matching, and permanently deleted after use." }
                  ].map((faq, i) => (
                    <details key={i} className="group border border-border dark:border-white/10 bg-card rounded-2xl p-6 cursor-pointer">
                      <summary className="font-semibold text-foreground flex justify-between items-center list-none outline-none">
                        {faq.q}
                        <span className="transition group-open:rotate-180">
                          <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                        </span>
                      </summary>
                      <p className="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed font-medium text-sm">
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </section>

            </div>
            </Suspense>

          </main>
          
          <Footer />
          <ScrollToTop />
        </div>
      </SmoothScroll>
    </LocalErrorBoundary>
  );
};

export default Index;