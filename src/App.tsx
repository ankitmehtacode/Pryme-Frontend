import { Suspense } from "react";
import { AppProviders } from "@/providers/AppProviders";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { SplashOverlay } from "@/components/SplashOverlay";
import { PageTransitionLoader } from "@/components/PageTransitionLoader";
import { AppRoutes } from "@/routes/AppRoutes";
import WhatsAppBubble from "@/components/WhatsAppBubble";

const App = () => (
  <AppProviders>
    <AppErrorBoundary>
      <SplashOverlay />

      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col w-full relative">
        <Suspense fallback={<PageTransitionLoader />}>
          <AppRoutes />
        </Suspense>
        <WhatsAppBubble />
      </div>
    </AppErrorBoundary>
  </AppProviders>
);

export default App;