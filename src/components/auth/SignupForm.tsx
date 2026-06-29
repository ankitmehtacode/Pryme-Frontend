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
      password: data.password,
      mobileNumber: data.mobileNumber,
    });
    
    if (error) {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive"
      });
    } else {
      if (loggedInUser) {
        const role = (loggedInUser.role || "USER").toUpperCase();
        const isAdminOrEmployee = ["ADMIN", "SUPER_ADMIN", "EMPLOYEE"].includes(role);

        toast({
          title: "Account Created",
          description: isAdminOrEmployee
            ? "Welcome to Pryme! Redirecting to admin dashboard..."
            : "Welcome to Pryme! Redirecting to home page...",
        });

        if (from) {
          navigate(from, { replace: true });
        } else if (isAdminOrEmployee) {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
      <div className="space-y-1">
        <Label className="text-[13px] font-semibold text-slate-700">Name</Label>
        <Input
          type="text"
          placeholder="John Doe"
          {...form.register("fullName")}
        />
        {form.formState.errors.fullName && (
          <p className="text-[10px] text-rose-500 mt-1 pl-1">{form.formState.errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-[13px] font-semibold text-slate-700">Email</Label>
        <Input
          type="email"
          placeholder="you@email.com"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-[10px] text-rose-500 mt-1 pl-1">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-[13px] font-semibold text-slate-700">Mobile Number</Label>
        <Input
          type="tel"
          placeholder="9876543210"
          maxLength={10}
          {...form.register("mobileNumber")}
        />
        {form.formState.errors.mobileNumber && (
          <p className="text-[10px] text-rose-500 mt-1 pl-1">{form.formState.errors.mobileNumber.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-[13px] font-semibold text-slate-700">Pass</Label>
        <div className="relative">
          <Input
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
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
        <Label className="text-[13px] font-semibold text-slate-700">Confirm</Label>
        <div className="relative">
          <Input
            type={showConfirmPw ? "text" : "password"}
            placeholder="••••••••"
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
        <Button type="submit" disabled={isLoading} className="mb-6 w-full h-[56px] bg-[#103783] hover:bg-[#1E4DAB] border border-transparent hover:border-white/10 text-white font-semibold rounded-[14px] transition-all duration-[160ms] ease-out text-[16px] flex items-center justify-center gap-2" size="sm">
          {isLoading ? <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 animate-spin" /> : (
            <>
              Create account →
            </>
          )}
        </Button>
      </div>

      {children}
    </form>
  );
};
