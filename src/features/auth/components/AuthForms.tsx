import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Shield, Lock } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import prymeLogo from "@/assets/pryme-typo-logo.svg";

import { useAuth } from "@/hooks/useAuth";

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").replace(/^["']|["']$/g, '');

type AuthView = "login" | "signup" | "forgot-password";

export function AuthForms() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<AuthView>("login");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const pendingLeadId = location.state?.leadId || null;
  const from = location.state?.from || null;

  useEffect(() => {
    if (pendingLeadId) {
      localStorage.setItem("pryme_pending_lead_id", pendingLeadId);
    }
  }, [pendingLeadId]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const initializeGIS = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          itp_support: true,
        });

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "pill",
            width: 320,
          });
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGIS();
      return;
    }

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGIS;
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener("load", initializeGIS);
    }
  }, [view]);

  const handleGoogleCredentialResponse = async (response: { credential: string }) => {
    setIsGoogleLoading(true);

    const { error, user: loggedInUser, isNewUser } = await signInWithGoogle(response.credential);

    if (error) {
      toast({
        title: "Google Sign-In Failed",
        description: error.message || "Could not authenticate with Google. Please try again.",
        variant: "destructive",
      });
    } else {
      if (loggedInUser) {
        const role = (loggedInUser.role || "USER").toUpperCase();
        const isAdminOrEmployee = ["ADMIN", "SUPER_ADMIN", "EMPLOYEE"].includes(role);

        toast({
          title: "Welcome to Pryme",
          description: isNewUser
            ? "Your account has been created successfully. Redirecting to home page..."
            : "Successfully signed in with Google.",
        });

        if (from) {
          navigate(from, { replace: true });
        } else if (isAdminOrEmployee) {
          navigate("/admin", { replace: true });
        } else {
          if (isNewUser) {
            navigate("/", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        }
      }
    }

    setIsGoogleLoading(false);
  };

  const handleGoogleSignIn = async () => {
    if (!GOOGLE_CLIENT_ID) {
      toast({
        title: "Configuration Required",
        description: "Google OAuth is not configured. Set VITE_GOOGLE_CLIENT_ID in your environment.",
        variant: "destructive",
      });
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      toast({
        title: "Loading...",
        description: "Google Sign-In is initializing. Please try again in a moment.",
      });
    }
  };

  return (
    <div className="w-full max-w-[380px] z-10 flex flex-col items-stretch">
      {/* Mobile Header (Hidden as we place logo top-left globally) */}
      <div className="hidden justify-start cursor-pointer mb-6" onClick={() => navigate("/")}>
        <img src={prymeLogo} alt="Pryme Logo" className="h-[26px] auto" style={{ filter: 'brightness(0) saturate(100%) invert(18%) sepia(85%) saturate(2250%) hue-rotate(211deg) brightness(98%) contrast(92%)' }} />
      </div>

      <AnimatePresence mode="wait">
        {view === "forgot-password" ? (
          <motion.div key="fp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <button onClick={() => setView("login")} className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-900 mb-5 transition-all duration-[160ms] ease-out">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </button>
            <h2 className="text-2xl sm:text-[28px] font-extrabold leading-[1.1] text-[#0a1530] mb-1.5 tracking-tight">Reset password</h2>
            <p className="text-slate-500 mb-6 text-sm font-normal">Enter your email and we'll send a secure reset link.</p>

            <ForgotPasswordForm onSuccess={() => setView("login")} />
          </motion.div>
        ) : (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <h2 className="text-2xl sm:text-[28px] font-extrabold leading-[1.1] text-[#0a1530] mb-1.5 tracking-tight">
              {view === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm font-normal text-slate-500 mb-6">
              {view === "login" ? "Continue to Pryme." : "Join Pryme today."}
            </p>

            {view === "login" ? (
              <LoginForm onForgotPassword={() => setView("forgot-password")} from={from}>
                <div className="relative mt-6 mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px]">
                    <span className="bg-white dark:bg-[#0d1527] px-3 text-slate-400 font-bold uppercase tracking-wider">or</span>
                  </div>
                </div>

                <div ref={googleButtonRef} className="flex justify-center w-full" />

                {!GOOGLE_CLIENT_ID && (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full h-11 flex items-center justify-center gap-2.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-all duration-[160ms] ease-out"
                  >
                    <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {isGoogleLoading ? "Signing in..." : "Continue with Google"}
                  </button>
                )}

                <div className="mt-5 text-center">
                  <span className="text-[13px] text-slate-500">Don't have an account? </span>
                  <button
                    onClick={() => setView("signup")}
                    className="text-[13px] font-semibold text-[#103783] hover:underline transition-all duration-[160ms] ease-out"
                  >
                    Create account &rarr;
                  </button>
                </div>
              </LoginForm>
            ) : (
              <SignupForm from={from}>
                <div className="relative mt-6 mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px]">
                    <span className="bg-white dark:bg-[#0d1527] px-3 text-slate-400 font-bold uppercase tracking-wider">or</span>
                  </div>
                </div>

                <div ref={view === "signup" ? googleButtonRef : undefined} className="flex justify-center w-full" />

                {!GOOGLE_CLIENT_ID && (
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full h-11 flex items-center justify-center gap-2.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-all duration-[160ms] ease-out"
                  >
                    <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {isGoogleLoading ? "Signing in..." : "Sign up with Google"}
                  </button>
                )}

                <div className="mt-5 text-center">
                  <span className="text-[13px] text-slate-500">Already have an account? </span>
                  <button
                    onClick={() => setView("login")}
                    className="text-[13px] font-semibold text-[#103783] hover:underline transition-all duration-[160ms] ease-out"
                  >
                    Sign in &rarr;
                  </button>
                </div>
              </SignupForm>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mt-8 flex items-center justify-center gap-4 w-full text-slate-400"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-[18px] h-[18px] text-slate-400" strokeWidth={1.5} />
          <span className="text-[12px] font-medium">RBI Compliant</span>
        </div>
        <div className="w-[4px] h-[4px] rounded-full bg-slate-300"></div>
        <div className="flex items-center gap-2">
          <Lock className="w-[18px] h-[18px] text-slate-400" strokeWidth={1.5} />
          <span className="text-[12px] font-medium">256-bit Encryption</span>
        </div>
      </motion.div>
    </div>
  );
}
