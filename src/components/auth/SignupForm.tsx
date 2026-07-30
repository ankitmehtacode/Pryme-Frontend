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
import { OtpVerifier } from "@/components/loan/shared/OtpVerifier";
import { useApplicationStore } from "@/store/applicationStore";

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

  // The server-signed proofs, not booleans. A "verified: true" flag in component
  // state is set by this component and therefore means nothing; these tokens are
  // issued by the server, bound to the exact address/number, and re-checked at
  // registration. Held against the value they were issued for, so editing the
  // field after verifying correctly invalidates the proof rather than carrying a
  // token for a contact the user no longer entered.
  const [emailToken, setEmailToken] = useState<{ value: string; token: string } | null>(null);

  // Carried from the application form.
  //
  // Someone reaching signup via "Apply with Pryme" has already typed their name
  // and number AND proven that number by SMS -- the store holds the verification
  // token the OTP exchange issued. Asking them to retype it and verify a second
  // time, minutes later, is asking them to prove something we already have
  // server-signed evidence for.
  //
  // Seeded as initial state rather than synced: after first render this form owns
  // its own fields, so editing the number correctly drops the carried token
  // instead of a store value reviving it.
  const carried = useApplicationStore.getState().basicKYC;
  const [mobileToken, setMobileToken] = useState<{ value: string; token: string } | null>(
    carried?.mobileVerified && carried?.mobileVerificationToken && carried?.mobileNumber
      ? { value: carried.mobileNumber, token: carried.mobileVerificationToken }
      : null
  );

  const form = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      fullName: carried?.fullName || "",
      email: carried?.email || "",
      mobileNumber: carried?.mobileNumber || "",
    },
  });

  const emailValue = form.watch("email") ?? "";
  const mobileValue = form.watch("mobileNumber") ?? "";

  const emailVerified = emailToken?.value.toLowerCase() === emailValue.trim().toLowerCase()
    && Boolean(emailToken?.token);
  const mobileVerified = mobileToken?.value === mobileValue.trim() && Boolean(mobileToken?.token);

  const onSubmit = async (data: SignupData) => {
    setIsLoading(true);

    const { error, user: loggedInUser } = await signUp({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      mobileNumber: data.mobileNumber,
      // Sent whenever we hold them. The backend decides whether they are
      // REQUIRED via app.otp.enforce-on-signup, so this ships safely before
      // enforcement is switched on.
      emailVerificationToken: emailVerified ? emailToken?.token : undefined,
      mobileVerificationToken: mobileVerified ? mobileToken?.token : undefined,
    });

    if (error) {
      // A verification token can be refused for reasons this form cannot see --
      // most likely a carried token that aged past its 30-minute TTL between the
      // application form and here. Dropping it brings the Verify control back;
      // without this the user is left looking at a "Verified" chip while the
      // server insists they verify, with no way to act on it.
      const message = error.message || "";
      if (/verify your email/i.test(message)) setEmailToken(null);
      if (/verify your mobile/i.test(message)) setMobileToken(null);

      toast({
        title: "Registration Failed",
        description: message || "Could not create account. Please try again.",
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
            : "Welcome to Pryme! Redirecting to your profile...",
        });

        if (from) {
          navigate(from, { replace: true });
        } else if (isAdminOrEmployee) {
          navigate("/admin", { replace: true });
        } else {
          navigate("/profile", { replace: true });
        }
      }
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
      <div className="space-y-1">
        <Label className="text-[13px] font-semibold text-slate-700">Name</Label>
        <Input
          type="text"
          placeholder="John Doe"
          className="h-11 rounded-xl px-3.5 text-sm"
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
          className="h-11 rounded-xl px-3.5 text-sm"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-[10px] text-rose-500 mt-1 pl-1">{form.formState.errors.email.message}</p>
        )}
        {/* Renders nothing until the address is well-formed, so it does not
            nag while the user is still typing. */}
        <OtpVerifier
          channel="email"
          value={emailValue.trim()}
          verified={emailVerified}
          onVerified={(token, value) => setEmailToken({ value, token })}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-[13px] font-semibold text-slate-700">Mobile Number</Label>
        <Input
          type="tel"
          placeholder="9876543210"
          maxLength={10}
          className="h-11 rounded-xl px-3.5 text-sm"
          {...form.register("mobileNumber")}
        />
        {form.formState.errors.mobileNumber && (
          <p className="text-[10px] text-rose-500 mt-1 pl-1">{form.formState.errors.mobileNumber.message}</p>
        )}
        <OtpVerifier
          channel="mobile"
          value={mobileValue.trim()}
          verified={mobileVerified}
          onVerified={(token, value) => setMobileToken({ value, token })}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-1">
        <Label className="text-[13px] font-semibold text-slate-700">Password</Label>
        <div className="relative">
          <Input
            type={showPw ? "text" : "password"}
            placeholder="Create a password"
            className="h-11 rounded-xl px-3.5 text-sm"
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
        <Label className="text-[13px] font-semibold text-slate-700">Confirm Password</Label>
        <div className="relative">
          <Input
            type={showConfirmPw ? "text" : "password"}
            placeholder="Re-enter your password"
            className="h-11 rounded-xl px-3.5 text-sm"
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

      <div className="pt-2 flex flex-col items-start w-full">
        <Button type="submit" disabled={isLoading} className="mb-4 w-full h-[46px] bg-[#103783] hover:bg-[#1E4DAB] border border-transparent hover:border-white/10 text-white font-semibold rounded-xl transition-all duration-[160ms] ease-out text-sm flex items-center justify-center gap-2" size="sm">
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
