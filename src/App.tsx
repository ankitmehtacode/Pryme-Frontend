import React, { useState, useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AnimatePresence } from "framer-motion";

// Providers & Core
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { SplashScreen } from "@/components/SplashScreen";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// 🧠 ARCHITECTURE UPGRADE: Dynamic Code Splitting (Lazy Loading)
// Isolates page bundles so the landing page loads instantly without downloading Admin or Dashboard code.
const Index = lazy(() => import("./pages/Index"));
const Apply = lazy(() => import("./pages/Apply"));
const Auth = lazy(() => import("./pages/Auth"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Contact = lazy(() => import("./pages/Contact"));
const Blogs = lazy(() => import("./pages/Blogs"));
const Offers = lazy(() => import("./pages/Offers"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Tools
const EMICalculatorPage = lazy(() => import("./pages/tools/EMICalculatorPage"));
const RewardsCalculatorPage = lazy(() => import("./pages/tools/RewardsCalculatorPage"));

// Authenticated Client Portal
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DocumentCheck = lazy(() => import("./pages/DocumentCheck"));
const Profile = lazy(() => import("./pages/Profile"));
const Notifications = lazy(() => import("./pages/Notifications"));

// Admin Core
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const queryClient = new QueryClient();

// 🧠 Bank-Grade Fallback Loader for asynchronous chunk fetching
const PageTransitionLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-[3px] border-white/5" />
      <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#2aac64] animate-spin" />
    </div>
  </div>
);

// 🧠 NATIVE ERROR BOUNDARY (Preserved)
class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any, errorInfo: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Fatal UI Crash:", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1a0505] text-white p-8 md:p-16 flex flex-col items-start justify-center font-mono selection:bg-red-500">
          <div className="max-w-5xl w-full bg-black/80 p-8 rounded-2xl border border-red-500/30 shadow-2xl backdrop-blur-md">
            <h1 className="text-2xl font-semibold text-red-500 mb-2">🚨 Application State Crash</h1>
            <p className="text-slate-400 mb-6">A critical exception bypassed standard handling. Stack trace attached:</p>
            <div className="bg-red-950/20 p-6 rounded-xl overflow-x-auto border border-red-900/50">
              <p className="text-red-400 font-medium text-lg mb-4">{this.state.error?.toString()}</p>
              <pre className="text-red-500/70 text-xs leading-relaxed overflow-x-auto">{this.state.errorInfo?.componentStack}</pre>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  // Failsafe: Ensures the splash screen ALWAYS unmounts
  useEffect(() => {
    const failsafeTimer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 3000);
    return () => clearTimeout(failsafeTimer);
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="pryme_theme">
          
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
              <TooltipProvider>
                <GlobalErrorBoundary>

                  {/* Splash Screen Overlay */}
                  <AnimatePresence>
                    {isSplashVisible && (
                      <SplashScreen key="splash" onComplete={() => setIsSplashVisible(false)} />
                    )}
                  </AnimatePresence>

                  <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                    <Toaster />
                    <Sonner />
                    
                    {/* 🧠 Suspense Boundary intercepts UI while Webpack dynamically fetches the route chunk */}
                    <Suspense fallback={<PageTransitionLoader />}>
                      <Routes>
                        {/* ==============================
                            ZONE 1: PUBLIC ACQUISITION LAYER
                            ============================== */}
                        <Route path="/" element={<Index />} />
                        <Route path="/apply" element={<Apply />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/blogs" element={<Blogs />} />
                        <Route path="/offers" element={<Offers />} />
                        <Route path="/emi-calculator" element={<EMICalculatorPage />} />
                        <Route path="/rewards-calculator" element={<RewardsCalculatorPage />} />

                        {/* ==============================
                            ZONE 2: STANDARD USER TIER (Pipeline)
                            ============================== */}
                        <Route element={<ProtectedRoute />}>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/document-check" element={<DocumentCheck />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/notifications" element={<Notifications />} />
                        </Route>

                        {/* ==============================
                            ZONE 3: SILICON-GRADE ADMIN TIER
                            Strict RBAC Enforcement
                            ============================== */}
                        <Route element={<ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN", "EMPLOYEE"]} />}>
                          <Route path="/admin" element={<AdminDashboard />} />
                        </Route>

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </div>

                </GlobalErrorBoundary>
              </TooltipProvider>
            </AuthProvider>
          </BrowserRouter>

        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;