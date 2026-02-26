import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, ArrowRight, Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  const [view, setView] = useState<AuthView>("login");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user, isLoading: authLoading } = useAuth();

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

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (data: LoginData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Welcome back!",
      description: "You have successfully logged in.",
    });
    navigate("/dashboard");
  };

  const handleSignup = async (data: SignupData) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, data.fullName);
    setIsLoading(false);

    if (error) {
      let message = error.message;
      if (error.message.includes("already registered")) {
        message = "This email is already registered. Please login instead.";
      }
      toast({
        title: "Signup Failed",
        description: message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Account Created!",
      description: "Welcome to PYRME Consulting. You can now access your dashboard.",
    });
    navigate("/dashboard");
  };

  const handleForgotPassword = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth?view=reset`,
    });
    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password Reset Email Sent",
      description: "Check your email for a link to reset your password.",
    });
    setView("login");
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setIsLoading(false);

    if (error) {
      toast({
        title: "Google Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{view === "login" ? "Login" : view === "signup" ? "Sign Up" : "Reset Password"} - PYRME Consulting</title>
        <meta name="description" content="Login or sign up to access your PYRME Consulting dashboard." />
      </Helmet>

      <div className="min-h-screen flex bg-background">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 hero-gradient items-center justify-center p-12">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl neo-card flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">PYRME</h1>
                <p className="text-sm text-muted-foreground">CONSULTING</p>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Compare Loans. Save Money. Get Funded.
            </h2>
            <p className="text-muted-foreground mb-8">
              Access exclusive loan offers from 15+ partner banks. Compare rates, track applications, and get personalized assistance.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 neo-card-inset p-4 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">1</span>
                </div>
                <span className="text-foreground">Compare offers from multiple banks</span>
              </div>
              <div className="flex items-center gap-3 neo-card-inset p-4 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">2</span>
                </div>
                <span className="text-foreground">Track your application status</span>
              </div>
              <div className="flex items-center gap-3 neo-card-inset p-4 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">3</span>
                </div>
                <span className="text-foreground">Get personalized RM support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
              <div className="w-10 h-10 rounded-xl neo-card flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">PYRME</h1>
                <p className="text-xs text-muted-foreground">CONSULTING</p>
              </div>
            </div>

            <div className="neo-card p-8 rounded-2xl">
              {/* Forgot Password View */}
              {view === "forgot-password" && (
                <>
                  <button 
                    onClick={() => setView("login")}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </button>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Reset Password</h2>
                  <p className="text-muted-foreground mb-8">
                    Enter your email and we'll send you a reset link
                  </p>

                  <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Email</Label>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="neo-input border-0 pl-10"
                          {...forgotPasswordForm.register("email")}
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                      {forgotPasswordForm.formState.errors.email && (
                        <p className="text-xs text-destructive">{forgotPasswordForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full neo-button border-0 bg-primary hover:bg-primary/90" size="lg">
                      {isLoading ? "Sending..." : "Send Reset Link"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </>
              )}

              {/* Login/Signup View */}
              {view !== "forgot-password" && (
                <>
                  <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
                    {view === "login" ? "Welcome Back" : "Create Account"}
                  </h2>
                  <p className="text-muted-foreground text-center mb-6">
                    {view === "login"
                      ? "Enter your credentials to access your account"
                      : "Sign up to start comparing loan offers"}
                  </p>

                  {/* Toggle */}
                  <div className="flex neo-card-inset rounded-xl p-1 mb-6">
                    <button
                      onClick={() => setView("login")}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                        view === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setView("signup")}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                        view === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Sign Up
                    </button>
                  </div>

                  {view === "login" ? (
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Email</Label>
                        <div className="relative">
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            className="neo-input border-0 pl-10"
                            {...loginForm.register("email")}
                          />
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                        {loginForm.formState.errors.email && (
                          <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Password</Label>
                        <div className="relative">
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="neo-input border-0 pl-10"
                            {...loginForm.register("password")}
                          />
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                        )}
                      </div>

                      <Button type="submit" disabled={isLoading} className="w-full border-0 bg-primary text-foreground hover:bg-primary/90" size="lg">
                        {isLoading ? "Signing in..." : "Sign In"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>

                      <button
                        type="button"
                        onClick={() => setView("forgot-password")}
                        className="w-full text-center text-sm text-primary hover:underline"
                      >
                        Forgot Password?
                      </button>

                      <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-card px-4 text-muted-foreground">or</span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full flex items-center justify-center gap-3 bg-background text-foreground border-border hover:bg-muted"
                        size="lg"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Full Name</Label>
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="John Doe"
                            className="neo-input border-0 pl-10"
                            {...signupForm.register("fullName")}
                          />
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                        {signupForm.formState.errors.fullName && (
                          <p className="text-xs text-destructive">{signupForm.formState.errors.fullName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Email</Label>
                        <div className="relative">
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            className="neo-input border-0 pl-10"
                            {...signupForm.register("email")}
                          />
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                        {signupForm.formState.errors.email && (
                          <p className="text-xs text-destructive">{signupForm.formState.errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Password</Label>
                        <div className="relative">
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="neo-input border-0 pl-10"
                            {...signupForm.register("password")}
                          />
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                        {signupForm.formState.errors.password && (
                          <p className="text-xs text-destructive">{signupForm.formState.errors.password.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="neo-input border-0 pl-10"
                            {...signupForm.register("confirmPassword")}
                          />
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                        {signupForm.formState.errors.confirmPassword && (
                          <p className="text-xs text-destructive">{signupForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>

                      <Button type="submit" disabled={isLoading} className="w-full border-0 bg-primary text-foreground hover:bg-primary/90" size="lg">
                        {isLoading ? "Creating account..." : "Create Account"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>

                      <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-card px-4 text-muted-foreground">or</span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full flex items-center justify-center gap-3 bg-background text-foreground border-border hover:bg-muted"
                        size="lg"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                      </Button>
                    </form>
                  )}
                </>
              )}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
