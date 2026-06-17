import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { motion, AnimatePresence } from "framer-motion";

// Components & Utilities
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import prymeLogo from "@/assets/pryme-typo-logo.svg";
// pryme2Logo removed — loading gate eliminated (Auth is a public page)

// 🧠 Closed-Loop Security Context & API
import { useAuth } from "@/hooks/useAuth";

// 🧠 Google Identity Services SDK Type Declaration
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            itp_support?: boolean;
          }) => void;
          renderButton: (parent: HTMLElement, config: {
            type?: string;
            theme?: string;
            size?: string;
            text?: string;
            shape?: string;
            width?: number;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").replace(/^["']|["']$/g, '');

// Zod schemas and types have been moved to src/components/auth/schemas.ts

type AuthView = "login" | "signup" | "forgot-password";

const Auth = () => {
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  
  const [view, setView] = useState<AuthView>("login");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Deep Link Recovery & Lead Matrix Capture
  const pendingLeadId = location.state?.leadId || null;
  const from = location.state?.from || null;

  // 🧠 RELAY FIX: Persist lead handoff to localStorage so Dashboard.tsx
  // can pick it up during boot. Without this, the leadId from Offers → Auth
  // is lost because Auth navigates to /dashboard without forwarding state.
  useEffect(() => {
    if (pendingLeadId) {
      localStorage.setItem("pryme_pending_lead_id", pendingLeadId);
    }
  }, [pendingLeadId]);

  // Form components manage their own loading and submission state internally

  // 🧠 GOOGLE IDENTITY SERVICES SDK INITIALIZATION
  // Loads the GIS script once and initializes with our Client ID.
  // The callback receives a JWT credential from Google which we send
  // to our backend for server-side verification.
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

        // Render the Google button if container exists
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

    // If script already loaded (SPA navigation), initialize immediately
    if (window.google?.accounts?.id) {
      initializeGIS();
      return;
    }

    // Load GIS script dynamically — idempotent (won't double-load)
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGIS;
      document.head.appendChild(script);
    } else {
      // Script tag exists but may still be loading
      existingScript.addEventListener("load", initializeGIS);
    }
  }, [view]); // Re-initialize when switching between login/signup

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

    // Trigger the One Tap / popup flow
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      toast({
        title: "Loading...",
        description: "Google Sign-In is initializing. Please try again in a moment.",
      });
    }
  };




  // 🧠 SILICON VALLEY GRADE FIX: The Auth page is a PUBLIC page.
  // NEVER block rendering on isContextLoading. If the backend is unreachable,
  // the React Query fetch hangs indefinitely → isLoading stays true → infinite spinner.
  // The useEffect above already handles redirecting authenticated users to /dashboard
  // once hydration completes. Rendering the form immediately is the correct UX.

  return (
    <>
      <Helmet>
        <title>{view === "login" ? "Log in" : view === "signup" ? "Get Started" : "Reset Password"} | Pryme</title>
        <meta name="description" content="Log in to manage your Pryme capital and loan applications." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* 0.01% TIER GLASSMORPHIC PREMIUM FINTECH BACKGROUND */}
      <div 
        className="min-h-[100dvh] w-full relative flex items-center justify-center bg-[#F4F7FA] font-sans text-[#0a1530] p-4 sm:p-6 md:p-8 overflow-hidden"
      >
        {/* High-End Dotted Mesh SVG Grid with Edge Fading */}
        <div 
          className="absolute inset-0 z-0 opacity-80"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='%23103783' fill-opacity='0.15'/%3E%3C/svg%3E")`,
            backgroundSize: '24px 24px',
            WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 80%)',
            maskImage: 'radial-gradient(circle at center, black 0%, transparent 95%)'
          }}
        />

        {/* 🧠 PERF FIX: Replaced blur+mix-blend-multiply blobs with radial-gradient.
             blur() + forces Chrome to rasterize 700px bitmaps
             on CPU every animation frame. radial-gradient is compositor-native. */}
        <motion.div 
          className="absolute top-[0%] left-[0%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full pointer-events-none opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.6) 0%, rgba(30,77,171,0.3) 50%, transparent 70%)' }}
          animate={{ x: [0, 100, -50, 0], y: [0, -50, 100, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[0%] right-[0%] w-[500px] md:w-[700px] h-[500px] md:h-[700px] rounded-full pointer-events-none opacity-35"
          style={{ background: 'radial-gradient(circle, rgba(16,55,131,0.6) 0%, rgba(16,185,129,0.3) 50%, transparent 70%)' }}
          animate={{ x: [0, -120, 80, 0], y: [0, 80, -100, 0], scale: [1, 1.15, 0.85, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-[25%] left-[30%] w-[350px] md:w-[500px] h-[350px] md:h-[500px] rounded-full pointer-events-none opacity-50"
          style={{ background: 'radial-gradient(circle, rgba(219,234,254,0.7) 0%, rgba(219,234,254,0.2) 50%, transparent 70%)' }}
          animate={{ x: [0, 80, -90, 0], y: [0, 120, -60, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* MAIN SPLIT CARD - Flawless Glassmorphism & Micro-animations */}
        <motion.div 
          className="relative w-full max-w-[1000px] min-h-[600px] rounded-[24px] sm:rounded-[32px] shadow-[0_24px_60px_rgba(16,55,131,0.15),0_0_0_1px_rgba(255,255,255,0.6)_inset] flex flex-col lg:flex-row overflow-hidden bg-white/10 backdrop-transform-gpu saturate-[1.2] z-10"
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} // Hyper-smooth spring curve
        >
          
          {/* ========================================================= */}
          {/* LEFT PANEL: High-Fidelity Photography & Glass Overlay */}
          {/* ========================================================= */}
          <div className="relative hidden w-full lg:flex lg:w-1/2 flex-col items-center justify-center p-14 overflow-hidden border-r border-white/20">
            {/* Cinematic Background Image */}
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000&auto=format&fit=crop" 
              alt="Pryme Finance Corporate" 
              className="absolute inset-0 w-full h-full object-cover z-0 scale-105" 
            />
            
            {/* Elegant Glassmorphic Pryme Overlay with Heavy Fade */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#103783]/90 via-[#103783]/70 to-[#10B981]/50 z-0"></div>
            <div className="absolute inset-0 bg-[#103783]/30 backdrop-transform-gpu z-0"></div>

            {/* Logo Centralized (White version over dark overlay) */}
            <div className="relative z-10 flex flex-col items-center cursor-pointer mb-2 drop-shadow-2xl" onClick={() => navigate("/")}>
               <img 
                 src={prymeLogo} 
                 alt="Pryme Logo" 
                 className="h-[64px] w-auto transition-duration-500 hover:scale-110 hover:-translate-y-1" 
                 style={{ filter: 'brightness(0) invert(1) drop-shadow(0px 8px 16px rgba(0,0,0,0.6))' }} 
               /> 
            </div>

            {/* Premium Typography Tagline */}
            <p className="relative z-10 mt-8 text-white font-medium text-[16px] leading-[1.6] text-center max-w-[340px] tracking-wide opacity-95 drop-shadow-md">
               Experience the future of financial agility. Extremely secure, seamless, and uniquely yours.
               <br/><br/><span className="text-[#10B981] font-bold tracking-[0.25em] text-[10px] uppercase drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">Powering Innovation</span>
            </p>

            {/* Subtle Footer Links */}
            <div className="absolute bottom-10 flex gap-6 text-[10px] font-bold text-white/80 uppercase tracking-widest z-10">
              <span className="hover:text-white cursor-pointer transition-all duration-300 backdrop-blur-sm px-4 py-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">About</span>
              <span className="hover:text-white cursor-pointer transition-all duration-300 backdrop-blur-sm px-4 py-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">Privacy</span>
              <span className="hover:text-white cursor-pointer transition-all duration-300 backdrop-blur-sm px-4 py-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">Terms</span>
              <span className="hover:text-white cursor-pointer transition-all duration-300 backdrop-blur-sm px-4 py-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">FAQ</span>
            </div>
          </div>
          
          {/* ========================================================= */}
          {/* RIGHT PANEL: Auth Form Overlay */}
          {/* ========================================================= */}
          <div className="w-full lg:w-1/2 bg-white/70 backdrop-transform-gpu shadow-[-20px_0_40px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center p-6 sm:p-12 md:p-16 relative z-10 overflow-y-auto w-[100%]">
             
             <div className="w-full max-w-[320px] z-10 flex flex-col w-[100%] items-stretch">
                {/* Mobile Header (Hidden on LG) */}
                <div className="lg:hidden flex justify-center cursor-pointer mb-8 sm:mb-10" onClick={() => navigate("/")}>
                   <img src={prymeLogo} alt="Pryme Logo" className="h-[34px] sm:h-8 auto" style={{ filter: 'brightness(0) saturate(100%) invert(18%) sepia(85%) saturate(2250%) hue-rotate(211deg) brightness(98%) contrast(92%)' }} />
                </div>

                {/* Premium Segmented Control Auth Toggle (In Flow) */}
                {view !== "forgot-password" && (
                   <div className="w-full flex p-1 mb-8 bg-black/5 border border-black/5 backdrop-blur-md rounded-full relative z-20">
                      <button 
                        onClick={() => setView("login")} 
                        className={cn("relative z-10 flex-1 h-[36px] sm:h-[40px] flex items-center justify-center text-[11px] sm:text-xs font-extrabold rounded-full transition-colors uppercase tracking-wider", view === "login" ? "text-white" : "text-slate-500 hover:text-slate-800")}
                      >
                        {view === "login" && (
                          <motion.div layoutId="auth-toggle-pill" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} className="absolute inset-0 bg-[#103783] rounded-full shadow-md -z-10" />
                        )}
                        Log in
                      </button>
                      <button 
                        onClick={() => setView("signup")} 
                        className={cn("relative z-10 flex-1 h-[36px] sm:h-[40px] flex items-center justify-center text-[11px] sm:text-xs font-extrabold rounded-full transition-colors uppercase tracking-wider", view === "signup" ? "text-white" : "text-slate-500 hover:text-slate-800")}
                      >
                        {view === "signup" && (
                          <motion.div layoutId="auth-toggle-pill" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} className="absolute inset-0 bg-[#10B981] rounded-full shadow-md -z-10" />
                        )}
                        Register
                      </button>
                   </div>
                )}

                <AnimatePresence mode="wait">
                  {view === "forgot-password" ? (
                    <motion.div key="fp" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                      <button onClick={() => setView("login")} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-800 mb-6 transition-colors uppercase tracking-wider">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                      <h2 className="text-[24px] sm:text-[26px] font-extrabold text-[#103783] mb-2 tracking-tight">Reset Password</h2>
                      <p className="text-slate-500 mb-8 text-[11px] sm:text-xs font-medium">Enter your email and we'll send a secure reset link.</p>

                      <ForgotPasswordForm onSuccess={() => setView("login")} />
                    </motion.div>
                  ) : (
                    <motion.div key="auth" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.3 }}>
                      
                      <h2 className="text-[28px] sm:text-[32px] font-black text-[#103783] mb-8 sm:mb-10 tracking-tight drop-shadow-sm">
                        {view === "login" ? "Welcome Back" : "Create Account"}
                      </h2>

                      {view === "login" ? (
                        <LoginForm onForgotPassword={() => setView("forgot-password")} from={from}>
                          {/* Google Sign-In Divider + Button */}
                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px]">
                              <span className="bg-white/70 backdrop-blur-sm px-4 text-slate-400 font-bold uppercase tracking-widest">or</span>
                            </div>
                          </div>

                          {/* Google GIS Rendered Button Container */}
                          <div ref={googleButtonRef} className="flex justify-center w-full" />

                          {/* Fallback custom Google button (shown if GIS hasn't rendered) */}
                          {!GOOGLE_CLIENT_ID && (
                            <button
                              type="button"
                              onClick={handleGoogleSignIn}
                              disabled={isGoogleLoading}
                              className="w-full h-[42px] flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-[12px] sm:text-[11px] font-bold text-slate-600 hover:text-slate-800 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                              </svg>
                              {isGoogleLoading ? "Signing in..." : "Continue with Google"}
                            </button>
                          )}
                        </LoginForm>
                      ) : (
                        <SignupForm from={from}>
                          {/* Google Sign-In Divider + Button */}
                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px]">
                              <span className="bg-white/70 backdrop-blur-sm px-4 text-slate-400 font-bold uppercase tracking-widest">or</span>
                            </div>
                          </div>

                          {/* Google GIS Rendered Button Container */}
                          <div ref={view === "signup" ? googleButtonRef : undefined} className="flex justify-center w-full" />

                          {/* Fallback custom Google button (shown if GIS hasn't rendered) */}
                          {!GOOGLE_CLIENT_ID && (
                            <button
                              type="button"
                              onClick={handleGoogleSignIn}
                              disabled={isGoogleLoading}
                              className="w-full h-[42px] flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-[12px] sm:text-[11px] font-bold text-slate-600 hover:text-slate-800 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                              </svg>
                              {isGoogleLoading ? "Signing in..." : "Sign up with Google"}
                            </button>
                          )}
                        </SignupForm>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Fintech Trust Signals */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mt-8 pt-6 border-t border-slate-200 flex flex-col items-center gap-2"
                >
                   <div className="flex items-center justify-center gap-3 sm:gap-4 w-full">
                     <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                        <span className="text-[9px] sm:text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mt-[1px]">RBI Compliant</span>
                     </div>
                     <div className="w-[3px] h-[3px] rounded-full bg-slate-300"></div>
                     <div className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#103783]/50" />
                        <span className="text-[9px] sm:text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mt-[1px]">SHA-256 Secure</span>
                     </div>
                   </div>
                </motion.div>
             </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Auth;