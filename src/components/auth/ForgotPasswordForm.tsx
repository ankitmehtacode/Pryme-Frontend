import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { forgotPasswordSchema, type ForgotPasswordData } from "./schemas";

interface ForgotPasswordFormProps {
  onSuccess: () => void;
}

export const ForgotPasswordForm = ({ onSuccess }: ForgotPasswordFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    // Simulate network request for forgot password
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for a secure link to reset your credentials.",
      });
      onSuccess();
    }, 1500);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <Label className="text-[13px] font-semibold text-slate-700 pl-1">Email</Label>
        <Input
          type="email"
          placeholder="you@example.com"
          className="h-[52px] w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 font-medium text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none text-[14px] sm:text-[13px]"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-[10px] text-rose-500 mt-1 pl-1">{form.formState.errors.email.message}</p>
        )}
      </div>
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="mt-8 w-full h-[46px] sm:h-[42px] bg-[#103783] hover:bg-[#1E4DAB] text-white font-extrabold tracking-widest rounded-full shadow-[0_8px_24px_rgba(16,55,131,0.25)] hover:shadow-[0_12px_28px_rgba(16,55,131,0.35)] hover:-translate-y-0.5 transition-all duration-300 text-[12px] sm:text-[11px] uppercase" 
        size="sm"
      >
        {isLoading ? <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 animate-spin" /> : "Send Link"}
      </Button>
    </form>
  );
};
