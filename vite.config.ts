import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward /mb/* to microburbs; example: /mb/report_generator/api/sandbox/property/development
      '/mb': {
        target: 'https://www.microburbs.com.au',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/mb/, ''),
      },
    },
  },
});
