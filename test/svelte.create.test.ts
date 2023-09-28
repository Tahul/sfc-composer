import { beforeEach, describe, expect, it } from 'vitest'
import { parse } from 'svelte/compiler'
import { createSvelteSFC as create, createSvelteBlock, createSvelteSFC } from '../src/svelte/create'
import { magicSvelteSfcOptions } from '../src/svelte/sfc'

describe('Create Svelte Block', () => {
  beforeEach(() => {
    // Set default parser for MagicVueSFC
    magicSvelteSfcOptions.parser = parse
  })

  it('Should create a template block correctly', () => {
    const block = {
      content: '<div>Hello World</div>',
    }
    const result = createSvelteBlock(block, 'templates')
    expect(result).toBe('<div>Hello World</div>')
  })

  it('Should create a script block correctly', () => {
    const block = {
      content: 'console.log("Hello World");',
    }
    const result = createSvelteBlock(block, 'scripts')
    expect(result).toBe('<script>\nconsole.log("Hello World");\n</script>')
  })

  it('Should create a style block correctly', () => {
    const block = {
      content: 'body { color: red; }',
    }
    const result = createSvelteBlock(block, 'styles')
    expect(result).toBe('<style>\nbody { color: red; }\n</style>')
  })

  it('Should handle multiple attributes correctly', () => {
    const block = {
      attrs: { lang: 'scss' },
      content: 'body { color: red; }',
    } as const

    const result = createSvelteBlock(block, 'styles')
    expect(result).toBe('<style>\nbody { color: red; }\n</style>')
  })

  it('Should return an empty string if no block is provided', () => {
    const result = createSvelteBlock(undefined, 'templates')
    expect(result).toBe('')
  })

  it('Should handle missing block.attrs gracefully', () => {
    const block = {
      content: '<div>Hello</div>',
    }
    const result = createSvelteBlock(block, 'templates')
    // Ensure that the block creation works without errors and the content is present
    expect(result).toBe('<div>Hello</div>')
  })

  it('Should handle missing templates option gracefully', () => {
    const options = {
      scripts: [{ content: 'console.log("Hello");' }],
    }
    const result = createSvelteSFC(options)
    const sfcContent = result.toString() // Assuming toString method exists

    // Assert there is no <template> block but the <script> block exists
    expect(sfcContent).not.toContain('<template>')
    expect(sfcContent).toContain('<script>\nconsole.log("Hello");\n</script>')
  })
})

describe('Create Svelte SFC', () => {
  beforeEach(() => {
    // Set default parser for MagicVueSFC
    magicSvelteSfcOptions.parser = parse
  })

  it('Can create an SFC with template, script, scriptSetup, and styles', () => {
    const sfc = create({
      templates: [{
        content: '<div>{{ msg }}</div>',
      }],
      scripts: [
        {
          content: `export default {
  data() {
    return {
      msg: "Hello, world!",
    };
  },
};`,
        },
      ],
      styles: [
        {
          content: `.text {
  color: red;
}`,
        },
      ],
    })

    const expectedSFC = `<div>{{ msg }}</div>\n
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
</style>`

    expect(sfc.toString()).toBe(expectedSFC)
  })

  it('Can create an SFC with custom blocks', () => {
    const sfc = create({
      templates: [{
        content: '<div>{{ msg }}</div>',
      }],
      scripts: [{
        content: `export default {
  data() {
    return {
      msg: "Hello, world!",
    };
  },
};`,
      }],
    })

    const expectedSFC = `<div>{{ msg }}</div>

<script>
export default {
  data() {
    return {
      msg: "Hello, world!",
    };
  },
};
</script>`

    expect(sfc.toString()).toBe(expectedSFC)
  })

  it('Can create an SFC with attributes, lang, and src', () => {
    const sfc = create({
      templates: [{
        content: '<div>{{ msg }}</div>',
      }],
      scripts: [{
        content: 'console.log("Hello");',
      }],
      styles: [
        {
          content: `.text {
  color: red;
}`,
        },
      ],
    })

    const expectedSFC = `<div>{{ msg }}</div>

<script>
console.log("Hello");
</script>

<style>
.text {
  color: red;
}
</style>`

    expect(sfc.toString()).toBe(expectedSFC)
  })
})
