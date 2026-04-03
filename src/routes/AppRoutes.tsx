import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Core Routes (Synchronous for FCP)
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";

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

export const AppRoutes = () => (
  <Routes>
    {/* ============================
        ZONE 1: PUBLIC ACQUISITION LAYER
        ============================ */}
    <Route path="/" element={<Index />} />
    <Route path="/apply" element={<Apply />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/about" element={<About />} />
    <Route path="/services" element={<Services />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/blogs" element={<Blogs />} />
    <Route path="/blogs/:slug" element={<BlogDetail />} />
    <Route path="/offers" element={<Offers />} />
    <Route path="/emi-calculator" element={<EMICalculatorPage />} />
    <Route path="/prepayment-calculator" element={<PrepaymentCalculatorPage />} />
    <Route path="/rewards-calculator" element={<RewardsCalculatorPage />} />

    {/* ============================
        ZONE 2: STANDARD USER TIER
        ============================ */}
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/notifications" element={<Notifications />} />
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

    <Route path="*" element={<NotFound />} />
  </Routes>
);
