/* VUE */

export const script = '<script>let baseScript: string</script>'
export const scriptSetup = '<script setup>let scriptSetup: string</script>'
export const template = '<template><div>Hello World!</div></template>'
export const style = '<style>div { color: blue; }</style>'
export const styleScoped = '<style scoped>.scoped { color: blue; }</style>'
export const styleLangTs = '<style lang="ts">css({ \'.lang-ts\': { color: \'red\' } })</style>'
export const completeComponent = [script, scriptSetup, template, style, styleScoped, styleLangTs].join('\n')

/* SVELTE */

export const svelteScript = '<script>let name = `world`;</script>'
export const svelteTemplate = `
<h1>Hello {name}!</h1>
`
export const svelteStyle = '<style>h1 { color: red; }</style>'
export const completeSvelteComponent = [svelteScript, svelteTemplate, svelteStyle].join('\n')

/* ASTRO */

export const astroFrontmatter = `---
const name = "Astro";
---`
export const astroScript = '<script>let name = `world`;</script>'
export const astroTemplate = `<div>
  <h1>Hello {name}!</h1>
</div>`
export const astroInlineScript = `<script is:inline>
console.log('Hello World');
</script>`
export const astroStyle = `<style>
h1 { color: red; }
div { background-color: red; }
@media (prefers-color-scheme: dark) { div { background-color: blue; } }
</style>`
export const completeAstroComponent = [astroFrontmatter, astroScript, astroTemplate, astroStyle].join('\n')
