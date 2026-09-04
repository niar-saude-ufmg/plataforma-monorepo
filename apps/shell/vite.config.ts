import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(appDir, "../..");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, workspaceRoot, "");

  return {
    envDir: workspaceRoot,
    plugins: [
      react(),
      federation({
        name: "shell",
        remotes: {
          institucional: env.VITE_INSTITUCIONAL_REMOTE_URL || "http://localhost:4176/assets/remoteEntry.js",
          admin: env.VITE_ADMIN_REMOTE_URL || "http://localhost:4174/assets/remoteEntry.js",
          assistant: env.VITE_ASSISTENTE_REMOTE_URL || "http://localhost:4175/assets/remoteEntry.js"
        },
        shared: ["react", "react-dom", "react-router-dom"]
      })
    ],
    server: {
      host: "0.0.0.0",
      port: 5173,
      proxy: {
        "/api/admin": {
          target: env.VITE_ADMIN_API_PROXY_TARGET || `http://localhost:${env.ADMIN_API_PORT || 3333}`,
          changeOrigin: true
        },
        "/assistente-api": {
          target: env.VITE_ASSISTENTE_API_PROXY_TARGET || `http://localhost:${env.ASSISTENTE_API_PORT || 8000}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/assistente-api/, "")
        }
      }
    },
    build: {
      target: "esnext"
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test-setup.ts"
    }
  };
});
