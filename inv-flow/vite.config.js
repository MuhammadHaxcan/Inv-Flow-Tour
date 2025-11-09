import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    allowedHosts: [
        "0f288a8c9e0c.ngrok-free.app",
        "b436068aa4e5.ngrok-free.app",
        "b86726c11922.ngrok-free.app"
    ]
  }
});
