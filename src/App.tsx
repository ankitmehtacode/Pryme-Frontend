import { Suspense } from "react";
import { useLocation } from "react-router-dom";
import { AppProviders } from "@/providers/AppProviders";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { SplashOverlay } from "@/components/SplashOverlay";
import { PageTransitionLoader } from "@/components/PageTransitionLoader";
import { AppRoutes } from "@/routes/AppRoutes";
import WhatsAppBubble from "@/components/WhatsAppBubble";

// "Chat with us on WhatsApp" is a prospective-customer support entry point --
// it has no business floating over the internal admin/CRM tooling, so it's
// suppressed on /admin routes rather than rendered globally.
const GlobalWhatsAppBubble = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  return <WhatsAppBubble />;
};

const App = () => (
  <AppProviders>
    <AppErrorBoundary>
      <SplashOverlay />

      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col w-full relative">
        <Suspense fallback={<PageTransitionLoader />}>
          <AppRoutes />
        </Suspense>
        <GlobalWhatsAppBubble />
      </div>
    </AppErrorBoundary>
  </AppProviders>
);

export default App;