import {
  useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User, Briefcase, CheckCircle2, LockKeyhole, ArrowRight,
  ChevronLeft, IndianRupee, Loader2, AlertCircle,
  Building2, Landmark, BriefcaseBusiness,
  Home, Upload, FolderOpen, FileText, ShieldCheck, Check, X, Sparkles, ShieldAlert
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import React from "react";

import { useApplicationStore } from "@/store/applicationStore";
import { useShallow } from "zustand/react/shallow";
import type {
  StageNumber, ApplicationStore,
} from "@/lib/applicationTypes";
import { STAGE_LABELS } from "@/lib/applicationTypes";
import { IdentityStep } from "./steps/IdentityStep";
import { LoanDetailsStep } from "./steps/LoanDetailsStep";
import { EmploymentStep } from "./steps/EmploymentStep";
import { CoApplicantStep } from "./steps/CoApplicantStep";
import {
  validateStage1, validateStage2, validateStage3, validateStage4,
  validateAllStages, ERROR_SECTION_MAP, STAGE_LABELS_FRIENDLY,
  type ValidationErrors,
} from "./shared/validation";
import { STATE_PIN_PREFIXES, CITY_PIN_PREFIXES } from "./shared/constants";

// ─── DOCUMENT UPLOAD CARD ───────────────────────────────────────────────────

interface DocEntry {
  id: string;
  label: string;
  description: string;
  required: boolean;
  category: 'identity' | 'income' | 'property' | 'business';
}

const DocumentCard = ({
  doc, file, onFileSelect, onRemove
}: {
  doc: DocEntry;
  file: File | null;
  onFileSelect: (docId: string, file: File) => void;
  onRemove: (docId: string) => void;
}) => {
  const inputId = `upload-${doc.id}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFileSelect(doc.id, f);
    e.target.value = '';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative p-4 rounded-xl border transition-all duration-300",
        file
          ? "bg-primary/[0.03] dark:bg-[#103783]/[0.03] border-primary/20 dark:border-[#103783]/20"
          : "bg-secondary/30 dark:bg-white/[0.02] border-border dark:border-white/[0.06] hover:border-primary/15 dark:hover:border-white/[0.1]"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
          file ? "bg-primary/10 dark:bg-[#103783]/10" : "bg-secondary dark:bg-white/[0.05]"
        )}>
          {file ? (
            <Check className="w-4 h-4 text-primary dark:text-[#103783]" />
          ) : (
            <FileText className={cn(
              "w-4 h-4 transition-colors",
              doc.required ? "text-muted-foreground/50" : "text-muted-foreground/30"
            )} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-foreground truncate">{doc.label}</p>
            {doc.required ? (
              <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/10 shrink-0">Required</span>
            ) : (
              <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-secondary text-muted-foreground/50 border border-border dark:border-white/[0.06] shrink-0">Optional</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed">{doc.description}</p>

          {file ? (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/5 dark:bg-[#103783]/5 border border-primary/10 dark:border-[#103783]/10">
                <FileText className="w-3 h-3 text-primary dark:text-[#103783]" />
                <span className="text-[11px] font-medium text-foreground truncate max-w-[150px]">{file.name}</span>
                <span className="text-[10px] text-muted-foreground/50">
                  {(file.size / 1024).toFixed(0)}KB
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(doc.id)}
                className="p-1 rounded-md hover:bg-red-500/10 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          ) : (
            <label
              htmlFor={inputId}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-all duration-200 bg-secondary/80 dark:bg-white/[0.04] text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-white/[0.08] border border-border dark:border-white/[0.06] hover:border-primary/20 dark:hover:border-white/[0.12]"
            >
              <Upload className="w-3 h-3" />
              Choose File
            </label>
          )}
        </div>
      </div>

      <input
        id={inputId}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={handleChange}
        className="sr-only"
      />
    </motion.div>
  );
};

// ─── DOCUMENT RULES ENGINE ──────────────────────────────────────────────────

function resolveDocuments(store: ReturnType<typeof useApplicationStore.getState>): DocEntry[] {
  const docs: DocEntry[] = [];
  const k = store.basicKYC || {};
  const emp = k.employmentType;
  const fin = store.financialDetails || {};
  const finPath = fin.path;
  const lr = store.loanRequirements || {};
  const loanType = lr.loanType;
  const fp = store.financialFootprint || {};

  // UNIVERSAL (always)
  docs.push(
    { id: 'pan_card', label: 'PAN Card', description: 'Clear copy of PAN card (front)', required: true, category: 'identity' },
    { id: 'aadhaar', label: 'Aadhaar Card / Passport', description: 'Aadhaar (front & back) or valid Passport', required: true, category: 'identity' },
    { id: 'photo', label: 'Passport Size Photo', description: 'Recent passport-size photograph (white background)', required: true, category: 'identity' },
  );

  // SALARIED INCOME
  if (emp === 'SALARIED') {
    docs.push(
      { id: 'salary_slips', label: 'Salary Slips (3 months)', description: 'Latest 3 months salary slips from employer', required: true, category: 'income' },
      { id: 'bank_stmt_6m', label: 'Bank Statement (6 months)', description: 'Salary account bank statement for last 6 months', required: true, category: 'income' },
      { id: 'form16', label: 'Form 16 / ITR', description: 'Latest Form 16 or Income Tax Return acknowledgement', required: true, category: 'income' },
    );
  }

  // PROFESSIONAL / SELF-EMPLOYED INCOME
  if (emp === 'PROFESSIONAL' || emp === 'SELF_EMPLOYED') {
    docs.push(
      { id: 'itr_2yr', label: 'ITR (2-3 years)', description: 'Income Tax Returns with computation for last 2-3 financial years', required: true, category: 'income' },
      { id: 'balance_sheet', label: 'Balance Sheet & P&L', description: 'CA-certified Balance Sheet and Profit & Loss for last 2 years', required: true, category: 'income' },
      { id: 'bank_stmt_12m', label: 'Bank Statement (6-12 months)', description: 'Primary bank account statement for last 6-12 months', required: true, category: 'income' },
    );
  }

  // GST-BASED OVERRIDE
  if (finPath === 'SELF_EMPLOYED' && store.financialDetails.data.subType === 'GST_BASED') {
    docs.push(
      { id: 'gst_returns', label: 'GST Returns (6-12 months)', description: 'GSTR-1 and GSTR-3B filings for last 6-12 months', required: true, category: 'business' },
      { id: 'gst_cert', label: 'GST Registration Certificate', description: '15-digit GSTIN registration certificate', required: true, category: 'business' },
    );
  }

  // HOME LOAN / LAP PROPERTY DOCS
  if (loanType === 'HOME_LOAN' || loanType === 'LAP') {
    docs.push(
      { id: 'agreement_sale', label: 'Agreement to Sell', description: 'Registered / draft agreement to sell the property', required: true, category: 'property' },
      { id: 'chain_docs', label: 'Chain Documents', description: 'Complete ownership chain — previous sale deeds, mutation entries', required: true, category: 'property' },
      { id: 'approved_plan', label: 'Approved Building Plan', description: 'Municipal-approved plan and layout with NOC', required: true, category: 'property' },
    );
  }

  // BUSINESS LOAN > ₹50L OVERRIDE
  if (loanType === 'BUSINESS_LOAN' && fp.isAbove50Lakhs) {
    docs.push(
      { id: 'debtors_creditors', label: 'Debtors & Creditors List', description: 'Itemized list of trade debtors and creditors with ageing', required: true, category: 'business' },
      { id: 'cma_data', label: 'CMA Data', description: 'Credit Monitoring Arrangement projection for next 3-5 years', required: true, category: 'business' },
    );
  }

  // AUTO LOAN
  if (loanType === 'AUTO_LOAN') {
    docs.push(
      { id: 'vehicle_quotation', label: 'Proforma Invoice / Quotation', description: 'Quotation from authorized dealer', required: true, category: 'property' },
      { id: 'driving_license', label: 'Driving License', description: 'Valid driving license', required: true, category: 'identity' },
    );
  }

  return docs;
}

const CATEGORY_META: Record<DocEntry['category'], { label: string; icon: any; color: string }> = {
  identity: { label: 'Identity & KYC', icon: ShieldCheck, color: 'text-blue-500' },
  income: { label: 'Income Proof', icon: IndianRupee, color: 'text-blue-500' },
  property: { label: 'Property Documents', icon: Home, color: 'text-amber-500' },
  business: { label: 'Business Documents', icon: BriefcaseBusiness, color: 'text-blue-500' },
};

// ─── DOCUMENT VAULT STAGE (Stage 5) ────────────────────────────────────────

const DocumentVaultStage = ({
  store, direction, cardCn
}: {
  store: ApplicationStore;
  direction: number;
  cardCn: string;
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});

  const requiredDocs = useMemo(() => resolveDocuments(useApplicationStore.getState()), [
    store.basicKYC?.employmentType,
    store.financialDetails?.path,
    store.loanRequirements?.loanType,
    store.financialFootprint?.isAbove50Lakhs,
  ]);

  const handleFileSelect = useCallback((docId: string, file: File) => {
    setUploadedFiles(prev => ({ ...prev, [docId]: file }));
  }, []);

  const handleRemove = useCallback((docId: string) => {
    setUploadedFiles(prev => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
  }, []);

  // Group by category, preserving insertion order
  const groupedDocs = useMemo(() => {
    const groups: { category: DocEntry['category']; docs: DocEntry[] }[] = [];
    const seen = new Set<DocEntry['category']>();
    for (const doc of requiredDocs) {
      if (!seen.has(doc.category)) {
        seen.add(doc.category);
        groups.push({ category: doc.category, docs: [] });
      }
      groups.find(g => g.category === doc.category)?.docs.push(doc);
    }
    return groups;
  }, [requiredDocs]);

  // Progressive Disclosure State
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const activeGroup = groupedDocs[activeCategoryIndex];

  // Auto-advance logic (500ms dopamine delay)
  useEffect(() => {
    if (!activeGroup) return;
    
    // Check if all required docs in the CURRENT group are uploaded
    const allRequiredUploaded = activeGroup.docs.every(doc => !doc.required || uploadedFiles[doc.id]);
    
    if (allRequiredUploaded && activeCategoryIndex < groupedDocs.length - 1) {
      const timer = setTimeout(() => {
        setActiveCategoryIndex(prev => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [uploadedFiles, activeGroup, activeCategoryIndex, groupedDocs.length]);

  const totalRequired = requiredDocs.filter(d => d.required).length;
  const uploadedRequired = requiredDocs.filter(d => d.required && uploadedFiles[d.id]).length;
  const progress = totalRequired > 0 ? Math.round((uploadedRequired / totalRequired) * 100) : 0;

  return (
    <motion.div
      key="stage5"
      custom={direction}
      initial={{ x: direction * 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } }}
      exit={{ x: direction * -24, opacity: 0, transition: { duration: 0.15 } }}
      className="space-y-5"
    >
      {/* Header Card */}
      <div className={cardCn}>

        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-[#0d1829] border border-border dark:border-white/[0.06] flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-primary dark:text-[#103783]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground tracking-tight">Document Vault</h3>
              <p className="text-[11px] text-muted-foreground/60">Personalized checklist based on your profile</p>
            </div>
          </div>

          {/* Progress Counter */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Uploaded</p>
              <p className="text-lg font-bold tabular-nums text-foreground">
                <span className="text-primary dark:text-[#103783]">{uploadedRequired}</span>
                <span className="text-muted-foreground/30"> / {totalRequired}</span>
              </p>
            </div>
            <div className="relative w-10 h-10">
              <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2" className="text-border dark:text-white/[0.06]" />
                <motion.circle
                  cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round"
                  className="text-primary dark:text-[#103783]"
                  strokeDasharray={`${2 * Math.PI * 15.5}`}
                  animate={{ strokeDashoffset: 2 * Math.PI * 15.5 * (1 - progress / 100) }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-foreground">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Adaptive info chip */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10 relative z-10">
          <AlertCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <p className="text-[11px] text-muted-foreground font-medium">
            This checklist is personalized for <span className="text-foreground font-semibold">{store.basicKYC?.employmentType === 'SALARIED' ? 'Salaried' : store.basicKYC?.employmentType === 'PROFESSIONAL' ? 'Professional' : 'Self-Employed'}</span> applicants
            {((store.loanRequirements?.loanType === 'HOME_LOAN' || store.loanRequirements?.loanType === 'LAP')) && ' with property documentation'}
            {store.loanRequirements?.loanType === 'BUSINESS_LOAN' && store.financialFootprint?.isAbove50Lakhs && ' (High-value business loan)'}
            . Upload PDF or images.
          </p>
        </div>
      </div>

      {/* Document Sections - Progressive Disclosure */}
      <AnimatePresence mode="wait">
        {activeGroup && (() => {
          const meta = CATEGORY_META[activeGroup.category];
          const SectionIcon = meta.icon;
          return (
            <motion.div
              key={activeGroup.category}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className={cardCn}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", `bg-${meta.color.replace('text-', '')}/10`)}>
                  <SectionIcon className={cn("w-3.5 h-3.5", meta.color)} />
                </div>
                <h4 className="text-sm font-bold text-foreground">{meta.label}</h4>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-[10px] font-medium text-muted-foreground/40">
                    Step {activeCategoryIndex + 1} of {groupedDocs.length}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-foreground font-semibold">
                    {activeGroup.docs.filter(d => uploadedFiles[d.id]).length}/{activeGroup.docs.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {activeGroup.docs.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    file={uploadedFiles[doc.id] || null}
                    onFileSelect={handleFileSelect}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
              
              {/* Manual navigation fallback if they want to go back */}
              {activeCategoryIndex > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50 flex justify-start">
                  <button 
                    onClick={() => setActiveCategoryIndex(prev => prev - 1)}
                    className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3 h-3" /> Previous Step
                  </button>
                </div>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
};




// ─── STEP METADATA ──────────────────────────────────────────────────────────

const STEP_META = [
  { stage: 1 as StageNumber, label: "Loan Details", icon: IndianRupee },
  { stage: 2 as StageNumber, label: "Identity", icon: User },
  { stage: 3 as StageNumber, label: "Employment", icon: Briefcase },
];

// ═══════════════════════════════════════════════════════════════════════════════
// THE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface LoanApplicationFormProps {
  onAmountChange?: (amount: number) => void;
  onFormSubmit?: (data: any) => void;
}

const LoanApplicationForm = ({ onAmountChange, onFormSubmit }: LoanApplicationFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Enforce atomic selectors for Zustand optimization
  const store: ApplicationStore = {
    // Stage navigation & Meta
    applicationId: useApplicationStore((s) => s.applicationId),
    completedStages: useApplicationStore(useShallow((s) => s.completedStages)),
    createdAt: useApplicationStore((s) => s.createdAt),
    lastModifiedAt: useApplicationStore((s) => s.lastModifiedAt),
    currentStage: useApplicationStore((s) => s.currentStage),
    setStage: useApplicationStore((s) => s.setStage),
    completeStage: useApplicationStore((s) => s.completeStage),

    // Data Slices
    basicKYC: useApplicationStore(useShallow((s) => s.basicKYC)),
    financialDetails: useApplicationStore(useShallow((s) => s.financialDetails)),
    loanRequirements: useApplicationStore(useShallow((s) => s.loanRequirements)),
    financialFootprint: useApplicationStore(useShallow((s) => s.financialFootprint)),
    documents: useApplicationStore(useShallow((s) => s.documents)),
    consent: useApplicationStore(useShallow((s) => s.consent)),

    // Mutators
    updateBasicKYC: useApplicationStore((s) => s.updateBasicKYC),
    updateFinancialDetails: useApplicationStore((s) => s.updateFinancialDetails),
    updateSalariedDetails: useApplicationStore((s) => s.updateSalariedDetails),
    updateProfessionalDetails: useApplicationStore((s) => s.updateProfessionalDetails),
    updateBusinessDetails: useApplicationStore((s) => s.updateBusinessDetails),
    updateLoanRequirements: useApplicationStore((s) => s.updateLoanRequirements),
    updateFinancialFootprint: useApplicationStore((s) => s.updateFinancialFootprint),
    updateDocuments: useApplicationStore((s) => s.updateDocuments),
    setDocumentStatus: useApplicationStore((s) => s.setDocumentStatus),
    setConsent: useApplicationStore((s) => s.setConsent),
    resetApplication: useApplicationStore((s) => s.resetApplication),

    // Validation
    validationErrors: useApplicationStore(useShallow((s) => s.validationErrors)),
    setValidationErrors: useApplicationStore((s) => s.setValidationErrors),
    setValidationError: useApplicationStore((s) => s.setValidationError),
    clearValidationErrors: useApplicationStore((s) => s.clearValidationErrors),
    
    // Computed Helpers
    getActiveEmploymentPath: useApplicationStore((s) => s.getActiveEmploymentPath),
    getProgress: useApplicationStore((s) => s.getProgress),
    isStageAccessible: useApplicationStore((s) => s.isStageAccessible),
  };

  // ── Sync URL query parameter to store ─────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get("type");
    
    if (typeParam) {
      const typeMap: Record<string, typeof store.loanRequirements.loanType> = {
        personal: "PERSONAL_LOAN",
        business: "BUSINESS_LOAN",
        home: "HOME_LOAN",
        lap: "LAP",
        auto: "AUTO_LOAN",
        vehicle: "AUTO_LOAN",
      };
      
      const resolvedType = typeMap[typeParam.toLowerCase()];
      
      // We read the current state directly to avoid reactivity loops on `store` object
      const currentState = useApplicationStore.getState();
      if (resolvedType && currentState.loanRequirements.loanType !== resolvedType) {
        currentState.updateLoanRequirements({ loanType: resolvedType });
      }
    }
  }, [location.search]);

  const [direction, setDirection] = useState(1);
  const errors = store.validationErrors;
  const setErrors = store.setValidationErrors;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formEndRef = useRef<HTMLDivElement>(null);
  const [isBottomVisible, setIsBottomVisible] = useState(false);

  // ── Local State (Unused states removed) ──────────────────────────────────────────────

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // Add a small threshold offset so it transitions just before leaving layout
      setIsBottomVisible(entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight);
    }, { rootMargin: "0px 0px 50px 0px" });
    if (formEndRef.current) observer.observe(formEndRef.current);
    return () => observer.disconnect();
  }, []);

  // ── 200 IQ REAL-TIME PROGRESS ANALYZER ──────────────────────────────────────
  const progressMetrics = useMemo(() => {
    // 1. Loan Details Step Progress
    const lr = store.loanRequirements || {};
    const isPropertyBacked = ['HOME_LOAN', 'LAP'].includes(lr.loanType || '');
    let score1 = 0;
    let total1 = 3;
    if (lr.loanType) score1 += 1;
    if (lr.loanAmount && lr.loanAmount >= 50000) score1 += 1;
    
    const tenureValid = (lr.loanType === 'PERSONAL_LOAN' || lr.loanType === 'BUSINESS_LOAN')
      ? (lr.tenureYears && lr.tenureYears >= 1 && lr.tenureYears <= 7)
      : (lr.tenureYears && lr.tenureYears >= 3 && lr.tenureYears <= 30);
    if (lr.tenureYears && lr.tenureYears > 0 && tenureValid) score1 += 1;

    if (isPropertyBacked) {
      total1 = 4;
      if (lr.propertyValue && lr.propertyValue >= lr.loanAmount) score1 += 1;
    }
    const p1 = score1 / total1;

    // 2. Identity Step Progress
    const k = store.basicKYC || {};
    let score2 = 0;
    const total2 = 7;
    if (k.fullName && k.fullName.trim().length >= 3) score2 += 1;
    if (k.mobileNumber && /^[6-9]\d{9}$/.test(k.mobileNumber)) score2 += 1;
    if (k.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(k.email)) score2 += 1;
    if (k.dateOfBirth) score2 += 1;
    if (k.state) score2 += 1;
    if (k.city) score2 += 1;
    
    let isPinValid = false;
    if (k.pinCode && /^\d{6}$/.test(k.pinCode)) {
      isPinValid = true;
      if (k.city && CITY_PIN_PREFIXES[k.city]) {
        const validPrefixes = CITY_PIN_PREFIXES[k.city];
        isPinValid = validPrefixes.some(prefix => k.pinCode.startsWith(prefix));
      } else if (k.state && STATE_PIN_PREFIXES[k.state]) {
        const validPrefixes = STATE_PIN_PREFIXES[k.state];
        isPinValid = validPrefixes.some(prefix => k.pinCode.startsWith(prefix));
      }
    }
    if (isPinValid) score2 += 1;
    const p2 = score2 / total2;

    // 3. Employment Step Progress
    let score3 = 0;
    let total3 = 1;
    const emp = k.employmentType;
    if (emp) {
      score3 += 1;
      const fin = store.financialDetails || {};
      if (emp === "SALARIED" && fin.path === "SALARIED") {
        total3 = 7;
        const d = fin.data || {};
        if (d.subType) score3 += 1;
        if (d.subType !== "PRIVATE" || d.companyType) score3 += 1;
        if (d.companyName && d.companyName.trim().length >= 2) score3 += 1;
        if (d.designation && d.designation.trim().length >= 2) score3 += 1;
        if (d.netMonthlySalary && d.netMonthlySalary >= 10000) score3 += 1;
        if (typeof d.totalExperienceYears === 'number' && d.totalExperienceYears >= 0) score3 += 1;
      } else if (emp === "PROFESSIONAL" && fin.path === "PROFESSIONAL") {
        total3 = 5;
        const d = fin.data || {};
        if (d.subType) score3 += 1;
        if (d.practiceName && d.practiceName.trim().length >= 2) score3 += 1;
        if (typeof d.practiceYears === 'number' && d.practiceYears >= 0) score3 += 1;
        if (d.netMonthlyIncome && d.netMonthlyIncome >= 10000) score3 += 1;
      } else if (emp === "SELF_EMPLOYED" && fin.path === "SELF_EMPLOYED") {
        total3 = 4;
        const d = fin.data || {};
        if (d.subType) score3 += 1;
        if (d.businessName && d.businessName.trim().length >= 2) score3 += 1;
        if (d.netMonthlyIncome && d.netMonthlyIncome >= 10000) score3 += 1;
      }
    }
    const p3 = score3 / total3;

    // Calculate active stage
    let activeStage = 1;
    if (p1 >= 1) {
      activeStage = 2;
      if (p2 >= 1) {
        activeStage = 3;
        if (p3 >= 1) {
          activeStage = 4; // Complete
        }
      }
    }

    // Calculate dynamic bar percentage
    let barPercent = p1 * 50;
    if (p1 >= 1) {
      barPercent = 50 + (p2 * 50);
    }

    return {
      p1,
      p2,
      p3,
      activeStage,
      barPercent,
    };
  }, [store.loanRequirements, store.basicKYC, store.financialDetails]);

  // ── Sync loan amount to parent ────────────────────────────────────────────
  useEffect(() => {
    if (onAmountChange) onAmountChange(store.loanRequirements.loanAmount);
  }, [store.loanRequirements.loanAmount, onAmountChange]);

  // ── Navigation ────────────────────────────────────────────────────────────

  const nextStep = useCallback(() => {
    let validationErrors: ValidationErrors = {};

    if (store.currentStage === 1) validationErrors = validateStage1(useApplicationStore.getState());
    if (store.currentStage === 2) validationErrors = validateStage2(useApplicationStore.getState());
    if (store.currentStage === 3) validationErrors = validateStage3(useApplicationStore.getState());
    if (store.currentStage === 4) validationErrors = validateStage4(useApplicationStore.getState());

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({ title: "Please fix the errors", description: "Some fields require your attention.", variant: "destructive" });
      return;
    }

    setErrors({});
    setDirection(1);
    store.completeStage(store.currentStage as StageNumber);
    store.setStage(Math.min(store.currentStage + 1, 5) as StageNumber);
  }, [store]);

  const prevStep = useCallback(() => {
    setErrors({});
    setDirection(-1);
    store.setStage(Math.max(store.currentStage - 1, 1) as StageNumber);
  }, [store]);

  // ── Submit (200 IQ: validates ALL stages → scroll-to-first-error) ──────────



  const handleFormSubmit = useCallback(() => {
    try {
      const currentState = useApplicationStore.getState();

      // Validate all stages via centralized engine (Loan Details → Identity → Employment)
      const allErrors = validateAllStages(currentState);

      if (Object.keys(allErrors).length > 0) {
        setErrors(allErrors);

        // Find the first error key and resolve its section
        const firstErrorKey = Object.keys(allErrors)[0];
        const targetSectionId = ERROR_SECTION_MAP[firstErrorKey] || 'section-loan-details';
        const sectionLabel = STAGE_LABELS_FRIENDLY[targetSectionId] || 'form';

        // Scroll to the section with the first error
        const el = document.getElementById(targetSectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Flash highlight effect — add and remove a ring animation
          el.classList.add('ring-2', 'ring-red-500/40', 'ring-offset-2', 'ring-offset-background');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-red-500/40', 'ring-offset-2', 'ring-offset-background');
          }, 2500);
        }

        toast({
          title: `Missing fields in ${sectionLabel}`,
          description: allErrors[firstErrorKey],
          variant: 'destructive',
        });
        return;
      }

      // All validations passed
      setErrors({});
      store.completeStage(3 as StageNumber);

      setIsSubmitting(true);

      const fin = store.financialDetails;
      const fp = store.financialFootprint;

      // Bridge to Apply.tsx → EligibilityRequest.
      // CRITICAL: Pass raw enum values. No transformation. The engine matches on exact strings.
      const data = {
        fullName: store.basicKYC?.fullName ?? "Guest",
        email: store.basicKYC?.email ?? "",
        phone: store.basicKYC?.mobileNumber ?? "",
        panCard: store.basicKYC?.panNumber ?? "",
        dob: store.basicKYC?.dateOfBirth ?? "",
        // BUG-1 FIX: Raw loanType — no .toLowerCase().replace() mangling.
        // Engine matches HOME_LOAN, BUSINESS_LOAN, etc. verbatim.
        productType: store.loanRequirements?.loanType ?? "PERSONAL_LOAN",
        loanAmount: Number(store.loanRequirements?.loanAmount ?? 500000),
        loanTenure: Number(store.loanRequirements?.tenureYears ?? 5),
        cibilScore: Number(store.loanRequirements?.cibilScore ?? 750),
        occupation: store.basicKYC?.employmentType?.toLowerCase() ?? "salaried",
        monthlyIncome: (() => {
          if (fin?.path === "SALARIED") return Number(fin.data?.netMonthlySalary ?? 50000);
          if (fin?.path === "PROFESSIONAL") return Number(fin.data?.netMonthlyIncome ?? 50000);
          if (fin?.path === "SELF_EMPLOYED") return Number(fin.data?.netMonthlyIncome ?? 50000);
          return 50000;
        })(),
        state: store.basicKYC?.state ?? "",
        city: store.basicKYC?.city ?? "",
        employmentType: store.basicKYC?.employmentType ?? "SALARIED",

        // Employment path metadata — needed by Apply.tsx to resolve the correct surrogate programName
        financialPath: fin?.path ?? null,                                       // SALARIED | PROFESSIONAL | SELF_EMPLOYED
        professionalSubType: fin?.path === "PROFESSIONAL" ? (fin.data as any)?.subType ?? null : null, // CA | CS | DOCTOR | LAWYER
        businessSubType: fin?.path === "SELF_EMPLOYED" ? (fin.data as any)?.subType ?? null : null,    // ITR_BASED | GST_BASED | BANKING_PROGRAM | CASH_FLOW_PROGRAM
        businessIndustryType: fin?.path === "SELF_EMPLOYED" ? (fin.data as any)?.industryType ?? null : null,

        // Property type — BUG-4 FIX: pass real value from form, not hardcoded "RESIDENTIAL"
        propertyType: (store.loanRequirements as any)?.propertyType ?? "RESIDENTIAL",

        // 🧠 PIPELINE FIX: Forward employment-specific fields for Admin Dashboard visibility
        pinCode: store.basicKYC?.pinCode ?? "",
        companyName: (fin?.data as any)?.companyName ?? (fin?.data as any)?.practiceName ?? (fin?.data as any)?.businessName ?? "",
        designation: (fin?.data as any)?.designation ?? "",
        officialEmail: (fin?.data as any)?.officialEmail ?? "",
        loanPurpose: store.loanRequirements?.purpose ?? "",
        existingBank: fp?.primaryBankName ?? "",
        hasCoApplicant: fp?.hasCoApplicant ?? false,

        // Phase 5 underwriting variables safely mapped
        depreciation: Number((fin?.data as any)?.depreciation ?? 0),
        netProfit: Number((fin?.data as any)?.netProfit ?? 0),
        grossSalary: Number((fin?.data as any)?.grossSalary ?? 0),
        isCaCertifiedOrAudited: Boolean((fin?.data as any)?.isCaCertifiedOrAudited ?? false),
        last12MonthsGstTurnover: Number((fin?.data as any)?.last12MonthsGstTurnover ?? 0),
        annualGrossReceipts: Number((fin?.data as any)?.annualGrossReceipts ?? 0),
        totalPracticeYears: Number((fin?.data as any)?.totalPracticeYears ?? 0),
        businessVintageYears: Number((fin?.data as any)?.vintageYears ?? 0),
        totalExperienceYears: Number((fin?.data as any)?.totalExperienceYears ?? 0),
        averageBankBalance: Number((fin?.data as any)?.abbTier ? (fin.data as any).abbTier * 100000 : 0), // ABB tier in lakhs → rupees
        propertyIdentified: Boolean(fp?.propertyIdentified ?? false),
        estimatedPropertyValue: Number(store.loanRequirements?.propertyValue || fp?.estimatedPropertyValue || 0),
        isAbove50Lakhs: Boolean(fp?.isAbove50Lakhs ?? false),
        hasExistingLoan: (Number((fin?.data as any)?.existingEMI ?? 0) > 0) || Boolean((fp as any)?.hasExistingLoan ?? false),
        eligibleExistingEmi: Number((fin?.data as any)?.existingEMI ?? 0)
      };

      onFormSubmit?.(data);
      setIsAnalyzing(true);
    } catch (error) {
      console.error("Fatal exception during payload construction or submission:", error);
      toast({ title: "System Error", description: "Could not process form data. Please check your inputs.", variant: "destructive" });
      setIsSubmitting(false);
      setIsAnalyzing(false);
    }
  }, [store, onFormSubmit]);

  const handleAnalysisComplete = useCallback(() => {
    const lr = store.loanRequirements || {};
    const k = store.basicKYC || {};
    navigate("/offers", {
      state: {
        cibilScore: lr.cibilScore ?? 750,
        productType: lr.loanType ?? "PERSONAL_LOAN",
        monthlyIncome: 50000,
        loanAmount: lr.loanAmount ?? 500000,
        fullName: k.fullName || "Guest",
      },
    });
  }, [navigate, store]);

  // ── CIBIL UI (moved to LoanDetailsStep — kept getter for submit payload) ──

  // ── Style tokens ──────────────────────────────────────────────────────────

  const cardCn = "bg-card dark:bg-[#080d1e] border border-border dark:border-white/[0.06] rounded-[1.75rem] p-5 md:p-6 relative overflow-hidden transition-colors duration-300 hover:border-primary/10 dark:hover:border-white/[0.08]";

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════════

  const getIncomeOrFallback = () => {
    const fin = store.financialDetails || {};
    const d = fin.data || {};
    if (fin.path === "SALARIED") return d.netMonthlySalary || 50000;
    if (fin.path === "PROFESSIONAL") return d.netMonthlyIncome || 50000;
    if (fin.path === "SELF_EMPLOYED") return d.netMonthlyIncome || 50000;
    return 50000;
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0 h-full w-full relative">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-5">
          <h2 className="text-lg md:text-base font-semibold text-foreground tracking-tight mb-1">
            Start Your Application
          </h2>

          {/* Step Indicator */}
          <div className="relative flex justify-between items-center mb-1">
            {STEP_META.map((meta, i) => {
              const isCompleted = i === 0 ? progressMetrics.p1 >= 1 : (i === 1 ? progressMetrics.p2 >= 1 : progressMetrics.p3 >= 1);
              const isActive = i === 0 ? true : (i === 1 ? progressMetrics.p1 >= 1 : progressMetrics.p2 >= 1);
              const isCurrent = progressMetrics.activeStage === meta.stage;

              return (
                <div key={meta.label} className="flex flex-col items-center z-10">
                  <motion.div
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                      boxShadow: isCurrent ? "0 0 0 4px rgba(124,58,237,0.15)" : "0 0 0 0px rgba(124,58,237,0)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-colors duration-300",
                      isActive
                        ? "bg-primary dark:bg-[#103783] text-white"
                        : "bg-secondary dark:bg-[#1a1a1a] text-muted-foreground border border-border dark:border-white/10"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      meta.stage
                    )}
                  </motion.div>
                  <span className={cn(
                    "text-[10px] mt-2 font-semibold uppercase tracking-widest transition-colors duration-300",
                    isActive ? "text-primary dark:text-[#103783]" : "text-muted-foreground/50"
                  )}>
                    {meta.label}
                  </span>
                </div>
              );
            })}
            {/* Connector line */}
            <div className="absolute top-4 left-8 right-8 h-[2px] bg-border dark:bg-white/[0.06] -z-0">
              <motion.div
                className="h-full bg-primary dark:bg-[#103783]"
                animate={{ width: `${progressMetrics.barPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* ── Step Content ─────────────────────────────────────────────────── */}
        
        <div className="space-y-5 md:space-y-6">
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* DYNAMIC RENDERER: MODULAR STEPS                                 */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {[
            { id: 'loan-details', Component: LoanDetailsStep, props: { cardCn } },
            { id: 'identity', Component: IdentityStep, props: { cardCn } },
            { id: 'employment', Component: EmploymentStep, props: { cardCn } },
            { id: 'co-applicant', Component: CoApplicantStep, props: { cardCn } },
          ].map(({ id, Component, props }) => (
            <Component key={id} {...(props as any)} />
          ))}
        </div>


        {/* ── Real-Time Signal Injection ──────────────────────────────────────── */}
        <div className="mt-4 p-4 rounded-xl bg-primary/5 dark:bg-[#103783]/5 border border-primary/10 dark:border-[#103783]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-[#103783]/10 flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 text-primary dark:text-[#103783]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                {store.currentStage > 1 
                  ? `Preliminary match: ${getIncomeOrFallback() * 12} to ${getIncomeOrFallback() * 24} limit`
                  : 'Analyzing your profile in real-time...'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {store.currentStage > 2 ? '4+ lenders currently matched' : 'Connecting to lending partners'}
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-medium text-slate-500 flex items-center justify-end gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Bank-grade encryption
            </p>
          </div>
        </div>

        
        
        {/* Income vs EMI Logic Validation */}
        {(() => {
           let income = 0;
           let emi = 0;
           const empType = store.basicKYC?.employmentType;
           const fin = store.financialDetails || {};
           const finData = fin.data || {};
           if (empType === 'SALARIED' && fin.path === 'SALARIED') {
              income = finData.netMonthlySalary || 0;
              emi = finData.existingEMI || 0;
           } else if (empType === 'SELF_EMPLOYED' && fin.path === 'SELF_EMPLOYED') {
              income = finData.netMonthlyIncome || 0;
              emi = finData.existingEMI || 0;
           } else if (empType === 'PROFESSIONAL' && fin.path === 'PROFESSIONAL') {
              income = finData.netMonthlyIncome || 0;
              emi = finData.existingEMI || 0;
           }
           
           if (income > 0 && emi >= income) {
             return (
               <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5" />
                  Total obligations (EMI) cannot exceed your current income.
               </div>
             );
           }
           return null;
        })()}

        <div className="mt-5 relative z-50">
          <Button 
             type="submit"
             disabled={
               isSubmitting || isAnalyzing ||
               (() => {
                 const empType = store.basicKYC?.employmentType;
                 const fin = store.financialDetails || {};
                 const finData = fin.data || {};
                 if (empType === 'SALARIED' && fin.path === 'SALARIED') {
                    return (finData.existingEMI || 0) >= (finData.netMonthlySalary || 0) && (finData.netMonthlySalary || 0) > 0;
                 } else if (empType === 'SELF_EMPLOYED' && fin.path === 'SELF_EMPLOYED') {
                    return (finData.existingEMI || 0) >= (finData.netMonthlyIncome || 0) && (finData.netMonthlyIncome || 0) > 0;
                 } else if (empType === 'PROFESSIONAL' && fin.path === 'PROFESSIONAL') {
                    return (finData.existingEMI || 0) >= (finData.netMonthlyIncome || 0) && (finData.netMonthlyIncome || 0) > 0;
                 }
                 return false;
               })()
             }
             className="w-full h-14 md:h-16 text-base md:text-lg font-bold rounded-2xl md:rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl transition-all"
             onClick={(e) => { e.preventDefault(); handleFormSubmit(); }}
          >
             {isSubmitting || isAnalyzing ? (
                <>
                   <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                   Processing Application...
                </>
             ) : (
                <>
                   See My Offers <ArrowRight className="ml-2 w-5 h-5" />
                </>
             )}
          </Button>
        </div>

        {/* Trust Microcopy */}
        <div className="flex items-center justify-center gap-1.5 mt-3 px-2 group">
          <LockKeyhole className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
          <p className="text-[10.5px] text-muted-foreground/60 font-medium text-center leading-tight">
            Checking eligibility will <span className="font-semibold text-foreground/80">not</span> affect your credit score
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default LoanApplicationForm;