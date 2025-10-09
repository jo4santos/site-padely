import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    // Use base path from environment variable
    // Defaults to '/' if not set
    base: env.VITE_BASE_PATH || '/',
    server: {
      port: 8080
    }
  }
})
