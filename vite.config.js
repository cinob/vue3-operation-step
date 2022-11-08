import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Unocss from 'unocss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@/': `${path.resolve(__dirname, 'lib')}/`,
    },
  },
  plugins: [
    vue(),

    AutoImport({
      imports: [
        'vue',
      ],
      dts: true,
    }),

    Unocss(),
  ],
  build: {
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
  },
})
