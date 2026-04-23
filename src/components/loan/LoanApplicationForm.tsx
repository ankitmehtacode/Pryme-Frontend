import {
  useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User, Briefcase, CheckCircle2, XCircle, LockKeyhole, ArrowRight,
  ChevronRight, ChevronLeft, IndianRupee, Loader2, AlertCircle,
  Building2, Stethoscope, Scale, GraduationCap, CreditCard, MapPin,
  Phone, Mail, Calendar, Hash, Landmark, BriefcaseBusiness,
  Home, HandCoins, FileSearch, UserPlus, ToggleLeft,
  Upload, FolderOpen, FileText, ShieldCheck, Check, X, CloudUpload, Sparkles, Edit2, ShieldAlert
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
import { useShallow } from "zustand/react/shallow";
import type {
  EmploymentType, SalariedSubType, ProfessionalSubType, BusinessSubType,
  StageNumber, LoanType, ApplicationStore, PropertyType, HomePropertyType,
  CommercialPropertyType, IndustrialPropertyType
} from "@/lib/applicationTypes";
import {
  EMPLOYMENT_LABELS, SALARIED_LABELS, PROFESSIONAL_LABELS,
  BUSINESS_LABELS, LOAN_TYPE_LABELS, STAGE_LABELS
} from "@/lib/applicationTypes";

// ─── STABLE VALIDATED INPUT (outside component to prevent remount) ──────────

const ValidatedInput = React.forwardRef<HTMLInputElement, any>(
  ({ label, error, isValid, icon: Icon, className: _className, ...props }, ref) => (
    <div className="relative group w-full">
      <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80 dark:text-[#103783]/80 ml-1 mb-1 block">{label}</Label>
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
            "w-full bg-secondary/50 dark:bg-white/[0.03] border border-border dark:border-white/[0.06] rounded-xl px-4 py-6 text-sm font-medium text-foreground outline-none transition-all duration-200 group-hover:border-primary/20 dark:group-hover:border-white/15 focus:border-primary/60 dark:focus:border-[#103783]/50 focus:ring-2 focus:ring-inset focus:ring-primary/10 dark:focus:ring-[#103783]/10",
            Icon && "pl-11",
            error && "border-red-500/30 focus:ring-red-500/10 focus:border-red-500/50",
            isValid && !error && "border-primary/20 dark:border-[#103783]/20"
          )}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {error && (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
              <XCircle className="w-4 h-4 text-red-500/80" />
            </motion.div>
          )}
          {isValid && !error && (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
              <CheckCircle2 className="w-4 h-4 text-primary dark:text-[#103783]" />
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
    <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80 dark:text-[#103783]/80 ml-1 mb-1 block">{label}</Label>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn(
        "relative w-full bg-secondary/50 dark:bg-white/[0.03] border border-border dark:border-white/[0.06] rounded-xl px-4 py-6 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/20 dark:hover:border-white/15 focus:border-primary/60 dark:focus:border-[#103783]/50 focus:ring-2 focus:ring-inset focus:ring-primary/10 dark:focus:ring-[#103783]/10",
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
      <SelectContent className="bg-card dark:bg-[#0d1829] border-border dark:border-white/[0.06] rounded-xl">
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
    <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80 dark:text-[#103783]/80 ml-1 mb-2 flex items-center gap-2">
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
              "py-3.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 border flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50",
              isSelected
                ? "bg-primary dark:bg-[#103783] text-white border-primary dark:border-[#103783] shadow-lg shadow-primary/20 dark:shadow-[#103783]/20"
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
        ? "bg-primary/5 dark:bg-[#103783]/5 border-primary/20 dark:border-[#103783]/20"
        : "bg-secondary/30 dark:bg-white/[0.02] border-border dark:border-white/[0.06] hover:border-primary/10 dark:hover:border-white/[0.1]"
    )}
  >
    <div className="flex items-center gap-3">
      {Icon && (
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
          checked ? "bg-primary/10 dark:bg-[#103783]/10" : "bg-secondary dark:bg-white/[0.05]"
        )}>
          <Icon className={cn(
            "w-4 h-4 transition-colors",
            checked ? "text-primary dark:text-[#103783]" : "text-muted-foreground/50"
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
      checked ? "bg-primary dark:bg-[#103783]" : "bg-border dark:bg-white/[0.1]"
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

const STATE_CITIES: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kakinada", "Rajahmundry", "Tirupati", "Kadapa", "Anantapur", "Eluru", "Ongole", "Vizianagaram", "Machilipatnam", "Adoni", "Tenali", "Proddatur", "Chittoor", "Hindupur", "Bhimavaram", "Srikakulam", "Nandyal", "Tadepalligudem", "Narasaraopet"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Bomdila", "Along", "Tezu", "Namsai", "Roing", "Daporijo", "Changlang", "Khonsa", "Seppa", "Anini"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Karimganj", "Sivasagar", "Goalpara", "Dhubri", "North Lakhimpur", "Diphu", "Barpeta", "Golaghat", "Nalbari", "Mangaldai", "Haflong", "Kokrajhar"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Arrah", "Begusarai", "Katihar", "Munger", "Chapra", "Sasaram", "Hajipur", "Bihar Sharif", "Dehri", "Siwan", "Motihari", "Saharsa", "Bettiah", "Nawada", "Bagaha", "Buxar", "Kishanganj", "Jehanabad", "Aurangabad"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur", "Raigarh", "Ambikapur", "Chirmiri", "Dhamtari", "Mahasamund", "Kawardha", "Kanker", "Kondagaon", "Mungeli", "Bemetara", "Balod", "Janjgir"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Sanquelim", "Canacona", "Quepem", "Sanguem", "Valpoi", "Pernem"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Nadiad", "Morbi", "Mehsana", "Bharuch", "Navsari", "Surendranagar", "Porbandar", "Valsad", "Gandhidham", "Godhra", "Palanpur", "Vapi", "Veraval", "Dahod", "Botad"],
  "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula", "Bhiwani", "Bahadurgarh", "Sirsa", "Jind", "Thanesar", "Kaithal", "Rewari", "Palwal", "Hansi", "Narnaul", "Fatehabad", "Mahendragarh"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan", "Nahan", "Bilaspur", "Hamirpur", "Palampur", "Baddi", "Sundarnagar", "Kullu", "Manali", "Chamba", "Una", "Paonta Sahib", "Kangra", "Keylong", "Rampur", "Rohru", "Parwanoo"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar", "Giridih", "Ramgarh", "Medininagar", "Phusro", "Dumka", "Chaibasa", "Chatra", "Godda", "Lohardaga", "Pakur", "Sahebganj", "Jamtara", "Gumla", "Simdega"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Dharwad", "Belagavi", "Kalaburagi", "Davangere", "Ballari", "Shivamogga", "Tumakuru", "Udupi", "Vijayapura", "Raichur", "Hassan", "Mandya", "Chitradurga", "Gadag", "Haveri", "Bagalkot", "Chikkamagaluru", "Bidar", "Yadgir", "Ramanagara", "Kodagu"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Alappuzha", "Palakkad", "Malappuram", "Kottayam", "Kasaragod", "Pathanamthitta", "Idukki", "Wayanad", "Ernakulam", "Munnar", "Guruvayur", "Thalassery", "Mattancherry", "Perinthalmanna"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Katni", "Singrauli", "Burhanpur", "Khandwa", "Morena", "Bhind", "Chhindwara", "Guna", "Shivpuri", "Vidisha", "Damoh", "Mandsaur", "Chhatarpur", "Neemuch", "Datia"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Navi Mumbai", "Sangli", "Malegaon", "Jalgaon", "Akola", "Latur", "Dhule", "Ahmednagar", "Chandrapur", "Parbhani", "Nanded", "Ichalkaranji", "Jalna", "Bhiwandi", "Panvel", "Satara", "Beed", "Yavatmal", "Wardha", "Ratnagiri", "Gondia"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching", "Senapati", "Ukhrul", "Tamenglong", "Chandel", "Jiribam", "Moreh", "Moirang", "Nambol"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongstoin", "Williamnagar", "Baghmara", "Resubelpara", "Nongpoh", "Mairang", "Mawkyrwat", "Khliehriat", "Ampati"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Lawngtlai", "Saiha", "Mamit", "Saitual", "Hnahthial", "Khawzawl"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Mon", "Phek", "Kiphire", "Longleng", "Peren", "Chumukedima"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Baripada", "Bhadrak", "Jharsuguda", "Jeypore", "Bargarh", "Angul", "Kendrapara", "Dhenkanal", "Paradip", "Rayagada", "Koraput", "Phulbani", "Sundargarh"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Hoshiarpur", "Batala", "Moga", "Abohar", "Malerkotla", "Khanna", "Phagwara", "Muktsar", "Barnala", "Rajpura", "Firozpur", "Kapurthala", "Faridkot", "Mansa", "Sangrur", "Nawanshahr", "Gurdaspur"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Bharatpur", "Sikar", "Pali", "Sri Ganganagar", "Jhunjhunu", "Tonk", "Kishangarh", "Beawar", "Hanumangarh", "Chittorgarh", "Nagaur", "Bundi", "Churu", "Barmer", "Dholpur", "Sawai Madhopur", "Banswara", "Dungarpur", "Jaisalmer", "Mount Abu", "Pushkar"],
  "Sikkim": ["Gangtok", "Namchi", "Mangan", "Gyalshing", "Rangpo", "Singtam", "Jorethang", "Naya Bazar", "Ravangla", "Pelling", "Lachung", "Lachen", "Yuksom"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Thanjavur", "Dindigul", "Tiruppur", "Ranipet", "Sivakasi", "Karur", "Nagercoil", "Kanchipuram", "Kumbakonam", "Cuddalore", "Hosur", "Ooty", "Ambur", "Pollachi", "Krishnagiri", "Rajapalayam"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet", "Miryalaguda", "Siddipet", "Jagtial", "Mancherial", "Kamareddy", "Bhongir", "Bodhan", "Zaheerabad", "Medak", "Wanaparthy"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia", "Ambassa", "Khowai", "Sabroom", "Sonamura", "Amarpur", "Teliamura", "Bishalgarh", "Kamalpur"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Prayagraj", "Ghaziabad", "Noida", "Bareilly", "Aligarh", "Moradabad", "Gorakhpur", "Saharanpur", "Jhansi", "Muzaffarnagar", "Mathura", "Firozabad", "Ayodhya", "Shahjahanpur", "Rampur", "Loni", "Unnao", "Bulandshahr", "Sambhal", "Amroha", "Hardoi", "Fatehpur", "Hapur", "Etawah", "Mirzapur", "Budaun", "Bahraich", "Sitapur", "Sultanpur", "Deoria", "Azamgarh", "Basti", "Gonda", "Ballia", "Banda"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Roorkee", "Rudrapur", "Kashipur", "Nainital", "Mussoorie", "Pithoragarh", "Almora", "Bageshwar", "Chamoli", "Champawat", "Tehri", "Uttarkashi", "Pauri", "Srinagar", "Lansdowne", "Kotdwar"],
  "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur", "Shantiniketan", "Darjeeling", "Jalpaiguri", "Balurghat", "Basirhat", "Bankura", "Purulia", "Raiganj", "Cooch Behar", "Haldia", "Krishnanagar", "Midnapore", "Ranaghat", "Contai", "Bolpur"],
  "Delhi": ["New Delhi", "Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "North East Delhi", "North West Delhi", "South East Delhi", "South West Delhi", "Shahdara", "Dwarka", "Rohini", "Lajpat Nagar", "Karol Bagh", "Connaught Place", "Chandni Chowk", "Saket", "Vasant Kunj", "Mehrauli"]
};

const RELIGIONS = [
  "Hinduism", "Islam", "Christianity", "Sikhism", "Buddhism", "Jainism", "Other"
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
  if (!k.city) errors.city = "Select your city";
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
    if (d.subType === "PRIVATE" && !d.companyType) errors.companyType = "Select company type";
    if (!d.companyName || d.companyName.trim().length < 2) errors.companyName = "Enter your company name";
    if (!d.designation || d.designation.trim().length < 2) errors.designation = "Enter your designation";
    if (!d.netMonthlySalary || d.netMonthlySalary < 10000) errors.netMonthlySalary = "Minimum salary is ₹10,000";
    if (typeof d.totalExperienceYears !== 'number' || d.totalExperienceYears < 0) errors.totalExperienceYears = "Enter valid experience";
    if (typeof d.currentCompanyYears !== 'number' || d.currentCompanyYears < 0) errors.currentCompanyYears = "Enter valid current experience";
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

function validateStage4(_store: ReturnType<typeof useApplicationStore.getState>): ValidationErrors {
  return {};
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
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCibil, setEditingCibil] = useState(false);
  const [cibilInputVal, setCibilInputVal] = useState("");

  const formEndRef = useRef<HTMLDivElement>(null);
  const [isBottomVisible, setIsBottomVisible] = useState(false);

  // ── Co-Applicant Local State ──────────────────────────────────────────────
  const [coApplicant, setCoApplicant] = useState({
    fullName: '', mobileNumber: '', email: '', dateOfBirth: '',
    state: '', city: '', pinCode: '',
    employmentType: '' as string,
    companyName: '', designation: '', netMonthlySalary: '',
    totalExperience: '', currentCompanyYears: '',
  });
  const updateCoApplicant = (patch: Partial<typeof coApplicant>) => setCoApplicant(prev => ({ ...prev, ...patch }));

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // Add a small threshold offset so it transitions just before leaving layout
      setIsBottomVisible(entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight);
    }, { rootMargin: "0px 0px 50px 0px" });
    if (formEndRef.current) observer.observe(formEndRef.current);
    return () => observer.disconnect();
  }, []);

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
    try {
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
        estimatedPropertyValue: Number(fp?.estimatedPropertyValue ?? 0),
        isAbove50Lakhs: Boolean(fp?.isAbove50Lakhs ?? false),
        hasExistingLoan: Boolean((fp as any)?.hasExistingLoan ?? false),
        eligibleExistingEmi: Number((fp as any)?.existingEmi ?? (fp as any)?.totalExistingEMI ?? 0)
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
    if (cibilScore >= 750) return { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Excellent" };
    if (cibilScore >= 650) return { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Good" };
    if (cibilScore >= 550) return { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Fair" };
    return { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "Poor" };
  }, [cibilScore]);

  // ── Style tokens ──────────────────────────────────────────────────────────

  const cardCn = "bg-card dark:bg-[#080d1e] border border-border dark:border-white/[0.06] rounded-[1.75rem] p-6 md:p-8 relative overflow-hidden transition-colors duration-300 hover:border-primary/10 dark:hover:border-white/[0.08]";

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
                        ? "bg-primary dark:bg-[#103783] text-white"
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
                animate={{ width: `${((displayStep - 1) / (STEP_META.length - 1)) * 100}%` }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>
        </div>

        {/* ── Step Content ─────────────────────────────────────────────────── */}
        
        <div className="space-y-8 md:space-y-12">
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STAGE 3: LOAN REQUIREMENTS (Moved to Top)                       */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div className={cardCn}>
              <div className={cardCn}>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-[#0d1829] border border-border dark:border-white/[0.06] flex items-center justify-center">
                    <IndianRupee className="w-5 h-5 text-primary dark:text-[#103783]" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight">Loan Details</h3>
                </div>

                <div className="space-y-5 relative z-10">
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
                    <ValidatedInput
                      label="Tenure (Years)"
                      type="number"
                      placeholder="5"
                      icon={Calendar}
                      value={store.loanRequirements.tenureYears}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateLoanRequirements({ tenureYears: parseInt(e.target.value) || 0 })}
                      onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
                      isValid={
                        (store.loanRequirements.loanType === 'PERSONAL_LOAN' || store.loanRequirements.loanType === 'BUSINESS_LOAN')
                          ? (store.loanRequirements.tenureYears >= 1 && store.loanRequirements.tenureYears <= 7)
                          : (store.loanRequirements.tenureYears >= 3 && store.loanRequirements.tenureYears <= 30)
                      }
                      error={
                        store.loanRequirements.tenureYears > 0
                          ? ((store.loanRequirements.loanType === 'PERSONAL_LOAN' || store.loanRequirements.loanType === 'BUSINESS_LOAN') && (store.loanRequirements.tenureYears < 1 || store.loanRequirements.tenureYears > 7)
                            ? "Must be 1 to 7 Years"
                            : ((store.loanRequirements.loanType === 'HOME_LOAN' || store.loanRequirements.loanType === 'LAP') && (store.loanRequirements.tenureYears < 3 || store.loanRequirements.tenureYears > 30)
                              ? "Must be 3 to 30 Years" : undefined))
                          : undefined
                      }
                    />
                  </div>

                  {/* CIBIL Slider */}
                  <div className={`p-5 rounded-2xl border backdrop-blur-sm transition-colors duration-500 ${cibilUi.bg} ${cibilUi.border}`}>
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                      <div className="flex items-center gap-2">
                        <CreditCard className={`w-5 h-5 shrink-0 ${cibilUi.color}`} />
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">CIBIL Score</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {editingCibil ? (
                          // ── Inline edit mode ──────────────────────────────
                          <div className="flex items-center gap-1">
                            <input
                              autoFocus
                              type="number"
                              min={-1}
                              max={900}
                              className={`w-20 bg-transparent text-right text-2xl font-semibold tabular-nums outline-none border-b-2 border-primary/50 focus:border-primary transition-colors py-0.5 rounded-none ${cibilUi.color}`}
                              value={cibilInputVal}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => setCibilInputVal(e.target.value)}
                              onBlur={() => {
                                const parsed = parseInt(cibilInputVal, 10);
                                let val;
                                if (parsed === -1 || parsed === 0) val = parsed;
                                else val = Math.min(900, Math.max(300, parsed));
                                
                                if (!isNaN(val)) store.updateLoanRequirements({ cibilScore: val });
                                else setCibilInputVal(cibilScore.toString());
                                setEditingCibil(false);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                                if (e.key === "Escape") { setCibilInputVal(cibilScore.toString()); setEditingCibil(false); }
                              }}
                            />
                          </div>
                        ) : (
                          // ── Display mode — tap to edit ────────────────────
                          <button
                            type="button"
                            className={`flex items-center gap-1.5 group/edit cursor-pointer`}
                            onClick={() => { setCibilInputVal(cibilScore.toString()); setEditingCibil(true); }}
                            title="Click to type exact score"
                          >
                            <motion.span
                              key={cibilScore}
                              initial={{ y: -8, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              className={`text-2xl font-semibold tabular-nums border-b border-dashed border-current/40 group-hover/edit:border-current pb-0.5 transition-colors ${cibilUi.color}`}
                            >
                              {cibilScore}
                            </motion.span>
                            <Edit2 className={`w-3.5 h-3.5 opacity-40 group-hover/edit:opacity-100 transition-opacity ${cibilUi.color}`} />
                          </button>
                        )}
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
            </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STAGE 1: BASIC KYC                                              */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div className={cardCn}>

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-[#0d1829] border border-border dark:border-white/[0.06] flex items-center justify-center">
                  <User className="w-5 h-5 text-primary dark:text-[#103783]" />
                </div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">Verify Identity</h3>
              </div>

              <div className="space-y-5 relative z-10">
                <ValidatedInput
                  label="Full Name (As per PAN)"
                  placeholder="Rahul Sharma"
                  icon={User}
                  value={store.basicKYC.fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBasicKYC({ fullName: e.target.value })}
                  isValid={store.basicKYC.fullName.length >= 3}
                  error={errors.fullName}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2 relative">
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
                    {/^[6-9]\d{9}$/.test(store.basicKYC.mobileNumber) && (
                      <div className="flex animate-in fade-in slide-in-from-top-1 items-center gap-2 mt-1">
                        <Input type="text" placeholder="Enter OTP" className="w-1/2 h-10 bg-white/50 border-slate-200 focus:border-primary/50" maxLength={6} />
                        <Button type="button" variant="outline" className="w-1/2 h-10 border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                          Verify OTP
                        </Button>
                      </div>
                    )}
                  </div>
                  <ValidatedInput
                    label="Email Address"
                    type="email"
                    placeholder="rahul@company.com"
                    icon={Mail}
                    value={store.basicKYC.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBasicKYC({ email: e.target.value })}
                    isValid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(store.basicKYC.email)}
                    error={errors.email}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ValidatedInput
                    label="Date of Birth"
                    type="date" max={new Date(new Date().setFullYear(new Date().getFullYear() - 19)).toISOString().split("T")[0]} 
                    icon={Calendar}
                    value={store.basicKYC.dateOfBirth}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBasicKYC({ dateOfBirth: e.target.value })}
                    isValid={!!store.basicKYC.dateOfBirth}
                    error={errors.dateOfBirth}
                  />

                  <StyledSelect
                    label="Religion"
                    icon={User}
                    value={store.basicKYC.religion}
                    onValueChange={(v) => store.updateBasicKYC({ religion: v })}
                    placeholder="Select Religion"
                    error={errors.religion}
                  >
                    {RELIGIONS.map((r) => (
                      <SelectItem key={r} value={r} className="cursor-pointer">{r}</SelectItem>
                    ))}
                  </StyledSelect>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <StyledSelect
                    label="State"
                    icon={MapPin}
                    value={store.basicKYC.state}
                    onValueChange={(v) => {
                      store.updateBasicKYC({ state: v, city: '' });
                    }}
                    placeholder="Select State"
                    error={errors.state}
                  >
                    {Object.keys(STATE_CITIES).map((s) => (
                      <SelectItem key={s} value={s} className="cursor-pointer">{s}</SelectItem>
                    ))}
                  </StyledSelect>

                  <StyledSelect
                    label="City"
                    icon={Building2}
                    value={store.basicKYC.city}
                    onValueChange={(v) => store.updateBasicKYC({ city: v })}
                    placeholder={store.basicKYC.state ? "Select City" : "Select state first"}
                    error={errors.city}
                  >
                    {(STATE_CITIES[store.basicKYC.state] || []).map((c) => (
                      <SelectItem key={c} value={c} className="cursor-pointer">{c}</SelectItem>
                    ))}
                  </StyledSelect>

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
            </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STAGE 2: EMPLOYMENT DETAILS                                     */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div className={cardCn}>
              {/* Employment Category Selector */}
              <div className={cardCn}>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-[#0d1829] border border-border dark:border-white/[0.06] flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary dark:text-[#103783]" />
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

                        {store.financialDetails.path === "SALARIED" && store.financialDetails.data.subType === "PRIVATE" && (
                          <div className="mb-5">
                            <StyledSelect
                              label="Company Entity Type"
                              icon={Building2}
                              value={store.financialDetails.data.companyType || ""}
                              onValueChange={(v) => store.updateSalariedDetails({ companyType: v as any })}
                              placeholder="Select Company Type"
                              error={errors.companyType}
                            >
                              <SelectItem value="PRIVATE_LIMITED">Private Limited</SelectItem>
                              <SelectItem value="PUBLIC_LIMITED_LISTED">Public Limited (Listed)</SelectItem>
                              <SelectItem value="PUBLIC_LIMITED_UNLISTED">Public Limited (Unlisted)</SelectItem>
                              <SelectItem value="LLP">Limited Liability Partnership (LLP)</SelectItem>
                              <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
                              <SelectItem value="PROPRIETORSHIP">Proprietorship</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </StyledSelect>
                          </div>
                        )}

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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                          <ValidatedInput
                            label="Gross Salary (₹)"
                            type="number"
                            placeholder="100000"
                            icon={IndianRupee}
                            value={store.financialDetails.path === "SALARIED" ? (store.financialDetails.data.grossSalary || "") : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateSalariedDetails({ grossSalary: Number(e.target.value) })}
                            isValid={(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.grossSalary : 0) >= 10000}
                          />
                          <ValidatedInput
                            label="Net Salary (₹)"
                            type="number"
                            placeholder="85000"
                            icon={IndianRupee}
                            value={store.financialDetails.path === "SALARIED" ? (store.financialDetails.data.netMonthlySalary || "") : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateSalariedDetails({ netMonthlySalary: Number(e.target.value) })}
                            isValid={(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.netMonthlySalary : 0) >= 10000}
                            error={errors.netMonthlySalary}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                          <ValidatedInput
                            label="Current Experience (Years)"
                            type="number"
                            placeholder="2"
                            icon={Calendar}
                            value={store.financialDetails.path === "SALARIED" ? (store.financialDetails.data.currentCompanyYears || "") : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateSalariedDetails({ currentCompanyYears: Number(e.target.value) })}
                            isValid={(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.currentCompanyYears : 0) > 0}
                            error={errors.currentCompanyYears}
                          />
                        </div>

                        {/* ── EMI Disclosure (Step A + conditional Step B) ── */}
                        <div className="h-px bg-gradient-to-r from-transparent via-border dark:via-white/[0.06] to-transparent" />

                        <ValidatedInput
                          label="Total Monthly EMI across all loans (₹)"
                          type="number"
                          placeholder="e.g. 45000"
                          icon={CreditCard}
                          value={store.financialDetails.path === "SALARIED" ? (store.financialDetails.data.existingEMI || "") : ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateSalariedDetails({ existingEMI: Number(e.target.value) })}
                          isValid={(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.existingEMI : -1) >= 0}
                        />

                        <AnimatePresence>
                          {store.financialDetails.path === "SALARIED" && (store.financialDetails.data.existingEMI ?? 0) > 0 && (
                            <motion.div
                              key="salaried-maturity"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 dark:bg-[#103783]/10">
                                <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                                  <IndianRupee className="w-3.5 h-3.5 text-primary dark:text-[#103783]" />
                                  Are any of these loans finishing in the next 12 months? If yes, enter the EMI of those specific loans.
                                </p>
                                <ValidatedInput
                                  label="EMI of loans closing in next 12 months (₹)"
                                  type="number"
                                  placeholder="e.g. 15000 (or 0 if none)"
                                  icon={IndianRupee}
                                  value={store.financialDetails.path === "SALARIED" ? (store.financialDetails.data.maturingLoanEMI ?? "") : ""}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateSalariedDetails({ maturingLoanEMI: Number(e.target.value) })}
                                  isValid={(store.financialDetails.path === "SALARIED" ? store.financialDetails.data.maturingLoanEMI ?? 0 : 0) >= 0}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                        </div>

                        {/* ── Practice Vintage — split into total + current firm ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <ValidatedInput
                            label="Total Practice Vintage (Years)"
                            type="number"
                            placeholder="e.g. 12"
                            icon={Calendar}
                            value={store.financialDetails.path === "PROFESSIONAL" ? (store.financialDetails.data.totalPracticeYears || "") : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const v = Number(e.target.value);
                              store.updateProfessionalDetails({ totalPracticeYears: v, practiceYears: v });
                            }}
                            isValid={(store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.totalPracticeYears : 0) > 0}
                            error={errors.practiceYears}
                          />
                          <ValidatedInput
                            label="Years in Current Firm"
                            type="number"
                            placeholder="e.g. 4"
                            icon={Briefcase}
                            value={store.financialDetails.path === "PROFESSIONAL" ? (store.financialDetails.data.yearsInCurrentFirm || "") : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateProfessionalDetails({ yearsInCurrentFirm: Number(e.target.value) })}
                            isValid={(store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.yearsInCurrentFirm : 0) > 0}
                          />
                        </div>

                        {/* ── Income fields ──────────────────────────────────── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <ValidatedInput
                            label="Annual Gross Receipts (₹)"
                            type="number"
                            placeholder="e.g. 3600000"
                            icon={IndianRupee}
                            value={store.financialDetails.path === "PROFESSIONAL" ? (store.financialDetails.data.annualGrossReceipts || "") : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateProfessionalDetails({ annualGrossReceipts: Number(e.target.value) })}
                            isValid={(store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.annualGrossReceipts : 0) > 0}
                          />
                          <ValidatedInput
                            label="Professional Income as per ITR (₹)"
                            type="number"
                            placeholder="150000"
                            icon={IndianRupee}
                            value={store.financialDetails.path === "PROFESSIONAL" ? (store.financialDetails.data.netMonthlyIncome || "") : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateProfessionalDetails({ netMonthlyIncome: Number(e.target.value) })}
                            isValid={(store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.netMonthlyIncome : 0) >= 10000}
                            error={errors.netMonthlyIncome}
                          />
                        </div>

                        {/* ── EMI Disclosure (Step A + conditional Step B) ── */}
                        <div className="h-px bg-gradient-to-r from-transparent via-border dark:via-white/[0.06] to-transparent" />

                        <ValidatedInput
                          label="Total Monthly EMI across all loans (₹)"
                          type="number"
                          placeholder="e.g. 45000"
                          icon={CreditCard}
                          value={store.financialDetails.path === "PROFESSIONAL" ? (store.financialDetails.data.existingEMI || "") : ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateProfessionalDetails({ existingEMI: Number(e.target.value) })}
                          isValid={(store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.existingEMI : -1) >= 0}
                        />

                        <AnimatePresence>
                          {store.financialDetails.path === "PROFESSIONAL" && (store.financialDetails.data.existingEMI ?? 0) > 0 && (
                            <motion.div
                              key="professional-maturity"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 dark:bg-[#103783]/10">
                                <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                                  <IndianRupee className="w-3.5 h-3.5 text-primary dark:text-[#103783]" />
                                  Are any of these loans finishing in the next 12 months? If yes, enter the EMI of those specific loans.
                                </p>
                                <ValidatedInput
                                  label="EMI of loans closing in next 12 months (₹)"
                                  type="number"
                                  placeholder="e.g. 15000 (or 0 if none)"
                                  icon={IndianRupee}
                                  value={store.financialDetails.path === "PROFESSIONAL" ? (store.financialDetails.data.maturingLoanEMI ?? "") : ""}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateProfessionalDetails({ maturingLoanEMI: Number(e.target.value) })}
                                  isValid={(store.financialDetails.path === "PROFESSIONAL" ? store.financialDetails.data.maturingLoanEMI ?? 0 : 0) >= 0}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                            label="Business Vintage (Years)"
                            type="number"
                            placeholder="5"
                            icon={Calendar}
                            value={store.financialDetails.path === "SELF_EMPLOYED" ? (store.financialDetails.data.vintageYears || "") : ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBusinessDetails({ vintageYears: Number(e.target.value) })}
                            isValid={(store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.vintageYears || 0 : 0) > 0}
                            error={errors.vintageYears}
                          />
                        </div>

                        {/* ── Program-specific income / turnover fields ─────── */}
                        {(() => {
                          const subType = store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.subType : null;

                          if (subType === "GST_BASED") return (
                            <AnimatePresence mode="wait">
                              <motion.div
                                key="gst-fields"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                className="space-y-5"
                              >

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  {/* Last 12 months GST turnover — the primary income proxy */}
                                  <ValidatedInput
                                    label="Last 12 Months GST Turnover (₹)"
                                    type="number"
                                    placeholder="e.g. 6000000"
                                    icon={IndianRupee}
                                    value={store.financialDetails.path === "SELF_EMPLOYED" ? (store.financialDetails.data.last12MonthsGstTurnover || "") : ""}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      const val = Number(e.target.value);
                                      // Mirror monthly avg to netMonthlyIncome for downstream eligibility calc
                                      store.updateBusinessDetails({
                                        last12MonthsGstTurnover: val,
                                        monthlyGSTTurnover: Math.round(val / 12),
                                        netMonthlyIncome: Math.round(val / 12),
                                      });
                                    }}
                                    isValid={(store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.last12MonthsGstTurnover || 0 : 0) > 0}
                                    error={errors.netMonthlyIncome}
                                  />

                                  {/* GST Filing Months */}
                                  <StyledSelect
                                    label="GST Returns Filed (Months)"
                                    icon={FileText}
                                    value={store.financialDetails.path === "SELF_EMPLOYED" && store.financialDetails.data.gstFilingMonths ? store.financialDetails.data.gstFilingMonths.toString() : undefined}
                                    onValueChange={(v) => store.updateBusinessDetails({ gstFilingMonths: Number(v) })}
                                    placeholder="Select filing period"
                                  >
                                    <SelectItem value="6">6 Months</SelectItem>
                                    <SelectItem value="12">12 Months</SelectItem>
                                    <SelectItem value="24">24 Months</SelectItem>
                                    <SelectItem value="36">36+ Months</SelectItem>
                                  </StyledSelect>
                                </div>
                              </motion.div>
                            </AnimatePresence>
                          );

                          if (subType === "ITR_BASED") return (
                            <AnimatePresence mode="wait">
                              <motion.div
                                key="itr-fields"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                className="space-y-5"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <ValidatedInput
                                    label="Annual Turnover (₹)"
                                    type="number"
                                    placeholder="5000000"
                                    icon={IndianRupee}
                                    value={store.financialDetails.path === "SELF_EMPLOYED" ? (store.financialDetails.data.annualTurnover || "") : ""}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBusinessDetails({ annualTurnover: Number(e.target.value) })}
                                    isValid={(store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.annualTurnover || 0 : 0) > 0}
                                  />
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
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <StyledSelect
                                    label="ITR Filing (Years)"
                                    icon={FileText}
                                    value={store.financialDetails.path === "SELF_EMPLOYED" && store.financialDetails.data.itrFiledYears ? store.financialDetails.data.itrFiledYears.toString() : undefined}
                                    onValueChange={(v) => store.updateBusinessDetails({ itrFiledYears: Number(v) })}
                                    placeholder="Select years of ITR filed"
                                  >
                                    <SelectItem value="1">1 Year</SelectItem>
                                    <SelectItem value="2">2 Years</SelectItem>
                                    <SelectItem value="3">3 or more Years</SelectItem>
                                  </StyledSelect>
                                </div>

                                {/* Depreciation add-back — only relevant for property-collateral loans */}
                                <AnimatePresence>
                                  
                {store.loanRequirements.loanType === "AUTO_LOAN" && (
                  <div className="grid grid-cols-1 gap-5">
                    <ValidatedInput
                      label="Vehicle Quotation Price (₹)"
                      type="number"
                      placeholder="850000"
                      icon={IndianRupee}
                      value={store.loanRequirements.vehicleQuotationPrice || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateLoanRequirements({ vehicleQuotationPrice: Number(e.target.value) })}
                      isValid={(store.loanRequirements.vehicleQuotationPrice || 0) > 100000}
                    />
                  </div>
                )}
                
                {(store.loanRequirements.loanType === "HOME_LOAN" || store.loanRequirements.loanType === "LAP") && (
                                    <motion.div
                                      key="depreciation-field"
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                      className="overflow-hidden"
                                    >
                                      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-1.5">
                                          <IndianRupee className="w-3.5 h-3.5" />
                                          P&amp;L Normalisation (Property Loan)
                                        </p>
                                        <ValidatedInput
                                          label="Annual Depreciation Add-back (₹)"
                                          type="number"
                                          placeholder="e.g. 240000 — from P&L / Balance Sheet"
                                          icon={IndianRupee}
                                          value={store.financialDetails.path === "SELF_EMPLOYED" ? (store.financialDetails.data.depreciation || "") : ""}
                                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBusinessDetails({ depreciation: Number(e.target.value) })}
                                          isValid={(store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.depreciation || 0 : 0) >= 0}
                                        />
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            </AnimatePresence>
                          );

                          // BANKING_PROGRAM or not yet selected — show net income only
                          if (subType === "BANKING_PROGRAM") return (
                            <AnimatePresence mode="wait">
                              <motion.div
                                key="banking-fields"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                              >
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
                            </AnimatePresence>
                          );

                          return null;
                        })()}

                        {/* ── CA Certification toggle — universal signal for all SELF_EMPLOYED ── */}
                        <div className="flex items-start gap-4 p-4 rounded-xl border border-border dark:border-white/[0.06] bg-secondary/30 dark:bg-white/[0.02]">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={!!(store.financialDetails.path === "SELF_EMPLOYED" && store.financialDetails.data.isCaCertifiedOrAudited)}
                            onClick={() => {
                              const current = store.financialDetails.path === "SELF_EMPLOYED" ? !!store.financialDetails.data.isCaCertifiedOrAudited : false;
                              store.updateBusinessDetails({ isCaCertifiedOrAudited: !current });
                            }}
                            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                              store.financialDetails.path === "SELF_EMPLOYED" && store.financialDetails.data.isCaCertifiedOrAudited
                                ? "bg-primary border-primary dark:bg-[#103783] dark:border-[#103783]"
                                : "border-border dark:border-white/20 bg-transparent"
                            }`}
                          >
                            {store.financialDetails.path === "SELF_EMPLOYED" && store.financialDetails.data.isCaCertifiedOrAudited && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </button>
                          <div>
                            <p className="text-sm font-semibold text-foreground leading-snug">
                              Accounts are CA-Certified / Audited
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                              Declaring CA-certified accounts improves creditworthiness assessment and may unlock better rates.
                            </p>
                          </div>
                        </div>

                        {/* ── EMI Disclosure (Step A + conditional Step B) ── */}
                        <div className="h-px bg-gradient-to-r from-transparent via-border dark:via-white/[0.06] to-transparent" />

                        <ValidatedInput
                          label="Total Monthly EMI across all loans (₹)"
                          type="number"
                          placeholder="e.g. 45000"
                          icon={CreditCard}
                          value={store.financialDetails.path === "SELF_EMPLOYED" ? (store.financialDetails.data.existingEMI || "") : ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBusinessDetails({ existingEMI: Number(e.target.value) })}
                          isValid={(store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.existingEMI : -1) >= 0}
                        />

                        <AnimatePresence>
                          {store.financialDetails.path === "SELF_EMPLOYED" && (store.financialDetails.data.existingEMI ?? 0) > 0 && (
                            <motion.div
                              key="business-maturity"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 rounded-xl border border-primary/10 bg-primary/5 dark:bg-[#103783]/10">
                                <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                                  <IndianRupee className="w-3.5 h-3.5 text-primary dark:text-[#103783]" />
                                  Are any of these loans finishing in the next 12 months? If yes, enter the EMI of those specific loans.
                                </p>
                                <ValidatedInput
                                  label="EMI of loans closing in next 12 months (₹)"
                                  type="number"
                                  placeholder="e.g. 15000 (or 0 if none)"
                                  icon={IndianRupee}
                                  value={store.financialDetails.path === "SELF_EMPLOYED" ? (store.financialDetails.data.maturingLoanEMI ?? "") : ""}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBusinessDetails({ maturingLoanEMI: Number(e.target.value) })}
                                  isValid={(store.financialDetails.path === "SELF_EMPLOYED" ? store.financialDetails.data.maturingLoanEMI ?? 0 : 0) >= 0}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Conditional Property Selectors based on Loan Type (Moved to Stage 2) ── */}
                  <AnimatePresence mode="popLayout">
                    {(store.loanRequirements.loanType === "HOME_LOAN" || store.loanRequirements.loanType === "LAP" || store.loanRequirements.loanType === "BUSINESS_LOAN") && (
                      <motion.div
                        key="property-selectors"
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-5 rounded-2xl border border-primary/10 bg-primary/5 dark:bg-[#103783]/10 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Home className="w-4 h-4 text-primary dark:text-[#103783]" />
                          <h4 className="text-sm font-bold text-foreground">Property Type Selection</h4>
                        </div>
                        <div className="space-y-4">
                          {store.loanRequirements.loanType === "LAP" && (
                            <StyledSelect
                              label="Type of Property"
                              value={store.loanRequirements.propertyCategory || "RESIDENTIAL"}
                              onValueChange={(v) => store.updateLoanRequirements({ propertyCategory: v as 'RESIDENTIAL' | 'COMMERCIAL_INDUSTRIAL', propertyType: undefined, businessPropertyCategory: undefined })}
                              placeholder="Select category"
                            >
                              <SelectItem value="RESIDENTIAL" className="cursor-pointer">Residential</SelectItem>
                              <SelectItem value="COMMERCIAL_INDUSTRIAL" className="cursor-pointer">Commercial & Industrial</SelectItem>
                            </StyledSelect>
                          )}

                          {(store.loanRequirements.loanType === "HOME_LOAN" || (store.loanRequirements.loanType === "LAP" && store.loanRequirements.propertyCategory === "RESIDENTIAL")) && (
                            <StyledSelect
                              label="Property"
                              value={store.loanRequirements.propertyType || ""}
                              onValueChange={(v) => store.updateLoanRequirements({ propertyType: v as Extract<PropertyType, HomePropertyType> })}
                              placeholder="Select property type"
                            >
                              <SelectItem value="FLAT" className="cursor-pointer">Flat</SelectItem>
                              <SelectItem value="HOME" className="cursor-pointer">Home</SelectItem>
                              <SelectItem value="PLOT" className="cursor-pointer">Plot</SelectItem>
                            </StyledSelect>
                          )}

                          {((store.loanRequirements.loanType === "LAP" && store.loanRequirements.propertyCategory === "COMMERCIAL_INDUSTRIAL") || store.loanRequirements.loanType === "BUSINESS_LOAN") && (
                            <>
                              <StyledSelect
                                label={store.loanRequirements.loanType === "BUSINESS_LOAN" ? "Type of Property" : "Business Property Category"}
                                value={store.loanRequirements.businessPropertyCategory || ""}
                                onValueChange={(v) => store.updateLoanRequirements({ businessPropertyCategory: v as 'COMMERCIAL' | 'INDUSTRIAL', propertyType: undefined })}
                                placeholder="Select category"
                              >
                                <SelectItem value="COMMERCIAL" className="cursor-pointer">Commercial</SelectItem>
                                <SelectItem value="INDUSTRIAL" className="cursor-pointer">Industrial</SelectItem>
                              </StyledSelect>

                              {store.loanRequirements.businessPropertyCategory === "COMMERCIAL" && (
                                <StyledSelect
                                  label="Commercial Property"
                                  value={store.loanRequirements.propertyType || ""}
                                  onValueChange={(v) => store.updateLoanRequirements({ propertyType: v as Extract<PropertyType, CommercialPropertyType> })}
                                  placeholder="Select commercial property"
                                >
                                  <SelectItem value="HOSPITAL" className="cursor-pointer">Hospital</SelectItem>
                                  <SelectItem value="HOSTEL" className="cursor-pointer">Hostel</SelectItem>
                                  <SelectItem value="RESTAURANTS" className="cursor-pointer">Restaurants</SelectItem>
                                  <SelectItem value="HOTEL" className="cursor-pointer">Hotel</SelectItem>
                                  <SelectItem value="MARRIAGE_GARDEN" className="cursor-pointer">Marriage Garden</SelectItem>
                                  <SelectItem value="SCHOOL" className="cursor-pointer">School</SelectItem>
                                  <SelectItem value="SHOP" className="cursor-pointer">Shop</SelectItem>
                                  <SelectItem value="WAREHOUSE" className="cursor-pointer">Warehouse</SelectItem>
                                  <SelectItem value="GODOWN" className="cursor-pointer">Godown</SelectItem>
                                </StyledSelect>
                              )}

                              {store.loanRequirements.businessPropertyCategory === "INDUSTRIAL" && (
                                <StyledSelect
                                  label="Industrial Property"
                                  value={store.loanRequirements.propertyType || ""}
                                  onValueChange={(v) => store.updateLoanRequirements({ propertyType: v as Extract<PropertyType, IndustrialPropertyType> })}
                                  placeholder="Select industrial property"
                                >
                                  <SelectItem value="FACTORIES" className="cursor-pointer">Factories</SelectItem>
                                  <SelectItem value="WAREHOUSES" className="cursor-pointer">Warehouses</SelectItem>
                                  <SelectItem value="DISTRIBUTION_CENTER" className="cursor-pointer">Distribution Center</SelectItem>
                                  <SelectItem value="R_AND_D_FACILITY" className="cursor-pointer">R&D Facility</SelectItem>
                                  <SelectItem value="FLEX_SPACES" className="cursor-pointer">Flex Spaces</SelectItem>
                                </StyledSelect>
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* CO-APPLICANT SECTION                                             */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          <div className={cardCn}>
            <ToggleSwitch
              label="Adding a Co-Applicant?"
              description="A co-applicant can increase your loan eligibility"
              icon={UserPlus}
              checked={store.financialFootprint.hasCoApplicant}
              onChange={(v) => store.updateFinancialFootprint({ hasCoApplicant: v })}
            />

            <AnimatePresence>
              {store.financialFootprint.hasCoApplicant && (
                <motion.div
                  key="co-applicant-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 pt-6 border-t border-border dark:border-white/[0.06] space-y-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 dark:bg-[#103783]/10 flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-primary dark:text-[#103783]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Co-Applicant Details</h4>
                        <p className="text-[11px] text-muted-foreground/60">Same details as primary applicant</p>
                      </div>
                    </div>

                    {/* Identity */}
                    <ValidatedInput
                      label="Full Name (as per PAN)"
                      placeholder="Co-Applicant Name"
                      icon={User}
                      value={coApplicant.fullName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCoApplicant({ fullName: e.target.value })}
                      isValid={coApplicant.fullName.length >= 3}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <ValidatedInput
                        label="Mobile Number"
                        type="tel"
                        placeholder="9876543210"
                        icon={Phone}
                        value={coApplicant.mobileNumber}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCoApplicant({ mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        isValid={/^[6-9]\d{9}$/.test(coApplicant.mobileNumber)}
                      />
                      <ValidatedInput
                        label="Email Address"
                        type="email"
                        placeholder="co-applicant@email.com"
                        icon={Mail}
                        value={coApplicant.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCoApplicant({ email: e.target.value })}
                        isValid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coApplicant.email)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <ValidatedInput
                        label="Date of Birth"
                        type="date"
                        icon={Calendar}
                        value={coApplicant.dateOfBirth}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCoApplicant({ dateOfBirth: e.target.value })}
                        isValid={!!coApplicant.dateOfBirth}
                      />
                      <ValidatedInput
                        label="PIN Code"
                        placeholder="400001"
                        icon={MapPin}
                        value={coApplicant.pinCode}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCoApplicant({ pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        isValid={/^\d{6}$/.test(coApplicant.pinCode)}
                      />
                    </div>

                    {/* Employment */}
                    <PillSelector
                      label="Employment Type"
                      icon={Briefcase}
                      options={[
                        { value: 'SALARIED', label: 'Salaried', icon: Briefcase },
                        { value: 'SELF_EMPLOYED', label: 'Business', icon: BriefcaseBusiness },
                        { value: 'PROFESSIONAL', label: 'Professional', icon: GraduationCap },
                      ]}
                      value={coApplicant.employmentType || null}
                      onChange={(v) => updateCoApplicant({ employmentType: v })}
                    />

                    {coApplicant.employmentType && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <ValidatedInput
                          label={coApplicant.employmentType === 'SALARIED' ? 'Company Name' : coApplicant.employmentType === 'PROFESSIONAL' ? 'Practice / Firm Name' : 'Business Name'}
                          placeholder={coApplicant.employmentType === 'SALARIED' ? 'Infosys Ltd' : coApplicant.employmentType === 'PROFESSIONAL' ? 'Dr. Mehta Clinic' : 'Mehta Enterprises'}
                          icon={Building2}
                          value={coApplicant.companyName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCoApplicant({ companyName: e.target.value })}
                          isValid={coApplicant.companyName.length >= 2}
                        />
                        <ValidatedInput
                          label="Net Monthly Income (₹)"
                          type="number"
                          placeholder="50000"
                          icon={IndianRupee}
                          value={coApplicant.netMonthlySalary}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCoApplicant({ netMonthlySalary: e.target.value })}
                          isValid={Number(coApplicant.netMonthlySalary) >= 10000}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ═════════════════════════════════════════════════════════════════ */}
          
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* STAGE 5: DOCUMENT VAULT                                         */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* Document Vault is wired to Dashboard only */}
        
        </div>


        {/* ── Real-Time Signal Injection ──────────────────────────────────────── */}
        <div className="mt-6 p-4 rounded-xl bg-primary/5 dark:bg-[#103783]/5 border border-primary/10 dark:border-[#103783]/10 flex items-center justify-between">
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
           if (store.basicKYC.employmentType === 'SALARIED' && store.financialDetails.path === 'SALARIED') {
              income = store.financialDetails.data.netMonthlySalary || 0;
              emi = store.financialDetails.data.existingEMI || 0;
           } else if (store.basicKYC.employmentType === 'SELF_EMPLOYED' && store.financialDetails.path === 'SELF_EMPLOYED') {
              income = store.financialDetails.data.netMonthlyIncome || 0;
              emi = store.financialDetails.data.existingEMI || 0;
           } else if (store.basicKYC.employmentType === 'PROFESSIONAL' && store.financialDetails.path === 'PROFESSIONAL') {
              income = store.financialDetails.data.netMonthlyIncome || 0;
              emi = store.financialDetails.data.existingEMI || 0;
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

        <div className="mt-8 relative z-50">
          <Button 
             type="submit"
             disabled={
               isSubmitting || isAnalyzing ||
               (() => {
                 if (store.basicKYC.employmentType === 'SALARIED' && store.financialDetails.path === 'SALARIED') {
                    return (store.financialDetails.data.existingEMI || 0) >= (store.financialDetails.data.netMonthlySalary || 0) && (store.financialDetails.data.netMonthlySalary || 0) > 0;
                 } else if (store.basicKYC.employmentType === 'SELF_EMPLOYED' && store.financialDetails.path === 'SELF_EMPLOYED') {
                    return (store.financialDetails.data.existingEMI || 0) >= (store.financialDetails.data.netMonthlyIncome || 0) && (store.financialDetails.data.netMonthlyIncome || 0) > 0;
                 } else if (store.basicKYC.employmentType === 'PROFESSIONAL' && store.financialDetails.path === 'PROFESSIONAL') {
                    return (store.financialDetails.data.existingEMI || 0) >= (store.financialDetails.data.netMonthlyIncome || 0) && (store.financialDetails.data.netMonthlyIncome || 0) > 0;
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
        <p className="text-[10.5px] text-muted-foreground/60 font-medium flex items-center gap-1.5 text-center mt-2 group justify-center">
          <LockKeyhole className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
          Checking eligibility will <span className="font-semibold text-foreground/80">not</span> affect your credit score
        </p>
      </motion.div>
    </>
  );
};

export default LoanApplicationForm;