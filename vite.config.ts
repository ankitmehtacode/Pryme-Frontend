/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
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
        target: 'http://localhost:8090',
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  optimizeDeps: {
    exclude: ["optimize_typography.py", "refactor_theme.cjs"]
  },
  build: {
    // Target broadly supported environments for the Indian market
    // Supports Chrome 80+ while avoiding aggressive ESNext transpilation bugs
    target: ["es2020", "chrome80"],
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
          // Animation library — Framer Motion only (GSAP removed)
          "vendor-animation": ["framer-motion"],
          // Radix UI primitives — shared across many components
          "vendor-radix": ["@radix-ui/react-accordion", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-navigation-menu", "@radix-ui/react-popover", "@radix-ui/react-tabs", "@radix-ui/react-toast", "@radix-ui/react-tooltip", "@radix-ui/react-select", "@radix-ui/react-scroll-area", "@radix-ui/react-slot"],
          // Data layer — cacheable separately
          "vendor-query": ["@tanstack/react-query"],
          // Router — loaded on every page but small
          "vendor-router": ["react-router-dom"],
          // Charts — only needed on dashboard/calculator pages
          "vendor-charts": ["recharts"],
          // Form validation — only needed on apply/auth pages
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"]
        }
      }
    }
  },
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});