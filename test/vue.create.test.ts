import { beforeEach, describe, expect, it } from 'vitest'
import { parse } from 'vue/compiler-sfc'
import {
  createSFC as create,
  createBlock as createVueBlock,
} from '../src/vue/create'
import { magicVueSfcDefaultOptions } from '../src/vue/sfc'

describe('Create Vue Block', () => {
  beforeEach(() => {
    // Set default parser for MagicVueSFC
    magicVueSfcDefaultOptions.parser = parse
  })

  it('Should create a template block correctly', () => {
    const block = {
      content: '<div>Hello World</div>',
    }
    const result = createVueBlock(block, 'templates')
    expect(result).toBe('<template>\n<div>Hello World</div>\n</template>')
  })

  it('Should create a script block correctly', () => {
    const block = {
      content: 'console.log("Hello World");',
    }
    const result = createVueBlock(block, 'scripts')
    expect(result).toBe('<script>\nconsole.log("Hello World");\n</script>')
  })

  it('Should create a style block correctly', () => {
    const block = {
      content: 'body { color: red; }',
    }
    const result = createVueBlock(block, 'styles')
    expect(result).toBe('<style>\nbody { color: red; }\n</style>')
  })

  it('Should handle multiple attributes correctly', () => {
    const block = {
      attrs: { scoped: true, lang: 'scss' },
      content: 'body { color: red; }',
    } as const

    const result = createVueBlock(block, 'styles')
    expect(result).toBe('<style scoped lang="scss">\nbody { color: red; }\n</style>')
  })

  it('Should return an empty string if no block is provided', () => {
    const result = createVueBlock(undefined, 'templates')
    expect(result).toBe('')
  })

  it('Should set custom block name from block.type if available', () => {
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

  it('Should set custom block name from block.attrs.type if block.type is not available', () => {
    const block = {
      attrs: { type: 'my-custom-attr-block' },
      content: 'Some content',
    }
    const result = createVueBlock(block, 'customs')
    expect(result).toContain('<my-custom-attr-block')
  })

  it('Should handle missing block.attrs gracefully', () => {
    const block = {
      content: '<div>Hello</div>',
    }
    const result = createVueBlock(block, 'templates')
    // Ensure that the block creation works without errors and the content is present
    expect(result).toBe('<template>\n<div>Hello</div>\n</template>')
  })

  it('Should handle missing templates option gracefully', () => {
    const options = {
      scripts: [{ content: 'console.log("Hello");' }],
    }
    const result = create(options)
    const sfcContent = result.toString() // Assuming toString method exists

    // Assert there is no <template> block but the <script> block exists
    expect(sfcContent).not.toContain('<template>')
    expect(sfcContent).toContain('<script>\nconsole.log("Hello");\n</script>')
  })
})

describe('Create Vue SFC', () => {
  beforeEach(() => {
    // Set default parser for MagicVueSFC
    magicVueSfcDefaultOptions.parser = parse
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
        {
          content: 'const setupMsg = \'Hello from setup!\';',
          attrs: {
            setup: true,
          },
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

    const expectedSFC = `<template>
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
      customs: [
        {
          type: 'docs',
          content: 'This is a custom block with documentation.',
        },
      ],
    })

    const expectedSFC = `<template>
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

<docs>
This is a custom block with documentation.
</docs>`

    expect(sfc.toString()).toBe(expectedSFC)
  })

  it('Can create an SFC with attributes, lang, and src', () => {
    const sfc = create({
      templates: [{
        content: '<div>{{ msg }}</div>',
      }],
      scripts: [{
        lang: 'ts',
        src: './script.ts',
      }],
      styles: [
        {
          scoped: true,
          lang: 'scss',
          content: `.text {
  color: red;
}`,
        },
      ],
    })

    const expectedSFC = `<template>
<div>{{ msg }}</div>
</template>

<script lang="ts" src="./script.ts">

</script>

<style scoped lang="scss">
.text {
  color: red;
}
</style>`

    expect(sfc.toString()).toBe(expectedSFC)
  })
})
