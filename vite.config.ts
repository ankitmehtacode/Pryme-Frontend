import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 8081,
    proxy: {
      // 🧠 ZERO-TRUST PROXY: All /api requests are forwarded to Spring Boot.
      // This is MISSION-CRITICAL for HttpOnly cookie flow:
      //   Browser → localhost:8081/api/v1/... → Vite proxy → localhost:8080/api/v1/...
      // The browser sees same-origin, so the PRYME_SID cookie attaches on every request.
      // changeOrigin rewrites the Host header to match the target.
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["optimize_typography.py", "refactor_theme.cjs"],
  },
  build: {
    // Target modern browsers — no legacy polyfill overhead
    target: "esnext",
    // Source maps off in production — they double the data served from the CDN
    // Enable only when debugging a production issue
    sourcemap: false,
    // Warn on chunks above 200KB — tighter than default to catch regressions
    chunkSizeWarningLimit: 200,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — loaded on every page
          "vendor-react": ["react", "react-dom"],
          
          // Animation libraries — heavy but needed for interactions
          "vendor-animation": ["framer-motion", "gsap", "@gsap/react"],
          
          // Radix UI primitives — shared across many components
          "vendor-radix": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-navigation-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-select",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-slot",
          ],
          
          // Data layer — cacheable separately
          "vendor-query": ["@tanstack/react-query"],
          
          // Router — loaded on every page but small
          "vendor-router": ["react-router-dom"],
          
          // Smooth scroll — conditionally loaded
          "vendor-scroll": ["@studio-freight/lenis"],
          
          // Charts — only needed on dashboard/calculator pages
          "vendor-charts": ["recharts"],
          
          // Form validation — only needed on apply/auth pages
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
        },
      },
    },
  },
});