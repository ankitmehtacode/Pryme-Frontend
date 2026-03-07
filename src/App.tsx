import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";

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
  // Application Lifecycle State
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="pryme_theme">
          <AuthProvider>
            <TooltipProvider>
              
              {/* THE FIX: The Splash Screen is now an overlay. 
                The BrowserRouter is NEVER unmounted, which prevents the black screen crash.
              */}
              <AnimatePresence>
                {isSplashVisible && (
                  <SplashScreen key="splash" onComplete={() => setIsSplashVisible(false)} />
                )}
              </AnimatePresence>

              <BrowserRouter>
                <motion.div
                  key="app-content"
                  // App stays hidden and blurred in the background while Splash is active
                  initial={false}
                  animate={{ 
                    opacity: isSplashVisible ? 0 : 1, 
                    scale: isSplashVisible ? 0.98 : 1, 
                    filter: isSplashVisible ? "blur(10px)" : "blur(0px)",
                    pointerEvents: isSplashVisible ? "none" : "auto"
                  }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="min-h-screen bg-background text-foreground transition-colors duration-300"
                >
                  <Toaster />
                  <Sonner />
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
                </motion.div>
              </BrowserRouter>

            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;