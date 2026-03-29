import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { SplashScreen } from "@/components/SplashScreen";

const SPLASH_FAILSAFE_MS = 3000;

export const SplashOverlay = () => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  // Failsafe: Ensures the splash screen ALWAYS unmounts
  useEffect(() => {
    const failsafeTimer = setTimeout(() => {
      setIsSplashVisible(false);
    }, SPLASH_FAILSAFE_MS);
    return () => clearTimeout(failsafeTimer);
  }, []);

  return (
    <AnimatePresence>
      {isSplashVisible && (
        <SplashScreen
          key="splash"
          onComplete={() => setIsSplashVisible(false)}
        />
      )}
    </AnimatePresence>
  );
};
