import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 8081,
    proxy: {
      // 🧠 CLOSED-LOOP: Target port MUST match server.port in application.yml (8082)
      // If running via Docker, Docker maps 8080→8082 internally.
      // If running via `mvn spring-boot:run`, it listens on 8082 directly.
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
    // Warn on chunks above 250KB — keeps us honest
    chunkSizeWarningLimit: 250,
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