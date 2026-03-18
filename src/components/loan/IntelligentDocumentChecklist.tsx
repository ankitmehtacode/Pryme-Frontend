import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, ShieldCheck, ChevronLeft, Briefcase,
  Building2, Home, Landmark, User, FileCheck, Stethoscope, ArrowRight,
  UploadCloud, X, Loader2, IndianRupee, CalendarDays, CreditCard, Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type ProductType,
  type EmploymentType,
  type DocumentItem,
  type DocumentGroup,
  getDocumentsForLoanType,
  groupDocumentsByCategory,
} from "@/lib/documentData";

/* ──────────────────────────────────────────────
   Occupation sub-types (unchanged)
   ────────────────────────────────────────────── */

type SpecificOccupation =
  | "Private Sector" | "Government Employee"
  | "CA" | "CS" | "Doctor" | "Lawyer" | "Architect"
  | "ITR Based (Normal Income)" | "GST Based" | "Banking Program" | "Cash Flow Program";

/* ──────────────────────────────────────────────
   Icons per document category
   ────────────────────────────────────────────── */

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Identity Documents": User,
  "Income Documents": Landmark,
  "Financial Documents": Wallet,
  "Property Documents": Building2,
  "Business Proof": Briefcase,
  "Additional Documents": FileCheck,
};

/* ──────────────────────────────────────────────
   Animations
   ────────────────────────────────────────────── */

const cardVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    y: direction > 0 ? 24 : -24,
    scale: 0.97,
  }),
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 28 },
  },
  exit: (direction: number) => ({
    opacity: 0,
    y: direction > 0 ? -24 : 24,
    scale: 0.97,
    transition: { duration: 0.18 },
  }),
};

/* ──────────────────────────────────────────────
   File Uploader
   ────────────────────────────────────────────── */

const FileUploader = ({
  doc,
  file,
  onUpload,
}: {
  doc: DocumentItem;
  file: File | null;
  onUpload: (file: File | null) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const processFile = (selectedFile: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(selectedFile.type)) {
      alert("Unsupported format. Please upload a PDF, JPG, or PNG file.");
      return;
    }
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      onUpload(selectedFile);
    }, 1200);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-xl border transition-all duration-300 p-4 group",
        isDragging
          ? "bg-emerald-500/10 border-emerald-500 border-dashed"
          : file
            ? "bg-emerald-500/8 border-emerald-500/30"
            : "bg-white/[0.03] border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.06] border-dashed"
      )}
    >
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
        }}
      />

      {isUploading ? (
        <div className="flex flex-col items-center justify-center py-3 space-y-2.5">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          <div className="w-full max-w-[180px] h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
          <p className="text-[11px] font-medium tracking-wide text-emerald-500/80 uppercase">Verifying Document...</p>
        </div>
      ) : file ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
              <FileCheck className="w-[18px] h-[18px] text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-white text-[15px] leading-snug truncate">{doc.label}</p>
              <p className="text-xs text-emerald-500/90 font-medium flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" /> Uploaded • {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onUpload(null); }}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-500 hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-between gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center bg-white/[0.06] group-hover:bg-emerald-500/15 transition-all shrink-0",
              isDragging && "bg-emerald-500/15 scale-105"
            )}>
              <UploadCloud className={cn(
                "w-[18px] h-[18px] text-slate-500 group-hover:text-emerald-500 transition-colors",
                isDragging && "text-emerald-500"
              )} />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-200 text-[15px] leading-snug">
                {doc.label}
                {doc.optional && <span className="text-slate-500 text-xs ml-1.5 font-normal">(optional)</span>}
              </p>
              <p className="text-[13px] text-slate-500 mt-0.5">
                Drop file or <span className="text-emerald-500 font-medium">browse</span>
              </p>
            </div>
          </div>
          <span className="text-[10px] font-medium tracking-wider text-slate-500 bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded uppercase shrink-0">
            PDF / JPG / PNG
          </span>
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */

export default function IntelligentDocumentChecklist() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [docCategoryIndex, setDocCategoryIndex] = useState(0);

  const [product, setProduct] = useState<ProductType | null>(null);
  const [loanAmount, setLoanAmount] = useState<string>("");
  const [tenure, setTenure] = useState<string>("");
  const [empCategory, setEmpCategory] = useState<EmploymentType | null>(null);
  const [occupation, setOccupation] = useState<SpecificOccupation | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});

  /* ── Compute documents from centralized data layer ── */
  const currentDocs = useMemo(() => {
    if (!product) return [];
    // Business Loan doesn't need employment type
    if (product === "Business Loan") return getDocumentsForLoanType(product, "SENP");
    if (!empCategory) return [];
    return getDocumentsForLoanType(product, empCategory);
  }, [product, empCategory]);

  const docCategories: DocumentGroup[] = useMemo(() => {
    if (currentDocs.length === 0) return [];
    return groupDocumentsByCategory(currentDocs);
  }, [currentDocs]);

  const nextStep = () => {
    setDirection(1);
    if (step === 3 && docCategoryIndex < docCategories.length - 1) {
      setDocCategoryIndex((prev) => prev + 1);
      return;
    }
    // Business Loan: skip employment step (step 2), jump to docs
    if (step === 1 && product === "Business Loan") {
      setStep(3);
      setDocCategoryIndex(0);
      return;
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    if (step === 3 && docCategoryIndex > 0) {
      setDocCategoryIndex((prev) => prev - 1);
      return;
    }
    // Business Loan: going back from docs → skip employment step
    if (step === 3 && product === "Business Loan") {
      setStep(1);
      return;
    }
    setStep((prev) => prev - 1);
  };

  const isProductValid = product !== null;
  const isLoanValid = loanAmount.replace(/\D/g, "").length > 4 && tenure !== "" && parseInt(tenure) > 0;
  const isProfileValid = product === "Business Loan"
    ? true
    : empCategory !== null && occupation !== null;

  const isCurrentCategoryValid = useMemo(() => {
    if (step !== 3 || docCategories.length === 0) return false;
    const currentCatDocs = docCategories[docCategoryIndex].docs;
    // Only required (non-optional) docs must be uploaded
    return currentCatDocs
      .filter((d) => !d.optional)
      .every((d) => uploadedFiles[d.id] != null);
  }, [step, docCategories, docCategoryIndex, uploadedFiles]);

  const handleProceed = () => {
    navigate("/apply", { state: { product, loanAmount, tenure, occupation } });
  };

  /* Reusable selection card */
  const SelectionCard = ({
    active, onClick, icon: Icon, title, subtitle,
  }: {
    active: boolean; onClick: () => void; icon: React.ElementType; title: string; subtitle?: string;
  }) => (
    <div
      onClick={onClick}
      className={cn(
        "relative p-5 rounded-xl cursor-pointer transition-all duration-200 border flex items-center gap-4 w-full",
        active
          ? "bg-emerald-500/10 border-emerald-500/60 ring-1 ring-emerald-500/30"
          : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all",
        active ? "bg-emerald-500 text-white" : "bg-white/[0.06] text-slate-400"
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={cn("font-semibold text-lg", active ? "text-white" : "text-slate-200")}>{title}</h4>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5 leading-snug">{subtitle}</p>}
      </div>
      <div className={cn(
        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
        active ? "bg-emerald-500 border-emerald-500" : "border-white/20"
      )}>
        {active && <CheckCircle2 className="w-4 h-4 text-white" />}
      </div>
    </div>
  );

  /* ── Step labels for the progress tracker ── */
  const stepLabels = product === "Business Loan"
    ? ["Loan Type", "Amount", "Documents"]
    : ["Loan Type", "Amount", "Profile", "Documents"];
  const totalSteps = stepLabels.length;

  /* Map current step to progress dot index */
  const progressIndex = product === "Business Loan" && step === 3 ? 2 : step;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col pt-4 pb-8 px-4 relative" style={{ minHeight: 'calc(100vh - 200px)' }}>

      {/* Social Proof */}
      <div className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-[10px] text-slate-400 font-medium">
          <span className="text-emerald-400 font-semibold">2,400+</span> loans approved this month
        </p>
      </div>

      {/* Progress Tracker */}
      <div className="w-full max-w-sm mx-auto flex justify-between items-center mb-6 relative z-20">
        {stepLabels.map((label, s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-500",
                progressIndex >= s
                  ? "bg-emerald-500 scale-125"
                  : "bg-white/10 border border-white/20"
              )} />
              <span className={cn(
                "text-[10px] font-medium tracking-wide uppercase transition-colors duration-500 hidden sm:block",
                progressIndex >= s ? "text-emerald-500" : "text-slate-600"
              )}>{label}</span>
            </div>
            {s < totalSteps - 1 && (
              <div className={cn(
                "h-px w-full mx-2 transition-colors duration-500 mb-5 sm:mb-0",
                progressIndex > s ? "bg-emerald-500/60" : "bg-white/10"
              )} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>

        {/* ── STEP 0 · Loan Type ── */}
        {step === 0 && (
          <motion.div
            key="step-0" custom={direction} variants={cardVariants}
            initial="initial" animate="animate" exit="exit"
            className="w-full bg-[#0b0b0e]/90 backdrop-blur-xl border border-white/10 p-5 md:p-8 rounded-2xl shadow-xl relative overflow-hidden flex flex-col max-h-[calc(100vh-200px)]"
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/8 blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />

            <div className="text-center mb-5 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Step 1 of {totalSteps}</span>
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">What type of loan do you need?</h2>
              <p className="text-[15px] text-slate-400">Select the product that best fits your requirement.</p>
            </div>

            <div className="space-y-3 mb-5 relative z-10 flex-1 overflow-y-auto custom-scrollbar">
              <SelectionCard
                active={product === "Home Loan"}
                onClick={() => { setProduct("Home Loan"); setEmpCategory(null); setOccupation(null); setUploadedFiles({}); setDocCategoryIndex(0); }}
                icon={Home} title="Home Loan"
                subtitle="Purchase, construction, extension, or balance transfer"
              />
              <SelectionCard
                active={product === "LAP"}
                onClick={() => { setProduct("LAP"); setEmpCategory(null); setOccupation(null); setUploadedFiles({}); setDocCategoryIndex(0); }}
                icon={Building2} title="Loan Against Property"
                subtitle="Leverage your commercial or residential property"
              />
              <SelectionCard
                active={product === "Business Loan"}
                onClick={() => { setProduct("Business Loan"); setEmpCategory("SENP"); setOccupation(null); setUploadedFiles({}); setDocCategoryIndex(0); }}
                icon={Briefcase} title="Business Loan"
                subtitle="Working capital, expansion, equipment, or invoice financing"
              />
              <SelectionCard
                active={product === "Personal Loan"}
                onClick={() => { setProduct("Personal Loan"); setEmpCategory(null); setOccupation(null); setUploadedFiles({}); setDocCategoryIndex(0); }}
                icon={CreditCard} title="Personal Loan"
                subtitle="Medical, travel, wedding, or any personal requirement"
              />
            </div>

            <div className="flex justify-end relative z-10">
              <Button
                onClick={nextStep} disabled={!isProductValid}
                className="group px-8 py-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all font-semibold text-[15px] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
              >
                Continue <ArrowRight className="w-5 h-5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 1 · Loan Amount & Tenure ── */}
        {step === 1 && (
          <motion.div
            key="step-1" custom={direction} variants={cardVariants}
            initial="initial" animate="animate" exit="exit"
            className="w-full bg-[#0b0b0e]/90 backdrop-blur-xl border border-white/10 p-5 md:p-8 rounded-2xl shadow-xl relative overflow-hidden flex flex-col max-h-[calc(100vh-200px)]"
          >
            <div className="flex items-center justify-between mb-5 relative z-10 shrink-0">
              <button onClick={prevStep} className="p-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-slate-400 hover:text-white border border-white/10">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center flex-1">
                <span className="inline-flex items-center gap-1.5 mb-2">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Step 2 of {totalSteps}</span>
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">How much do you need?</h2>
              </div>
              <div className="w-10" />
            </div>

            <div className="grid md:grid-cols-2 gap-5 mb-5 relative z-10 flex-1">
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-slate-400">Loan Amount (₹)</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-medium text-slate-500 group-focus-within:text-emerald-500 transition-colors">₹</span>
                  <Input
                    type="text"
                    value={loanAmount}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, "");
                      setLoanAmount(num ? new Intl.NumberFormat("en-IN").format(parseInt(num)) : "");
                    }}
                    placeholder="50,00,000"
                    className="h-16 pl-12 pr-5 text-2xl font-semibold bg-white/[0.03] border-white/10 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl text-white placeholder:text-slate-600 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-slate-400">Tenure (Years)</label>
                <div className="relative group">
                  <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    placeholder="15"
                    max="30"
                    min="1"
                    className="h-16 pl-12 pr-5 text-2xl font-semibold bg-white/[0.03] border-white/10 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl text-white placeholder:text-slate-600 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end relative z-10">
              <Button
                onClick={nextStep} disabled={!isLoanValid}
                className="group px-8 py-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all font-semibold text-[15px] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
              >
                Continue <ArrowRight className="w-5 h-5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2 · Employment Profile (skipped for Business Loan) ── */}
        {step === 2 && product !== "Business Loan" && (
          <motion.div
            key="step-2" custom={direction} variants={cardVariants}
            initial="initial" animate="animate" exit="exit"
            className="w-full bg-[#0b0b0e]/90 backdrop-blur-xl border border-white/10 p-5 md:p-8 rounded-2xl shadow-xl relative overflow-hidden flex flex-col max-h-[calc(100vh-200px)]"
          >
            <div className="flex items-center justify-between mb-5 relative z-10 shrink-0">
              <button onClick={prevStep} className="p-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-slate-400 hover:text-white border border-white/10">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center flex-1">
                <span className="inline-flex items-center gap-1.5 mb-2">
                  <User className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Step 3 of {totalSteps}</span>
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Tell us about yourself</h2>
              </div>
              <div className="w-10" />
            </div>

            <div className="space-y-4 mb-5 relative z-10 flex-1 overflow-y-auto custom-scrollbar">
              <h3 className="text-[13px] font-medium text-slate-400 mb-2">Employment Type</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {([
                  { key: "Salaried" as EmploymentType, icon: Briefcase, label: "Salaried" },
                  { key: "SEP" as EmploymentType, icon: Stethoscope, label: "Professional" },
                  { key: "SENP" as EmploymentType, icon: Landmark, label: "Business" },
                ] as const).map(({ key, icon: EmpIcon, label }) => (
                  <div
                    key={key}
                    onClick={() => { setEmpCategory(key); setOccupation(null); }}
                    className={cn(
                      "p-4 rounded-xl border text-center cursor-pointer transition-all duration-200",
                      empCategory === key
                        ? "bg-emerald-500/15 border-emerald-500/60 text-white"
                        : "bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/[0.06] hover:border-white/20"
                    )}
                  >
                    <EmpIcon className={cn("w-6 h-6 mx-auto mb-2 transition-colors", empCategory === key ? "text-white" : "text-slate-500")} />
                    <span className="font-medium text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-h-[80px]">
              <AnimatePresence mode="popLayout">
                {empCategory && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="space-y-3 mb-8 relative z-10"
                  >
                    <h3 className="text-[13px] font-medium text-slate-400 mb-2">Occupation</h3>
                    <div className="flex flex-wrap gap-2">
                      {empCategory === "Salaried" && ["Private Sector", "Government Employee"].map((occ) => (
                        <button key={occ} onClick={() => setOccupation(occ as SpecificOccupation)} className={cn(
                          "px-5 py-3 rounded-lg border text-sm font-medium transition-all",
                          occupation === occ
                            ? "bg-primary text-primary-foreground border-white"
                            : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]"
                        )}>{occ}</button>
                      ))}
                      {empCategory === "SEP" && ["CA", "CS", "Doctor", "Lawyer", "Architect"].map((occ) => (
                        <button key={occ} onClick={() => setOccupation(occ as SpecificOccupation)} className={cn(
                          "px-5 py-3 rounded-lg border text-sm font-medium transition-all",
                          occupation === occ
                            ? "bg-primary text-primary-foreground border-white"
                            : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]"
                        )}>{occ}</button>
                      ))}
                      {empCategory === "SENP" && ["ITR Based (Normal Income)", "GST Based", "Banking Program", "Cash Flow Program"].map((occ) => (
                        <button key={occ} onClick={() => setOccupation(occ as SpecificOccupation)} className={cn(
                          "px-5 py-3 rounded-lg border text-sm font-medium transition-all",
                          occupation === occ
                            ? "bg-primary text-primary-foreground border-white"
                            : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]"
                        )}>{occ}</button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-end relative z-10">
              <Button
                onClick={() => { setDirection(1); setStep(3); setDocCategoryIndex(0); }}
                disabled={!isProfileValid}
                className="group px-8 py-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all font-semibold text-[15px] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
              >
                Continue <ArrowRight className="w-5 h-5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3 · Document Upload ── */}
        {step === 3 && docCategories.length > 0 && (() => {
          const currentCategory = docCategories[docCategoryIndex];
          const CatIcon = CATEGORY_ICONS[currentCategory.displayName] || FileCheck;
          const isLastCategory = docCategoryIndex === docCategories.length - 1;

          return (
            <motion.div
              key={`step-3-${docCategoryIndex}`} custom={direction} variants={cardVariants}
              initial="initial" animate="animate" exit="exit"
              className={cn(
                "w-full bg-[#0b0b0e]/90 backdrop-blur-xl border p-5 md:p-8 rounded-2xl shadow-xl relative overflow-hidden flex flex-col max-h-[calc(100vh-200px)] transition-all duration-700",
                isCurrentCategoryValid
                  ? "border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.12)]"
                  : "border-white/10"
              )}
              style={isCurrentCategoryValid ? { transform: "scale(1.01)" } : undefined}
            >
              <div className={cn(
                "absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full pointer-events-none transition-colors duration-700 translate-x-1/3 -translate-y-1/3",
                isCurrentCategoryValid ? "bg-emerald-500/15" : "bg-white/[0.02]"
              )} />

              <div className="flex items-center justify-between mb-5 relative z-10 shrink-0">
                <button onClick={prevStep} className="p-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-slate-400 hover:text-white border border-white/10">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-center flex-1">
                  <span className="inline-flex items-center gap-1.5 mb-2">
                    <CatIcon className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Step {totalSteps} of {totalSteps}</span>
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Upload {currentCategory.displayName}</h2>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-sm font-semibold text-emerald-500">
                  {docCategoryIndex + 1}/{docCategories.length}
                </div>
              </div>

              <div className="space-y-3 mb-4 relative z-10 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {currentCategory.docs.map((doc, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    key={doc.id}
                  >
                    <FileUploader
                      doc={doc}
                      file={uploadedFiles[doc.id] || null}
                      onUpload={(file) => setUploadedFiles((prev) => ({ ...prev, [doc.id]: file }))}
                    />
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col items-center relative z-10 pt-4 border-t border-white/[0.06] shrink-0">
                {!isCurrentCategoryValid ? (
                  <div className="w-full flex items-center justify-center text-[13px] font-medium text-slate-500 mb-5 bg-white/[0.03] p-3.5 rounded-lg border border-white/[0.06] gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-500" /> Please upload all required documents to continue.
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full flex items-center justify-center text-[13px] font-semibold text-emerald-500 mb-5 bg-emerald-500/10 p-3.5 rounded-lg border border-emerald-500/20 gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> All documents uploaded successfully.
                  </motion.div>
                )}

                {isLastCategory ? (
                  <Button
                    onClick={handleProceed} disabled={!isCurrentCategoryValid}
                    className="w-full group px-8 py-6 rounded-xl font-semibold text-[15px] transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Submit Application <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep} disabled={!isCurrentCategoryValid}
                    className={cn(
                      "w-full px-8 py-6 rounded-xl font-semibold text-[15px] transition-all group",
                      isCurrentCategoryValid
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                        : "bg-white/[0.04] text-slate-500 border border-white/10"
                    )}
                  >
                    Next: {docCategories[docCategoryIndex + 1]?.displayName} <ArrowRight className="w-5 h-5 ml-1.5 inline-block group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })()}

      </AnimatePresence>
    </div>
  );
}
