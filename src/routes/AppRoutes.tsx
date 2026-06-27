import { lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AnimatePresence, motion } from "framer-motion";

// All routes are lazy-loaded for optimal code splitting.
// Index and Auth were previously synchronous — moving them to lazy cuts ~60KB
// from the critical-path main bundle (index-*.js).
const Index = lazy(() => import("@/pages/Index"));
const Auth = lazy(() => import("@/pages/Auth"));

// Secondary Routes (Aggressively Lazy-Loaded)
const Apply = lazy(() => import("@/pages/Apply"));
const About = lazy(() => import("@/pages/About"));
const Services = lazy(() => import("@/pages/Services"));
const Contact = lazy(() => import("@/pages/Contact"));
const Blogs = lazy(() => import("@/pages/Blogs"));
const BlogDetail = lazy(() => import("@/pages/BlogDetail"));
const Offers = lazy(() => import("@/pages/Offers"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Tools
const EMICalculatorPage = lazy(
  () => import("@/pages/tools/EMICalculatorPage")
);
const RewardsCalculatorPage = lazy(
  () => import("@/pages/tools/RewardsCalculatorPage")
);
const PrepaymentCalculatorPage = lazy(
  () => import("@/pages/tools/PrepaymentCalculatorPage")
);

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

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} className="w-full h-full min-h-screen">
    {children}
  </motion.div>
);

export const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ============================
            ZONE 1: PUBLIC ACQUISITION LAYER
            ============================ */}
        <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
        <Route path="/apply" element={<PageWrapper><Apply /></PageWrapper>} />
        <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/blogs" element={<PageWrapper><Blogs /></PageWrapper>} />
        <Route path="/blogs/:slug" element={<PageWrapper><BlogDetail /></PageWrapper>} />
        <Route path="/offers" element={<PageWrapper><Offers /></PageWrapper>} />
        <Route path="/emi-calculator" element={<PageWrapper><EMICalculatorPage /></PageWrapper>} />
        <Route path="/prepayment-calculator" element={<PageWrapper><PrepaymentCalculatorPage /></PageWrapper>} />
        <Route path="/rewards-calculator" element={<PageWrapper><RewardsCalculatorPage /></PageWrapper>} />

        {/* ============================
            ZONE 2: STANDARD USER TIER
            ============================ */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
          <Route path="/notifications" element={<PageWrapper><Notifications /></PageWrapper>} />
        </Route>

        {/* ============================
            ZONE 3: ADMIN TIER (RBAC)
            ============================ */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN", "SUPER_ADMIN", "EMPLOYEE"]}
            />
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};
