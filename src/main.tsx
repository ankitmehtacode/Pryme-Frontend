import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 🧠 SILICON-GRADE ARCHITECTURE
// All legacy Supabase dependencies and environment blockers have been fully eradicated. 
// The application now boots cleanly and authenticates directly with the Java Code X backend.
// Theme is locked to light mode via class="light" on <html> — zero JS runtime cost.

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
    <App />
  </React.StrictMode>
);
