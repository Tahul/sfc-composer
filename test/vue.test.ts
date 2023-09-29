import MagicString, { SourceMap } from 'magic-string'
import { beforeEach, describe, expect, it } from 'vitest'
import { parse } from 'vue/compiler-sfc'
import { MagicSFC as MagicVueSFC, magicVueSfcOptions } from '../src/vue/sfc'
import { completeComponent, script, scriptSetup, style, styleScoped, template } from './utils'

describe('Magic Vue SFC', () => {
  beforeEach(() => {
    // Set default parser for MagicVueSFC
    magicVueSfcOptions.parser = parse
  })

  it('Can create the class', async () => {
    const sfc = await new MagicVueSFC(scriptSetup).parse()

    expect(sfc.toString()).toBe(scriptSetup)
  })

  it('Cannot create a Magic Vue SFC without a parser function', async () => {
    magicVueSfcOptions.parser = undefined

    try {
      await new MagicVueSFC(scriptSetup).parse()
      throw new Error('Code should not reach this point!')
    }
    catch (e) {
      expect(e.message).toBe('You must provide a `parser` function (from vue/compiler-sfc) in options when using MagicVueSFC.')
    }
  })

  it('Can create the class from a MagicString', async () => {
    const ms = new MagicString(scriptSetup)

    const sfc = await new MagicVueSFC(ms).parse()

    const appended = '\nlet secondTest: string'

    sfc.scripts[0].append(appended)

    expect(sfc.toString()).toBe(`<script setup>let scriptSetup: string${appended}</script>`)
  })

  it('Can get a sourcemap', async () => {
    const sfc = await new MagicVueSFC(scriptSetup).parse()

    expect(sfc.getSourcemap()).toBeInstanceOf(SourceMap)
  })

  it('Can parse a <script> tag', async () => {
    const sfc = await new MagicVueSFC(script).parse()
    expect(sfc.scripts[0]).toBeInstanceOf(Object)
  })

  it('Can parse a <script setup> tag', async () => {
    const sfc = await new MagicVueSFC(scriptSetup).parse()
    expect(sfc.scripts[0]).toBeInstanceOf(Object)
  })

  it('Can parse a <template> tag', async () => {
    const sfc = await new MagicVueSFC(template).parse()
    expect(sfc.templates[0]).toBeInstanceOf(Object)
  })

  it('Can parse a <style> tag', async () => {
    const sfc = await new MagicVueSFC(style).parse()
    expect(sfc.styles[0]).toBeInstanceOf(Object)
  })

  it('Can parse multiple <style> tags', async () => {
    const sfc = await new MagicVueSFC(`${style}\n${styleScoped}`).parse()
    expect(sfc.styles[0]).toBeInstanceOf(Object)
    expect(sfc.styles[1]).toBeInstanceOf(Object)
  })

  it('Can parse a complete component', async () => {
    const sfc = await new MagicVueSFC(completeComponent).parse()
    expect(sfc.scripts[0]).toBeInstanceOf(Object)
    expect(sfc.scripts[1]).toBeInstanceOf(Object)
    expect(sfc.styles[0]).toBeInstanceOf(Object)
    expect(sfc.styles[1]).toBeInstanceOf(Object)
    expect(sfc.templates[0]).toBeInstanceOf(Object)
  })

  it('Can transform SFCBlock into MagicBlock<SFCBlock>', async () => {
    const sfc = await new MagicVueSFC(completeComponent).parse()
    sfc.scripts[1].append('test')
    sfc.scripts[1].append('\nnew-test')
    expect(sfc.scripts[1].toString()).toEqual('let scriptSetup: stringtest\nnew-test')
    expect(sfc.toString()).toEqual(completeComponent.replace('let scriptSetup: string', 'let scriptSetup: stringtest\nnew-test'))
  })

  it('Can parse a custom block', async () => {
    const customBlock = '<custom>\n  Some custom content\n</custom>'
    const sfc = await new MagicVueSFC(customBlock).parse()
    expect(sfc.customs).toHaveLength(1)
    expect(sfc.customs[0]).toBeInstanceOf(Object)
  })

  it('Can parse multiple custom blocks', async () => {
    const customBlock1 = '<custom1>\n  Some custom content\n</custom1>'
    const customBlock2 = '<custom2>\n  Some other custom content\n</custom2>'
    const sfc = await new MagicVueSFC(`${customBlock1}\n${customBlock2}`).parse()
    expect(sfc.customs).toHaveLength(2)
    expect(sfc.customs[0]).toBeInstanceOf(Object)
    expect(sfc.customs[1]).toBeInstanceOf(Object)
  })

  it('Can manipulate a <script> block', async () => {
    const originalScript = '<script>\nexport default {\n  name: "MyComponent",\n};\n</script>'
    const expectedScript = '<script>\nexport default {\n  name: "UpdatedComponent",\n};\n</script>'
    const sfc = await new MagicVueSFC(originalScript).parse()
    sfc.scripts[0].overwrite(27, 38, 'UpdatedComponent')
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can manipulate a <script setup> block', async () => {
    const originalScriptSetup = '<script setup>\nconst msg = "Hello, world!";\n</script>'
    const expectedScriptSetup = '<script setup>\nconst msg = "Hello, Mars!";\n</script>'
    const sfc = await new MagicVueSFC(originalScriptSetup).parse()
    sfc.scripts[0].overwrite(21, 26, 'Mars')
    expect(sfc.toString()).toBe(expectedScriptSetup)
  })

  it('Can manipulate a <style> block', async () => {
    const originalStyle = '<style>\n.text {\n  color: red;\n}\n</style>'
    const expectedStyle = '<style>\n.text {\n  color: blue;\n}\n</style>'
    const sfc = await new MagicVueSFC(originalStyle).parse()
    sfc.styles[0].overwrite(18, 21, 'blue')
    expect(sfc.toString()).toBe(expectedStyle)
  })

  it('Can manipulate nested elements in a <template> block', async () => {
    const originalNestedTemplate = '<template>\n  <div><span>Hello, world!</span></div>\n</template>'
    const expectedNestedTemplate = '<template>\n  <div><span>Hello, Mars!</span></div>\n</template>'
    const sfc = await new MagicVueSFC(originalNestedTemplate).parse()
    sfc.templates[0].overwrite(21, 26, 'Mars')
    expect(sfc.toString()).toBe(expectedNestedTemplate)
  })

  it('Can handle empty blocks', async () => {
    const emptyScript = '<script></script>'
    const emptyScriptSetup = '<script setup></script>'
    const emptyTemplate = '<template></template>'
    const emptyStyle = '<style></style>'
    const sfc = await new MagicVueSFC(`${emptyScriptSetup}\n${emptyScript}\n${emptyTemplate}\n${emptyStyle}`).parse()

    // Vue SFC parser does sets null for empty script blocks
    expect(sfc.scripts.length).toBeFalsy()
    expect(sfc.styles.length).toBeFalsy()

    // Vue SFC parser does detect <template>
    expect(sfc.templates.length).toBeTruthy()
  })

  it('Can append content to a <script> block', async () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const appended = '\nconsole.log("Appended!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${baseContent}${appended}</script>`
    const sfc = await new MagicVueSFC(originalScript).parse()
    sfc.scripts[0].append(appended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can appendLeft content to a <script> block', async () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const appended = '\nconsole.log("AppendedLeft!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${appended}${baseContent}</script>`
    const sfc = await new MagicVueSFC(originalScript).parse()
    sfc.scripts[0].appendLeft(0, appended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can appendRight content to a <script> block', async () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const appended = '\nconsole.log("AppendedRight!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${baseContent}${appended}</script>`
    const sfc = await new MagicVueSFC(originalScript).parse()
    sfc.scripts[0].appendRight(baseContent.length, appended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can prepend content to a <script> block', async () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const prepended = '\nconsole.log("Prepended!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${prepended}${baseContent}</script>`
    const sfc = await new MagicVueSFC(originalScript).parse()
    sfc.scripts[0].prepend(prepended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can prependLeft content to a <script> block', async () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const prepended = '\nconsole.log("PrependedLeft!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${prepended}${baseContent}</script>`
    const sfc = await new MagicVueSFC(originalScript).parse()
    sfc.scripts[0].prependLeft(0, prepended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can prependRight content to a <script> block', async () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const prepended = '\nconsole.log("PrependedRight!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${baseContent}${prepended}</script>`
    const sfc = await new MagicVueSFC(originalScript).parse()
    sfc.scripts[0].prependRight(baseContent.length, prepended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can manipulate every block of an SFC', async () => {
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

    const sfc = await new MagicVueSFC(originalSFC).parse()
    sfc.templates[0].overwrite(11, 14, 'updatedMsg')
    sfc.scripts[0].overwrite(61, 66, 'Mars')
    sfc.scripts[1].appendLeft(29, ' updated')
    sfc.styles[0].overwrite(18, 21, 'blue')

    expect(sfc.toString()).toBe(expectedSFC)
  })

  it('Uses all methods on different blocks', async () => {
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

    const sfc = await new MagicVueSFC(originalSFC).parse()

    // Manipulate <template> block
    sfc.templates[0].prepend('\n  <span>Hi, Mars!</span>')

    // Manipulate <script> block
    sfc.scripts[0].prepend('\nconsole.log(\'Prepended!\');')
    sfc.scripts[0].append('console.log(\'Appended!\');\n')
    sfc.scripts[0].overwrite(27, 38, 'UpdatedComponent')
    sfc.scripts[0].appendRight(40, '\n  data() {\n    return {\n      message: \'Appended!\',\n    };\n  }')

    // Manipulate <style> block
    sfc.styles[0].overwrite(18, 21, 'blue')
    sfc.styles[0].appendRight(22, '\n  font-size: 16px;')

    expect(sfc.toString()).toBe(expectedSFC)
  })
})
