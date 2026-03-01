import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 1. IMPORT FIX: We now use the official next-themes provider
import { ThemeProvider } from "next-themes";

// Guard against missing Supabase environment variables
// This prevents the "White Screen of Death" by showing a clear error if keys are missing
const requiredEnvVars = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
] as const;

const missingVars = requiredEnvVars.filter(
  (key) => !import.meta.env[key]
);

if (missingVars.length > 0) {
  const root = document.getElementById("root")!;
  root.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;padding:2rem;text-align:center;background-color:#f8fafc;">
      <div style="background:white;padding:2rem;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h1 style="font-size:1.5rem;font-weight:700;margin-bottom:1rem;color:#ef4444;">Configuration Error</h1>
        <p style="color:#64748b;max-width:420px;line-height:1.6;">
          Missing required environment variables: <br/>
          <code style="background:#f1f5f9;padding:0.2rem 0.4rem;border-radius:4px;color:#0f172a;font-size:0.875rem;margin-top:0.5rem;display:inline-block;">${missingVars.join(", ")}</code>
        </p>
        <p style="margin-top:1rem;font-size:0.875rem;color:#94a3b8;">Please check your .env file.</p>
      </div>
    </div>
  `;
} else {
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      {/* 2. PROVIDER FIX: Using attribute="class" to connect with Tailwind's dark mode */}
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}