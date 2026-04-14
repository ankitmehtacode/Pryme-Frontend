import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { SplashScreen } from "@/components/SplashScreen";

const SPLASH_FAILSAFE_MS = 3000;
const SPLASH_SESSION_KEY = "pryme_splash_shown";

export const SplashOverlay = () => {
  // Skip splash entirely on repeat visits within the same browser session
  const [isSplashVisible, setIsSplashVisible] = useState(() => {
    try {
      return !sessionStorage.getItem(SPLASH_SESSION_KEY);
    } catch {
      return true; // fallback: show splash if sessionStorage is unavailable
    }
  });

  useEffect(() => {
    if (!isSplashVisible) return;

    const failsafeTimer = setTimeout(() => {
      setIsSplashVisible(false);
    }, SPLASH_FAILSAFE_MS);

    return () => clearTimeout(failsafeTimer);
  }, [isSplashVisible]);

  const handleComplete = () => {
    setIsSplashVisible(false);
    try {
      sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
    } catch {
      // Ignore — private browsing mode may block sessionStorage
    }
  };

  return (
    <AnimatePresence>
      {isSplashVisible && (
        <SplashScreen
          key="splash"
          onComplete={handleComplete}
        />
      )}
    </AnimatePresence>
  );
};
