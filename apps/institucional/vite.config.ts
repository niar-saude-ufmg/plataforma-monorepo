import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "institucional",
      filename: "remoteEntry.js",
      exposes: { "./App": "./src/RemoteApp.tsx" },
      shared: ["react", "react-dom", "react-router-dom"]
    })
  ],
  server: { host: "0.0.0.0", port: 5176 },
  build: { target: "esnext" },
  test: { globals: true, environment: "jsdom", setupFiles: "./src/test-setup.ts" }
});
