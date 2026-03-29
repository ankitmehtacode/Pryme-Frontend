import { Suspense } from "react";
import { AppProviders } from "@/providers/AppProviders";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SplashOverlay } from "@/components/SplashOverlay";
import { PageTransitionLoader } from "@/components/PageTransitionLoader";
import { AppRoutes } from "@/routes/AppRoutes";

const App = () => (
  <AppProviders>
    <ErrorBoundary>
      <SplashOverlay />

      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden flex flex-col w-full relative">
        <Suspense fallback={<PageTransitionLoader />}>
          <AppRoutes />
        </Suspense>
      </div>
    </ErrorBoundary>
  </AppProviders>
);

export default App;