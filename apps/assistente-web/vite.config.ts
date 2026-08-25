import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
})
