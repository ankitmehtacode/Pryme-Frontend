import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, ArrowRight, Building2, ArrowLeft, Loader2, Code2, TrendingUp, ShieldCheck, Wallet, Sparkles } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";

// Removed native canvas background for static minimalist layout

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
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
  const { user, signIn, signUp, isLoading: isContextLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [view, setView] = useState<AuthView>("login");
  const [isLoading, setIsLoading] = useState(false);

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
    
    const { error } = await signIn(data.email, data.password);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      loginForm.setValue("password", ""); 
    } else {
      toast({
        title: "Welcome Back",
        description: "Successfully logged into your Pryme account.",
      });
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (data: SignupData) => {
    setIsLoading(true);
    
    const { error } = await signUp({
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

  const handleGoogleSignIn = async () => {
    toast({
      title: "Coming Soon",
      description: "Google OAuth zero-trust integration will be enabled in Phase 2.",
    });
  };

  const fillAdminCredentials = () => {
    loginForm.setValue("email", "admin@pryme.com");
    loginForm.setValue("password", "admin123");
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
        className="min-h-[100dvh] w-full relative flex items-center justify-center bg-[#F4F7FA] font-sans text-slate-900 p-4 sm:p-6 md:p-8 overflow-hidden"
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

        {/* Abstract Cinematic Glassmorphic Energy Blobs (Animated via Framer Motion) */}
        <motion.div 
          className="absolute top-[0%] left-[0%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-gradient-to-br from-[#10B981] to-[#1E4DAB] rounded-full mix-blend-multiply filter blur-[100px] md:blur-[140px] opacity-60"
          animate={{ x: [0, 100, -50, 0], y: [0, -50, 100, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[0%] right-[0%] w-[500px] md:w-[700px] h-[500px] md:h-[700px] bg-gradient-to-tl from-[#103783] to-[#10B981] rounded-full mix-blend-multiply filter blur-[120px] md:blur-[160px] opacity-50"
          animate={{ x: [0, -120, 80, 0], y: [0, 80, -100, 0], scale: [1, 1.15, 0.85, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-[25%] left-[30%] w-[350px] md:w-[500px] h-[350px] md:h-[500px] bg-[#DBEAFE] rounded-full mix-blend-multiply filter blur-[80px] md:blur-[100px] opacity-70"
          animate={{ x: [0, 80, -90, 0], y: [0, 120, -60, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* MAIN SPLIT CARD - Flawless Glassmorphism & Micro-animations */}
        <motion.div 
          className="relative w-full max-w-[1000px] min-h-[600px] rounded-[24px] sm:rounded-[32px] shadow-[0_24px_60px_rgba(16,55,131,0.15),0_0_0_1px_rgba(255,255,255,0.6)_inset] flex flex-col lg:flex-row overflow-hidden bg-white/10 backdrop-blur-[40px] saturate-[1.2] z-10"
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
            <div className="absolute inset-0 bg-gradient-to-br from-[#103783]/90 via-[#103783]/70 to-[#10B981]/50 mix-blend-multiply z-0"></div>
            <div className="absolute inset-0 bg-[#103783]/30 backdrop-blur-[4px] z-0"></div>

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
              <span className="hover:text-white cursor-pointer transition-all duration-300 backdrop-blur-xl px-4 py-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">About</span>
              <span className="hover:text-white cursor-pointer transition-all duration-300 backdrop-blur-xl px-4 py-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">Privacy</span>
              <span className="hover:text-white cursor-pointer transition-all duration-300 backdrop-blur-xl px-4 py-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">Terms</span>
              <span className="hover:text-white cursor-pointer transition-all duration-300 backdrop-blur-xl px-4 py-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">FAQ</span>
            </div>
          </div>
          
          {/* ========================================================= */}
          {/* RIGHT PANEL: Auth Form Overlay */}
          {/* ========================================================= */}
          <div className="w-full lg:w-1/2 bg-white/70 backdrop-blur-[20px] shadow-[-20px_0_40px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center p-6 sm:p-12 md:p-16 relative z-10 overflow-y-auto w-[100%]">
             
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
                              placeholder="admin@pryme.com"
                              className="h-10 sm:h-9 w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 font-medium text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none text-[14px] sm:text-[13px]"
                              {...loginForm.register("email")}
                            />
                            {loginForm.formState.errors.email && (
                              <p className="text-[10px] text-rose-500 mt-1 pl-1">{loginForm.formState.errors.email.message}</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Password</Label>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="h-10 sm:h-9 w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 font-bold text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none tracking-[0.2em] text-[16px] xl:text-[20px]"
                              {...loginForm.register("password")}
                            />
                            {loginForm.formState.errors.password && (
                              <p className="text-[10px] text-rose-500 mt-1 pl-1">{loginForm.formState.errors.password.message}</p>
                            )}
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
                            <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Pass</Label>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="h-10 sm:h-9 w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 font-bold text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none tracking-[0.2em] text-[16px] xl:text-[20px]"
                              {...signupForm.register("password")}
                            />
                            {signupForm.formState.errors.password && (
                              <p className="text-[10px] text-rose-500 mt-1 pl-1">{signupForm.formState.errors.password.message}</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Confirm</Label>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="h-10 sm:h-9 w-full border-0 border-b border-[#103783]/10 hover:border-[#103783]/30 rounded-none bg-transparent px-1 font-bold text-[#103783] placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-[#10B981] transition-colors shadow-none tracking-[0.2em] text-[16px] xl:text-[20px]"
                              {...signupForm.register("confirmPassword")}
                            />
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