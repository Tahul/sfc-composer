import MagicString, { SourceMap } from 'magic-string'
import { beforeEach, describe, expect, it } from 'vitest'
import { parse } from 'vue/compiler-sfc'
import { MagicVueSFC, magicVueSfcDefaultOptions } from '../src/vue/sfc'
import { createVueBlock, createVueSFC } from '../src'
import { completeComponent, script, scriptSetup, style, styleScoped, template } from './utils'

describe('Magic Vue SFC', () => {
  beforeEach(() => {
    // Set default parser for MagicVueSFC
    magicVueSfcDefaultOptions.parser = parse
  })

  it('Can create the class', () => {
    const sfc = new MagicVueSFC(scriptSetup)

    expect(sfc.toString()).toBe(scriptSetup)
  })

  it('Cannot create a Magic Vue SFC without a parser function', () => {
    magicVueSfcDefaultOptions.parser = undefined

    expect(
      () => new MagicVueSFC(scriptSetup),
    ).toThrowError(
      'You must provide a `parser` function (from vue/compiler-sfc) in options when using MagicVueSFC.',
    )
  })

  it('Can create the class from a MagicString', () => {
    const ms = new MagicString(scriptSetup)

    const sfc = new MagicVueSFC(ms)

    const appended = '\nlet secondTest: string'

    sfc.scripts[0].append(appended)

    expect(sfc.toString()).toBe(`<script setup>let scriptSetup: string${appended}</script>`)
  })

  it('Can get a sourcemap', () => {
    const sfc = new MagicVueSFC(scriptSetup)

    expect(sfc.getSourcemap()).toBeInstanceOf(SourceMap)
  })

  it('Can parse a <script> tag', () => {
    const sfc = new MagicVueSFC(script)
    expect(sfc.scripts[0]).toBeInstanceOf(Object)
  })

  it('Can parse a <script setup> tag', () => {
    const sfc = new MagicVueSFC(scriptSetup)
    expect(sfc.scripts[0]).toBeInstanceOf(Object)
  })

  it('Can parse a <template> tag', () => {
    const sfc = new MagicVueSFC(template)
    expect(sfc.templates[0]).toBeInstanceOf(Object)
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
    expect(sfc.scripts[0]).toBeInstanceOf(Object)
    expect(sfc.scripts[1]).toBeInstanceOf(Object)
    expect(sfc.styles[0]).toBeInstanceOf(Object)
    expect(sfc.styles[1]).toBeInstanceOf(Object)
    expect(sfc.templates[0]).toBeInstanceOf(Object)
  })

  it('Can transform SFCBlock into MagicBlock<SFCBlock>', () => {
    const sfc = new MagicVueSFC(completeComponent)
    sfc.scripts[1].append('test')
    sfc.scripts[1].append('\nnew-test')
    expect(sfc.scripts[1].toString()).toEqual('let scriptSetup: stringtest\nnew-test')
    expect(sfc.toString()).toEqual(completeComponent.replace('let scriptSetup: string', 'let scriptSetup: stringtest\nnew-test'))
  })

  it('Can parse a custom block', () => {
    const customBlock = '<custom>\n  Some custom content\n</custom>'
    const sfc = new MagicVueSFC(customBlock)
    expect(sfc.customs).toHaveLength(1)
    expect(sfc.customs[0]).toBeInstanceOf(Object)
  })

  it('Can parse multiple custom blocks', () => {
    const customBlock1 = '<custom1>\n  Some custom content\n</custom1>'
    const customBlock2 = '<custom2>\n  Some other custom content\n</custom2>'
    const sfc = new MagicVueSFC(`${customBlock1}\n${customBlock2}`)
    expect(sfc.customs).toHaveLength(2)
    expect(sfc.customs[0]).toBeInstanceOf(Object)
    expect(sfc.customs[1]).toBeInstanceOf(Object)
  })

  it('Can manipulate a <script> block', () => {
    const originalScript = '<script>\nexport default {\n  name: "MyComponent",\n};\n</script>'
    const expectedScript = '<script>\nexport default {\n  name: "UpdatedComponent",\n};\n</script>'
    const sfc = new MagicVueSFC(originalScript)
    sfc.scripts[0].overwrite(27, 38, 'UpdatedComponent')
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can manipulate a <script setup> block', () => {
    const originalScriptSetup = '<script setup>\nconst msg = "Hello, world!";\n</script>'
    const expectedScriptSetup = '<script setup>\nconst msg = "Hello, Mars!";\n</script>'
    const sfc = new MagicVueSFC(originalScriptSetup)
    sfc.scripts[0].overwrite(21, 26, 'Mars')
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
    sfc.templates[0].overwrite(21, 26, 'Mars')
    expect(sfc.toString()).toBe(expectedNestedTemplate)
  })

  it('Can handle empty blocks', () => {
    const emptyScript = '<script></script>'
    const emptyScriptSetup = '<script setup></script>'
    const emptyTemplate = '<template></template>'
    const emptyStyle = '<style></style>'
    const sfc = new MagicVueSFC(`${emptyScriptSetup}\n${emptyScript}\n${emptyTemplate}\n${emptyStyle}`)

    // Vue SFC parser does sets null for empty script blocks
    expect(sfc.scripts.length).toBeFalsy()
    expect(sfc.styles.length).toBeFalsy()

    // Vue SFC parser does detect <template>
    expect(sfc.templates.length).toBeTruthy()
  })

  it('Can append content to a <script> block', () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const appended = '\nconsole.log("Appended!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${baseContent}${appended}</script>`
    const sfc = new MagicVueSFC(originalScript)
    sfc.scripts[0].append(appended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can appendLeft content to a <script> block', () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const appended = '\nconsole.log("AppendedLeft!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${appended}${baseContent}</script>`
    const sfc = new MagicVueSFC(originalScript)
    sfc.scripts[0].appendLeft(0, appended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can appendRight content to a <script> block', () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const appended = '\nconsole.log("AppendedRight!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${baseContent}${appended}</script>`
    const sfc = new MagicVueSFC(originalScript)
    sfc.scripts[0].appendRight(baseContent.length, appended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can prepend content to a <script> block', () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const prepended = '\nconsole.log("Prepended!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${prepended}${baseContent}</script>`
    const sfc = new MagicVueSFC(originalScript)
    sfc.scripts[0].prepend(prepended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can prependLeft content to a <script> block', () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const prepended = '\nconsole.log("PrependedLeft!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${prepended}${baseContent}</script>`
    const sfc = new MagicVueSFC(originalScript)
    sfc.scripts[0].prependLeft(0, prepended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can prependRight content to a <script> block', () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const prepended = '\nconsole.log("PrependedRight!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${baseContent}${prepended}</script>`
    const sfc = new MagicVueSFC(originalScript)
    sfc.scripts[0].prependRight(baseContent.length, prepended)
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
    sfc.templates[0].overwrite(11, 14, 'updatedMsg')
    sfc.scripts[0].overwrite(61, 66, 'Mars')
    sfc.scripts[1].appendLeft(29, ' updated')
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

describe('createVueBlock', () => {
  it('should return an empty string if no block is provided', () => {
    const result = createVueBlock(undefined, 'templates')
    expect(result).toBe('')
  })

  it('should set custom block name from block.type if available', () => {
    const block = {
      type: 'my-custom-block',
      content: 'Some content',
    }
    const result = createVueBlock(block, 'customs')
    expect(result).toContain('<my-custom-block>')

    const blockWithNoType = {
      content: 'Some content',
    }
    const resultWithNoType = createVueBlock(blockWithNoType, 'customs')
    expect(resultWithNoType).toContain('<custom>')
  })

  it('should set custom block name from block.attrs.type if block.type is not available', () => {
    const block = {
      attrs: { type: 'my-custom-attr-block' },
      content: 'Some content',
    }
    const result = createVueBlock(block, 'customs')
    expect(result).toContain('<my-custom-attr-block')
  })

  it('should handle missing block.attrs gracefully', () => {
    const block = {
      content: '<div>Hello</div>',
    }
    const result = createVueBlock(block, 'templates')
    // Ensure that the block creation works without errors and the content is present
    expect(result).toBe('<template>\n<div>Hello</div>\n</template>\n')
  })

  it('should handle missing templates option gracefully', () => {
    const options = {
      scripts: [{ content: 'console.log("Hello");' }],
    }
    const result = createVueSFC(options)
    const sfcContent = result.toString() // Assuming toString method exists

    // Assert there is no <template> block but the <script> block exists
    expect(sfcContent).not.toContain('<template>')
    expect(sfcContent).toContain('<script>\nconsole.log("Hello");\n</script>')
  })
})
