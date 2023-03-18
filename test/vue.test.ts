import { SourceMap } from 'magic-string'
import { describe, expect, it } from 'vitest'
import { MagicVueSFC } from '../src/vue/sfc'

const script = '<script>let baseScript: string</script>'
const scriptSetup = '<script setup>let scriptSetup: string</script>'
const template = '<template><div>Hello World!</div></template>'
const style = '<style>div { color: blue; }</style>'
const styleScoped = '<style scoped>.scoped { color: blue; }</style>'
const completeComponent = `
  ${script}
  ${scriptSetup}
  ${template}
  ${style}
  ${styleScoped}
`

describe('Magic Vue SFC', () => {
  it('Can create the class', () => {
    const sfc = new MagicVueSFC(scriptSetup)

    expect(sfc.toString()).toBe(scriptSetup)
  })

  it('Can get a sourcemap', () => {
    const sfc = new MagicVueSFC(scriptSetup)

    expect(sfc.getSourcemap()).toBeInstanceOf(SourceMap)
  })

  it('Can parse a <script> tag', () => {
    const sfc = new MagicVueSFC(script)
    expect(sfc.script).toBeInstanceOf(Object)
  })

  it('Can parse a <script setup> tag', () => {
    const sfc = new MagicVueSFC(scriptSetup)
    expect(sfc.scriptSetup).toBeInstanceOf(Object)
  })

  it('Can parse a <template> tag', () => {
    const sfc = new MagicVueSFC(template)
    expect(sfc.template).toBeInstanceOf(Object)
  })

  it('Can parse a <style> tag', () => {
    const sfc = new MagicVueSFC(style)
    expect(sfc.styles[0]).toBeInstanceOf(Object)
  })

  it('Can parse multiple <style> tags', () => {
    const sfc = new MagicVueSFC(`${style}\n${styleScoped}`)
    expect(sfc.styles[0]).toBeInstanceOf(Object)
    expect(sfc.styles[1]).toBeInstanceOf(Object)
  })

  it('Can parse a complete component', () => {
    const sfc = new MagicVueSFC(completeComponent)
    expect(sfc.script).toBeInstanceOf(Object)
    expect(sfc.scriptSetup).toBeInstanceOf(Object)
    expect(sfc.styles[0]).toBeInstanceOf(Object)
    expect(sfc.styles[1]).toBeInstanceOf(Object)
    expect(sfc.template).toBeInstanceOf(Object)
  })

  it('Can transform SFCBlock into MagicBlock<SFCBlock>', () => {
    const sfc = new MagicVueSFC(completeComponent)
    sfc.scriptSetup.append('test')
    sfc.scriptSetup.append('\nnew-test')
    expect(sfc.scriptSetup.toString()).toEqual('let scriptSetup: stringtest\nnew-test')
    expect(sfc.toString()).toEqual(completeComponent.replace('let scriptSetup: string', 'let scriptSetup: stringtest\nnew-test'))
  })

  it('Can parse a custom block', () => {
    const customBlock = '<custom>\n  Some custom content\n</custom>'
    const sfc = new MagicVueSFC(customBlock)
    expect(sfc.customBlocks).toHaveLength(1)
    expect(sfc.customBlocks[0]).toBeInstanceOf(Object)
  })

  it('Can parse multiple custom blocks', () => {
    const customBlock1 = '<custom1>\n  Some custom content\n</custom1>'
    const customBlock2 = '<custom2>\n  Some other custom content\n</custom2>'
    const sfc = new MagicVueSFC(`${customBlock1}\n${customBlock2}`)
    expect(sfc.customBlocks).toHaveLength(2)
    expect(sfc.customBlocks[0]).toBeInstanceOf(Object)
    expect(sfc.customBlocks[1]).toBeInstanceOf(Object)
  })

  it('Can manipulate a <script> block', () => {
    const originalScript = '<script>\nexport default {\n  name: "MyComponent",\n};\n</script>'
    const expectedScript = '<script>\nexport default {\n  name: "UpdatedComponent",\n};\n</script>'
    const sfc = new MagicVueSFC(originalScript)
    sfc.script.overwrite(27, 38, 'UpdatedComponent')
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can manipulate a <script setup> block', () => {
    const originalScriptSetup = '<script setup>\nconst msg = "Hello, world!";\n</script>'
    const expectedScriptSetup = '<script setup>\nconst msg = "Hello, Mars!";\n</script>'
    const sfc = new MagicVueSFC(originalScriptSetup)
    sfc.scriptSetup.overwrite(21, 26, 'Mars')
    expect(sfc.toString()).toBe(expectedScriptSetup)
  })

  it('Can manipulate a <style> block', () => {
    const originalStyle = '<style>\n.text {\n  color: red;\n}\n</style>'
    const expectedStyle = '<style>\n.text {\n  color: blue;\n}\n</style>'
    const sfc = new MagicVueSFC(originalStyle)
    sfc.styles[0].overwrite(18, 21, 'blue')
    expect(sfc.toString()).toBe(expectedStyle)
  })

  it('Can manipulate nested elements in a <template> block', () => {
    const originalNestedTemplate = '<template>\n  <div><span>Hello, world!</span></div>\n</template>'
    const expectedNestedTemplate = '<template>\n  <div><span>Hello, Mars!</span></div>\n</template>'
    const sfc = new MagicVueSFC(originalNestedTemplate)
    sfc.template.overwrite(21, 26, 'Mars')
    expect(sfc.toString()).toBe(expectedNestedTemplate)
  })

  it('Can handle empty blocks', () => {
    const emptyScript = '<script></script>'
    const emptyScriptSetup = '<script setup></script>'
    const emptyTemplate = '<template></template>'
    const emptyStyle = '<style></style>'
    const sfc = new MagicVueSFC(`${emptyScriptSetup}\n${emptyScript}\n${emptyTemplate}\n${emptyStyle}`)

    // Vue SFC parser does sets null for empty script blocks
    expect(sfc.scriptSetup).toBeFalsy()
    expect(sfc.script).toBeFalsy()
    expect(sfc.styles.length).toBeFalsy()

    // Vue SFC parser does detect <template>
    expect(sfc.template).toBeTruthy()
  })

  it('Can append content to a <script> block', () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const appended = '\nconsole.log("Appended!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${baseContent}${appended}</script>`
    const sfc = new MagicVueSFC(originalScript)
    sfc.script.append(appended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can appendLeft content to a <script> block', () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const appended = '\nconsole.log("AppendedLeft!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${appended}${baseContent}</script>`
    const sfc = new MagicVueSFC(originalScript)
    sfc.script.appendLeft(0, appended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can appendRight content to a <script> block', () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const appended = '\nconsole.log("AppendedRight!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${baseContent}${appended}</script>`
    const sfc = new MagicVueSFC(originalScript)
    sfc.script.appendRight(baseContent.length, appended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can prepend content to a <script> block', () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const prepended = '\nconsole.log("Prepended!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${prepended}${baseContent}</script>`
    const sfc = new MagicVueSFC(originalScript)
    sfc.script.prepend(prepended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can prependLeft content to a <script> block', () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const prepended = '\nconsole.log("PrependedLeft!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${prepended}${baseContent}</script>`
    const sfc = new MagicVueSFC(originalScript)
    sfc.script.prependLeft(0, prepended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can prependRight content to a <script> block', () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const prepended = '\nconsole.log("PrependedRight!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${baseContent}${prepended}</script>`
    const sfc = new MagicVueSFC(originalScript)
    sfc.script.prependRight(baseContent.length, prepended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can manipulate every block of an SFC', () => {
    const originalSFC = `
<template>
  <div>{{ msg }}</div>
</template>

<script>
export default {
  data() {
    return {
      msg: "Hello, world!",
    };
  },
};
</script>

<script setup>
const setupMsg = 'Hello from setup!';
</script>

<style>
.text {
  color: red;
}
</style>
`

    const expectedSFC = `
<template>
  <div>{{ updatedMsg }}</div>
</template>

<script>
export default {
  data() {
    return {
      msg: "Hello, Mars!",
    };
  },
};
</script>

<script setup>
const setupMsg = 'Hello from updated setup!';
</script>

<style>
.text {
  color: blue;
}
</style>
`

    const sfc = new MagicVueSFC(originalSFC)
    sfc.template.overwrite(11, 14, 'updatedMsg')
    sfc.script.overwrite(61, 66, 'Mars')
    sfc.scriptSetup.appendLeft(29, ' updated')
    sfc.styles[0].overwrite(18, 21, 'blue')

    expect(sfc.toString()).toBe(expectedSFC)
  })

  it('Uses all methods on different blocks', () => {
    const originalSFC = `
<template>
  <div>Hello, world!</div>
</template>

<script>
export default {
  name: "MyComponent",
};
</script>

<style>
.text {
  color: red;
}
</style>
`
    const expectedSFC = `
<template>
  <span>Hi, Mars!</span>
  <div>Hello, world!</div>
</template>

<script>
console.log('Prepended!');
export default {
  name: "UpdatedComponent",
  data() {
    return {
      message: 'Appended!',
    };
  }
};
console.log('Appended!');
</script>

<style>
.text {
  color: blue;
  font-size: 16px;
}
</style>
`

    const sfc = new MagicVueSFC(originalSFC)

    // Manipulate <template> block
    sfc.template.prepend('\n  <span>Hi, Mars!</span>')

    // Manipulate <script> block
    sfc.script.prepend('\nconsole.log(\'Prepended!\');')
    sfc.script.append('console.log(\'Appended!\');\n')
    sfc.script.overwrite(27, 38, 'UpdatedComponent')
    sfc.script.appendRight(40, '\n  data() {\n    return {\n      message: \'Appended!\',\n    };\n  }')

    // Manipulate <style> block
    sfc.styles[0].overwrite(18, 21, 'blue')
    sfc.styles[0].appendRight(22, '\n  font-size: 16px;')

    expect(sfc.toString()).toBe(expectedSFC)
  })
})
