import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LeadCaptureGate, { isLeadCaptured } from "@/components/auth/LeadCaptureGate";
import IntelligentDocumentChecklist from "@/components/loan/IntelligentDocumentChecklist";

export default function DocumentCheck() {
  const [hasAccess, setHasAccess] = useState(isLeadCaptured());

  return (
    <>
      <Helmet>
        <title>Document Vault | PRYME Consulting</title>
        <meta name="description" content="Securely verify your identity and upload documents for fastest loan processing." />
      </Helmet>

      {!hasAccess && <LeadCaptureGate onCaptured={() => setHasAccess(true)} />}

      <div className="min-h-screen flex flex-col bg-[#050505] selection:bg-primary/20 selection:text-primary relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-[#0f462b]/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#2aac64]/5 blur-[120px] rounded-full pointer-events-none" />

        <Header />

        <main className="flex-1 w-full pt-24 pb-20 relative z-10 px-4">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="text-center space-y-2"
            >
              <div className="w-12 h-12 bg-[#2aac64]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#2aac64]/20">
                <ShieldCheck className="w-6 h-6 text-[#2aac64]" />
              </div>
              <h1 className="text-3xl font-semibold text-white tracking-tight">Document Vault</h1>
              <p className="text-slate-400">
                Select your loan type, tell us about yourself, and upload the required documents.
              </p>
            </motion.div>

            {/* Document Checklist Engine */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
            >
              <IntelligentDocumentChecklist />
            </motion.div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
