import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Search, HelpCircle, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { Link } from "react-router-dom";

import Header from "@/components/layout/Header";
import SmoothScroll from "@/components/SmoothScroll";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { PageShell } from "@/components/layout/PageShell";
import { Surface, Section, Container } from "@/components/layout/Primitives";

// FAQ categories with matched icons/identifiers
const FAQ_CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "general", label: "General" },
  { id: "eligibility", label: "Eligibility & Score" },
  { id: "loans", label: "Loans & Rates" },
  { id: "security", label: "Security & Privacy" },
  { id: "process", label: "Process & Documents" }
];

const FAQS = [
  {
    category: "general",
    q: "What is PRYME?",
    a: "PRYME is a loan discovery and comparison platform that helps you find the most suitable loan offers from multiple trusted banks and financial institutions based on your real eligibility. We make borrowing transparent, simple, and spam-free."
  },
  {
    category: "general",
    q: "Is PRYME a bank or a direct lender?",
    a: "No. PRYME is not a bank or NBFC. We partner with leading lenders to help you compare loan options and apply to the one that best matches your eligibility."
  },
  {
    category: "general",
    q: "How does PRYME work?",
    a: "Answer a few questions about your financial profile. Our eligibility engine compares your information against multiple lenders and shows the loan options you're most likely to qualify for."
  },
  {
    category: "general",
    q: "Is using PRYME free?",
    a: "Yes. PRYME is completely free for borrowers. We never charge you for comparing offers or checking your eligibility."
  },
  {
    category: "eligibility",
    q: "Will checking my eligibility affect my credit score?",
    a: "No. Checking your eligibility through PRYME does not impact your credit score. We perform a soft eligibility assessment before you decide to apply."
  },
  {
    category: "process",
    q: "How many banks and lenders can I compare?",
    a: "PRYME partners with multiple leading banks and NBFCs, allowing you to compare offers from a wide range of trusted lenders through a single platform."
  },
  {
    category: "eligibility",
    q: "Why are my loan offers different from someone else's?",
    a: "Every lender evaluates applicants differently based on factors such as income, employment, credit profile, banking history, and existing obligations."
  },
  {
    category: "security",
    q: "Is my personal data secure?",
    a: "Yes. We use industry-standard security practices to protect your information. We never sell your personal data, and you stay in control of what you choose to share."
  },
  {
    category: "security",
    q: "Will I receive spam calls after using PRYME?",
    a: "No. Our Zero Spam Policy ensures your contact details are only shared with the lender you choose to proceed with."
  },
  {
    category: "loans",
    q: "What types of loans can I compare?",
    a: "Personal Loan, Home Loan, Business Loan, Loan Against Property, Auto Loan, and more as available."
  },
  {
    category: "loans",
    q: "How quickly can I receive loan offers?",
    a: "Most users receive personalized loan matches within a few minutes after completing the eligibility check."
  },
  {
    category: "process",
    q: "What documents will I need?",
    a: "Common documents include PAN, Aadhaar, address proof, income proof, bank statements, and employment/business documents depending on the lender."
  },
  {
    category: "process",
    q: "Can self-employed individuals use PRYME?",
    a: "Yes. PRYME supports salaried individuals, self-employed professionals, business owners, freelancers, and entrepreneurs."
  },
  {
    category: "eligibility",
    q: "Can I apply if my credit score is low?",
    a: "Yes. Some lenders evaluate multiple factors beyond credit score. PRYME helps identify lenders that may still be a good fit."
  },
  {
    category: "general",
    q: "Why should I use PRYME instead of applying directly to a bank?",
    a: "PRYME helps you compare suitable offers first, saving time and improving your chances of approval."
  },
  {
    category: "loans",
    q: "Can I compare interest rates before applying?",
    a: "Yes. Compare available interest rates, fees, and other loan details before deciding where to apply."
  },
  {
    category: "eligibility",
    q: "How does PRYME choose my recommended lenders?",
    a: "Recommendations are based on your eligibility profile and participating lenders' criteria."
  },
  {
    category: "process",
    q: "Can I track my loan application?",
    a: "Yes. You can monitor your application's progress through your PRYME dashboard where supported."
  },
  {
    category: "general",
    q: "Do I need to create an account first?",
    a: "You can begin checking eligibility with minimal information. An account may be required to proceed with an application."
  },
  {
    category: "process",
    q: "Which cities and states does PRYME serve?",
    a: "PRYME aims to serve customers across India, subject to lender availability."
  },
  {
    category: "general",
    q: "How do I contact PRYME support?",
    a: "Reach us through the Contact Us page, email, or customer support channels listed on the website."
  },
  {
    category: "loans",
    q: "Are there any hidden charges?",
    a: "No. PRYME is transparent about costs and does not charge borrowers for comparing loan offers."
  },
  {
    category: "eligibility",
    q: "What is the difference between eligibility and approval?",
    a: "Eligibility is an estimate based on available information. Final approval is determined by the lender after verification."
  },
  {
    category: "security",
    q: "Can I compare loans without sharing my mobile number?",
    a: "Yes. PRYME is designed to let you explore options with minimal information before proceeding."
  },
  {
    category: "general",
    q: "How is PRYME different from other loan comparison platforms?",
    a: "PRYME focuses on transparency, privacy, zero spam, and real eligibility-based loan matching."
  }
];

const Faq = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openIndexes, setOpenIndexes] = useState<Record<number, boolean>>({});

  // Reset scroll position to top of viewport on mount
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  // Toggle single accordion state
  const toggleAccordion = (index: number) => {
    setOpenIndexes((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Filter FAQs based on search and selected category
  const filteredFaqs = useMemo(() => {
    return FAQS.map((faq, originalIndex) => ({ ...faq, originalIndex }))
      .filter((faq) => {
        const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
        const matchesSearch =
          faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.a.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#050505] transition-colors duration-300">
      <Helmet>
        <title>Frequently Asked Questions | PRYME</title>
        <meta name="description" content="Find answers to all your queries regarding loan eligibility, bank comparison, data security, and applications on PRYME." />
      </Helmet>

      <SmoothScroll>
        <PageShell>
          <Header />

          <main className="flex-1 pt-20 md:pt-24">
            
            {/* MAIN CONTENT LAYER */}
            <Surface variant="default" className="relative pb-24 border-t border-slate-200/60 dark:border-slate-800/80">
              {/* Technical background grid */}
              <div className="absolute inset-0 opacity-40 pointer-events-none bg-[linear-gradient(to_right,rgba(16,55,131,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,55,131,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

              <Container size="wide" className="relative z-10 pt-8 md:pt-10">
                {/* Silicon Valley Grade Left-Aligned Header */}
                <div className="mb-8 md:mb-10 max-w-3xl">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider mb-3 border border-primary/20">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Help Center
                  </span>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                    Frequently Asked <span className="text-primary">Questions</span>
                  </h1>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    Got questions? We've got answers. Compare loan options and platforms.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* SIDEBAR / TOP BAR: Search + Categories */}
                  <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
                    {/* Search Panel */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Search FAQs</h3>
                      <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden transition focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 ml-3.5 shrink-0" />
                        <input
                          type="text"
                          placeholder="Search keywords..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full py-2.5 px-3 bg-transparent text-foreground placeholder-slate-400 focus:outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Desktop Sidebar Categories */}
                    <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 font-bold">Categories</h3>
                      <div className="space-y-1.5">
                        {FAQ_CATEGORIES.map((cat) => {
                          const isActive = selectedCategory === cat.id;
                          const count = cat.id === "all"
                            ? FAQS.length
                            : FAQS.filter((f) => f.category === cat.id).length;

                          return (
                            <button
                              key={cat.id}
                              onClick={() => {
                                setSelectedCategory(cat.id);
                                setOpenIndexes({});
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                                isActive
                                  ? "bg-primary border-primary text-white shadow-sm shadow-primary/10"
                                  : "bg-transparent border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                              }`}
                            >
                              <span>{cat.label}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                              }`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mobile Horizontal Tags Carousel */}
                    <div className="block lg:hidden overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
                      <div className="flex gap-2">
                        {FAQ_CATEGORIES.map((cat) => {
                          const isActive = selectedCategory === cat.id;
                          const count = cat.id === "all"
                            ? FAQS.length
                            : FAQS.filter((f) => f.category === cat.id).length;

                          return (
                            <button
                              key={cat.id}
                              onClick={() => {
                                setSelectedCategory(cat.id);
                                setOpenIndexes({});
                              }}
                              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                                isActive
                                  ? "bg-primary border-primary text-white shadow-sm"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {cat.label} ({count})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ACCORDION CONTENT */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-foreground">
                        {FAQ_CATEGORIES.find((c) => c.id === selectedCategory)?.label || "Questions"}
                      </h2>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        Showing {filteredFaqs.length} results
                      </p>
                    </div>

                    <div className="space-y-3 min-h-[400px]">
                      <AnimatePresence mode="popLayout">
                        {filteredFaqs.length > 0 ? (
                          filteredFaqs.map((faq) => {
                            const isOpen = !!openIndexes[faq.originalIndex];
                            return (
                              <motion.div
                                key={faq.originalIndex}
                                layout="position"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                                className={`group border rounded-2xl p-5 md:p-6 transition-all duration-300 ${
                                  isOpen
                                    ? "border-primary/30 dark:border-primary/20 bg-primary/[0.01] dark:bg-primary/[0.02] shadow-sm shadow-primary/[0.01]"
                                    : "border-slate-200/60 dark:border-white/10 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-slate-900"
                                }`}
                              >
                                <button
                                  onClick={() => toggleAccordion(faq.originalIndex)}
                                  className="w-full text-left font-semibold text-foreground flex justify-between items-start gap-4 outline-none"
                                >
                                  <span className="text-sm md:text-base leading-snug group-hover:text-primary transition-colors duration-200">
                                    {faq.q}
                                  </span>
                                  <span className={`shrink-0 mt-0.5 p-1 rounded-lg transition-all duration-300 ${
                                    isOpen ? "bg-primary/10 text-primary rotate-180" : "text-slate-400 dark:text-slate-600"
                                  }`}>
                                    <svg fill="none" height="16" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="16">
                                      <path d="M6 9l6 6 6-6"></path>
                                    </svg>
                                  </span>
                                </button>

                                <AnimatePresence initial={false}>
                                  {isOpen && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2, ease: "easeInOut" }}
                                      className="overflow-hidden"
                                    >
                                      <p className="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed text-sm border-t border-slate-100 dark:border-slate-800/80 pt-4 font-medium">
                                        {faq.a}
                                      </p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            );
                          })
                        ) : (
                          /* EMPTY STATE */
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-16 border-2 border-dashed border-slate-200/60 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/40"
                          >
                            <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                            <h3 className="text-base font-bold text-foreground mb-2">No matching FAQs found</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6">
                              Try checking other categories or searching for different keywords.
                            </p>
                            <button
                              onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("all");
                              }}
                              className="px-4 py-2 bg-primary text-white font-semibold rounded-xl text-xs hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
                            >
                              Reset All Filters
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                </div>
              </Container>
            </Surface>

            {/* CALL TO ACTION SECTION */}
            <Surface variant="inverse" className="border-t border-slate-200/10 dark:border-slate-800/40 bg-slate-900 dark:bg-[#030303]">
              <Section spacing="xl" className="relative z-10 overflow-hidden">
                <Container size="expanded">
                  <div className="relative p-8 md:p-12 lg:p-16 rounded-[2.5rem] bg-gradient-to-br from-slate-950 to-slate-900 dark:from-[#050914] dark:to-[#03040a] border border-white/5 shadow-2xl overflow-hidden text-center max-w-5xl mx-auto">
                    {/* Abstract Grid background */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
                    
                    <div className="relative z-10 max-w-2xl mx-auto">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-semibold uppercase tracking-widest mb-6">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Still have questions?
                      </span>
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
                        We're here to help you get the best deal.
                      </h2>
                      <p className="text-slate-400 text-sm md:text-base mb-10 leading-relaxed font-medium">
                        If you need personalized guidance, want to understand lender specifications, or need help matching offers, our credit specialists are available to consult.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                          to="/contact"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-all shadow-md shadow-white/5"
                        >
                          <Mail className="w-4 h-4" />
                          Contact Support
                        </Link>
                        <Link
                          to="/apply"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/25 border border-primary/20"
                        >
                          Check My Loan Options
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
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
    </div>
  );
};

export default Faq;
