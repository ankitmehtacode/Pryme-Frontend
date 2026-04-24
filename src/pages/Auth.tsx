import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, ArrowRight, Building2, ArrowLeft, Loader2, Code2, TrendingUp, ShieldCheck, Wallet, Sparkles, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components & Utilities
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import prymeLogo from "@/assets/pryme-typo-logo.svg";
import pryme2Logo from "@/assets/Pryme2.svg";

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

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include at least one uppercase letter")
    .regex(/[0-9]/, "Must include at least one digit")
    .regex(/[^A-Za-z0-9]/, "Must include at least one special character"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type LoginData = z.infer<typeof loginSchema>;
type SignupData = z.infer<typeof signupSchema>;
type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

type AuthView = "login" | "signup" | "forgot-password";

const Auth = () => {
  const { user, signIn, signUp, signInWithGoogle, isLoading: isContextLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  
  const [view, setView] = useState<AuthView>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  
  // Silicon Valley Grade UX: Password Shake State
  const [isLoginShaking, setIsLoginShaking] = useState(false);

  // Deep Link Recovery & Lead Matrix Capture
  const pendingLeadId = location.state?.leadId || null;
  const from = location.state?.from || null;

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const signupForm = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const forgotPasswordForm = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (user) {
      if (from) {
        navigate(from, { replace: true });
        return;
      }
      
      const role = (user.role || "USER").toUpperCase();

      if (["ADMIN", "SUPER_ADMIN", "EMPLOYEE"].includes(role)) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, navigate, from]);

  const handleLogin = async (data: LoginData) => {
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
        // 200 IQ UX: Inline context-aware error with micro-interaction (shake)
        loginForm.setError("password", { 
          type: "manual", 
          message: "Incorrect password. Please double-check and try again." 
        });
        
        // Trigger haptic-like shake animation
        setIsLoginShaking(true);
        setTimeout(() => setIsLoginShaking(false), 600);
      } else {
        toast({
          title: "Login Failed",
          description: error.message || "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
      
      loginForm.setValue("password", ""); 
    } else {
      toast({
        title: "Welcome Back",
        description: "Successfully logged into your Pryme account.",
      });
      // Navigation is now handled by the useEffect above reacting to the hydrated user state, 
      // but we maintain this declarative fallback just in case.
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

  const handleSignup = async (data: SignupData) => {
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

  const handleForgotPassword = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for a secure link to reset your credentials.",
      });
      setView("login");
    }, 1500);
  };

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
    
    const { error, user: loggedInUser } = await signInWithGoogle(response.credential);
    
    if (error) {
      toast({
        title: "Google Sign-In Failed",
        description: error.message || "Could not authenticate with Google. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome to Pryme",
        description: "Successfully signed in with Google.",
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




  if (isContextLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F7FA] relative overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }} 
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 flex flex-col items-center"
        >
          <img src={pryme2Logo} className="w-20 h-auto sm:w-28 drop-shadow-xl mb-10" alt="Pryme Logo" />
          <div className="flex flex-col items-center gap-3">
             <Loader2 className="w-5 h-5 text-[#103783] animate-spin" />
             <p className="text-[10px] sm:text-[11px] font-extrabold text-[#103783] tracking-[0.3em] uppercase">Authenticating</p>
          </div>
        </motion.div>
      </div>
    );
  }

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

                      <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-6">
                        <div className="space-y-1">
                          <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email</Label>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            className="h-10 sm:h-9 w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 font-medium text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none text-[14px] sm:text-[13px]"
                            {...forgotPasswordForm.register("email")}
                          />
                          {forgotPasswordForm.formState.errors.email && (
                            <p className="text-[10px] text-rose-500 mt-1 pl-1">{forgotPasswordForm.formState.errors.email.message}</p>
                          )}
                        </div>
                        <Button type="submit" disabled={isLoading} className="mt-8 w-full h-[46px] sm:h-[42px] bg-[#103783] hover:bg-[#1E4DAB] text-white font-extrabold tracking-widest rounded-full shadow-[0_8px_24px_rgba(16,55,131,0.25)] hover:shadow-[0_12px_28px_rgba(16,55,131,0.35)] hover:-translate-y-0.5 transition-all duration-300 text-[12px] sm:text-[11px] uppercase" size="sm">
                          {isLoading ? <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 animate-spin" /> : "Send Link"}
                        </Button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div key="auth" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.3 }}>
                      
                      <h2 className="text-[28px] sm:text-[32px] font-black text-[#103783] mb-8 sm:mb-10 tracking-tight drop-shadow-sm">
                        {view === "login" ? "Welcome Back" : "Create Account"}
                      </h2>

                      {view === "login" ? (
                        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                          <div className="space-y-1">
                            <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email</Label>
                            <Input
                              type="email"
                              placeholder="you@company.com"
                              className="h-10 sm:h-9 w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 font-medium text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none text-[14px] sm:text-[13px]"
                              {...loginForm.register("email")}
                            />
                            {loginForm.formState.errors.email && (
                              <p className="text-[10px] text-rose-500 mt-1 pl-1">{loginForm.formState.errors.email.message}</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Password</Label>
                            <motion.div 
                              className="relative"
                              animate={isLoginShaking ? { x: [-5, 5, -5, 5, -3, 3, 0], transition: { duration: 0.4 } } : {}}
                            >
                              <Input
                                type={showLoginPw ? "text" : "password"}
                                placeholder="••••••••"
                                className={cn(
                                  "h-10 sm:h-9 w-full border-0 border-b rounded-none bg-transparent px-1 pr-9 font-bold text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 transition-colors shadow-none tracking-[0.2em] text-[16px] xl:text-[20px]",
                                  loginForm.formState.errors.password 
                                    ? "border-rose-500/50 focus-visible:border-rose-500 text-rose-600" 
                                    : "border-[#103783]/10 hover:border-[#103783]/30 focus-visible:border-[#10B981]"
                                )}
                                {...loginForm.register("password", {
                                  onChange: () => {
                                    if (loginForm.formState.errors.password) {
                                      loginForm.clearErrors("password");
                                    }
                                  }
                                })}
                              />
                              <button type="button" onClick={() => setShowLoginPw(!showLoginPw)} className={cn("absolute right-1 top-1/2 -translate-y-1/2 p-1 transition-colors", loginForm.formState.errors.password ? "text-rose-400 hover:text-rose-600" : "text-slate-400 hover:text-[#103783]")} tabIndex={-1}>
                                {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </motion.div>
                            <AnimatePresence>
                              {loginForm.formState.errors.password && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0, y: -5 }} 
                                  animate={{ opacity: 1, height: "auto", y: 0 }} 
                                  exit={{ opacity: 0, height: 0, y: -5 }}
                                  className="text-[10px] text-rose-500 mt-1.5 pl-1 font-bold flex items-center gap-1"
                                >
                                  <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  {loginForm.formState.errors.password.message}
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
                            
                            <button type="button" onClick={() => setView("forgot-password")} className="text-[11px] sm:text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors pl-1">
                              Forgot Password?
                            </button>
                          </div>

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
                        </form>
                      ) : (
                        <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-5 sm:space-y-6">
                          <div className="space-y-1">
                            <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Name</Label>
                            <Input
                              type="text"
                              placeholder="John Doe"
                              className="h-10 sm:h-9 w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 font-medium text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none text-[14px] sm:text-[13px]"
                              {...signupForm.register("fullName")}
                            />
                            {signupForm.formState.errors.fullName && (
                              <p className="text-[10px] text-rose-500 mt-1 pl-1">{signupForm.formState.errors.fullName.message}</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email</Label>
                            <Input
                              type="email"
                              placeholder="you@email.com"
                              className="h-10 sm:h-9 w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 font-medium text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none text-[14px] sm:text-[13px]"
                              {...signupForm.register("email")}
                            />
                            {signupForm.formState.errors.email && (
                              <p className="text-[10px] text-rose-500 mt-1 pl-1">{signupForm.formState.errors.email.message}</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Mobile Number</Label>
                            <Input
                              type="tel"
                              placeholder="9876543210"
                              maxLength={10}
                              className="h-10 sm:h-9 w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 font-medium text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none text-[14px] sm:text-[13px]"
                              {...signupForm.register("mobileNumber")}
                            />
                            {signupForm.formState.errors.mobileNumber && (
                              <p className="text-[10px] text-rose-500 mt-1 pl-1">{signupForm.formState.errors.mobileNumber.message}</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Pass</Label>
                            <div className="relative">
                              <Input
                                type={showSignupPw ? "text" : "password"}
                                placeholder="••••••••"
                                className="h-10 sm:h-9 w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 pr-9 font-bold text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none tracking-[0.2em] text-[16px] xl:text-[20px]"
                                {...signupForm.register("password")}
                              />
                              <button type="button" onClick={() => setShowSignupPw(!showSignupPw)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#103783] transition-colors" tabIndex={-1}>
                                {showSignupPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            {signupForm.formState.errors.password && (
                              <p className="text-[10px] text-rose-500 mt-1 pl-1">{signupForm.formState.errors.password.message}</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Confirm</Label>
                            <div className="relative">
                              <Input
                                type={showConfirmPw ? "text" : "password"}
                                placeholder="••••••••"
                                className="h-10 sm:h-9 w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 pr-9 font-bold text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none tracking-[0.2em] text-[16px] xl:text-[20px]"
                                {...signupForm.register("confirmPassword")}
                              />
                              <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#103783] transition-colors" tabIndex={-1}>
                                {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            {signupForm.formState.errors.confirmPassword && (
                              <p className="text-[10px] text-rose-500 mt-1 pl-1">{signupForm.formState.errors.confirmPassword.message}</p>
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

                          {/* Google Sign-In Divider + Button */}
                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px]">
                              <span className="bg-white/70 backdrop-blur-sm px-4 text-slate-400 font-bold uppercase tracking-widest">or</span>
                            </div>
                          </div>

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
                        </form>
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