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

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    
    const { error, user: loggedInUser } = await signIn(data.email, data.password);
    
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
        <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email</Label>
        <Input
          type="email"
          placeholder="you@company.com"
          className="h-10 sm:h-9 w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 font-medium text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none text-[14px] sm:text-[13px]"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-[10px] text-rose-500 mt-1 pl-1">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Password</Label>
        <motion.div 
          className="relative"
          animate={isShaking ? { x: [-5, 5, -5, 5, -3, 3, 0], transition: { duration: 0.4 } } : {}}
        >
          <Input
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            className={cn(
              "h-10 sm:h-9 w-full border-0 border-b rounded-none bg-transparent px-1 pr-9 font-bold text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 transition-colors shadow-none tracking-[0.2em] text-[16px] xl:text-[20px]",
              form.formState.errors.password 
                ? "border-rose-500/50 focus-visible:border-rose-500 text-rose-600" 
                : "border-[#103783]/10 hover:border-[#103783]/30 focus-visible:border-[#10B981]"
            )}
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
      </div>

      <div className="flex items-center gap-2 mt-5 sm:mt-6 pl-1 group">
          <div className="w-[14px] sm:w-[16px] h-[14px] sm:h-[16px] rounded-[4px] bg-white border border-[#10B981] flex items-center justify-center cursor-pointer transition-colors group-hover:bg-[#10B981]/10">
            <div className="w-2 h-2 rounded-[2px] bg-[#10B981]" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 cursor-pointer transition-colors group-hover:text-[#103783]">Keep me logged in</span>
      </div>

      <div className="pt-4 sm:pt-6 flex flex-col items-start w-full">
        <Button type="submit" disabled={isLoading} className="mb-6 w-full h-[46px] sm:h-[42px] bg-[#103783] hover:bg-[#1E4DAB] border border-transparent hover:border-white/10 text-white font-extrabold tracking-widest rounded-full shadow-[0_8px_24px_rgba(16,55,131,0.25)] hover:shadow-[0_12px_28px_rgba(16,55,131,0.35)] hover:-translate-y-[2px] transition-all duration-300 text-[12px] sm:text-[11px] uppercase flex items-center justify-center gap-2" size="sm">
          {isLoading ? <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 animate-spin" /> : (
            <>
              Continue <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
        
        <button type="button" onClick={onForgotPassword} className="text-[11px] sm:text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors pl-1">
          Forgot Password?
        </button>
      </div>

      {children}
    </form>
  );
};
