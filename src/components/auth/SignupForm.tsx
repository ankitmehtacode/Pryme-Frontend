import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { signupSchema, type SignupData } from "./schemas";

interface SignupFormProps {
  from: string | null;
  children?: React.ReactNode;
}

export const SignupForm = ({ from, children }: SignupFormProps) => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const form = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: SignupData) => {
    setIsLoading(true);
    
    const { error, user: loggedInUser } = await signUp({
      fullName: data.fullName,
      email: data.email,
      password: data.password
    });
    
    if (error) {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account Created",
        description: "Welcome to Pryme! Redirecting to your dashboard...",
      });
      if (loggedInUser) {
        const role = (loggedInUser.role || "USER").toUpperCase();
        if (from) {
          navigate(from, { replace: true });
        } else if (["ADMIN", "SUPER_ADMIN", "EMPLOYEE"].includes(role)) {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
      <div className="space-y-1">
        <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Name</Label>
        <Input
          type="text"
          placeholder="John Doe"
          className="h-10 sm:h-9 w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 font-medium text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none text-[14px] sm:text-[13px]"
          {...form.register("fullName")}
        />
        {form.formState.errors.fullName && (
          <p className="text-[10px] text-rose-500 mt-1 pl-1">{form.formState.errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email</Label>
        <Input
          type="email"
          placeholder="you@email.com"
          className="h-10 sm:h-9 w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 font-medium text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none text-[14px] sm:text-[13px]"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-[10px] text-rose-500 mt-1 pl-1">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Mobile Number</Label>
        <Input
          type="tel"
          placeholder="9876543210"
          maxLength={10}
          className="h-10 sm:h-9 w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 font-medium text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none text-[14px] sm:text-[13px]"
          {...form.register("mobileNumber")}
        />
        {form.formState.errors.mobileNumber && (
          <p className="text-[10px] text-rose-500 mt-1 pl-1">{form.formState.errors.mobileNumber.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Pass</Label>
        <div className="relative">
          <Input
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            className="h-10 sm:h-9 w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 pr-9 font-bold text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none tracking-[0.2em] text-[16px] xl:text-[20px]"
            {...form.register("password")}
          />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#103783] transition-colors" tabIndex={-1}>
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-[10px] text-rose-500 mt-1 pl-1">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Confirm</Label>
        <div className="relative">
          <Input
            type={showConfirmPw ? "text" : "password"}
            placeholder="••••••••"
            className="h-10 sm:h-9 w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 pr-9 font-bold text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none tracking-[0.2em] text-[16px] xl:text-[20px]"
            {...form.register("confirmPassword")}
          />
          <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#103783] transition-colors" tabIndex={-1}>
            {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {form.formState.errors.confirmPassword && (
          <p className="text-[10px] text-rose-500 mt-1 pl-1">{form.formState.errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="pt-6 flex flex-col items-start w-full">
        <Button type="submit" disabled={isLoading} className="mb-6 w-full h-[46px] sm:h-[42px] bg-[#103783] hover:bg-[#1E4DAB] border border-transparent hover:border-white/10 text-white font-extrabold tracking-widest rounded-full shadow-[0_8px_24px_rgba(16,55,131,0.25)] hover:shadow-[0_12px_28px_rgba(16,55,131,0.35)] hover:-translate-y-[2px] transition-all duration-300 text-[12px] sm:text-[11px] uppercase flex items-center justify-center gap-2" size="sm">
          {isLoading ? <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 animate-spin" /> : (
            <>
              Create Account <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>

      {children}
    </form>
  );
};
