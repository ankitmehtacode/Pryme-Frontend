import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 1. IMPORT FIX: We now use the official next-themes provider
import { ThemeProvider } from "next-themes";

// 🧠 SILICON-GRADE ARCHITECTURE
// All legacy Supabase dependencies and environment blockers have been fully eradicated. 
// The application now boots cleanly and authenticates directly with the Java Code X backend.

// 🛡️ Global ChunkLoadError Interceptor for zero-downtime SPA deployments
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('Failed to fetch dynamically imported module')) {
    console.warn('Stale build detected. Automatically reloading clear cache...');
    window.location.reload(); 
  }
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Critical Fault: Failed to find the root element to mount the React application.");
}

createRoot(rootElement).render(
  <React.StrictMode>
    {/* Theme locked to light mode only */}
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
