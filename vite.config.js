import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server:{
    port: 3000,
    proxy: {'/api': {
            target: 'https://api.masterlptg.it/',
            changeOrigin: true, 
            
          }
        },
      },
resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },}})