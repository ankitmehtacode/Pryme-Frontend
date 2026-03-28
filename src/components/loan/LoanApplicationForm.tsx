import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User, Briefcase, CheckCircle2, XCircle, LockKeyhole, ArrowRight,
  ChevronRight, ChevronLeft, IndianRupee, Loader2, AlertCircle,
  Building2, Stethoscope, Scale, GraduationCap, CreditCard, MapPin,
  Phone, Mail, Calendar, Hash, Landmark, BriefcaseBusiness,
  Home, HandCoins, FileSearch, UserPlus, ToggleLeft,
  Upload, FolderOpen, FileText, ShieldCheck, Check, X, CloudUpload, Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import React from "react";

import AnalysisLoader from "@/components/loan/AnalysisLoader";
import { useApplicationStore } from "@/store/applicationStore";
import type {
  EmploymentType, SalariedSubType, ProfessionalSubType, BusinessSubType,
  StageNumber, LoanType, ApplicationStore
} from "@/lib/applicationTypes";
import {
  EMPLOYMENT_LABELS, SALARIED_LABELS, PROFESSIONAL_LABELS,
  BUSINESS_LABELS, LOAN_TYPE_LABELS, STAGE_LABELS
} from "@/lib/applicationTypes";

// ─── STABLE VALIDATED INPUT (outside component to prevent remount) ──────────

const ValidatedInput = React.forwardRef<HTMLInputElement, any>(
  ({ label, error, isValid, isSecure, icon: Icon, className: _className, ...props }, ref) => (
    <div className="relative group w-full">
      <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80 dark:text-[#7c3aed]/80 ml-1 mb-1 block">{label}</Label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <Icon className="w-4 h-4 text-muted-foreground/50" />
          </div>
        )}
        <Input
          ref={ref}
          {...props}
          className={cn(
            "w-full bg-secondary/50 dark:bg-white/[0.03] border border-border dark:border-white/[0.06] rounded-xl px-4 py-6 text-sm font-medium text-foreground outline-none transition-all duration-200 group-hover:border-primary/20 dark:group-hover:border-white/15 focus:border-primary/60 dark:focus:border-[#7c3aed]/50 focus:ring-2 focus:ring-primary/10 dark:focus:ring-[#7c3aed]/10",
            Icon && "pl-11",
            error && "border-red-500/30 focus:ring-red-500/10 focus:border-red-500/50",
            isValid && !error && "border-primary/20 dark:border-[#7c3aed]/20"
          )}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isSecure && <LockKeyhole className="w-4 h-4 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground/50" />}
          {error && (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
              <XCircle className="w-4 h-4 text-red-500/80" />
            </motion.div>
          )}
          {isValid && !error && (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
              <CheckCircle2 className="w-4 h-4 text-primary dark:text-[#7c3aed]" />
            </motion.div>
          )}
        </div>
      </div>
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 font-medium ml-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </motion.p>
      )}
    </div>
  )
);
ValidatedInput.displayName = "ValidatedInput";

// ─── STYLED SELECT WITH ICON ────────────────────────────────────────────────

const StyledSelect = ({
  label, icon: Icon, value, onValueChange, placeholder, children, error
}: {
  label: string; icon?: any; value?: string; onValueChange: (v: string) => void;
  placeholder: string; children: React.ReactNode; error?: string;
}) => (
  <div className="group w-full">
    <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80 dark:text-[#7c3aed]/80 ml-1 mb-1 block">{label}</Label>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn(
        "w-full bg-secondary/50 dark:bg-white/[0.03] border border-border dark:border-white/[0.06] rounded-xl px-4 py-6 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/20 dark:hover:border-white/15 focus:border-primary/60 dark:focus:border-[#7c3aed]/50 focus:ring-2 focus:ring-primary/10 dark:focus:ring-[#7c3aed]/10",
        Icon && "pl-11",
        error && "border-red-500/30"
      )}>
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-4 h-4 text-muted-foreground/50" />
          </div>
        )}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-card dark:bg-[#111] border-border dark:border-white/[0.06] rounded-xl">
        {children}
      </SelectContent>
    </Select>
    {error && (
      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 font-medium ml-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> {error}
      </motion.p>
    )}
  </div>
);

// ─── PILL SELECTOR (for employment type) ────────────────────────────────────

const PillSelector = <T extends string>({
  label, options, value, onChange, icon: Icon
}: {
  label: string; options: { value: T; label: string; icon?: any }[];
  value: T | null; onChange: (v: T) => void; icon?: any;
}) => (
  <div className="w-full">
    <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80 dark:text-[#7c3aed]/80 ml-1 mb-2 flex items-center gap-2">
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </Label>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        const OptIcon = opt.icon;
        return (
          <motion.button
            key={opt.value}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(opt.value)}
            className={cn(
              "py-3.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 border flex items-center justify-center gap-2",
              isSelected
                ? "bg-primary dark:bg-[#7c3aed] text-white border-primary dark:border-[#7c3aed] shadow-lg shadow-primary/20 dark:shadow-[#7c3aed]/20"
                : "bg-secondary/50 dark:bg-white/[0.03] text-muted-foreground border-border dark:border-white/[0.06] hover:text-foreground hover:border-primary/20 dark:hover:border-white/15"
            )}
          >
            {OptIcon && <OptIcon className="w-3.5 h-3.5" />}
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  </div>
);

// ─── PREMIUM TOGGLE SWITCH ──────────────────────────────────────────────────

const ToggleSwitch = ({
  label, description, icon: Icon, checked, onChange
}: {
  label: string; description?: string; icon?: any; checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <motion.button
    type="button"
    whileTap={{ scale: 0.98 }}
    onClick={() => onChange(!checked)}
    className={cn(
      "w-full flex items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-300",
      checked
        ? "bg-primary/5 dark:bg-[#7c3aed]/5 border-primary/20 dark:border-[#7c3aed]/20"
        : "bg-secondary/30 dark:bg-white/[0.02] border-border dark:border-white/[0.06] hover:border-primary/10 dark:hover:border-white/[0.1]"
    )}
  >
    <div className="flex items-center gap-3">
      {Icon && (
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
          checked ? "bg-primary/10 dark:bg-[#7c3aed]/10" : "bg-secondary dark:bg-white/[0.05]"
        )}>
          <Icon className={cn(
            "w-4 h-4 transition-colors",
            checked ? "text-primary dark:text-[#7c3aed]" : "text-muted-foreground/50"
          )} />
        </div>
      )}
      <div className="text-left">
        <p className={cn(
          "text-sm font-semibold transition-colors",
          checked ? "text-foreground" : "text-muted-foreground"
        )}>{label}</p>
        {description && (
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">{description}</p>
        )}
      </div>
    </div>
    <div className={cn(
      "w-11 h-6 rounded-full relative transition-colors duration-300",
      checked ? "bg-primary dark:bg-[#7c3aed]" : "bg-border dark:bg-white/[0.1]"
    )}>
      <motion.div
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ left: checked ? 24 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  </motion.button>
);

// ─── DOCUMENT UPLOAD CARD ───────────────────────────────────────────────────

interface DocEntry {
  id: string;
  label: string;
  description: string;
  required: boolean;
  category: 'identity' | 'income' | 'property' | 'business' | 'education';
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
          ? "bg-primary/[0.03] dark:bg-[#7c3aed]/[0.03] border-primary/20 dark:border-[#7c3aed]/20"
          : "bg-secondary/30 dark:bg-white/[0.02] border-border dark:border-white/[0.06] hover:border-primary/15 dark:hover:border-white/[0.1]"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
          file ? "bg-primary/10 dark:bg-[#7c3aed]/10" : "bg-secondary dark:bg-white/[0.05]"
        )}>
          {file ? (
            <Check className="w-4 h-4 text-primary dark:text-[#7c3aed]" />
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
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/5 dark:bg-[#7c3aed]/5 border border-primary/10 dark:border-[#7c3aed]/10">
                <FileText className="w-3 h-3 text-primary dark:text-[#7c3aed]" />
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
  const emp = store.basicKYC.employmentType;
  const finPath = store.financialDetails.path;
  const loanType = store.loanRequirements.loanType;
  const fp = store.financialFootprint;

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

  // EDUCATION LOAN
  if (loanType === 'EDUCATIONAL_LOAN') {
    docs.push(
      { id: 'admission_letter', label: 'Admission / Offer Letter', description: 'Confirmed admission or conditional offer from institution', required: true, category: 'education' },
      { id: 'fee_structure', label: 'Fee Structure', description: 'Detailed semester-wise fee breakdown from institution', required: true, category: 'education' },
      { id: 'marksheets', label: 'Academic Records', description: 'Last qualifying examination marksheets', required: true, category: 'education' },
    );
  }

  return docs;
}

const CATEGORY_META: Record<DocEntry['category'], { label: string; icon: any; color: string }> = {
  identity: { label: 'Identity & KYC', icon: ShieldCheck, color: 'text-violet-500' },
  income: { label: 'Income Proof', icon: IndianRupee, color: 'text-blue-500' },
  property: { label: 'Property Documents', icon: Home, color: 'text-amber-500' },
  business: { label: 'Business Documents', icon: BriefcaseBusiness, color: 'text-violet-500' },
  education: { label: 'Education Documents', icon: GraduationCap, color: 'text-pink-500' },
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
    store.basicKYC.employmentType,
    store.financialDetails.path,
    store.loanRequirements.loanType,
    store.financialFootprint.isAbove50Lakhs,
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
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 dark:bg-[#7c3aed]/5 blur-[60px] rounded-full pointer-events-none" />

        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-[#111] border border-border dark:border-white/[0.06] flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-primary dark:text-[#7c3aed]" />
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
                <span className="text-primary dark:text-[#7c3aed]">{uploadedRequired}</span>
                <span className="text-muted-foreground/30"> / {totalRequired}</span>
              </p>
            </div>
            <div className="relative w-10 h-10">
              <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2" className="text-border dark:text-white/[0.06]" />
                <motion.circle
                  cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round"
                  className="text-primary dark:text-[#7c3aed]"
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
            This checklist is personalized for <span className="text-foreground font-semibold">{store.basicKYC.employmentType === 'SALARIED' ? 'Salaried' : store.basicKYC.employmentType === 'PROFESSIONAL' ? 'Professional' : 'Self-Employed'}</span> applicants
            {(store.loanRequirements.loanType === 'HOME_LOAN' || store.loanRequirements.loanType === 'LAP') && ' with property documentation'}
            {store.loanRequirements.loanType === 'BUSINESS_LOAN' && store.financialFootprint.isAbove50Lakhs && ' (High-value business loan)'}
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

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

const EMPLOYMENT_OPTIONS: { value: EmploymentType; label: string; icon: any }[] = [
  { value: "SALARIED", label: "Salaried", icon: Building2 },
  { value: "PROFESSIONAL", label: "Professional", icon: GraduationCap },
  { value: "SELF_EMPLOYED", label: "Business", icon: BriefcaseBusiness },
];

const PRODUCT_OPTIONS: { value: LoanType; label: string }[] = [
  { value: "PERSONAL_LOAN", label: "Personal Loan" },
  { value: "HOME_LOAN", label: "Home Loan" },
  { value: "BUSINESS_LOAN", label: "Business Loan" },
  { value: "EDUCATIONAL_LOAN", label: "Education Loan" },
  { value: "LAP", label: "Loan Against Property" },
];

// ─── STEP METADATA ──────────────────────────────────────────────────────────

const STEP_META = [
  { stage: 1 as StageNumber, label: "Identity", icon: User },
  { stage: 2 as StageNumber, label: "Employment", icon: Briefcase },
  { stage: 3 as StageNumber, label: "Loan Details", icon: IndianRupee },
];

// ─── VALIDATION ─────────────────────────────────────────────────────────────

type ValidationErrors = Record<string, string>;

function validateStage1(store: ReturnType<typeof useApplicationStore.getState>): ValidationErrors {
  const k = store.basicKYC;
  const errors: ValidationErrors = {};
  if (!k.fullName || k.fullName.trim().length < 3) errors.fullName = "Name must be at least 3 characters";
  if (!k.mobileNumber || !/^[6-9]\d{9}$/.test(k.mobileNumber)) errors.mobileNumber = "Enter a valid 10-digit mobile number";
  if (!k.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(k.email)) errors.email = "Enter a valid email address";
  if (!k.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
  if (!k.state) errors.state = "Select your state";
  if (!k.city || k.city.trim().length < 2) errors.city = "Enter your city";
  if (!k.pinCode || !/^\d{6}$/.test(k.pinCode)) errors.pinCode = "Enter a valid 6-digit PIN code";
  return errors;
}

function validateStage2(store: ReturnType<typeof useApplicationStore.getState>): ValidationErrors {
  const errors: ValidationErrors = {};
  const emp = store.basicKYC.employmentType;
  if (!emp) { errors.employmentType = "Select your employment type"; return errors; }

  const fin = store.financialDetails;

  if (emp === "SALARIED" && fin.path === "SALARIED") {
    const d = fin.data;
    if (!d.subType) errors.subType = "Select private or government";
    if (!d.companyName || d.companyName.trim().length < 2) errors.companyName = "Enter your company name";
    if (!d.designation || d.designation.trim().length < 2) errors.designation = "Enter your designation";
    if (!d.netMonthlySalary || d.netMonthlySalary < 10000) errors.netMonthlySalary = "Minimum salary is ₹10,000";
    if (d.totalExperienceYears < 0) errors.totalExperienceYears = "Enter valid experience";
  }

  if (emp === "PROFESSIONAL" && fin.path === "PROFESSIONAL") {
    const d = fin.data;
    if (!d.subType) errors.subType = "Select your profession";
    if (!d.practiceName || d.practiceName.trim().length < 2) errors.practiceName = "Enter your practice/firm name";
    if (d.practiceYears < 0) errors.practiceYears = "Enter valid practice vintage";
    if (!d.netMonthlyIncome || d.netMonthlyIncome < 10000) errors.netMonthlyIncome = "Minimum income is ₹10,000";
  }

  if (emp === "SELF_EMPLOYED" && fin.path === "SELF_EMPLOYED") {
    const d = fin.data;
    if (!d.subType) errors.subType = "Select your business program";
    if (!d.businessName || d.businessName.trim().length < 2) errors.businessName = "Enter your business name";
    if (!d.netMonthlyIncome || d.netMonthlyIncome < 10000) errors.netMonthlyIncome = "Minimum income is ₹10,000";
  }

  return errors;
}

function validateStage3(store: ReturnType<typeof useApplicationStore.getState>): ValidationErrors {
  const errors: ValidationErrors = {};
  const lr = store.loanRequirements;
  if (!lr.loanAmount || lr.loanAmount < 50000) errors.loanAmount = "Minimum loan amount is ₹50,000";
  if (!lr.tenureYears || lr.tenureYears < 1) errors.tenure = "Select a tenure";
  return errors;
}

function validateStage4(store: ReturnType<typeof useApplicationStore.getState>): ValidationErrors {
  const errors: ValidationErrors = {};
  const fp = store.financialFootprint;
  if (!fp.panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(fp.panNumber.toUpperCase())) errors.panNumber = "Invalid PAN format (e.g. ABCDE1234F)";
  if (!fp.primaryBankName || fp.primaryBankName.trim().length < 2) errors.primaryBankName = "Enter your primary bank name";
  if (fp.totalExistingEMI < 0) errors.totalExistingEMI = "EMI cannot be negative";

  // Conditional: property value required if property identified on HOME_LOAN/LAP
  const lt = store.loanRequirements.loanType;
  if ((lt === 'HOME_LOAN' || lt === 'LAP') && fp.propertyIdentified) {
    if (!fp.estimatedPropertyValue || fp.estimatedPropertyValue < 100000) {
      errors.estimatedPropertyValue = "Enter estimated property value (min ₹1 Lakh)";
    }
  }
  return errors;
}

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
  const store = useApplicationStore();

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
        education: "EDUCATIONAL_LOAN",
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
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map internal stages to display steps (we only show 1-4 for now)
  const displayStep = Math.min(store.currentStage, 4);

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

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(() => {
    // Validate Stage 3 before allowing submission
    const validationErrors = validateStage3(useApplicationStore.getState());
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({ title: "Incomplete Details", description: "Please complete your loan requirements.", variant: "destructive" });
      return;
    }
    setErrors({});
    store.completeStage(3 as StageNumber);

    setIsSubmitting(true);

    // Bridge to the old Apply.tsx interface
    const data = {
      fullName: store.basicKYC.fullName,
      email: store.basicKYC.email,
      phone: store.basicKYC.mobileNumber,
      panCard: store.basicKYC.panNumber,
      dob: store.basicKYC.dateOfBirth,
      productType: store.loanRequirements.loanType.toLowerCase().replace('_loan', '').replace('_', ''),
      loanAmount: store.loanRequirements.loanAmount,
      loanTenure: store.loanRequirements.tenureYears,
      cibilScore: store.loanRequirements.cibilScore,
      occupation: store.basicKYC.employmentType?.toLowerCase() || "salaried",
      monthlyIncome: (() => {
        const fin = store.financialDetails;
        if (fin.path === "SALARIED") return fin.data.netMonthlySalary;
        if (fin.path === "PROFESSIONAL") return fin.data.netMonthlyIncome;
        if (fin.path === "SELF_EMPLOYED") return fin.data.netMonthlyIncome;
        return 50000;
      })(),
      state: store.basicKYC.state,
      city: store.basicKYC.city,
      employmentType: store.basicKYC.employmentType,
    };

    onFormSubmit?.(data);
    setIsAnalyzing(true);
  }, [store, onFormSubmit]);

  const handleAnalysisComplete = useCallback(() => {
    navigate("/offers", {
      state: {
        cibilScore: store.loanRequirements.cibilScore,
        productType: store.loanRequirements.loanType,
        monthlyIncome: 50000,
        loanAmount: store.loanRequirements.loanAmount,
        fullName: store.basicKYC.fullName,
      },
    });
  }, [navigate, store]);

  // ── CIBIL UI ──────────────────────────────────────────────────────────────

  const cibilScore = store.loanRequirements.cibilScore;
  const cibilUi = useMemo(() => {
    if (cibilScore >= 750) return { color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20", label: "Excellent" };
    if (cibilScore >= 650) return { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Good" };
    if (cibilScore >= 550) return { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Fair" };
    return { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "Poor" };
  }, [cibilScore]);

  // ── Style tokens ──────────────────────────────────────────────────────────

  const cardCn = "bg-card dark:bg-[#0a0a0a] border border-border dark:border-white/[0.06] rounded-[1.75rem] p-6 md:p-8 relative overflow-hidden transition-colors duration-300 hover:border-primary/10 dark:hover:border-white/[0.08]";

  // ═════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════════

  const getIncomeOrFallback = () => {
    const fin = store.financialDetails;
    if (fin.path === "SALARIED") return fin.data.netMonthlySalary || 50000;
    if (fin.path === "PROFESSIONAL") return fin.data.netMonthlyIncome || 50000;
    if (fin.path === "SELF_EMPLOYED") return fin.data.netMonthlyIncome || 50000;
    return 50000;
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0 h-full w-full relative">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-xl font-semibold text-foreground tracking-tight mb-1">
            Start Your Application
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Complete the fields below to find your best loan match.
          </p>

          {/* Step Indicator */}
          <div className="relative flex justify-between items-center mb-2">
            {STEP_META.map((meta, i) => {
              const isActive = displayStep >= meta.stage;
              const isCurrent = displayStep === meta.stage;
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
                        ? "bg-primary dark:bg-[#7c3aed] text-white"
                        : "bg-secondary dark:bg-[#1a1a1a] text-muted-foreground border border-border dark:border-white/10"
                    )}
                  >
                    {isActive && meta.stage < displayStep ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      meta.stage
                    )}
                  </motion.div>
                  <span className={cn(
                    "text-[10px] mt-2 font-semibold uppercase tracking-widest transition-colors duration-300",
                    isActive ? "text-primary dark:text-[#7c3aed]" : "text-muted-foreground/50"
                  )}>
                    {meta.label}
                  </span>
                </div>
              );
            })}
            {/* Connector line */}
            <div className="absolute top-4 left-8 right-8 h-[2px] bg-border dark:bg-white/[0.06] -z-0">
              <motion.div
                className="h-full bg-primary dark:bg-[#7c3aed]"
                animate={{ width: `${((displayStep - 1) / (STEP_META.length - 1)) * 100}%` }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>
        </div>

        {/* ── Step Content ─────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait" custom={direction}>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STAGE 1: BASIC KYC                                             */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {store.currentStage === 1 && (
            <motion.div
              key="stage1"
              custom={direction}
              initial={{ x: direction * 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } }}
              exit={{ x: direction * -24, opacity: 0, transition: { duration: 0.15 } }}
              className={cardCn}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 dark:bg-[#7c3aed]/5 blur-[60px] rounded-full pointer-events-none" />

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-[#111] border border-border dark:border-white/[0.06] flex items-center justify-center">
                  <User className="w-5 h-5 text-primary dark:text-[#7c3aed]" />
                </div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">Verify Identity</h3>
              </div>

              <div className="space-y-5 relative z-10">
                <ValidatedInput
                  label="Full Name (As per PAN)"
                  placeholder="Rahul Sharma"
                  icon={User}
                  isSecure
                  value={store.basicKYC.fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBasicKYC({ fullName: e.target.value })}
                  isValid={store.basicKYC.fullName.length >= 3}
                  error={errors.fullName}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ValidatedInput
                    label="Mobile Number"
                    placeholder="9876543210"
                    icon={Phone}
                    maxLength={10}
                    value={store.basicKYC.mobileNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBasicKYC({ mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    isValid={/^[6-9]\d{9}$/.test(store.basicKYC.mobileNumber)}
                    error={errors.mobileNumber}
                  />
                  <ValidatedInput
                    label="Email Address"
                    type="email"
                    placeholder="rahul@company.com"
                    icon={Mail}
                    isSecure
                    value={store.basicKYC.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBasicKYC({ email: e.target.value })}
                    isValid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(store.basicKYC.email)}
                    error={errors.email}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ValidatedInput
                    label="Date of Birth"
                    type="date"
                    icon={Calendar}
                    isSecure
                    value={store.basicKYC.dateOfBirth}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBasicKYC({ dateOfBirth: e.target.value })}
                    isValid={!!store.basicKYC.dateOfBirth}
                    error={errors.dateOfBirth}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <StyledSelect
                    label="State"
                    icon={MapPin}
                    value={store.basicKYC.state}
                    onValueChange={(v) => store.updateBasicKYC({ state: v })}
                    placeholder="Select State"
                    error={errors.state}
                  >
                    {STATES.map((s) => (
                      <SelectItem key={s} value={s} className="cursor-pointer">{s}</SelectItem>
                    ))}
                  </StyledSelect>

                  <ValidatedInput
                    label="City"
                    placeholder="Mumbai"
                    icon={Building2}
                    value={store.basicKYC.city}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBasicKYC({ city: e.target.value })}
                    isValid={store.basicKYC.city.length >= 2}
                    error={errors.city}
                  />

                  <ValidatedInput
                    label="PIN Code"
                    placeholder="400001"
                    icon={Hash}
                    maxLength={6}
                    value={store.basicKYC.pinCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBasicKYC({ pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    isValid={/^\d{6}$/.test(store.basicKYC.pinCode)}
                    error={errors.pinCode}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STAGE 2: EMPLOYMENT & INCOME (The Smart Pivot)                  */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {store.currentStage === 2 && (
            <motion.div
              key="stage2"
              custom={direction}
              initial={{ x: direction * 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } }}
              exit={{ x: direction * -24, opacity: 0, transition: { duration: 0.15 } }}
              className="space-y-5"
            >
              {/* Employment Category Selector */}
              <div className={cardCn}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 dark:bg-[#7c3aed]/5 blur-[60px] rounded-full pointer-events-none" />

                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-[#111] border border-border dark:border-white/[0.06] flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary dark:text-[#7c3aed]" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight">Employment & Income</h3>
                </div>

                <div className="space-y-6 relative z-10">
                  <PillSelector<EmploymentType>
                    label="What describes you best?"
                    icon={Briefcase}
                    options={EMPLOYMENT_OPTIONS}
                    value={store.basicKYC.employmentType}
                    onChange={(v) => {
                      store.updateBasicKYC({ employmentType: v });
                      setErrors({});
                    }}
                  />
                  {errors.employmentType && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 font-medium ml-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.employmentType}
                    </motion.p>
                  )}

                  {/* ─── DYNAMIC BRANCHING ─────────────────────────────────── */}
                  <AnimatePresence mode="wait">

                    {/* ── SALARIED PATH ──────────────────────────────────── */}
                    {store.basicKYC.employmentType === "SALARIED" && (
                      <motion.div
                        key="salaried"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="space-y-5 overflow-hidden"
                      >
                        <div className="h-px bg-gradient-to-r from-transparent via-border dark:via-white/[0.06] to-transparent" />

                        <PillSelector<SalariedSubType>
                          label="Employer Type"
                          options={[
                            { value: "PRIVATE", label: "Private Sector", icon: Building2 },
                            { value: "GOVERNMENT", label: "Government / PSU", icon: Landmark },
                          ]}
                          value={store.financialDetails.path === "SALARIED" ? store.financialDetails.data.subType : null}
                          onChange={(v) => store.updateSalariedDetails({ subType: v })}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <ValidatedInput
                            label="Company Name"
                            placeholder="Tata Consultancy Services"
                            icon={Building2}
                            value={store.financialDetails.path === "SALARIED" ? store.financialDetails.data.companyName : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateSalariedDetails({ companyName: e.target.value })}
                            isValid={(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.companyName : "").length >= 2}
                            error={errors.companyName}
                          />
                          <ValidatedInput
                            label="Designation"
                            placeholder="Software Engineer"
                            icon={Briefcase}
                            value={store.financialDetails.path === "SALARIED" ? store.financialDetails.data.designation : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateSalariedDetails({ designation: e.target.value })}
                            isValid={(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.designation : "").length >= 2}
                            error={errors.designation}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <ValidatedInput
                            label="Net Monthly Salary (₹)"
                            type="number"
                            placeholder="85000"
                            icon={IndianRupee}
                            value={store.financialDetails.path === "SALARIED" ? (store.financialDetails.data.netMonthlySalary || "") : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateSalariedDetails({ netMonthlySalary: Number(e.target.value) })}
                            isValid={(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.netMonthlySalary : 0) >= 10000}
                            error={errors.netMonthlySalary}
                          />
                          <ValidatedInput
                            label="Total Experience (Years)"
                            type="number"
                            placeholder="5"
                            icon={Calendar}
                            value={store.financialDetails.path === "SALARIED" ? (store.financialDetails.data.totalExperienceYears || "") : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateSalariedDetails({ totalExperienceYears: Number(e.target.value) })}
                            isValid={(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.totalExperienceYears : 0) > 0}
                            error={errors.totalExperienceYears}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* ── PROFESSIONAL PATH ──────────────────────────────── */}
                    {store.basicKYC.employmentType === "PROFESSIONAL" && (
                      <motion.div
                        key="professional"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="space-y-5 overflow-hidden"
                      >
                        <div className="h-px bg-gradient-to-r from-transparent via-border dark:via-white/[0.06] to-transparent" />

                        <PillSelector<ProfessionalSubType>
                          label="Profession"
                          options={[
                            { value: "CA", label: "Chartered Accountant", icon: GraduationCap },
                            { value: "CS", label: "Company Secretary", icon: GraduationCap },
                            { value: "DOCTOR", label: "Doctor", icon: Stethoscope },
                            { value: "LAWYER", label: "Lawyer", icon: Scale },
                          ]}
                          value={store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.subType : null}
                          onChange={(v) => store.updateProfessionalDetails({ subType: v })}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <ValidatedInput
                            label="Practice / Firm Name"
                            placeholder="Sharma & Associates"
                            icon={Building2}
                            value={store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.practiceName : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateProfessionalDetails({ practiceName: e.target.value })}
                            isValid={(store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.practiceName : "").length >= 2}
                            error={errors.practiceName}
                          />
                          <ValidatedInput
                            label="Practice Vintage (Years)"
                            type="number"
                            placeholder="8"
                            icon={Calendar}
                            value={store.financialDetails.path === "PROFESSIONAL" ? (store.financialDetails.data.practiceYears || "") : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateProfessionalDetails({ practiceYears: Number(e.target.value) })}
                            isValid={(store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.practiceYears : 0) > 0}
                            error={errors.practiceYears}
                          />
                        </div>

                        <ValidatedInput
                          label="Net Monthly Income (₹)"
                          type="number"
                          placeholder="150000"
                          icon={IndianRupee}
                          value={store.financialDetails.path === "PROFESSIONAL" ? (store.financialDetails.data.netMonthlyIncome || "") : ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateProfessionalDetails({ netMonthlyIncome: Number(e.target.value) })}
                          isValid={(store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.netMonthlyIncome : 0) >= 10000}
                          error={errors.netMonthlyIncome}
                        />
                      </motion.div>
                    )}

                    {/* ── SELF-EMPLOYED / BUSINESS PATH ──────────────────── */}
                    {store.basicKYC.employmentType === "SELF_EMPLOYED" && (
                      <motion.div
                        key="business"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="space-y-5 overflow-hidden"
                      >
                        <div className="h-px bg-gradient-to-r from-transparent via-border dark:via-white/[0.06] to-transparent" />

                        <PillSelector<BusinessSubType>
                          label="Business Program"
                          options={[
                            { value: "ITR_BASED", label: "ITR Based", icon: CreditCard },
                            { value: "GST_BASED", label: "GST Based", icon: CreditCard },
                            { value: "BANKING_PROGRAM", label: "Banking (ABB)", icon: Landmark },
                            { value: "CASH_FLOW_PROGRAM", label: "Cash Flow", icon: IndianRupee },
                          ]}
                          value={store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.subType : null}
                          onChange={(v) => store.updateBusinessDetails({ subType: v })}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <ValidatedInput
                            label="Business Name"
                            placeholder="Sharma Enterprises"
                            icon={BriefcaseBusiness}
                            value={store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.businessName : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBusinessDetails({ businessName: e.target.value })}
                            isValid={(store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.businessName : "").length >= 2}
                            error={errors.businessName}
                          />
                          <ValidatedInput
                            label="Annual Turnover (₹)"
                            type="number"
                            placeholder="5000000"
                            icon={IndianRupee}
                            value={store.financialDetails.path === "SELF_EMPLOYED" ? (store.financialDetails.data.annualTurnover || "") : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBusinessDetails({ annualTurnover: Number(e.target.value) })}
                            isValid={(store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.annualTurnover || 0 : 0) > 0}
                          />
                        </div>

                        <ValidatedInput
                          label="Net Monthly Income (₹)"
                          type="number"
                          placeholder="100000"
                          icon={IndianRupee}
                          value={store.financialDetails.path === "SELF_EMPLOYED" ? (store.financialDetails.data.netMonthlyIncome || "") : ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBusinessDetails({ netMonthlyIncome: Number(e.target.value) })}
                          isValid={(store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.netMonthlyIncome : 0) >= 10000}
                          error={errors.netMonthlyIncome}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STAGE 3: LOAN DETAILS                                           */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {store.currentStage === 3 && (
            <motion.div
              key="stage3"
              custom={direction}
              initial={{ x: direction * 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } }}
              exit={{ x: direction * -24, opacity: 0, transition: { duration: 0.15 } }}
              className="space-y-5"
            >
              <div className={cardCn}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 dark:bg-[#7c3aed]/5 blur-[60px] rounded-full pointer-events-none" />

                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-[#111] border border-border dark:border-white/[0.06] flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-primary dark:text-[#7c3aed]" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight">Loan Details</h3>
                </div>

                <div className="space-y-6 relative z-10">
                  {/* Product Selector */}
                  <PillSelector<LoanType>
                    label="Select Product"
                    options={PRODUCT_OPTIONS.map(p => ({ ...p, icon: undefined }))}
                    value={store.loanRequirements.loanType}
                    onChange={(v) => store.updateLoanRequirements({ loanType: v })}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ValidatedInput
                      label="Loan Amount (₹)"
                      type="number"
                      placeholder="500000"
                      icon={IndianRupee}
                      value={store.loanRequirements.loanAmount || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateLoanRequirements({ loanAmount: Number(e.target.value) })}
                      isValid={store.loanRequirements.loanAmount >= 50000}
                    />
                    <StyledSelect
                      label="Tenure (Years)"
                      value={store.loanRequirements.tenureYears.toString()}
                      onValueChange={(v) => store.updateLoanRequirements({ tenureYears: parseInt(v) })}
                      placeholder="Select tenure"
                    >
                      {[1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30].map((y) => (
                        <SelectItem key={y} value={y.toString()} className="cursor-pointer">
                          {y} {y === 1 ? "Year" : "Years"}
                        </SelectItem>
                      ))}
                    </StyledSelect>
                  </div>

                  {/* CIBIL Slider */}
                  <div className={`p-5 rounded-2xl border backdrop-blur-sm transition-colors duration-500 ${cibilUi.bg} ${cibilUi.border}`}>
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-2">
                        <CreditCard className={`w-5 h-5 ${cibilUi.color}`} />
                        <span className="text-sm font-medium text-muted-foreground">CIBIL Score</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.span
                          key={cibilScore}
                          initial={{ y: -8, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className={`text-2xl font-semibold tabular-nums ${cibilUi.color}`}
                        >
                          {cibilScore}
                        </motion.span>
                        <span className={`text-[10px] font-medium uppercase tracking-widest px-2 py-1 rounded border ${cibilUi.bg} ${cibilUi.color} ${cibilUi.border}`}>
                          {cibilUi.label}
                        </span>
                      </div>
                    </div>
                    <Slider
                      value={[cibilScore]}
                      onValueChange={(v) => store.updateLoanRequirements({ cibilScore: v[0] })}
                      min={300} max={900} step={10}
                      className="cursor-pointer mb-2"
                    />
                    <div className="flex justify-between text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest mt-2">
                      <span>300</span>
                      <span>900</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STAGE 4: FINANCIAL FOOTPRINT                                    */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {store.currentStage === 4 && (
            <motion.div
              key="stage4"
              custom={direction}
              initial={{ x: direction * 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } }}
              exit={{ x: direction * -24, opacity: 0, transition: { duration: 0.15 } }}
              className="space-y-5"
            >
              {/* ── Universal Financial Footprint Card ──────────────────────── */}
              <div className={cardCn}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 dark:bg-[#7c3aed]/5 blur-[60px] rounded-full pointer-events-none" />

                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-[#111] border border-border dark:border-white/[0.06] flex items-center justify-center">
                    <FileSearch className="w-5 h-5 text-primary dark:text-[#7c3aed]" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight">Financial Footprint</h3>
                </div>

                <div className="space-y-5 relative z-10">
                  {/* PAN (moved here from Stage 1 for lower initial friction) */}
                  <ValidatedInput
                    label="PAN Card Number"
                    placeholder="ABCDE1234F"
                    icon={CreditCard}
                    isSecure
                    value={store.financialFootprint.panNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateFinancialFootprint({ panNumber: e.target.value.toUpperCase() })}
                    isValid={/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(store.financialFootprint.panNumber)}
                    error={errors.panNumber}
                    style={{ textTransform: "uppercase", letterSpacing: "0.15em" }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ValidatedInput
                      label="Total Existing EMIs (Monthly ₹)"
                      type="number"
                      placeholder="15000"
                      icon={HandCoins}
                      value={store.financialFootprint.totalExistingEMI || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateFinancialFootprint({ totalExistingEMI: Number(e.target.value) })}
                      isValid={store.financialFootprint.totalExistingEMI >= 0}
                      error={errors.totalExistingEMI}
                    />
                    <ValidatedInput
                      label="Primary Bank Account"
                      placeholder="HDFC Bank"
                      icon={Landmark}
                      value={store.financialFootprint.primaryBankName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateFinancialFootprint({ primaryBankName: e.target.value })}
                      isValid={store.financialFootprint.primaryBankName.length >= 2}
                      error={errors.primaryBankName}
                    />
                  </div>

                  {/* Co-Applicant Toggle */}
                  <ToggleSwitch
                    label="Adding a Co-Applicant?"
                    description="A co-applicant can increase your loan eligibility"
                    icon={UserPlus}
                    checked={store.financialFootprint.hasCoApplicant}
                    onChange={(v) => store.updateFinancialFootprint({ hasCoApplicant: v })}
                  />
                </div>
              </div>

              {/* ── Conditional Overrides ───────────────────────────────────── */}
              <AnimatePresence mode="wait">

                {/* HOME_LOAN / LAP → Property Toggle */}
                {(store.loanRequirements.loanType === "HOME_LOAN" || store.loanRequirements.loanType === "LAP") && (
                  <motion.div
                    key="property-override"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className={cardCn}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Home className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Property Details</h4>
                        <p className="text-[11px] text-muted-foreground/60">Required for {store.loanRequirements.loanType === 'HOME_LOAN' ? 'Home Loan' : 'Loan Against Property'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <ToggleSwitch
                        label="Have you identified a property?"
                        description="If yes, we'll need the estimated value"
                        icon={Home}
                        checked={store.financialFootprint.propertyIdentified}
                        onChange={(v) => store.updateFinancialFootprint({ propertyIdentified: v })}
                      />

                      <AnimatePresence>
                        {store.financialFootprint.propertyIdentified && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <ValidatedInput
                              label="Estimated Property Value (₹)"
                              type="number"
                              placeholder="5000000"
                              icon={IndianRupee}
                              value={store.financialFootprint.estimatedPropertyValue || ""}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateFinancialFootprint({ estimatedPropertyValue: Number(e.target.value) })}
                              isValid={store.financialFootprint.estimatedPropertyValue >= 100000}
                              error={errors.estimatedPropertyValue}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {/* BUSINESS_LOAN → Above ₹50 Lakhs Toggle */}
                {store.loanRequirements.loanType === "BUSINESS_LOAN" && (
                  <motion.div
                    key="business-override"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className={cardCn}
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <BriefcaseBusiness className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Business Loan Override</h4>
                        <p className="text-[11px] text-muted-foreground/60">Additional verification for higher limits</p>
                      </div>
                    </div>

                    <ToggleSwitch
                      label="Is requested limit above ₹50 Lakhs?"
                      description="Higher limits require additional underwriting"
                      icon={IndianRupee}
                      checked={store.financialFootprint.isAbove50Lakhs}
                      onChange={(v) => store.updateFinancialFootprint({ isAbove50Lakhs: v })}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STAGE 5: DOCUMENT VAULT                                         */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {store.currentStage === 5 && (
            <DocumentVaultStage
              store={store}
              direction={direction}
              cardCn={cardCn}
            />
          )}
        </AnimatePresence>

        {/* ── Real-Time Signal Injection ──────────────────────────────────────── */}
        <div className="mt-6 p-4 rounded-xl bg-primary/5 dark:bg-[#7c3aed]/5 border border-primary/10 dark:border-[#7c3aed]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-[#7c3aed]/10 flex items-center justify-center animate-pulse">
              <Sparkles className="w-4 h-4 text-primary dark:text-[#7c3aed]" />
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

        {/* ── Navigation ──────────────────────────────────────────────────── */}
        <div className="mt-4 pt-6 flex flex-col items-center gap-4">
          <div className="w-full flex items-center justify-between">
          <motion.div whileHover={store.currentStage > 1 ? { x: -2 } : {}} whileTap={store.currentStage > 1 ? { scale: 0.96 } : {}}>
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={store.currentStage === 1 || isSubmitting || isAnalyzing}
              className={cn(
                "bg-transparent border-border dark:border-white/10 text-muted-foreground hover:bg-secondary dark:hover:bg-white/5 hover:border-primary/20 rounded-xl transition-all duration-200",
                store.currentStage === 1 && "opacity-0 pointer-events-none"
              )}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </motion.div>

          {store.currentStage < 3 ? (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button
                type="button"
                onClick={nextStep}
                className="bg-primary dark:bg-[#7c3aed] hover:bg-primary/90 dark:hover:bg-[#6d28d9] text-white rounded-xl px-6 py-5 font-semibold transition-colors duration-200"
              >
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isAnalyzing}
                className="rounded-xl bg-primary dark:bg-[#7c3aed] hover:bg-primary/90 dark:hover:bg-[#6d28d9] text-white px-8 py-5 font-semibold transition-colors duration-200 min-w-[180px]"
              >
                {isSubmitting || isAnalyzing ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</span>
                ) : (
                  <span className="flex items-center gap-2"><ArrowRight className="w-5 h-5" /> See My Offers</span>
                )}
              </Button>
            </motion.div>
          )}
          </div>
          
          {/* Trust Microcopy Injection */}
          <p className="text-[10.5px] text-muted-foreground/60 font-medium flex items-center gap-1.5 text-center mt-2 group">
            <LockKeyhole className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors" /> 
            Checking eligibility will <span className="font-semibold text-foreground/80">not</span> affect your credit score
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default LoanApplicationForm;