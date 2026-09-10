import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // El puerto está fijado a propósito: es el origen que la API permite en
    // CORS_ORIGIN. Si Vite eligiera otro al estar ocupado, las peticiones
    // empezarían a fallar por CORS sin decir por qué.
    port: 5173,
    strictPort: true,
  },
})
