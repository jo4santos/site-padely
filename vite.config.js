import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Use root path for dev, repository path for production
  base: command === 'serve' ? '/' : '/site-padely/',
  server: {
    port: 8080
  }
}))
