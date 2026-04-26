import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      external: ['@perfood/capacitor-healthkit', '@perfood/capacitor-health-connect'],
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 3000,
  },
});
