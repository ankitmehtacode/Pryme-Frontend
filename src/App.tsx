import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AnimatePresence } from "framer-motion";

// Providers
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";

// Components & Pages
import { SplashScreen } from "@/components/SplashScreen";
import Index from "./pages/Index";
import Apply from "./pages/Apply";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 🧠 1. NATIVE ERROR BOUNDARY: This completely eliminates silent "Blank Screens"
class GlobalErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any, errorInfo: any}> {
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
        <div className="min-h-screen bg-red-950 text-white p-8 md:p-16 flex flex-col items-start justify-center font-mono selection:bg-red-500">
          <div className="max-w-5xl w-full bg-black/60 p-8 rounded-2xl border border-red-500/30 shadow-2xl">
            <h1 className="text-xl font-medium text-red-500 mb-2">🚨 Application Crashed</h1>
            <p className="text-slate-300 mb-6">Instead of a blank screen, here is the exact error causing the failure:</p>
            <div className="bg-red-950/50 p-4 rounded-xl overflow-x-auto border border-red-900">
              <p className="text-red-300 font-medium text-lg mb-4">{this.state.error?.toString()}</p>
              <pre className="text-red-400 text-xs leading-relaxed">{this.state.errorInfo?.componentStack}</pre>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Native Route Protection for the Java Spring Boot Backend
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("pryme_token");
  const role = localStorage.getItem("pryme_role");
  
  if (!token || (role !== "SUPER_ADMIN" && role !== "ADMIN")) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  // 200 IQ Failsafe: Ensures the splash screen ALWAYS unmounts
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
          <AuthProvider>
            <TooltipProvider>
              
              {/* 🧠 2. App wrapped in Error Boundary */}
              <GlobalErrorBoundary>
                
                {/* 1. Splash Screen Overlay */}
                <AnimatePresence>
                  {isSplashVisible && (
                    <SplashScreen key="splash" onComplete={() => setIsSplashVisible(false)} />
                  )}
                </AnimatePresence>

                {/* 2. Main Application Router */}
                <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                  <Toaster />
                  <Sonner />
                  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/apply" element={<Apply />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route 
                        path="/admin" 
                        element={
                          <AdminProtectedRoute>
                            <AdminDashboard />
                          </AdminProtectedRoute>
                        } 
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </div>
                
              </GlobalErrorBoundary>

            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;