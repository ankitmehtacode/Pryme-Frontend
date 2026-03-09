import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, Variants } from "framer-motion";
import { User, Briefcase, CheckCircle2, XCircle, LockKeyhole, ArrowRight, MapPin, CreditCard, Building2, Zap, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// 🧠 Robust Zod Schema preserved for fail-proof validation
const applicationSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters").max(100),
  dob: z.string().min(1, "Date of birth is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  monthlyIncome: z.number().min(15000, "Minimum income is ₹15,000"),
  occupation: z.enum(["salaried", "business"], { required_error: "Select occupation type" }),
  cibilScore: z.number().min(300).max(900),
  loanAmount: z.number().min(100000, "Minimum loan is ₹1 Lakh").max(10000000, "Maximum loan is ₹1 Crore"),
  loanTenure: z.number().min(1).max(30),
  productType: z.string().min(1, "Product type is required"),
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
};

const LoanApplicationForm = ({ onAmountChange, onFormSubmit }: LoanApplicationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ApplicationData>({
    resolver: zodResolver(applicationSchema),
    mode: "onChange",
    defaultValues: {
      monthlyIncome: 85000,
      loanAmount: 500000,
      loanTenure: 5,
      cibilScore: 750,
      productType: "personal"
    },
  });

  // 🧠 160 IQ Sync: useWatch perfectly syncs the RHF state with the external EMI Calculator component
  const currentLoanAmount = useWatch({ control: form.control, name: "loanAmount" });
  const currentCibil = useWatch({ control: form.control, name: "cibilScore" });

  useEffect(() => {
    if (onAmountChange && currentLoanAmount) {
      onAmountChange(currentLoanAmount);
    }
  }, [currentLoanAmount, onAmountChange]);

  const handleSubmit = async (data: ApplicationData) => {
    setIsSubmitting(true);
    // Simulate API delay for UX
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    
    toast({
      title: "Data Encrypted & Processed 🔒",
      description: "Matchmaking with top financial institutions...",
    });
    
    onFormSubmit?.(data);
  };

  const getCibilData = (score: number) => {
    if (score >= 750) return { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Excellent" };
    if (score >= 650) return { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Good" };
    if (score >= 550) return { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Fair" };
    return { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "Poor" };
  };

  const cibilUi = getCibilData(currentCibil || 750);

  // 🧠 Premium Input Wrapper
  const InputWithValidation = ({ label, error, isValid, isSecure, ...props }: any) => (
    <div className="space-y-2 relative group">
      <Label className="text-[10px] font-medium uppercase tracking-widest text-[#2aac64] ml-1">{label}</Label>
      <div className="relative">
        <Input
          {...props}
          className={cn(
            "w-full bg-[#111] border border-white/10 rounded-xl px-4 py-6 text-sm font-medium text-white focus:ring-2 focus:ring-[#2aac64] outline-none transition-all shadow-inner group-hover:border-[#2aac64]/50",
            error && "border-red-500/50 focus:ring-red-500",
            isValid && !error && "border-[#2aac64]/50 focus:ring-[#2aac64]"
          )}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isSecure && <LockKeyhole className="w-4 h-4 text-slate-400" />}
          {error && <XCircle className="w-5 h-5 text-red-500 drop-shadow-md" />}
          {isValid && !error && <CheckCircle2 className="w-5 h-5 text-[#2aac64] drop-shadow-md" />}
        </div>
      </div>
      {error && <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
    </div>
  );

  return (
    <motion.form 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      onSubmit={form.handleSubmit(handleSubmit)} 
      className="space-y-8 h-full w-full"
    >
      {/* Dynamic Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-medium text-primary uppercase tracking-widest">
            Fast-Track Application
          </span>
        </div>
        <h2 className="text-2xl md:text-xl font-semibold text-slate-900 dark:text-white tracking-tight mb-2">
          Initialize Your Match
        </h2>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Complete the parameters below to scan 15+ banking algorithms instantly.
        </p>
      </motion.div>

      {/* 🧠 SECTION 1: CORE REQUIREMENTS */}
      <motion.div variants={itemVariants} className="bg-[#0a0a0a] border border-[#2aac64]/20 rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden transition-all hover:border-[#2aac64]/40">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2aac64]/10 blur-[40px] rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#2aac64]/20 shadow-sm flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#2aac64]" />
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight">Capital Requirement</h3>
        </div>

        <div className="space-y-6 relative z-10">
          {/* Product Type Grid (CRO Optimized compared to Select Dropdown) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {productTypes.map((type) => {
              const isSelected = form.watch("productType") === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => form.setValue("productType", type.value, { shouldValidate: true })}
                  className={cn(
                    "py-3 px-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 border",
                    isSelected 
                      ? "bg-[#2aac64] text-white border-[#2aac64] shadow-[0_0_15px_rgba(42,172,100,0.3)]" 
                      : "bg-[#111] text-slate-300 border-white/10 hover:border-[#2aac64]/50"
                  )}
                >
                  {type.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 group">
              <Label className="text-[10px] font-medium uppercase tracking-widest text-[#2aac64] ml-1">Loan Amount (₹)</Label>
              <Input
                type="number"
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-6 text-sm font-medium text-white focus:ring-2 focus:ring-[#2aac64] outline-none transition-all shadow-inner group-hover:border-[#2aac64]/50"
                {...form.register("loanAmount", { valueAsNumber: true })}
              />
              {form.formState.errors.loanAmount && <p className="text-xs text-red-500 font-medium ml-1">{form.formState.errors.loanAmount.message}</p>}
            </div>

            <div className="space-y-2 group">
              <Label className="text-[10px] font-medium uppercase tracking-widest text-[#2aac64] ml-1">Tenure (Years)</Label>
              <Select onValueChange={(v) => form.setValue("loanTenure", parseInt(v), { shouldValidate: true })} defaultValue={form.getValues("loanTenure").toString()}>
                <SelectTrigger className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-6 text-sm font-medium text-white focus:ring-2 focus:ring-[#2aac64] outline-none transition-all shadow-inner group-hover:border-[#2aac64]/50">
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

      {/* 🧠 SECTION 2: PERSONAL & LOCATION */}
      <motion.div variants={itemVariants} className="bg-[#0a0a0a] border border-[#2aac64]/20 rounded-[2rem] p-6 md:p-8 shadow-2xl relative transition-all hover:border-[#2aac64]/40">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#2aac64]/20 shadow-sm flex items-center justify-center">
            <User className="w-5 h-5 text-[#2aac64]" />
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight">KYC Verification Data</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputWithValidation
            label="Full Name (As per PAN)"
            placeholder="e.g. Rahul Sharma"
            isSecure
            isValid={form.formState.dirtyFields.fullName && !form.formState.errors.fullName}
            error={form.formState.errors.fullName?.message}
            {...form.register("fullName")}
          />
          <InputWithValidation
            label="Date of Birth"
            type="date"
            isSecure
            isValid={form.formState.dirtyFields.dob && !form.formState.errors.dob}
            error={form.formState.errors.dob?.message}
            {...form.register("dob")}
          />
          
          <div className="space-y-2 group">
            <Label className="text-[10px] font-medium uppercase tracking-widest text-[#2aac64] ml-1">State</Label>
            <Select onValueChange={(v) => form.setValue("state", v, { shouldValidate: true })}>
              <SelectTrigger className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-6 text-sm font-medium text-white focus:ring-2 focus:ring-[#2aac64] outline-none transition-all shadow-inner group-hover:border-[#2aac64]/50">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                {states.map((state) => (
                  <SelectItem key={state} value={state} className="cursor-pointer">{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.state && <p className="text-xs text-red-500 font-medium ml-1">{form.formState.errors.state.message}</p>}
          </div>

          <InputWithValidation
            label="Current City"
            placeholder="e.g. Mumbai"
            isValid={form.formState.dirtyFields.city && !form.formState.errors.city}
            error={form.formState.errors.city?.message}
            {...form.register("city")}
          />
        </div>
      </motion.div>

      {/* 🧠 SECTION 3: FINANCIAL ALGORITHM DATA */}
      <motion.div variants={itemVariants} className="bg-[#0a0a0a] border border-[#2aac64]/20 rounded-[2rem] p-6 md:p-8 shadow-2xl relative transition-all hover:border-[#2aac64]/40">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#2aac64]/20 shadow-sm flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-[#2aac64]" />
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight">Risk & Income Profile</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2 group">
            <Label className="text-[10px] font-medium uppercase tracking-widest text-[#2aac64] ml-1">Occupation Type</Label>
            <Select onValueChange={(v) => form.setValue("occupation", v as "salaried" | "business", { shouldValidate: true })}>
              <SelectTrigger className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-6 text-sm font-medium text-white focus:ring-2 focus:ring-[#2aac64] outline-none transition-all shadow-inner group-hover:border-[#2aac64]/50">
                <SelectValue placeholder="Select occupation" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                <SelectItem value="salaried" className="cursor-pointer">Salaried Professional</SelectItem>
                <SelectItem value="business" className="cursor-pointer">Self-Employed / Business</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.occupation && <p className="text-xs text-red-500 font-medium ml-1">{form.formState.errors.occupation.message}</p>}
          </div>

          <div className="space-y-2 group relative">
            <Label className="text-[10px] font-medium uppercase tracking-widest text-[#2aac64] ml-1">Monthly Income (₹)</Label>
            <Input
              type="number"
              placeholder="85000"
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-6 text-sm font-medium text-white focus:ring-2 focus:ring-[#2aac64] outline-none transition-all shadow-inner group-hover:border-[#2aac64]/50"
              {...form.register("monthlyIncome", { valueAsNumber: true })}
            />
            {form.formState.errors.monthlyIncome && <p className="text-xs text-red-500 font-medium ml-1">{form.formState.errors.monthlyIncome.message}</p>}
          </div>
        </div>

        {/* Premium CIBIL Slider Widget */}
        <div className={`p-6 rounded-[1.5rem] border backdrop-blur-md transition-colors duration-500 ${cibilUi.bg} ${cibilUi.border}`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <CreditCard className={`w-5 h-5 ${cibilUi.color}`} />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Self-Declared CIBIL</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-semibold ${cibilUi.color}`}>{currentCibil || 750}</span>
              <span className={`text-[10px] font-medium uppercase tracking-widest px-2 py-1 rounded border ${cibilUi.bg} ${cibilUi.color} ${cibilUi.border}`}>
                {cibilUi.label}
              </span>
            </div>
          </div>
          <Slider
            value={[currentCibil || 750]}
            onValueChange={(v) => form.setValue("cibilScore", v[0], { shouldValidate: true })}
            min={300} max={900} step={10}
            className="cursor-pointer mb-2"
          />
          <div className="flex justify-between text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-2">
            <span>300 (Poor)</span>
            <span>900 (Excellent)</span>
          </div>
        </div>
      </motion.div>

      {/* 🧠 SUBMIT ACTION */}
      <motion.div variants={itemVariants} className="pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full relative group overflow-hidden rounded-[1.5rem] bg-[#2aac64] hover:bg-[#2aac64]/90 text-white py-8 text-xl font-semibold shadow-[0_0_40px_rgba(42,172,100,0.3)] hover:shadow-[0_0_60px_rgba(42,172,100,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          {/* Apple-style Shimmer Effect */}
          <div className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:animate-shimmer" />
          <span className="relative flex items-center justify-center gap-3">
            {isSubmitting ? "Processing Algorithms..." : "Unlock Financial Matches"}
            {!isSubmitting && <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />}
          </span>
        </Button>
        <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-6">
          <ShieldCheck className="w-4 h-4 text-[#2aac64]" />
          <span>Data protected by AES-256 Encryption</span>
        </div>
      </motion.div>

    </motion.form>
  );
};

// Simple AlertCircle icon for validation errors
function AlertCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

export default LoanApplicationForm;