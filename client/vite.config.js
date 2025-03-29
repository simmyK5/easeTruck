import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables from .env file
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      global: 'globalThis', // Polyfill global for browser environment
    },
    resolve: {
      alias: {
        global: 'globalThis',
      },
    },
    build: {
      outDir: 'build', // This specifies that the build output will go into the 'build' directory
    },
    server: {
      port: 3000,
      proxy: {
        '/backend': {
          target: env.VITE_API_BASE_URL, // Use env variable correctly
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/backend/, ''),
        },
      },
    },
  };
});
