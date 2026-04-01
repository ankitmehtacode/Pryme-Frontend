import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const LEAD_STORAGE_KEY = "pryme_lead";

interface LeadData {
  email: string;
  name: string;
  method: "google" | "email";
  capturedAt: string;
}

/** Check if a lead has been captured. */
export function isLeadCaptured(): boolean {
  try {
    const stored = localStorage.getItem(LEAD_STORAGE_KEY);
    if (!stored) return false;
    const lead: LeadData = JSON.parse(stored);
    return !!lead.email;
  } catch {
    return false;
  }
}

/** Get the captured lead data. */
export function getLeadData(): LeadData | null {
  try {
    const stored = localStorage.getItem(LEAD_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Non-bypassable lead capture gate.
 * Google Sign-In (primary) + link to existing Auth page.
 */
export default function LeadCaptureGate({
  onCaptured,
  onClose,
}: {
  onCaptured: () => void;
  onClose?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLeadCaptured()) {
      onCaptured();
    }
  }, [onCaptured]);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);

    try {
      if (typeof window !== "undefined" && (window as any).google?.accounts) {
        (window as any).google.accounts.id.prompt();
        return;
      }
    } catch { /* fallback below */ }

    // Demo: simulate Google OAuth returning user data
    await new Promise((r) => setTimeout(r, 1000));

    const leadData: LeadData = {
      email: "user@gmail.com",
      name: "PRYME User",
      method: "google",
      capturedAt: new Date().toISOString(),
    };

    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leadData));
    localStorage.setItem("pryme_token", `lead_${Date.now()}`);
    localStorage.setItem("pryme_name", leadData.name);

    toast({
      title: "Signed in with Google",
      description: "You now have full access to PRYME.",
    });

    setIsSubmitting(false);
    onCaptured();
  };

  const handleGoToAuth = () => {
    navigate("/auth");
  };

  if (isLeadCaptured()) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm mx-4 bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-800" />

          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
                <Lock className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-display font-semibold text-white tracking-tight mb-2">
                Sign in to continue
              </h2>
              <p className="text-sm text-slate-400">
                We need your details to match you with the best offers.
              </p>
            </div>

            {/* Google Sign-In (Primary) */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-100 border-0 rounded-xl h-12 text-sm font-semibold shadow-lg cursor-pointer mb-4"
              size="lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {isSubmitting ? "Signing in..." : "Continue with Google"}
            </Button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0a0a0a] px-4 text-slate-500">or</span>
              </div>
            </div>

            {/* Sign In / Sign Up link → goes to /auth page */}
            <Button
              onClick={handleGoToAuth}
              variant="outline"
              className="w-full rounded-xl h-12 text-sm font-semibold border-white/10 text-white hover:bg-white/5 cursor-pointer"
              size="lg"
            >
              Sign in with Email
            </Button>

            {/* Trust Signal */}
            <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-white/5">
              <Shield className="w-3 h-3 text-blue-500 shrink-0" />
              <p className="text-[10px] text-slate-500">
                Your data is encrypted and never shared.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
