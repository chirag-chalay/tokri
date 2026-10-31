import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const apiTarget =
    env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5223'

  const proxyConfig = {
    '/api': {
      target: apiTarget,
      changeOrigin: true,
      secure: false,
    },

    '/uploads': {
      target: apiTarget,
      changeOrigin: true,
      secure: false,
    },

    '/tokri-backoffice': {
      target: apiTarget,
      changeOrigin: true,
      secure: false,
    },
  }

  return {
    plugins: [react()],

    server: {
      // Allows localhost, server IP, Docker, Nginx, and external domain access
      host: '0.0.0.0',
      port: 5222,
      strictPort: true,
      watch: { ignored: ['**/.next/**'] },

      allowedHosts: [
        'tokriii.com',
        'www.tokriii.com',
        'localhost',
        '127.0.0.1',
      ],

      proxy: proxyConfig,
    },

    preview: {
      host: '0.0.0.0',
      port: 5222,
      strictPort: true,

      allowedHosts: [
        'tokriii.com',
        'www.tokriii.com',
        'localhost',
        '127.0.0.1',
      ],

      proxy: proxyConfig,
    },
  }
})
