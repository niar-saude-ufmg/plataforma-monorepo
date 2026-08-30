import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'assistant',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/RemoteApp.tsx',
      },
      shared: ['react', 'react-dom', 'react-router-dom'],
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 5175,
    allowedHosts: [
      'localhost',
      'hrassistant.duckdns.org',
      '.duckdns.org',
      '163.176.194.146',
    ],
  },
  build: {
    target: 'esnext',
  },
})
