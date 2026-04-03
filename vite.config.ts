import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 8081,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    }, // <-- Fixed: Added missing closing brace for proxy
  }, // <-- Fixed: Added missing closing brace for server

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
    rollupOptions: {
      // Reverted manualChunks due to Rollup build errors
    },
  },
});