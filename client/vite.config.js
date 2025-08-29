import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  // Load environment variables from .env file
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(),viteStaticCopy({
      targets: [
        {
          src: 'path-to-your-images-folder/*',  // The path to your images folder
          dest: 'uploads',  // The destination folder in the build output
        },
      ],
    }),
  ],
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
