import MagicString, { SourceMap } from 'magic-string'
import { beforeEach, describe, expect, it } from 'vitest'
import { parse } from 'svelte/compiler'
import { MagicSvelteSFC, magicSvelteSfcOptions } from '../src/svelte/sfc'
import { createSvelteBlock, createSvelteSFC } from '../src/svelte/create'
import { completeSvelteComponent, svelteScript, svelteStyle, svelteTemplate } from './utils'

describe('Magic Vue SFC', () => {
  beforeEach(() => {
    // Set default parser for MagicSvelteSFC
    magicSvelteSfcOptions.parser = parse
  })

  it('Can create the class', () => {
    const sfc = new MagicSvelteSFC(svelteScript)

    expect(sfc.toString()).toBe(svelteScript)
  })

  it('Cannot create a Magic Svelte SFC without a parser function', () => {
    magicSvelteSfcOptions.parser = undefined

    expect(
      () => new MagicSvelteSFC(svelteScript),
    ).toThrowError(
      'You must provide a `parser` function (from svelte/compiler) in options when using MagicSvelteSFC.',
    )
  })

  it('Can create the class from a MagicString', () => {
    const ms = new MagicString(svelteScript)

    const sfc = new MagicSvelteSFC(ms)

    const appended = '\nlet secondTest: string'

    sfc.scripts[0].append(appended)

    expect(sfc.toString()).toBe(`<script>let name = \`world\`;${appended}</script>`)
  })

  it('Can get a sourcemap', () => {
    const sfc = new MagicSvelteSFC(svelteScript)

    expect(sfc.getSourcemap()).toBeInstanceOf(SourceMap)
  })

  it('Can parse a <script> tag', () => {
    const sfc = new MagicSvelteSFC(svelteScript)
    expect(sfc.scripts[0]).toBeInstanceOf(Object)
  })

  it('Can parse a <script setup> tag', () => {
    const sfc = new MagicSvelteSFC(svelteScript)
    expect(sfc.scripts[0]).toBeInstanceOf(Object)
  })

  it('Can parse a HTML content', () => {
    const sfc = new MagicSvelteSFC(svelteTemplate)
    expect(sfc.templates[0]).toBeInstanceOf(Object)
  })

  it('Can parse a <style> tag', () => {
    const sfc = new MagicSvelteSFC(svelteStyle)
    expect(sfc.styles[0]).toBeInstanceOf(Object)
  })

  it('Can parse a complete component', () => {
    const sfc = new MagicSvelteSFC(completeSvelteComponent)
    expect(sfc.scripts[0]).toBeInstanceOf(Object)
    expect(sfc.styles[0]).toBeInstanceOf(Object)
    expect(sfc.templates[0]).toBeInstanceOf(Object)
  })

  it('Can transform SFCBlock into MagicBlock<Ast>', () => {
    const sfc = new MagicSvelteSFC(completeSvelteComponent)
    sfc.scripts[0].append('test')
    sfc.scripts[0].append('\nnew-test')
    expect(sfc.scripts[0].toString()).toEqual('let name = \`world\`;test\nnew-test')
    expect(sfc.toString()).toEqual(completeSvelteComponent.replace('let name = \`world\`;', 'let name = \`world\`;test\nnew-test'))
  })

  it('Can manipulate a <script> block', () => {
    const originalScript = '<script>\nexport default {\n  name: "MyComponent",\n};\n</script>'
    const expectedScript = '<script>\nexport default {\n  name: "UpdatedComponent",\n};\n</script>'
    const sfc = new MagicSvelteSFC(originalScript)
    sfc.scripts[0].overwrite(27, 38, 'UpdatedComponent')
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can manipulate a <style> block', () => {
    const originalStyle = '<style>\n.text {\n  color: red;\n}\n</style>'
    const expectedStyle = '<style>\n.text {\n  color: blue;\n}\n</style>'
    const sfc = new MagicSvelteSFC(originalStyle)
    sfc.styles[0].overwrite(18, 21, 'blue')
    expect(sfc.toString()).toBe(expectedStyle)
  })

  it('Can manipulate nested elements in a <html> block', () => {
    const originalNestedTemplate = '<div><span>Hello, world!</span></div>'
    const expectedNestedTemplate = '<div><span>Hello, Mars!</span></div>'
    const sfc = new MagicSvelteSFC(originalNestedTemplate)
    sfc.templates[0].overwrite(18, 23, 'Mars')
    expect(sfc.toString()).toBe(expectedNestedTemplate)
  })

  it('Can handle empty blocks', () => {
    const emptyScript = '<script></script>'
    const emptyTemplate = '\n\n'
    const emptyStyle = '<style></style>'
    const sfc = new MagicSvelteSFC(`${emptyScript}\n${emptyTemplate}\n${emptyStyle}`)

    // Svelte SFC parser does detect empty script blocks
    expect(sfc.scripts.length).toBeTruthy()

    // Svelte SFC parser does detect empty style blocks
    expect(sfc.styles.length).toBeTruthy()

    // Svelte SFC parser does not detect empty HTML
    expect(sfc.templates.length).toBeTruthy()
  })

  it('Can append content to a <script> block', () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const appended = '\nconsole.log("Appended!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${baseContent}${appended}</script>`
    const sfc = new MagicSvelteSFC(originalScript)
    sfc.scripts[0].append(appended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can appendLeft content to a <script> block', () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const appended = '\nconsole.log("AppendedLeft!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${appended}${baseContent}</script>`
    const sfc = new MagicSvelteSFC(originalScript)
    sfc.scripts[0].appendLeft(0, appended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can appendRight content to a <script> block', () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const appended = '\nconsole.log("AppendedRight!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${baseContent}${appended}</script>`
    const sfc = new MagicSvelteSFC(originalScript)
    sfc.scripts[0].appendRight(baseContent.length, appended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can prepend content to a <script> block', () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const prepended = '\nconsole.log("Prepended!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${prepended}${baseContent}</script>`
    const sfc = new MagicSvelteSFC(originalScript)
    sfc.scripts[0].prepend(prepended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can prependLeft content to a <script> block', () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const prepended = '\nconsole.log("PrependedLeft!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${prepended}${baseContent}</script>`
    const sfc = new MagicSvelteSFC(originalScript)
    sfc.scripts[0].prependLeft(0, prepended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can prependRight content to a <script> block', () => {
    const baseContent = '\nexport default {\n  name: "MyComponent",\n};\n'
    const prepended = '\nconsole.log("PrependedRight!");'
    const originalScript = `<script>${baseContent}</script>`
    const expectedScript = `<script>${baseContent}${prepended}</script>`
    const sfc = new MagicSvelteSFC(originalScript)
    sfc.scripts[0].prependRight(baseContent.length, prepended)
    expect(sfc.toString()).toBe(expectedScript)
  })

  it('Can manipulate every block of an SFC', () => {
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

    const sfc = new MagicSvelteSFC(originalSFC)
    sfc.templates[0].overwrite(8, 11, 'updatedMsg')
    sfc.scripts[0].overwrite(61, 66, 'Mars')
    sfc.styles[0].overwrite(18, 21, 'blue')

    expect(sfc.toString()).toBe(expectedSFC)
  })

  it('Uses all methods on different blocks', () => {
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

    const sfc = new MagicSvelteSFC(originalSFC)

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

describe('createSvelteBlock', () => {
  it('should return an empty string if no block is provided', () => {
    const result = createSvelteBlock(undefined, 'templates')
    expect(result).toBe('')
  })

  it('should create a template block correctly', () => {
    const block = {
      content: '<div>Hello World</div>',
    }
    const result = createSvelteBlock(block, 'templates')
    expect(result).toBe('<div>Hello World</div>')
  })

  it('should create a script block correctly', () => {
    const block = {
      content: 'console.log("Hello World");',
    }
    const result = createSvelteBlock(block, 'scripts')
    expect(result).toBe('<script>\nconsole.log("Hello World");\n</script>')
  })

  it('should create a style block correctly', () => {
    const block = {
      content: 'body { color: red; }',
    }
    const result = createSvelteBlock(block, 'styles')
    expect(result).toBe('<style>\nbody { color: red; }\n</style>')
  })
})
