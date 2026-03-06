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

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="pryme_theme">
          {/* AuthProvider kept purely so old Supabase components don't crash during transition */}
          <AuthProvider>
            <TooltipProvider>
              
              {/* 🧠 Orchestrating the Cinematic Entry Sequence */}
              <AnimatePresence mode="wait">
                {isSplashVisible ? (
                  <SplashScreen key="splash" onComplete={() => setIsSplashVisible(false)} />
                ) : (
                  <motion.div
                    key="app"
                    initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="min-h-screen bg-background text-foreground transition-colors duration-300"
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>

            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;