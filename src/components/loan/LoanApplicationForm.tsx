import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // 🧠 ADDED: For the Hard Page Cut
import {
  User, Briefcase, CheckCircle2, XCircle, LockKeyhole, ArrowRight, CreditCard,
  ChevronRight, ChevronLeft, IndianRupee, Loader2, AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import React from "react";

// 🧠 ADDED: Import the cinematic loader
import AnalysisLoader from "@/components/loan/AnalysisLoader";

const applicationSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian mobile number"),
  panCard: z.string().transform((v) => v.toUpperCase()).pipe(z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g. ABCDE1234F)")),
  dob: z.string().min(1, "Date of birth is required"),
  productType: z.string().min(1, "Product type is required"),
  loanAmount: z.number().min(50000, "Minimum loan is ₹50,000").max(100000000, "Maximum loan is ₹10 Crore"),
  loanTenure: z.number().min(1).max(30),
  occupation: z.enum(["salaried", "self_employed", "business_owner"], { required_error: "Select occupation type" }),
  monthlyIncome: z.number().min(10000, "Minimum income is ₹10,000"),
  cibilScore: z.number().min(300).max(900),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
});

type ApplicationData = z.infer<typeof applicationSchema>;

interface LoanApplicationFormProps {
  onAmountChange?: (amount: number) => void;
  onFormSubmit?: (data: ApplicationData) => void;
}

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

const productTypes = [
  { value: "personal", label: "Personal Loan" },
  { value: "home", label: "Home Loan" },
  { value: "business", label: "Business Loan" },
  { value: "education", label: "Education Loan" },
  { value: "lap", label: "Loan Against Property" },
];

const STEP_LABELS = ["Identity", "Requirements", "Financials"] as const;

/* ── Stable ValidatedInput (outside component to avoid remount on re-render) ── */
const ValidatedInput = React.forwardRef<HTMLInputElement, any>(
  ({ label, error, isValid, isSecure, className: _className, ...props }, ref) => (
    <div className="space-y-2 relative group">
      <Label className="text-[10px] font-medium uppercase tracking-widest text-[#2aac64] ml-1">{label}</Label>
      <div className="relative">
        <Input
          ref={ref}
          {...props}
          className={cn(
            "w-full bg-secondary/50 dark:bg-[#111] border border-border dark:border-white/10 rounded-xl px-4 py-6 text-sm font-medium text-foreground outline-none transition-all duration-200 group-hover:border-primary/20 dark:group-hover:border-white/20 focus:border-primary/60 dark:focus:border-[#2aac64]/60 focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#2aac64]/20",
            error && "border-red-500/40 focus:ring-red-500/20 focus:border-red-500/60",
            isValid && !error && "border-[#2aac64]/30"
          )}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isSecure && <LockKeyhole className="w-4 h-4 text-slate-500 transition-colors group-hover:text-slate-400" />}
          {error && (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
              <XCircle className="w-4 h-4 text-red-500" />
            </motion.div>
          )}
          {isValid && !error && (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
              <CheckCircle2 className="w-4 h-4 text-[#2aac64]" />
            </motion.div>
          )}
        </div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 font-medium ml-1 flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" /> {error}
        </motion.p>
      )}
    </div>
  )
);
ValidatedInput.displayName = "ValidatedInput";

const STEP_FIELDS: Record<number, (keyof ApplicationData)[]> = {
  1: ["fullName", "email", "phone", "panCard", "dob"],
  2: ["productType", "loanAmount", "loanTenure"],
  3: ["occupation", "monthlyIncome", "cibilScore", "state", "city"],
};

const LoanApplicationForm = ({ onAmountChange, onFormSubmit }: LoanApplicationFormProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);

  // 🧠 ADDED: State for managing the Loader & Page Cut
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [validatedPayload, setValidatedPayload] = useState<ApplicationData | null>(null);

  const form = useForm<ApplicationData>({
    resolver: zodResolver(applicationSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      panCard: "",
      dob: "",
      monthlyIncome: 85000,
      loanAmount: 500000,
      loanTenure: 5,
      cibilScore: 750,
      productType: "personal",
      occupation: "salaried",
      state: "",
      city: "",
    },
  });

  const isFieldValid = (name: keyof ApplicationData): boolean => {
    const value = form.watch(name);
    const error = form.formState.errors[name];
    return value !== undefined && value !== "" && value !== 0 && !error;
  };

  const currentLoanAmount = useWatch({ control: form.control, name: "loanAmount" });
  const currentCibil = useWatch({ control: form.control, name: "cibilScore" });
  const currentProduct = useWatch({ control: form.control, name: "productType" });

  useEffect(() => {
    if (onAmountChange && currentLoanAmount) {
      onAmountChange(currentLoanAmount);
    }
  }, [currentLoanAmount, onAmountChange]);

  const nextStep = async () => {
    const fields = STEP_FIELDS[step];
    const isValid = await form.trigger(fields);
    if (isValid) {
      setDirection(1);
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (data: ApplicationData) => {
    setIsSubmitting(true);

    try {
      // 1. You can trigger your Java Backend API submission here later
      onFormSubmit?.(data);

      // 2. Lock the payload into state and trigger the cinematic overlay
      setValidatedPayload(data);
      setIsAnalyzing(true);

    } catch (error) {
      console.error("Submission failed:", error);
      toast({
        title: "Submission Error",
        description: "Unable to process application. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  // 🧠 EXECUTES THE HARD CUT: Fired automatically when AnalysisLoader finishes its animation cycle
  const handleAnalysisComplete = () => {
    if (validatedPayload) {
      navigate("/offers", {
        state: {
          cibilScore: validatedPayload.cibilScore,
          productType: validatedPayload.productType,
          monthlyIncome: validatedPayload.monthlyIncome,
          loanAmount: validatedPayload.loanAmount,
          fullName: validatedPayload.fullName
        }
      });
    }
  };

  const getCibilData = (score: number) => {
    if (score >= 750) return { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Excellent" };
    if (score >= 650) return { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Good" };
    if (score >= 550) return { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Fair" };
    return { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "Poor" };
  };
  const cibilUi = getCibilData(currentCibil || 750);

  const cardCn = "bg-card dark:bg-[#0a0a0a] border border-border dark:border-white/[0.06] rounded-[1.75rem] p-6 md:p-8 relative overflow-hidden transition-colors duration-300 hover:border-primary/20 dark:hover:border-white/[0.1]";
  const inputCn = "w-full bg-secondary/50 dark:bg-[#111] border border-border dark:border-white/10 rounded-xl px-4 py-6 text-sm font-medium text-foreground outline-none transition-all duration-200 hover:border-primary/20 dark:hover:border-white/20 focus:border-primary/60 dark:focus:border-[#2aac64]/60 focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#2aac64]/20";

  return (
    <>
      {/* 🧠 THE CINEMATIC TAKEOVER: Sits outside the form layout to ensure z-index dominance */}
      <AnalysisLoader
        isVisible={isAnalyzing}
        onComplete={handleAnalysisComplete}
        data={{
          cibilScore: currentCibil,
          productType: currentProduct
        }}
      />

      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-0 h-full w-full relative"
      >
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-xl font-semibold text-foreground tracking-tight mb-1">
            Start Your Application
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Complete the fields below to find your best loan match.
          </p>

          {/* Step Indicator */}
          <div className="relative flex justify-between items-center mb-2">
            {STEP_LABELS.map((label, i) => {
              const stepNum = i + 1;
              const isActive = step >= stepNum;
              const isCurrent = step === stepNum;
              return (
                <div key={label} className="flex flex-col items-center z-10">
                  <motion.div
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                      boxShadow: isCurrent ? "0 0 0 4px rgba(42,172,100,0.15)" : "0 0 0 0px rgba(42,172,100,0)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-colors duration-300",
                      isActive ? "bg-primary dark:bg-[#2aac64] text-primary-foreground dark:text-white" : "bg-secondary dark:bg-[#1a1a1a] text-muted-foreground dark:text-slate-500 border border-border dark:border-white/10"
                    )}
                  >
                    {isActive && stepNum < step ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      stepNum
                    )}
                  </motion.div>
                  <span className={cn("text-[10px] mt-2 font-medium uppercase tracking-widest transition-colors duration-300", isActive ? "text-[#2aac64]" : "text-slate-500")}>
                    {label}
                  </span>
                </div>
              );
            })}
            {/* Connector */}
            <div className="absolute top-4 left-8 right-8 h-[2px] bg-[#1a1a1a] -z-0">
              <motion.div
                className="h-full bg-[#2aac64]"
                animate={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait" custom={direction}>
          {/* Step 1: Identity */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              initial={{ x: direction * 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } }}
              exit={{ x: direction * -24, opacity: 0, transition: { duration: 0.15 } }}
              className={cardCn}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#2aac64]/5 blur-[60px] rounded-full pointer-events-none" />

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-[#111] border border-border dark:border-white/[0.06] flex items-center justify-center">
                  <User className="w-5 h-5 text-primary dark:text-[#2aac64]" />
                </div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">Verify Identity</h3>
              </div>

              <div className="space-y-5 relative z-10">
                <ValidatedInput
                  label="Full Name (As per PAN)"
                  placeholder="Rahul Sharma"
                  isSecure
                  isValid={isFieldValid("fullName")}
                  error={form.formState.errors.fullName?.message}
                  {...form.register("fullName")}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ValidatedInput
                    label="Email Address"
                    type="email"
                    placeholder="rahul@company.com"
                    isSecure
                    isValid={isFieldValid("email")}
                    error={form.formState.errors.email?.message}
                    {...form.register("email")}
                  />
                  <ValidatedInput
                    label="Mobile Number"
                    placeholder="9876543210"
                    isValid={isFieldValid("phone")}
                    error={form.formState.errors.phone?.message}
                    {...form.register("phone")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ValidatedInput
                    label="PAN Card Number"
                    placeholder="ABCDE1234F"
                    isSecure
                    isValid={isFieldValid("panCard")}
                    error={form.formState.errors.panCard?.message}
                    style={{ textTransform: "uppercase", letterSpacing: "0.15em" }}
                    {...form.register("panCard")}
                  />
                  <ValidatedInput
                    label="Date of Birth"
                    type="date"
                    isSecure
                    isValid={isFieldValid("dob")}
                    error={form.formState.errors.dob?.message}
                    {...form.register("dob")}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Loan Parameters */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              initial={{ x: direction * 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } }}
              exit={{ x: direction * -24, opacity: 0, transition: { duration: 0.15 } }}
              className={cardCn}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#2aac64]/5 blur-[60px] rounded-full pointer-events-none" />

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-[#111] border border-border dark:border-white/[0.06] flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-primary dark:text-[#2aac64]" />
                </div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">Loan Details</h3>
              </div>

              <div className="space-y-6 relative z-10">
                <div>
                  <Label className="text-[10px] font-medium uppercase tracking-widest text-[#2aac64] ml-1 mb-3 block">Select Product</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {productTypes.map((type) => {
                      const isSelected = form.watch("productType") === type.value;
                      return (
                        <motion.button
                          key={type.value}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => form.setValue("productType", type.value, { shouldValidate: true, shouldDirty: true })}
                          className={cn(
                            "py-3 px-2 rounded-xl text-xs md:text-sm font-medium transition-colors duration-200 border",
                            isSelected
                              ? "bg-primary dark:bg-[#2aac64] text-primary-foreground dark:text-white border-primary dark:border-[#2aac64]"
                              : "bg-secondary dark:bg-[#111] text-muted-foreground dark:text-slate-400 border-border dark:border-white/[0.06] hover:text-foreground hover:border-border dark:hover:border-white/15"
                          )}
                        >
                          {type.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 group">
                    <Label className="text-[10px] font-medium uppercase tracking-widest text-[#2aac64] ml-1">Loan Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="500000"
                      className={cn(inputCn, "text-lg tracking-wide")}
                      {...form.register("loanAmount", { valueAsNumber: true })}
                    />
                    {form.formState.errors.loanAmount && <p className="text-xs text-red-400 font-medium ml-1">{form.formState.errors.loanAmount.message}</p>}
                  </div>

                  <div className="space-y-2 group">
                    <Label className="text-[10px] font-medium uppercase tracking-widest text-[#2aac64] ml-1">Tenure (Years)</Label>
                    <Select onValueChange={(v) => form.setValue("loanTenure", parseInt(v), { shouldValidate: true, shouldDirty: true })} defaultValue={form.getValues("loanTenure").toString()}>
                      <SelectTrigger className={inputCn}>
                        <SelectValue placeholder="Select tenure" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border rounded-xl">
                        {[1, 2, 3, 4, 5, 7, 10, 15, 20, 25, 30].map((year) => (
                          <SelectItem key={year} value={year.toString()} className="font-medium cursor-pointer">{year} {year === 1 ? 'Year' : 'Years'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Financial Profile */}
          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              initial={{ x: direction * 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } }}
              exit={{ x: direction * -24, opacity: 0, transition: { duration: 0.15 } }}
              className="space-y-5"
            >
              <div className={cardCn}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-[#111] border border-border dark:border-white/[0.06] flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary dark:text-[#2aac64]" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight">Income & Employment</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div className="space-y-2 group">
                    <Label className="text-[10px] font-medium uppercase tracking-widest text-[#2aac64] ml-1">Employment Type</Label>
                    <Select onValueChange={(v) => form.setValue("occupation", v as any, { shouldValidate: true, shouldDirty: true })} defaultValue={form.getValues("occupation")}>
                      <SelectTrigger className={inputCn}>
                        <SelectValue placeholder="Select employment" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border rounded-xl">
                        <SelectItem value="salaried" className="cursor-pointer">Salaried Employee</SelectItem>
                        <SelectItem value="self_employed" className="cursor-pointer">Self Employed Professional</SelectItem>
                        <SelectItem value="business_owner" className="cursor-pointer">Business Owner</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.occupation && <p className="text-xs text-red-400 font-medium ml-1">{form.formState.errors.occupation.message}</p>}
                  </div>

                  <div className="space-y-2 group">
                    <Label className="text-[10px] font-medium uppercase tracking-widest text-[#2aac64] ml-1">Net Monthly Income (₹)</Label>
                    <Input
                      type="number"
                      placeholder="85000"
                      className={inputCn}
                      {...form.register("monthlyIncome", { valueAsNumber: true })}
                    />
                    {form.formState.errors.monthlyIncome && <p className="text-xs text-red-400 font-medium ml-1">{form.formState.errors.monthlyIncome.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div className="space-y-2 group">
                    <Label className="text-[10px] font-medium uppercase tracking-widest text-[#2aac64] ml-1">State</Label>
                    <Select onValueChange={(v) => form.setValue("state", v, { shouldValidate: true, shouldDirty: true })}>
                      <SelectTrigger className={inputCn}>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border rounded-xl">
                        {states.map((state) => (
                          <SelectItem key={state} value={state} className="cursor-pointer">{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.state && <p className="text-xs text-red-400 font-medium ml-1">{form.formState.errors.state.message}</p>}
                  </div>

                  <ValidatedInput
                    label="City"
                    placeholder="Mumbai"
                    isValid={isFieldValid("city")}
                    error={form.formState.errors.city?.message}
                    {...form.register("city")}
                  />
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
                        key={currentCibil}
                        initial={{ y: -8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`text-2xl font-semibold tabular-nums ${cibilUi.color}`}
                      >
                        {currentCibil || 750}
                      </motion.span>
                      <span className={`text-[10px] font-medium uppercase tracking-widest px-2 py-1 rounded border ${cibilUi.bg} ${cibilUi.color} ${cibilUi.border}`}>
                        {cibilUi.label}
                      </span>
                    </div>
                  </div>
                  <Slider
                    value={[currentCibil || 750]}
                    onValueChange={(v) => form.setValue("cibilScore", v[0], { shouldValidate: true, shouldDirty: true })}
                    min={300} max={900} step={10}
                    className="cursor-pointer mb-2"
                  />
                  <div className="flex justify-between text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-2">
                    <span>300</span>
                    <span>900</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <motion.div whileHover={step > 1 ? { x: -2 } : {}} whileTap={step > 1 ? { scale: 0.96 } : {}}>
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1 || isSubmitting || isAnalyzing}
              className={cn(
                "bg-transparent border-border dark:border-white/10 text-muted-foreground dark:text-slate-400 hover:bg-secondary dark:hover:bg-white/5 hover:border-primary/20 dark:hover:border-white/20 rounded-xl transition-all duration-200",
                step === 1 && "opacity-0 pointer-events-none"
              )}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </motion.div>

          {step < 3 ? (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button
                type="button"
                onClick={nextStep}
                className="bg-[#2aac64] hover:bg-[#239b57] text-white rounded-xl px-6 py-5 font-semibold transition-colors duration-200"
              >
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ) : (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button
                type="submit"
                disabled={isSubmitting || isAnalyzing}
                className="rounded-xl bg-[#2aac64] hover:bg-[#239b57] text-white px-8 py-5 font-semibold transition-colors duration-200 min-w-[180px]"
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
      </motion.form>
    </>
  );
};

export default LoanApplicationForm;