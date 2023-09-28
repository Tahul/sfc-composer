import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/vue',
    'src/svelte',
    'src/astro',
  ],
  failOnWarn: false,
  clean: false,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  externals: [
    'vite',
    '@vue',
    '@vue/*',
    '@vue/compiler-sfc',
    '@vue/compiler-core',
    'vue/compiler-sfc',
    '@astrojs/compiler',
    'vue',
    'svelte',
    'svelte/compilter',
  ],
})
