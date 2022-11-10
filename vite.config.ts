import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Unocss from 'unocss/vite'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'lib')}/`,
    },
  },
  plugins: [
    vue(),

    Unocss(),

    process.env.NODE_ENV === 'production'
    && dts({ insertTypesEntry: true, copyDtsFiles: false }),
  ],
  build: process.env.NODE_ENV === 'production'
    ? {
        lib: {
          entry: path.resolve(__dirname, 'lib/main.ts'),
          name: 'vue3-operation-step',
          fileName: 'vue3-operation-step',
        },
        rollupOptions: {
          external: ['vue'],
          output: {
            globals: {
              vue: 'Vue',
            },
          },
        },
      }
    : {},
})
