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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label className="text-[13px] font-semibold text-slate-700">Email</Label>
        <Input
          type="email"
          placeholder="you@example.com"
          className="h-11 rounded-xl px-3.5 text-sm"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-[10px] text-rose-500 mt-1 pl-1">{form.formState.errors.email.message}</p>
        )}
      </div>
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="mt-6 w-full h-[46px] bg-[#103783] hover:bg-[#1E4DAB] border border-transparent hover:border-white/10 text-white font-semibold rounded-xl transition-all duration-[160ms] ease-out text-sm flex items-center justify-center gap-2" 
        size="sm"
      >
        {isLoading ? <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 animate-spin" /> : "Send Link"}
      </Button>
    </form>
  );
};
