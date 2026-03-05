import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Do not pre-bundle — it uses dynamic imports and wasm that must stay intact
    exclude: ['@huggingface/transformers'],
  },
  build: {
    target: 'esnext',
  },
})
