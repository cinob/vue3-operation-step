import {
  defineConfig,
  presetAttributify,
  presetUno,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  transformers: [
    transformerDirectives(),
  ],
  shortcuts: [
    [/^square-\[?(.*?)\]?$/, ([, size]) => {
      return `w-${size} h-${size}`
    }],
    [/^circle-\[?(.*?)\]?$/, ([, size]) => {
      return `square-${size} rounded-full`
    }],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
  ],

})
