import MagicString, { SourceMap } from 'magic-string'
import { beforeEach, describe, expect, it } from 'vitest'
import { parse } from 'svelte/compiler'
import { MagicSFC as MagicSvelteSFC, magicSvelteSfcOptions } from '../src/svelte/sfc'
import { completeSvelteComponent, svelteScript, svelteStyle, svelteTemplate } from './utils'

describe('Magic Svelte SFC', () => {
  beforeEach(() => {
    // Set default parser for MagicSvelteSFC
    magicSvelteSfcOptions.parser = parse
  })

  it('Can create the class', async () => {
    const sfc = await new MagicSvelteSFC(svelteScript).parse()

    expect(sfc.toString()).toBe(svelteScript)
  })

  it('Cannot create a Magic Svelte SFC without a parser function', async () => {
    magicSvelteSfcOptions.parser = undefined

    try {
      await new MagicSvelteSFC(svelteScript).parse()
      throw new Error('Code should not reach this point!')
    }
    catch (e) {
      expect(e.message).toBe('You must provide a `parser` function (from svelte/compiler) in options when using MagicSvelteSFC.')
    }
  })

  it('Can create the class from a MagicString', async () => {
    const ms = new MagicString(svelteScript)

    const sfc = await new MagicSvelteSFC(ms).parse()

    const appended = '\nlet secondTest: string'

    sfc.scripts[0].append(appended)

    expect(sfc.toString()).toBe(`<script>let name = \`world\`;${appended}</script>`)
  })

  it('Can get a sourcemap', async () => {
    const sfc = await new MagicSvelteSFC(svelteScript).parse()

    expect(sfc.getSourcemap()).toBeInstanceOf(SourceMap)
  })

  it('Can parse a <script> tag', async () => {
    const sfc = await new MagicSvelteSFC(svelteScript).parse()
    expect(sfc.scripts[0]).toBeInstanceOf(Object)
  })

  it('Can parse a <script setup> tag', async () => {
    const sfc = await new MagicSvelteSFC(svelteScript).parse()
    expect(sfc.scripts[0]).toBeInstanceOf(Object)
  })

  it('Can parse a HTML content', async () => {
    const sfc = await new MagicSvelteSFC(svelteTemplate).parse()
    expect(sfc.templates[0]).toBeInstanceOf(Object)
  })

  it('Can parse a <style> tag', async () => {
    const sfc = await new MagicSvelteSFC(svelteStyle).parse()
    expect(sfc.styles[0]).toBeInstanceOf(Object)
  })

  it('Can parse a complete component', async () => {
    const sfc = await new MagicSvelteSFC(completeSvelteComponent).parse()
    expect(sfc.scripts[0]).toBeInstanceOf(Object)
    expect(sfc.styles[0]).toBeInstanceOf(Object)
    expect(sfc.templates[0]).toBeInstanceOf(Object)
  })

  it('Can transform SFCBlock into MagicBlock<Ast>', async () => {
    const sfc = await new MagicSvelteSFC(completeSvelteComponent).parse()
    sfc.scripts[0].append('test')
    sfc.scripts[0].append('\nnew-test')
    expect(sfc.scripts[0].toString()).toEqual('let name = \`world\`;test\nnew-test')
    expect(sfc.toString()).toEqual(completeSvelteComponent.replace('let name = \`world\`;', 'let name = \`world\`;test\nnew-test'))
  })

  it('Can manipulate a <script> block', async () => {
    const originalScript = '<script>\nexport default {\n  name: "MyComponent",\n};\n</script>'
    const expectedScript = '<script>\nexport default {\n  name: "UpdatedComponent",\n};\n</script>'
    const sfc = await new MagicSvelteSFC(originalScript).parse()
    sfc.scripts[0].overwrite(27, 38, 'UpdatedComponent')
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can manipulate a <style> block', async () => {
    const originalStyle = '<style>\n.text {\n  color: red;\n}\n</style>'
    const expectedStyle = '<style>\n.text {\n  color: blue;\n}\n</style>'
    const sfc = await new MagicSvelteSFC(originalStyle).parse()
    sfc.styles[0].overwrite(18, 21, 'blue')
    expect(sfc.toString()).toBe(expectedStyle)
  })

  it('Can manipulate nested elements in a <html> block', async () => {
    const originalNestedTemplate = '<div><span>Hello, world!</span></div>'
    const expectedNestedTemplate = '<div><span>Hello, Mars!</span></div>'
    const sfc = await new MagicSvelteSFC(originalNestedTemplate).parse()
    sfc.templates[0].overwrite(18, 23, 'Mars')
    expect(sfc.toString()).toBe(expectedNestedTemplate)
  })

  it('Can handle empty blocks', async () => {
    const emptyScript = '<script></script>'
    const emptyTemplate = '\n\n'
    const emptyStyle = '<style></style>'
    const sfc = await new MagicSvelteSFC(`${emptyScript}\n${emptyTemplate}\n${emptyStyle}`).parse()

    // Svelte SFC parser does detect empty script blocks
    expect(sfc.scripts.length).toBeTruthy()

    // Svelte SFC parser does detect empty style blocks
    expect(sfc.styles.length).toBeTruthy()

    // Svelte SFC parser does not detect empty HTML
    expect(sfc.templates.length).toBeTruthy()
  })

  it('Can append content to a <script> block', async () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const appended = '\nconsole.log("Appended!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${baseContent}${appended}</script>`
    const sfc = await new MagicSvelteSFC(originalScript).parse()
    sfc.scripts[0].append(appended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can appendLeft content to a <script> block', async () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const appended = '\nconsole.log("AppendedLeft!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${appended}${baseContent}</script>`
    const sfc = await new MagicSvelteSFC(originalScript).parse()
    sfc.scripts[0].appendLeft(0, appended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can appendRight content to a <script> block', async () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const appended = '\nconsole.log("AppendedRight!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${baseContent}${appended}</script>`
    const sfc = await new MagicSvelteSFC(originalScript).parse()
    sfc.scripts[0].appendRight(baseContent.length, appended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can prepend content to a <script> block', async () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const prepended = '\nconsole.log("Prepended!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${prepended}${baseContent}</script>`
    const sfc = await new MagicSvelteSFC(originalScript).parse()
    sfc.scripts[0].prepend(prepended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can prependLeft content to a <script> block', async () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const prepended = '\nconsole.log("PrependedLeft!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${prepended}${baseContent}</script>`
    const sfc = await new MagicSvelteSFC(originalScript).parse()
    sfc.scripts[0].prependLeft(0, prepended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can prependRight content to a <script> block', async () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const prepended = '\nconsole.log("PrependedRight!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${baseContent}${prepended}</script>`
    const sfc = await new MagicSvelteSFC(originalScript).parse()
    sfc.scripts[0].prependRight(baseContent.length, prepended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can manipulate every block of an SFC', async () => {
    const originalSFC = `<div>{{ msg }}</div>

<script>
export default {
  data() {
    return {
      msg: "Hello, world!",
    };
  },
};
</script>

<style>
.text {
  color: red;
}
</style>
`

    const expectedSFC = `<div>{{ updatedMsg }}</div>

<script>
export default {
  data() {
    return {
      msg: "Hello, Mars!",
    };
  },
};
</script>

<style>
.text {
  color: blue;
}
</style>
`

    const sfc = await new MagicSvelteSFC(originalSFC).parse()
    sfc.templates[0].overwrite(8, 11, 'updatedMsg')
    sfc.scripts[0].overwrite(61, 66, 'Mars')
    sfc.styles[0].overwrite(18, 21, 'blue')

    expect(sfc.toString()).toBe(expectedSFC)
  })

  it('Uses all methods on different blocks', async () => {
    const originalSFC = `<div>Hello, world!</div>

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
    const expectedSFC = `<span>Hi, Mars!</span>
<div>Hello, world!</div>

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

    const sfc = await new MagicSvelteSFC(originalSFC).parse()

    // Manipulate <template> block
    sfc.templates[0].prepend('<span>Hi, Mars!</span>\n')

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
