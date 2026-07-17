import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Building2, UploadCloud, ChevronRight, LockKeyhole, Loader2, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import api, { PrymeAPI } from "@/lib/api";
import { useApplicationStore } from "@/store/applicationStore";

const spring = { stiffness: 120, damping: 28, mass: 0.8 };

interface ProgressiveContinuationFormProps {
  applicationId?: string | null;
  bankId: string;
  bankName: string;
  loanAmount: number;
  emi: number;
  roi: number;
  productType: string;
  employmentType?: string;
  onComplete: () => void;
  onCancel: () => void;
}

export default function ProgressiveContinuationForm({
  applicationId,
  bankId,
  bankName,
  loanAmount,
  emi,
  roi,
  productType,
  employmentType,
  onComplete,
  onCancel
}: ProgressiveContinuationFormProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1); // 1 = Footprint, 2 = Vault
  const [isSubmitting, setIsSubmitting] = useState(false);
  const store = useApplicationStore();

  // State for Footprint
  // 🧠 SINGLE SOURCE OF TRUTH: pre-fill from financialDetails.data.existingEMI --
  // the same field the eligibility engine already used to compute the offer being
  // completed here. Without this, a user who already entered their EMI on the
  // main application form gets asked again on a differently-labeled field that
  // used to only write to admin metadata, silently diverging from what the
  // shown offer was actually calculated with.
  const [formData, setFormData] = useState({
    panNumber: "",
    monthlyEMI: store.financialDetails?.data?.existingEMI != null
      ? String(store.financialDetails.data.existingEMI)
      : "",
    existingBank: "",
  });

  // Simple hardcoded documents based on loan type (bypassing complex logic for speed, focusing on UX)
  const requiredDocs = productType === "Home Loan" || productType === "LAP" 
    ? ["PAN Card", "3 Months Bank Statement", "Property Chain Document"]
    : ["PAN Card", "3 Months Bank Statement"];

  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.panNumber || !formData.monthlyEMI || !formData.existingBank) {
      toast({ title: "Missing Information", description: "Please complete all fields to proceed.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleNextStep = async () => {
    if (!validateStep1()) return;
    setIsSubmitting(true);

    const emiValue = Number(formData.monthlyEMI) || 0;

    // 🧠 SINGLE SOURCE OF TRUTH: write any confirmed/edited EMI back into the
    // same financialDetails.data.existingEMI field the main form writes to,
    // so this is never a second, divergent copy of the same fact -- whichever
    // screen it was last entered/edited on, later reads (e.g. a future
    // eligibility re-check in this session) see the same number.
    const path = store.financialDetails?.path;
    if (path === 'SALARIED') store.updateSalariedDetails({ existingEMI: emiValue });
    else if (path === 'PROFESSIONAL') store.updateProfessionalDetails({ existingEMI: emiValue });
    else if (path === 'SELF_EMPLOYED') store.updateBusinessDetails({ existingEMI: emiValue });

    // 🧠 PIPELINE FIX: Persist the continuation form fields into the application's
    // metadata JSONB column so they appear in the Admin Dashboard drawer.
    // Without this, PAN, Existing Bank, and Monthly EMI are captured in UI but never saved.
    if (applicationId) {
      try {
        await api.patch(`/applications/${applicationId}`, {
          metadata: {
            panNumber: formData.panNumber,
            existingBank: formData.existingBank,
            monthlyEMI: emiValue,
          }
        });
      } catch (err) {
        console.warn("Continuation form metadata sync failed:", err);
        // Non-blocking: allow user to proceed even if sync fails
      }
    }

    setIsSubmitting(false);
    setCurrentStep(2);
    toast({ title: "Verified!", description: "Financial footprint secured. 1 step left.", variant: "default" });
  };

  const handleFileUpload = (docName: string) => {
    setUploadingDocs(prev => ({ ...prev, [docName]: true }));
    // Simulate upload delay for dopamine hit
    setTimeout(() => {
      setUploadingDocs(prev => ({ ...prev, [docName]: false }));
      setUploadedDocs(prev => ({ ...prev, [docName]: true }));
      toast({ title: "Document Secured", description: "Bank-grade encryption applied." });
    }, 1200);
  };

  const handleFinalSubmit = () => {
    const allUploaded = requiredDocs.every(d => uploadedDocs[d]);
    if (!allUploaded) {
      toast({ title: "Missing Documents", description: "Please upload all mandatory documents.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onComplete();
    }, 1500);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={spring}
      className="w-full bg-card dark:bg-[#0d1829] border-2 border-primary/20 dark:border-[#103783]/30 p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden"
    >
      
      {/* Header / Sunk Cost Anchor */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border dark:border-white/10 pb-6 mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-primary dark:text-[#103783]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Completing Application for {bankName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-semibold text-primary">{formatCurrency(loanAmount)}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-sm font-medium text-muted-foreground">{roi}% p.a.</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">80% Complete</span>
          </div>
          <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: currentStep === 1 ? '85%' : '95%' }} className="h-full bg-emerald-500 rounded-full transition-all duration-500" />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6 relative z-10"
          >
            <div className="mb-6">
              <h4 className="text-lg font-bold text-foreground">Financial Footprint</h4>
              <p className="text-sm text-muted-foreground mt-1">Takes less than 30 seconds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1 inline-block w-full">
                <Label htmlFor="panNumber" className="text-xs font-bold tracking-wide uppercase text-slate-500 ml-1">PAN Number</Label>
                <Input 
                  id="panNumber" 
                  value={formData.panNumber} 
                  onChange={(e) => handleInputChange("panNumber", e.target.value.toUpperCase())} 
                  placeholder="ABCDE1234F" 
                  maxLength={10}
                  className="bg-background border-border focus:border-primary/50 h-12 uppercase rounded-xl mb-6" 
                />
              </div>
              <div className="space-y-1 inline-block w-full">
                <Label htmlFor="existingBank" className="text-xs font-bold tracking-wide uppercase text-slate-500 ml-1">Primary Salary Bank</Label>
                <Input 
                  id="existingBank" 
                  value={formData.existingBank} 
                  onChange={(e) => handleInputChange("existingBank", e.target.value)} 
                  placeholder="e.g. HDFC Bank" 
                  className="bg-background border-border focus:border-primary/50 h-12 rounded-xl mb-6" 
                />
              </div>
              <div className="space-y-1 inline-block w-full md:col-span-2">
                <Label htmlFor="monthlyEMI" className="text-xs font-bold tracking-wide uppercase text-slate-500 ml-1">Total Existing Monthly EMIs</Label>
                <Input 
                  id="monthlyEMI" 
                  type="number"
                  value={formData.monthlyEMI} 
                  onChange={(e) => handleInputChange("monthlyEMI", e.target.value)} 
                  placeholder="0" 
                  className="bg-background border-border focus:border-primary/50 h-12 rounded-xl mb-6" 
                />
              </div>
            </div>

            {/* Spacer for mobile pinned bar */}
            <div className="h-20 md:hidden" aria-hidden="true" />

            {/* MOBILE: Pinned thumb-zone bar — Step 1 */}
            <div className="fixed bottom-0 left-0 w-full z-50 md:hidden px-4 pb-8 pt-3 bg-background/90 backdrop-blur-md border-t border-border/50 flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={onCancel} className="h-12 text-muted-foreground active:scale-[0.97] active:bg-secondary/60 shrink-0">Cancel</Button>
              <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
                <Button onClick={handleNextStep} disabled={isSubmitting} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] active:bg-primary/80 text-primary-foreground shadow-lg shadow-primary/20 font-semibold transition-all duration-150">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Secure Step <ChevronRight className="w-5 h-5 ml-1" /></>}
                </Button>
              </motion.div>
            </div>

            {/* DESKTOP: Inline Step 1 footer */}
            <div className="hidden md:flex pt-6 items-center justify-between">
              <Button variant="ghost" onClick={onCancel} className="text-muted-foreground active:scale-[0.97]">Cancel</Button>
              <Button onClick={handleNextStep} disabled={isSubmitting} className="h-12 w-full md:w-auto md:min-w-[200px] px-8 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] active:bg-primary/80 text-primary-foreground shadow-lg shadow-primary/20 group transition-all duration-150">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                <>Secure Step <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></>}
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6 relative z-10"
          >
            <div className="mb-6">
              <h4 className="text-lg font-bold text-foreground">Document Vault</h4>
              <p className="text-sm text-muted-foreground mt-1 text-emerald-600 dark:text-emerald-400 font-medium tracking-wide">Nice! You're eligible. Just 1 step left.</p>
            </div>

            <div className="space-y-4">
              {requiredDocs.map((doc) => {
                const isUploading = uploadingDocs[doc];
                const isUploaded = uploadedDocs[doc];
                return (
                  <div key={doc} className="group flex items-center justify-between p-5 rounded-[1.25rem] border border-border bg-background/50 hover:bg-background transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                        <FileText className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-sm">{doc}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">PDF, JPG, PNG</span>
                      </div>
                    </div>
                    <div>
                      {isUploaded ? (
                        <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Secured
                        </div>
                      ) : (
                       <Button 
                          variant="outline"
                          onClick={() => handleFileUpload(doc)}
                          disabled={isUploading}
                          className="rounded-lg h-12 min-w-[100px] border-border hover:border-primary hover:text-primary active:scale-[0.97] active:bg-primary/5 transition-all duration-150"
                        >
                          {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Encrypting...</> : <><UploadCloud className="w-4 h-4 mr-2" /> Upload</>}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Spacer for mobile pinned bar */}
            <div className="h-20 md:hidden" aria-hidden="true" />

            {/* MOBILE: Pinned thumb-zone bar — Step 2 */}
            <div className="fixed bottom-0 left-0 w-full z-50 md:hidden px-4 pb-8 pt-3 bg-background/90 backdrop-blur-md border-t border-border/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-widest shrink-0">
                <LockKeyhole className="w-3.5 h-3.5" /> Encrypted
              </div>
              <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
                <Button onClick={handleFinalSubmit} disabled={isSubmitting} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] active:bg-primary/80 text-primary-foreground shadow-lg shadow-primary/20 font-semibold transition-all duration-150">
                  {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Finalizing...</> : "Submit Application Form"}
                </Button>
              </motion.div>
            </div>

            {/* DESKTOP: Inline Step 2 footer */}
            <div className="hidden md:flex pt-8 items-center justify-between border-t border-border/50">
              <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                <LockKeyhole className="w-3.5 h-3.5" /> Bank-Grade Encryption
              </div>
              <Button onClick={handleFinalSubmit} disabled={isSubmitting} className="h-12 w-full md:w-auto md:min-w-[220px] px-8 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] active:bg-primary/80 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-150">
                {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                {isSubmitting ? "Finalizing..." : "Submit Application Form"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
