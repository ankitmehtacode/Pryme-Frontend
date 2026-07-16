import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Headset, Mail, Phone, ShieldCheck } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollReveal from "@/components/ui/ScrollReveal";

const GrievanceRedressal = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080d1e] relative overflow-hidden">
      {/* Background glowing decorations for glassmorphic effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-400/10 dark:bg-[#103783]/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/3 w-[250px] h-[250px] bg-teal-400/5 dark:bg-[#1e56c7]/5 rounded-full blur-[80px] pointer-events-none z-0" />

      <Helmet>
        <title>Grievance Redressal | PRYME Consulting</title>
        <meta name="description" content="Reach out to our Grievance Redressal Officer for any concerns or complaints." />
        <meta property="og:title" content="Grievance Redressal | PRYME Consulting" />
        <meta property="og:description" content="Reach out to our Grievance Redressal Officer for any concerns or complaints." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.gopryme.tech/grievance-redressal" />
        <meta property="og:image" content="https://www.gopryme.tech/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://www.gopryme.tech/grievance-redressal" />
      </Helmet>
      
      <Header />
      
      <SmoothScroll>
        <main className="flex-1 pt-20 md:pt-28 pb-16 relative z-10">
          <section className="container mx-auto px-4 max-w-2xl">
            
            {/* Top Header Section */}
            <ScrollReveal direction="up">
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-full bg-blue-50/50 dark:bg-[#103783]/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/40 dark:border-white/5">
                  <Headset className="w-5.5 h-5.5 text-[#103783] dark:text-[#1e56c7]" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#0a1530] dark:text-white tracking-tight" style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif' }}>
                  Grievance Redressal
                </h1>
                <div className="w-12 h-0.5 bg-[#103783]/60 dark:bg-[#1e56c7]/60 mx-auto mt-3 rounded"></div>
                <p className="text-xs md:text-sm text-slate-550 dark:text-slate-400 mt-4 max-w-md mx-auto leading-relaxed">
                  We are committed to addressing your concerns and ensuring a fair and transparent resolution.
                </p>
              </div>
            </ScrollReveal>

            {/* Main Grievance Officer Card (Glassmorphic & Compact) */}
            <ScrollReveal direction="up" delay={0.1}>
              <div className="bg-white/45 dark:bg-[#0c1829]/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-[1.75rem] p-6 md:p-8 shadow-xl dark:shadow-2xl relative max-w-lg mx-auto mb-6 overflow-hidden transition-all duration-300 hover:border-white/80 dark:hover:border-white/15">
                {/* Envelope Icon Header */}
                <div className="relative text-center mb-5">
                  <div className="w-12 h-12 rounded-full bg-[#103783] flex items-center justify-center mx-auto mb-3.5 shadow-md shadow-[#103783]/15">
                    <Mail className="w-5.5 h-5.5 text-white" />
                  </div>
                  <h2 className="text-lg md:text-xl font-extrabold text-[#0a1530] dark:text-white tracking-tight" style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif' }}>
                    Grievance Officer
                  </h2>
                  <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-450 mt-1.5 max-w-sm mx-auto leading-relaxed">
                    For any queries, concerns or complaints, please reach out to our Grievance Officer using the details below.
                  </p>
                </div>

                {/* Divider Line */}
                <div className="h-px bg-slate-200/40 dark:bg-white/5 my-4"></div>

                {/* Grievance Details list */}
                <div className="space-y-4 max-w-xs sm:max-w-sm mx-auto">
                  {/* Email Detail */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-[#103783]/5 dark:bg-[#1e56c7]/10 flex items-center justify-center text-primary dark:text-white shrink-0">
                      <Mail className="w-4 h-4 text-[#103783] dark:text-[#1e56c7]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-0.5">Email</p>
                      <a 
                        href="mailto:aadesh.k@gopryme.in"
                        className="text-xs md:text-sm font-bold text-[#103783] dark:text-[#1e56c7] hover:underline break-all"
                      >
                        aadesh.k@gopryme.in
                      </a>
                    </div>
                  </div>

                  {/* Contact Number Detail */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-[#103783]/5 dark:bg-[#1e56c7]/10 flex items-center justify-center text-primary dark:text-white shrink-0">
                      <Phone className="w-4 h-4 text-[#103783] dark:text-[#1e56c7]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-0.5">Contact Number</p>
                      <a 
                        href="tel:+919243294291"
                        className="text-xs md:text-sm font-bold text-[#0a1530] dark:text-white hover:text-primary transition-colors"
                      >
                        +91 92432 94291
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </ScrollReveal>

            {/* Important Note Box (Glassmorphic & Compact) */}
            <ScrollReveal direction="up" delay={0.2}>
              <div className="bg-[#edf4ff]/20 dark:bg-white/[0.01] backdrop-blur-md border border-[#103783]/5 dark:border-white/5 rounded-2xl p-4 md:p-5 flex items-start gap-3.5 max-w-lg mx-auto mb-8 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-[#103783] dark:text-[#1e56c7] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-[#103783] dark:text-[#1e56c7] mb-0.5">Important Note</h4>
                  <p className="text-[10px] md:text-[11px] text-slate-600 dark:text-slate-450 leading-relaxed font-medium">
                    Pryme is a technology platform that facilitates access to loan products offered by banks and financial institutions. Final decisions regarding loan approval, interest rates, documentation requirements, and disbursal are made solely by the respective lender.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Still Need Help Section */}
            <ScrollReveal direction="up" delay={0.3}>
              <div className="text-center mt-8 pt-6 border-t border-slate-200/40 dark:border-white/5 max-w-lg mx-auto">
                <div className="w-8 h-8 rounded-full bg-blue-50/50 dark:bg-[#103783]/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-2.5 border border-white/20 dark:border-white/5">
                  <Headset className="w-4 h-4 text-[#103783] dark:text-[#1e56c7]" />
                </div>
                <h3 className="text-sm font-bold text-[#0a1530] dark:text-white mb-0.5">
                  Still need help?
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-405 mb-4">
                  Our support team is here for you.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-[#103783]/20 dark:border-white/10 bg-white/30 dark:bg-white/[0.02] backdrop-blur-sm text-[10px] font-bold text-[#103783] dark:text-white hover:bg-[#103783]/5 transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  Go to Contact Us
                </Link>
              </div>
            </ScrollReveal>

          </section>
        </main>
        
        <Footer />
      </SmoothScroll>
    </div>
  );
};

export default GrievanceRedressal;
