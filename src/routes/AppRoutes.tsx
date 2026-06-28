import { lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ViewportLayout } from "@/layouts/ViewportLayout";
import { AnimatePresence, motion } from "framer-motion";

// All routes are lazy-loaded for optimal code splitting.
const Index = lazy(() => import("@/pages/Index"));
const Auth = lazy(() => import("@/pages/Auth"));
const Apply = lazy(() => import("@/pages/Apply"));
const About = lazy(() => import("@/pages/About"));
const Services = lazy(() => import("@/pages/Services"));
const Contact = lazy(() => import("@/pages/Contact"));
const Blogs = lazy(() => import("@/pages/Blogs"));
const BlogDetail = lazy(() => import("@/pages/BlogDetail"));
const Offers = lazy(() => import("@/pages/Offers"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Tools
const EMICalculatorPage = lazy(() => import("@/pages/tools/EMICalculatorPage"));
const RewardsCalculatorPage = lazy(() => import("@/pages/tools/RewardsCalculatorPage"));
const PrepaymentCalculatorPage = lazy(() => import("@/pages/tools/PrepaymentCalculatorPage"));

// Authenticated Client Portal
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Profile = lazy(() => import("@/pages/Profile"));
const Notifications = lazy(() => import("@/pages/Notifications"));

// Admin
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));

const pageVariants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
};

/**
 * Wraps page components with page transitions and explicitly manages their viewport mode.
 * The viewport mode is attached directly to the route definition, ensuring it stays
 * correct even if routes are moved across authentication boundaries.
 * 
 * Default is "scaled" (for marketing pages).
 */
const PageWrapper = ({ children, viewport = "scaled" }: { children: React.ReactNode, viewport?: "scaled" | "native" }) => (
  <ViewportLayout mode={viewport}>
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} className="w-full h-full min-h-screen">
      {children}
    </motion.div>
  </ViewportLayout>
);

export const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ════════════════════════════════════════════════════════════
            MARKETING LAYER (Scaled by default)
            ════════════════════════════════════════════════════════════ */}
        <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/blogs" element={<PageWrapper><Blogs /></PageWrapper>} />
        <Route path="/blogs/:slug" element={<PageWrapper><BlogDetail /></PageWrapper>} />
        <Route path="/offers" element={<PageWrapper><Offers /></PageWrapper>} />
        <Route path="/emi-calculator" element={<PageWrapper><EMICalculatorPage /></PageWrapper>} />
        <Route path="/prepayment-calculator" element={<PageWrapper><PrepaymentCalculatorPage /></PageWrapper>} />
        <Route path="/rewards-calculator" element={<PageWrapper><RewardsCalculatorPage /></PageWrapper>} />

        {/* ════════════════════════════════════════════════════════════
            APPLICATION LAYER (Native 1:1 Coordinates)
            ════════════════════════════════════════════════════════════ */}
        <Route path="/apply" element={<PageWrapper viewport="native"><Apply /></PageWrapper>} />
        <Route path="/auth" element={<PageWrapper viewport="native"><Auth /></PageWrapper>} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<PageWrapper viewport="native"><Dashboard /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper viewport="native"><Profile /></PageWrapper>} />
          <Route path="/notifications" element={<PageWrapper viewport="native"><Notifications /></PageWrapper>} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN", "SUPER_ADMIN", "EMPLOYEE"]}
            />
          }
        >
          <Route path="/admin" element={<PageWrapper viewport="native"><AdminDashboard /></PageWrapper>} />
        </Route>

        <Route path="*" element={<PageWrapper viewport="native"><NotFound /></PageWrapper>} />

      </Routes>
    </AnimatePresence>
  );
};
