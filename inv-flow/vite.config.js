import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        // Explicitly disable auto-open to prevent xdg-open errors on servers
        // The --no-open flag in package.json also ensures this
        open: false,
        host: true,
        allowedHosts: true,
        // Additional safety: don't try to open browser
        strictPort: false
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'esbuild',
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'ui-vendor': ['lucide-react'],
                }
            }
        },
        chunkSizeWarningLimit: 1000
    }
});
