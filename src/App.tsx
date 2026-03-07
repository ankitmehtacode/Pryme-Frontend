import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AnimatePresence } from "framer-motion";

// Providers
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider"; // 🧠 For Dark/Light Mode

// Components & Pages
import { SplashScreen } from "@/components/SplashScreen"; // 🧠 The Cinematic Entry
import Index from "./pages/Index";
import Apply from "./pages/Apply";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 🧠 160 IQ Move: Native Route Protection for the Java Spring Boot Backend
// This intercepts unauthenticated users BEFORE they even hit the dashboard component.
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("pryme_token");
  const role = localStorage.getItem("pryme_role");
  
  // If there is no token, or they are not an Admin, instantly bounce them to login
  if (!token || (role !== "SUPER_ADMIN" && role !== "ADMIN")) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  // 🧠 Application Lifecycle State for the Premium Loading Experience
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  // 🧠 200 IQ Failsafe: Ensures the splash screen ALWAYS unmounts, preventing "black screens"
  // If Framer Motion's onAnimationComplete fails, this forcefully reveals the app after 3 seconds.
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
          {/* AuthProvider kept purely so old Supabase components don't crash during transition */}
          <AuthProvider>
            <TooltipProvider>
              
              {/* 🧠 1. The Splash Screen is now an independent floating overlay. */}
              {/* It sits on top of the app using z-index and gracefully fades away. */}
              <AnimatePresence>
                {isSplashVisible && (
                  <SplashScreen key="splash" onComplete={() => setIsSplashVisible(false)} />
                )}
              </AnimatePresence>

              {/* 🧠 2. The App routes load instantly in the background. */}
              {/* No more GPU-crashing blurs. No more blocked routing. */}
              <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/apply" element={<Apply />} />
                    <Route path="/auth" element={<Auth />} />
                    
                    {/* Legacy Application Dashboard */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* 🛡️ Secure Admin Route (Wired to Java Backend) */}
                    <Route 
                      path="/admin" 
                      element={
                        <AdminProtectedRoute>
                          <AdminDashboard />
                        </AdminProtectedRoute>
                      } 
                    />
                    
                    {/* 404 Catch-All */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </div>

            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;