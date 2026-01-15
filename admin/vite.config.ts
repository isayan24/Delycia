import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  plugins: [
    devtools(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart({
      srcDirectory: 'src',
      start: {
        entry: 'src/index.tsx',
      },
    }),
    viteReact(),
  ],
  build: {
    // Production optimizations
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal loading
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (id.includes('@tanstack')) {
              return 'tanstack-vendor'
            }
            if (id.includes('@radix-ui')) {
              return 'radix-vendor'
            }
            if (id.includes('recharts')) {
              return 'charts-vendor'
            }
            return 'vendor'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    host: true,
  },
})

export default config
