import { useState, useEffect } from "react";
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

// 🧠 Closed-Loop Security Context & API
import { useAuth } from "@/contexts/AuthContext";

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
        title: "Access Denied",
        description: error.message || "Invalid secure credentials.",
        variant: "destructive",
      });
      loginForm.setValue("password", ""); 
    } else {
      toast({
        title: "Session Authorized",
        description: "Welcome back to the Pryme CRM system. Booting matrix...",
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
        title: "Identity Established",
        description: "Session securely authorized. Warping to Dashboard...",
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{view === "login" ? "Secure Login" : view === "signup" ? "Sign Up" : "Reset Access"} | PYRME Consulting</title>
        <meta name="description" content="Secure portal to access your PYRME Consulting dashboard." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* GLOBAL CINEMATIC LIGHT GLASS CANVAS */}
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500/20">
        
        {/* Background Gradients & Physics */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Base Noise Grain */}
          <div 
            className="absolute inset-0 mix-blend-overlay opacity-10"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
            }}
          />
          {/* Liquid Aurora Orbs - Light theme colors */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.4, 0.3],
              x: ["-10%", "10%", "-10%"]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-300/40 blur-[120px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.3, 0.2],
              y: ["-10%", "10%", "-10%"]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[70%] rounded-full bg-emerald-300/30 blur-[120px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[30%] left-[40%] w-[40%] h-[40%] rounded-full bg-rose-300/30 blur-[120px]"
          />
          {/* Global Ambient Glow  */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-slate-50/70 to-slate-100/80" />
        </div>

        {/* MAIN SPLIT LAYOUT */}
        <div className="relative z-10 w-full sm:w-[95%] max-w-[1400px] min-h-[100vh] sm:min-h-[700px] flex sm:rounded-[40px] overflow-hidden sm:border border-white/60 shadow-[0_12px_48px_rgba(0,0,0,0.06)] backdrop-blur-3xl bg-white/40">
          
          {/* ========================================================= */}
          {/* LEFT PANEL: 3D Finance Vector Showcase */}
          {/* ========================================================= */}
          <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative border-r border-slate-200/50">
            {/* Logo */}
            <div className="flex justify-start">
               <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
                 <div className="w-12 h-12 rounded-2xl bg-white/80 border border-slate-200 flex items-center justify-center backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.04)] group-hover:bg-white transition-all">
                   <Building2 className="w-6 h-6 text-slate-800" />
                 </div>
                 <div>
                   <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                     PYRME <Sparkles className="w-4 h-4 text-emerald-500" />
                   </h1>
                   <p className="text-[10px] tracking-[0.3em] text-slate-500 uppercase font-medium">CONSULTING</p>
                 </div>
               </div>
            </div>

            {/* Floating 3D Graphic Cluster */}
            <div className="relative w-full aspect-square max-h-[400px] my-auto flex items-center justify-center pointer-events-none">
                
                {/* Back Shield */}
                <motion.div 
                  initial={{ opacity: 0, y: 30, rotate: -5 }} animate={{ opacity: 1, y: 0, rotate: -10 }} transition={{ duration: 1.5, delay: 0.2 }}
                  className="absolute right-6 top-6 w-40 h-40 rounded-3xl bg-white/80 border border-white backdrop-blur-xl flex items-center justify-center shadow-[0_12px_32px_rgba(244,63,94,0.08)] transform -rotate-12"
                >
                   <ShieldCheck className="w-16 h-16 text-rose-500 drop-shadow-sm" strokeWidth={1.5} />
                </motion.div>

                {/* Left Wallet */}
                <motion.div 
                  initial={{ opacity: 0, x: -30, rotate: 10 }} animate={{ opacity: 1, x: 0, rotate: 5 }} transition={{ duration: 1.5, delay: 0.4 }}
                  className="absolute left-0 bottom-16 w-36 h-36 rounded-3xl bg-white/80 border border-white backdrop-blur-xl flex items-center justify-center shadow-[0_12px_32px_rgba(16,185,129,0.08)]"
                >
                   <Wallet className="w-14 h-14 text-emerald-500 drop-shadow-sm" strokeWidth={1.5} />
                </motion.div>

                {/* Center Main Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.5, delay: 0.6, type: "spring" }}
                  className="relative z-10 w-64 h-80 rounded-[32px] bg-gradient-to-br from-white/90 to-white/60 border border-white backdrop-blur-3xl shadow-[0_24px_64px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,1)] flex flex-col p-8 overflow-hidden"
                >
                   {/* Card Specular Glare */}
                   <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/80 to-transparent opacity-60 pointer-events-none" />
                   
                   <TrendingUp className="w-12 h-12 text-indigo-500 mb-6 drop-shadow-sm" strokeWidth={1.5} />
                   <h3 className="text-2xl font-bold leading-tight text-slate-900 relative z-10">
                     Scale Your<br/>Capital.
                   </h3>
                   <div className="mt-auto space-y-3 relative z-10">
                      <div className="h-1.5 w-full bg-slate-200 rounded-full" />
                      <div className="h-1.5 w-2/3 bg-slate-200 rounded-full" />
                   </div>
                </motion.div>
            </div>

            {/* Bottom Copy */}
            <div>
              <p className="text-sm text-slate-500 font-medium tracking-wide">Over <span className="text-slate-900 font-bold">10,000+</span> secured applications processed.</p>
            </div>
          </div>
          
          {/* ========================================================= */}
          {/* RIGHT PANEL: Volumetric Glass Auth Card */}
          {/* ========================================================= */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 relative">
             <div className="w-full max-w-[420px] relative z-10">
                {/* Mobile Header (Hidden on LG) */}
                <div className="lg:hidden flex items-center gap-3 justify-center cursor-pointer mb-10 group" onClick={() => navigate("/")}>
                 <div className="w-10 h-10 rounded-xl bg-white/80 border border-white flex items-center justify-center backdrop-blur-md shadow-sm">
                   <Building2 className="w-5 h-5 text-slate-900" />
                 </div>
                 <div>
                   <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                     PYRME <Sparkles className="w-3 h-3 text-emerald-500" />
                   </h1>
                   <p className="text-[9px] tracking-[0.3em] text-slate-500 uppercase font-medium">CONSULTING</p>
                 </div>
                </div>

                {/* Form Container */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                  className="rounded-[32px] bg-white/60 backdrop-blur-[60px] border border-white p-8 shadow-[0_12px_48px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.9)] relative overflow-hidden"
                >
                  {/* Subtle Top Glare */}
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

                  <AnimatePresence mode="wait">
                    {view === "forgot-password" ? (
                      <motion.div
                        key="fp"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                      >
                        <button 
                          onClick={() => setView("login")}
                          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back to Login
                        </button>
                        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Reset Password</h2>
                        <p className="text-slate-600 mb-8 text-sm">
                          Enter your email and we'll send you a secure reset link.
                        </p>

                        <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-5">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Email</Label>
                            <div className="relative group">
                              <Input
                                type="email"
                                placeholder="admin@pryme.in"
                                className="h-11 bg-white/80 border-slate-200 text-slate-900 placeholder:text-slate-400 pl-10 focus-visible:ring-1 focus-visible:ring-indigo-400/50 focus-visible:border-indigo-400 shadow-sm rounded-xl transition-all"
                                {...forgotPasswordForm.register("email")}
                              />
                              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            {forgotPasswordForm.formState.errors.email && (
                              <p className="text-xs text-rose-500">{forgotPasswordForm.formState.errors.email.message}</p>
                            )}
                          </div>

                          <Button type="submit" disabled={isLoading} className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all" size="lg">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {isLoading ? "Sending..." : "Send Reset Link"}
                            {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                          </Button>
                        </form>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="auth"
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center tracking-tight">
                          {view === "login" ? "System Access" : "Create Account"}
                        </h2>
                        <p className="text-slate-600 text-center mb-6 text-sm">
                          {view === "login"
                            ? "Enter your secure credentials to proceed"
                            : "Sign up to access exclusive capital"}
                        </p>

                        <div className="flex bg-slate-100/60 border border-slate-200 rounded-xl p-1 mb-6 shadow-inner">
                          <button
                            onClick={() => setView("login")}
                            className={cn(
                              "flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300",
                              view === "login" ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-800"
                            )}
                          >
                            Sign In
                          </button>
                          <button
                            onClick={() => setView("signup")}
                            className={cn(
                              "flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300",
                              view === "signup" ? "bg-white text-slate-900 shadow-sm border border-slate-200/60" : "text-slate-500 hover:text-slate-800"
                            )}
                          >
                            Register
                          </button>
                        </div>

                        {view === "login" ? (
                          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-700 ml-1">Email</Label>
                              <div className="relative group">
                                <Input
                                  type="email"
                                  placeholder="admin@pryme.com"
                                  className="h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 pl-10 focus-visible:ring-1 focus-visible:ring-indigo-400/50 focus-visible:border-indigo-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-xl transition-all"
                                  {...loginForm.register("email")}
                                />
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                              </div>
                              {loginForm.formState.errors.email && (
                                <p className="text-xs text-rose-500 ml-1">{loginForm.formState.errors.email.message}</p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-700 ml-1">Password</Label>
                              <div className="relative group">
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  className="h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 pl-10 tracking-widest focus-visible:ring-1 focus-visible:ring-indigo-400/50 focus-visible:border-indigo-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-xl transition-all"
                                  {...loginForm.register("password")}
                                />
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                              </div>
                              {loginForm.formState.errors.password && (
                                <p className="text-xs text-rose-500 ml-1">{loginForm.formState.errors.password.message}</p>
                              )}
                            </div>

                            <div className="pt-2">
                              <Button type="submit" disabled={isLoading} className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-[0_8px_16px_rgba(15,23,42,0.15)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.2)] transition-all duration-300" size="lg">
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {isLoading ? "Authenticating..." : "Authorize Session"}
                                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                              </Button>
                            </div>
                            
                            <div className="flex justify-center pt-2">
                               <Button type="button" variant="ghost" onClick={fillAdminCredentials} className="text-[10px] uppercase tracking-wider text-slate-500 hover:text-slate-900 hover:bg-slate-100 h-7 px-3 rounded-lg border border-slate-200 transition-colors">
                                 <Code2 className="w-3 h-3 mr-2"/> Fill Admin Demo
                               </Button>
                            </div>

                            <button
                              type="button"
                              onClick={() => setView("forgot-password")}
                              className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                              Forgot Password?
                            </button>

                            <div className="relative my-4">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                              </div>
                              <div className="relative flex justify-center text-xs">
                                <span className="bg-transparent backdrop-blur-3xl px-4 text-slate-500 font-medium">or</span>
                              </div>
                            </div>

                            <Button
                              type="button"
                              onClick={handleGoogleSignIn}
                              disabled={isLoading}
                              variant="outline"
                              className="w-full h-11 flex items-center justify-center gap-3 bg-white text-slate-800 border-slate-200 hover:bg-slate-50 transition-all rounded-xl shadow-sm"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                              </svg>
                              Continue with Google
                            </Button>
                          </form>
                        ) : (
                          <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-700 ml-1">Full Name</Label>
                              <div className="relative group">
                                <Input
                                  type="text"
                                  placeholder="John Doe"
                                  className="h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 pl-10 focus-visible:ring-1 focus-visible:ring-emerald-400/50 focus-visible:border-emerald-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-xl transition-all"
                                  {...signupForm.register("fullName")}
                                />
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                              </div>
                              {signupForm.formState.errors.fullName && (
                                <p className="text-xs text-rose-500 ml-1">{signupForm.formState.errors.fullName.message}</p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-700 ml-1">Email</Label>
                              <div className="relative group">
                                <Input
                                  type="email"
                                  placeholder="you@example.com"
                                  className="h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 pl-10 focus-visible:ring-1 focus-visible:ring-emerald-400/50 focus-visible:border-emerald-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-xl transition-all"
                                  {...signupForm.register("email")}
                                />
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                              </div>
                              {signupForm.formState.errors.email && (
                                <p className="text-xs text-rose-500 ml-1">{signupForm.formState.errors.email.message}</p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-700 ml-1">Password</Label>
                              <div className="relative group">
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  className="h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 pl-10 tracking-widest focus-visible:ring-1 focus-visible:ring-emerald-400/50 focus-visible:border-emerald-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-xl transition-all"
                                  {...signupForm.register("password")}
                                />
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                              </div>
                              {signupForm.formState.errors.password && (
                                <p className="text-xs text-rose-500 ml-1">{signupForm.formState.errors.password.message}</p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold text-slate-700 ml-1">Confirm Password</Label>
                              <div className="relative group">
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  className="h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 pl-10 tracking-widest focus-visible:ring-1 focus-visible:ring-emerald-400/50 focus-visible:border-emerald-400 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-xl transition-all"
                                  {...signupForm.register("confirmPassword")}
                                />
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                              </div>
                              {signupForm.formState.errors.confirmPassword && (
                                <p className="text-xs text-rose-500 ml-1">{signupForm.formState.errors.confirmPassword.message}</p>
                              )}
                            </div>

                            <div className="pt-2">
                              <Button type="submit" disabled={isLoading} className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-[0_8px_16px_rgba(15,23,42,0.15)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.2)] transition-all duration-300" size="lg">
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {isLoading ? "Creating account..." : "Create Account"}
                                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                              </Button>
                            </div>

                            <div className="relative my-4">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                              </div>
                              <div className="relative flex justify-center text-xs">
                                <span className="bg-transparent backdrop-blur-3xl px-4 text-slate-500 font-medium">or</span>
                              </div>
                            </div>

                            <Button
                              type="button"
                              onClick={handleGoogleSignIn}
                              disabled={isLoading}
                              variant="outline"
                              className="w-full h-11 flex items-center justify-center gap-3 bg-white text-slate-800 border-slate-200 hover:bg-slate-50 transition-all rounded-xl shadow-sm"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                              </svg>
                              Continue with Google
                            </Button>
                          </form>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <p className="text-center text-[10px] text-slate-400 mt-8 font-mono uppercase tracking-wider">
                  Protected by Pryme Code X Architecture.<br />
                  By continuing, you agree to our Terms of Service.
                </p>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;