export const script = '<script>let baseScript: string</script>'
export const scriptSetup = '<script setup>let scriptSetup: string</script>'
export const template = '<template><div>Hello World!</div></template>'
export const style = '<style>div { color: blue; }</style>'
export const styleScoped = '<style scoped>.scoped { color: blue; }</style>'
export const styleLangTs = '<style lang="ts">css({ \'.lang-ts\': { color: \'red\' } })</style>'
export const completeComponent = [script, scriptSetup, template, style, styleScoped, styleLangTs].join('\n')

export const svelteScript = '<script>let name = `world`;</script>'
export const svelteTemplate = `
<h1>Hello {name}!</h1>
`
export const svelteStyle = '<style>h1 { color: red; }</style>'
export const completeSvelteComponent = [svelteScript, svelteTemplate, svelteStyle].join('\n')
