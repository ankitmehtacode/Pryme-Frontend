import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginData } from "./schemas";

interface LoginFormProps {
  onForgotPassword: () => void;
  from: string | null;
  children?: React.ReactNode;
}

export const LoginForm = ({ onForgotPassword, from, children }: LoginFormProps) => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    
    const { error, user: loggedInUser } = await signIn(data.email, data.password, rememberMe);
    
    if (error) {
      const errorMessage = error.message?.toLowerCase() || "";
      const isAuthError = errorMessage.includes("credential") || 
                          errorMessage.includes("password") || 
                          errorMessage.includes("invalid") ||
                          errorMessage.includes("incorrect") ||
                          errorMessage.includes("401");

      if (isAuthError) {
        form.setError("password", { 
          type: "manual", 
          message: "Incorrect password. Please double-check and try again." 
        });
        
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600);
      } else {
        toast({
          title: "Login Failed",
          description: error.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
      
      form.setValue("password", ""); 
    } else {
      toast({
        title: "Welcome Back",
        description: "Successfully logged into your Pryme account.",
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <Label className="text-[13px] font-semibold text-slate-700">Email</Label>
        <Input
          type="email"
          placeholder="you@company.com"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-[10px] text-rose-500 mt-1 pl-1">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-[13px] font-semibold text-slate-700">Password</Label>
        <motion.div 
          className="relative"
          animate={isShaking ? { x: [-5, 5, -5, 5, -3, 3, 0], transition: { duration: 0.4 } } : {}}
        >
          <Input
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
             className={cn(form.formState.errors.password ? "border-rose-500 focus-visible:ring-rose-500 text-rose-600" : "")}
            {...form.register("password", {
              onChange: () => {
                if (form.formState.errors.password) {
                  form.clearErrors("password");
                }
              }
            })}
          />
          <button type="button" onClick={() => setShowPw(!showPw)} className={cn("absolute right-1 top-1/2 -translate-y-1/2 p-1 transition-colors", form.formState.errors.password ? "text-rose-400 hover:text-rose-600" : "text-slate-400 hover:text-[#103783]")} tabIndex={-1}>
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </motion.div>
        <AnimatePresence>
          {form.formState.errors.password && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -5 }} 
              animate={{ opacity: 1, height: "auto", y: 0 }} 
              exit={{ opacity: 0, height: 0, y: -5 }}
              className="text-[10px] text-rose-500 mt-1.5 pl-1 font-bold flex items-center gap-1"
            >
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {form.formState.errors.password.message}
            </motion.div>
          )}
        </AnimatePresence>
        <button type="button" onClick={onForgotPassword} className="text-[13px] font-semibold text-[#103783] hover:underline transition-all duration-[150ms] ease-out mt-2 text-left">
          Forgot password?
        </button>
      </div>

      <div 
        onClick={() => setRememberMe(!rememberMe)}
        className="flex items-center gap-2 mt-5 sm:mt-6 group cursor-pointer select-none"
      >
          <div className={cn(
            "w-[14px] sm:w-[16px] h-[14px] sm:h-[16px] rounded-[4px] bg-white border flex items-center justify-center transition-colors",
            rememberMe ? "border-[#10B981] bg-white" : "border-slate-300 hover:border-[#10B981]/50"
          )}>
            {rememberMe && <div className="w-2 h-2 rounded-[2px] bg-[#10B981]" />}
          </div>
          <span className={cn(
            "text-[11px] sm:text-xs font-bold transition-colors",
            rememberMe ? "text-[#103783]" : "text-slate-500 group-hover:text-slate-700"
          )}>
            Keep me logged in
          </span>
      </div>

      <div className="pt-4 sm:pt-6 flex flex-col items-start w-full">
        <Button type="submit" disabled={isLoading} className="mb-6 w-full h-[56px] bg-[#103783] hover:bg-[#1E4DAB] border border-transparent hover:border-white/10 text-white font-semibold rounded-[14px] transition-all duration-[160ms] ease-out text-[16px] flex items-center justify-center gap-2" size="sm">
          {isLoading ? <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 animate-spin" /> : (
            <>
              Sign in →
            </>
          )}
        </Button>
      </div>

      {children}
    </form>
  );
};
