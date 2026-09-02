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
    base: env.VITE_REMOTE_BASE || "/",
    plugins: [
      react(),
      federation({
        name: "admin",
        filename: "remoteEntry.js",
        exposes: {
          "./App": "./src/App.tsx"
        },
        shared: ["react", "react-dom"]
      })
    ],
    server: {
      host: "0.0.0.0",
      port: 5174
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
