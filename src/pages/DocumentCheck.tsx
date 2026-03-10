import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import IntelligentDocumentChecklist from "@/components/loan/IntelligentDocumentChecklist";
import LeadCaptureGate, { isLeadCaptured } from "@/components/auth/LeadCaptureGate";

export default function DocumentCheck() {
  const [hasAccess, setHasAccess] = useState(isLeadCaptured());

  return (
    <>
      <Helmet>
        <title>Document Readiness | PRYME</title>
        <meta name="description" content="Verify your documents before applying to ensure fastest processing times." />
      </Helmet>

      {/* Lead Capture Gate — non-bypassable */}
      {!hasAccess && <LeadCaptureGate onCaptured={() => setHasAccess(true)} />}

      <div className="min-h-screen flex flex-col bg-[#050505] selection:bg-primary/20 selection:text-primary relative overflow-hidden">
        
        {/* Core Banking Ambient Background */}
        <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-[#0f462b]/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#2aac64]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none mix-blend-overlay" />
        
        {/* Subtle background photo */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1400&h=900&fit=crop&auto=format&q=80" alt="" className="w-full h-full object-cover opacity-[0.04]" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/90 to-[#050505]" />
        </div>

        <Header />
        
        <main className="flex-1 w-full pt-32 pb-24 relative z-10 px-4 md:px-0">
          <IntelligentDocumentChecklist />
        </main>

        <Footer />
      </div>
    </>
  );
}
