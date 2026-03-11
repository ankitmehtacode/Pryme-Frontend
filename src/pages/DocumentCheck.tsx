import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ShieldCheck, UploadCloud, FileText, CheckCircle2,
  AlertCircle, Loader2, Fingerprint, Landmark
} from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LeadCaptureGate, { isLeadCaptured } from "@/components/auth/LeadCaptureGate";
import IntelligentDocumentChecklist from "@/components/loan/IntelligentDocumentChecklist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { PrymeAPI } from "@/lib/api";

const kycSchema = z.object({
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Must be a valid 10-character PAN format (e.g., ABCDE1234F)"),
  aadharNumber: z.string().regex(/^\d{12}$/, "Must be exactly 12 digits").optional().or(z.literal("")),
});

type KYCData = z.infer<typeof kycSchema>;

export default function DocumentCheck() {
  const [hasAccess, setHasAccess] = useState(isLeadCaptured());
  const [activeTab, setActiveTab] = useState<"EKYC" | "UPLOADS" | "CHECKLIST">("EKYC");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // In production, pull from API/State or route params
  const activeApplicationId = "PRY-9042";

  const { register, handleSubmit, formState: { errors, isSubmitSuccessful } } = useForm<KYCData>({
    resolver: zodResolver(kycSchema),
    mode: "onChange"
  });

  const handleKYCVerification = async (data: KYCData) => {
    setIsVerifying(true);
    try {
      await PrymeAPI.verifyIdentityNumber(activeApplicationId, "PAN", data.panNumber.toUpperCase());
      toast({
        title: "Identity verified",
        description: "PAN verification completed successfully.",
      });
      setTimeout(() => setActiveTab("UPLOADS"), 1000);
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Could not verify the provided ID. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF, JPG, or PNG under 5MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      setTimeout(() => setUploadProgress(60), 400);
      await PrymeAPI.uploadDocument(activeApplicationId, docType, file);
      setUploadProgress(100);
      toast({
        title: "Upload complete",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const tabs = [
    { key: "EKYC" as const, label: "Verify Identity", icon: Fingerprint },
    { key: "UPLOADS" as const, label: "Upload Documents", icon: UploadCloud },
    { key: "CHECKLIST" as const, label: "Checklist", icon: FileText },
  ];

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
                Verify your identity and upload documents for application{" "}
                <span className="font-mono font-medium text-slate-200">{activeApplicationId}</span>
              </p>
            </motion.div>

            {/* Tab Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
              className="bg-[#111] rounded-[2rem] border border-white/[0.06] overflow-hidden"
            >
              {/* Tab Navigation */}
              <div className="flex border-b border-white/[0.04] p-2 bg-[#0a0a0a]">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <motion.button
                      key={tab.key}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${isActive
                          ? "bg-[#111] text-[#2aac64] border border-white/[0.06]"
                          : "text-slate-500 hover:text-slate-300"
                        }`}
                    >
                      <Icon className="w-4 h-4" /> <span className="hidden sm:inline">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="p-6 md:p-8">
                <AnimatePresence mode="wait">

                  {/* Identity Verification */}
                  {activeTab === "EKYC" && (
                    <motion.div key="ekyc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                      <form onSubmit={handleSubmit(handleKYCVerification)} className="max-w-md mx-auto space-y-6">

                        <div className="space-y-3">
                          <Label className="flex items-center justify-between text-slate-300">
                            PAN Number
                            {isSubmitSuccessful && !errors.panNumber && (
                              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              </motion.span>
                            )}
                          </Label>
                          <Input
                            placeholder="ABCDE1234F"
                            className="uppercase font-mono tracking-widest bg-[#0a0a0a] border-white/10 text-white text-lg py-6 focus:ring-[#2aac64]/20 focus:border-[#2aac64]/60 transition-all duration-200 hover:border-white/20"
                            {...register("panNumber")}
                          />
                          {errors.panNumber && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {errors.panNumber.message}
                            </motion.p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label className="flex items-center justify-between text-slate-300">
                            Aadhar Number <span className="text-slate-500 font-normal">(Optional)</span>
                          </Label>
                          <Input
                            placeholder="XXXX XXXX XXXX"
                            className="font-mono tracking-widest bg-[#0a0a0a] border-white/10 text-white text-lg py-6 focus:ring-[#2aac64]/20 focus:border-[#2aac64]/60 transition-all duration-200 hover:border-white/20"
                            {...register("aadharNumber")}
                          />
                          {errors.aadharNumber && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {errors.aadharNumber.message}
                            </motion.p>
                          )}
                        </div>

                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            type="submit"
                            disabled={isVerifying}
                            className="w-full h-12 text-base bg-[#2aac64] hover:bg-[#239b57] text-white transition-colors duration-200"
                          >
                            {isVerifying
                              ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verifying...</>
                              : "Verify Identity"
                            }
                          </Button>
                        </motion.div>

                      </form>
                    </motion.div>
                  )}

                  {/* File Uploads */}
                  {activeTab === "UPLOADS" && (
                    <motion.div key="uploads" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-5">

                      {/* Bank Statement */}
                      <motion.div
                        whileHover={{ borderColor: "rgba(255,255,255,0.1)" }}
                        className="border border-white/[0.06] rounded-xl p-5 flex flex-col md:flex-row items-center gap-6 bg-[#0a0a0a] transition-colors duration-200"
                      >
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0 border border-blue-500/15">
                          <Landmark className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <h4 className="font-semibold text-white">Bank Statement</h4>
                          <p className="text-xs text-slate-500 mt-1">Last 6 months, PDF recommended.</p>
                        </div>
                        <div className="relative w-full md:w-auto">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => handleFileUpload(e, "BANK_STATEMENT")}
                            disabled={isUploading}
                          />
                          <Button type="button" variant="outline" className="w-full md:w-32 pointer-events-none border-white/10 text-slate-300 bg-transparent">
                            {isUploading
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <><UploadCloud className="w-4 h-4 mr-2" /> Select</>
                            }
                          </Button>
                        </div>
                      </motion.div>

                      {/* Salary Slip */}
                      <motion.div
                        whileHover={{ borderColor: "rgba(255,255,255,0.1)" }}
                        className="border border-white/[0.06] rounded-xl p-5 flex flex-col md:flex-row items-center gap-6 bg-[#0a0a0a] transition-colors duration-200"
                      >
                        <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center shrink-0 border border-purple-500/15">
                          <FileText className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <h4 className="font-semibold text-white">Salary Slip or ITR</h4>
                          <p className="text-xs text-slate-500 mt-1">Last 3 months salary slips or latest ITR.</p>
                        </div>
                        <div className="relative w-full md:w-auto">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => handleFileUpload(e, "SALARY_SLIP")}
                            disabled={isUploading}
                          />
                          <Button type="button" variant="outline" className="w-full md:w-32 pointer-events-none border-white/10 text-slate-300 bg-transparent">
                            {isUploading
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <><UploadCloud className="w-4 h-4 mr-2" /> Select</>
                            }
                          </Button>
                        </div>
                      </motion.div>

                      {/* Upload Progress */}
                      {isUploading && (
                        <div className="flex gap-1.5">
                          {[20, 40, 60, 80, 100].map((threshold) => (
                            <motion.div
                              key={threshold}
                              className={`h-1.5 flex-1 rounded-full ${uploadProgress >= threshold ? "bg-[#2aac64]" : "bg-white/5"}`}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ delay: threshold * 0.003, duration: 0.2 }}
                              style={{ transformOrigin: "left" }}
                            />
                          ))}
                        </div>
                      )}

                      <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex gap-3 text-amber-400 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>All files are encrypted during upload. Max 5MB per file — PDF, JPG, or PNG.</p>
                      </div>

                    </motion.div>
                  )}

                  {/* Existing Document Checklist */}
                  {activeTab === "CHECKLIST" && (
                    <motion.div key="checklist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                      <IntelligentDocumentChecklist />
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
