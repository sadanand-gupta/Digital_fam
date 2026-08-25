import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // Listen on all interfaces so the dev server is reachable from phones and
    // other devices on the same network, not just localhost.
    host: true,
  },
})
