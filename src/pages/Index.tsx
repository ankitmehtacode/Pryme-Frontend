import React, { useRef, useEffect, useState } from "react";
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

import Header from "@/components/layout/Header";
import SmoothScroll from "@/components/SmoothScroll";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { PageShell } from "@/components/layout/PageShell";
import { Surface, Section, Container } from "@/components/layout/Primitives";
import { SectionBackground } from "@/components/layout/SectionBackground";
import rewardsBgImg from "@/assets/rewards-bg.png";

// Above-the-fold components (eager)
import HeroSection from "@/components/home/HeroSection";
import ProductSelectorGrid from "@/components/home/ProductSelectorGrid";
import PartnerBankMarquee from "@/components/home/PartnerBankMarquee";

// Below-the-fold components
import ProcessSection from "@/components/home/ProcessSection";
import TrustMonologue from "@/components/home/TrustMonologue";
import CustomerReviews from "@/components/home/CustomerReviews";

import { BookOpen, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { blogs } from "@/data/blogs";

// Loan Utility Components
import EMICalculator from "@/components/loan/EMICalculator";
import PrepaymentCalculator from "@/components/loan/PrepaymentCalculator";
import OffersRewards from "@/components/loan/OffersRewards";
import CibilTips from "@/components/loan/CibilTips";

// 🧠 1. NATIVE ERROR BOUNDARY: Localized crash protection. 
class LocalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any, errorInfo: any }> {
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
  const calculatorRef = useRef<HTMLDivElement>(null);
  const [calculatorHeight, setCalculatorHeight] = useState<number | undefined>(undefined);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [location.hash, location.pathname]);

  useEffect(() => {
    if (!calculatorRef.current) return;

    const updateHeight = () => {
      if (calculatorRef.current) {
        if (window.innerWidth >= 1280) {
          setCalculatorHeight(calculatorRef.current.offsetHeight);
        } else {
          setCalculatorHeight(undefined);
        }
      }
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(calculatorRef.current);

    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

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
        <meta property="og:url" content="https://www.gopryme.tech" />
        <meta property="og:site_name" content="PRYME" />
        <meta property="og:image" content="https://www.gopryme.tech/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PRYME - Compare & Apply for Loans | Best Rates from 15+ Banks" />
        <meta name="twitter:description" content="Compare loan offers from 15+ banks. Quick approval, transparent process." />
        <meta name="twitter:image" content="https://www.gopryme.tech/og-image.png" />
        <link rel="canonical" href="https://www.gopryme.tech" />
      </Helmet>

      {/* Safe Smooth Scrolling wrapper */}
      <SmoothScroll>
        <PageShell className="bg-slate-50 dark:bg-[#080d1e] selection:bg-primary/20 selection:text-primary">

          <Header />

          <main className="flex-1 w-full pt-14 md:pt-16">

            {/* 1. TOP OF FUNNEL (Hero, Products, Partners) */}
            <Surface variant="default">
              <div className="flex flex-col justify-start w-full relative gap-1.5 md:gap-2 pb-0.5">
                <SectionBackground variant="hero" />

                {/* 🧠 1. HERO SECTION: The Billboard */}
                <Section bleed spacing="xs" className="relative z-30 pt-0 pb-0" style={{ paddingBlockStart: 0, paddingBlockEnd: 0, overflow: "visible" }}>
                  <Container size="expanded">
                    <HeroSection />
                  </Container>
                </Section>

                {/* 🧠 2. THE DYNAMIC PRODUCT GRID */}
                <ScrollReveal direction="up" duration={0.8} className="hidden md:block w-full">
                  <Section spacing="xs" id="products" className="relative z-20 pt-0 pb-0" style={{ paddingBlockStart: 0 }}>
                    <Container size="expanded">
                      <ProductSelectorGrid />
                    </Container>
                  </Section>
                </ScrollReveal>

                {/* 🧠 3. STATIC PARTNERSHIP BAR — visible on all breakpoints */}
                <Section id="partners" spacing="xs" className="relative z-20 pt-8 pb-0 md:pt-10 md:pb-0 lg:pt-10 lg:pb-0 w-full">
                  <Container size="expanded">
                    <PartnerBankMarquee />
                  </Container>
                </Section>
              </div>
            </Surface>

            {/* 🧠 4. PAISABAZAAR TERMINAL: EMI & Eligibility Split */}
              <Surface variant="muted">
                <Section spacing="md" className="relative z-10" style={{ paddingBlockStart: "clamp(12px, 2vw, 24px)", paddingBlockEnd: "clamp(20px, 2.5vw, 36px)" }}>
                  {/* Gradient section divider */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/30 dark:via-white/10 to-transparent" />


                  <ScrollReveal direction="up" duration={1} stagger={0.15}>
                    <Container size="expanded" className="relative z-10">
                      <div className="text-center mb-4 md:mb-8 lg:mb-10">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-3 border border-primary/20">
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          Financial Planning
                        </span>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-foreground mb-2 md:mb-3 tracking-tighter">
                          Calculate & Evaluate
                        </h2>
                      </div>

                      {/* Full Width Stack: EMI & Prepayment (Side-by-Side) -> Rewards */}
                      <div className="flex flex-col gap-2 md:gap-3 lg:gap-4 items-start w-full">

                        {/* Grid layout for Calculators side by side on large screens */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 md:gap-14 lg:gap-8 w-full items-start">
                          {/* EMI Calculator */}
                          <div className="w-full flex">
                            <EMICalculator loanAmount={500000} showTerminology={true} className="w-full" />
                          </div>

                          {/* Prepayment Calculator */}
                          <div className="w-full flex">
                            <PrepaymentCalculator className="w-full" />
                          </div>
                        </div>

                        {/* Grid layout for Reward Calculator & Cibil Tips side by side */}
                        <div className="grid grid-cols-1 xl:grid-cols-10 gap-6 w-full items-start mt-4">
                          {/* Rewards Calculator (70%) */}
                          <div className="xl:col-span-7 w-full" ref={calculatorRef}>
                            <div
                              className="w-full relative rounded-[2rem] border border-slate-200/80 dark:border-[#103783]/20 overflow-hidden shadow-xl py-8 md:py-10 px-6 md:px-12 bg-[#edf4ff] dark:bg-[#0b1021]"
                            >
                              {/* Background Image Layer with 75% opacity */}
                              <div
                                className="absolute inset-0 bg-center bg-no-repeat bg-cover pointer-events-none opacity-75"
                                style={{
                                  backgroundImage: `url(${rewardsBgImg})`,
                                  backgroundSize: "cover"
                                }}
                              />
                              <div className="max-w-3xl mx-auto relative z-10 w-full">
                                <OffersRewards />
                              </div>
                            </div>
                          </div>

                          {/* CIBIL Score Improvement Tips (30%) */}
                          <div className="xl:col-span-3 w-full">
                            <CibilTips calculatorHeight={calculatorHeight} />
                          </div>
                        </div>

                      </div>
                    </Container>
                  </ScrollReveal>
                </Section>
              </Surface>

            {/* 5. BOTTOM OF FUNNEL: Closing the deal (Process & Trust) */}
              <Surface variant="inverse">
                <Section id="process" spacing="lg" style={{ paddingBlockStart: "clamp(24px, 3vw, 48px)", paddingBlockEnd: "clamp(20px, 2.5vw, 36px)" }}>
                  <Container size="expanded"><ProcessSection /></Container>
                </Section>
              </Surface>

              <ScrollReveal direction="up" duration={1}>
                <Surface className="relative overflow-hidden bg-slate-50 dark:bg-slate-900 border-y border-slate-200/50 dark:border-white/5">
                  {/* Background Trust Image */}
                  <div className="absolute inset-0 z-0 pointer-events-none">
                    <img
                      src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop&auto=format&q=80"
                      alt=""
                      className="w-full h-full object-cover opacity-[0.03] dark:opacity-[0.05]"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white/80 to-slate-50/50 dark:from-slate-900/80 dark:via-slate-900/90 dark:to-slate-900/80" />
                  </div>


                  <Section spacing="md" className="relative z-10" style={{ paddingBlockStart: "clamp(24px, 3vw, 40px)", paddingBlockEnd: "clamp(24px, 3vw, 40px)" }}>
                    <Container size="expanded">
                      <TrustMonologue />
                    </Container>
                  </Section>
                </Surface>
              </ScrollReveal>

              <Surface variant="inverse">
                <Section spacing="lg" style={{ paddingBlockStart: "clamp(32px, 4vw, 56px)" }}>
                  <Container size="expanded"><CustomerReviews /></Container>
                </Section>
              </Surface>

            {/* 🧠 6. BLOG PREVIEW & FAQ */}
            <Surface variant="default">
              <Section spacing="xl">
                <Container size="expanded">
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
                  <div className="flex justify-center mt-12 mb-8 border-b border-slate-100 dark:border-slate-800/80 pb-8">
                    <Button asChild variant="outline" className="text-primary border-primary/20 hover:bg-primary/5 gap-2 rounded-full px-6 text-sm">
                      <Link to="/blogs">View All Articles <ArrowRight className="w-3.5 h-3.5" /></Link>
                    </Button>
                  </div>

                  {/* Generic FAQ Accordion */}
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                      <h2 className="text-2xl md:text-3xl font-semibold text-foreground">Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-4">
                      {[
                        { q: "What is PRYME?", a: "PRYME is a loan discovery and comparison platform that helps you find the most suitable loan offers from multiple trusted banks and financial institutions based on your real eligibility. We make borrowing transparent, simple, and spam-free." },
                        { q: "Is PRYME a bank or a direct lender?", a: "No. PRYME is not a bank or NBFC. We partner with leading lenders to help you compare loan options and apply to the one that best matches your eligibility." },
                        { q: "How does PRYME work?", a: "Answer a few questions about your financial profile. Our eligibility engine compares your information against multiple lenders and shows the loan options you're most likely to qualify for." },
                        { q: "Is using PRYME free?", a: "Yes. PRYME is completely free for borrowers. We never charge you for comparing offers or checking your eligibility." },
                        { q: "Will checking my eligibility affect my credit score?", a: "No. Checking your eligibility through PRYME does not impact your credit score. We perform a soft eligibility assessment before you decide to apply." }
                      ].map((faq, i) => (
                        <details key={i} className="group border border-border dark:border-white/10 bg-card rounded-2xl p-6 cursor-pointer">
                          <summary className="font-semibold text-foreground flex justify-between items-center list-none outline-none">
                            {faq.q}
                            <span className="transition group-open:rotate-180">
                              <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                          </summary>
                          <p className="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed font-medium text-sm">
                            {faq.a}
                          </p>
                        </details>
                      ))}
                    </div>

                    <div className="flex justify-center mt-10">
                      <Button asChild variant="outline" className="text-primary border-primary/20 hover:bg-primary/5 gap-2 rounded-full px-6 text-sm">
                        <Link to="/faq">View More FAQs <ArrowRight className="w-3.5 h-3.5" /></Link>
                      </Button>
                    </div>
                  </div>
                </Container>
              </Section>
            </Surface>
          </main>

          <Footer />
          <ScrollToTop />
        </PageShell>
      </SmoothScroll>
    </LocalErrorBoundary>
  );
};

export default Index;
