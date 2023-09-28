import { beforeEach, describe, expect, it } from 'vitest'
import { parse } from '@astrojs/compiler'
import {
  createBlock as createAstroBlock,
  createSFC as createAstroSFC,
} from '../src/astro/create'
import { magicAstroSfcOptions } from '../src/astro/sfc'

describe('Create Astro Block', () => {
  beforeEach(() => {
    // Set default parser for MagicAstroSFC
    magicAstroSfcOptions.parser = parse
  })

  it('Should create a template block correctly', () => {
    const block = {
      content: '<div>Hello World</div>',
    }
    const result = createAstroBlock(block, 'templates')
    expect(result).toBe('<div>Hello World</div>')
  })

  it('Should create a script block correctly', () => {
    const block = {
      content: 'console.log("Hello World");',
    }
    const result = createAstroBlock(block, 'scripts')
    expect(result).toBe('<script>\nconsole.log("Hello World");\n</script>') // Adjusted as per your implementation
  })

  it('Should create a style block correctly', () => {
    const block = {
      content: 'body { color: red; }',
    }
    const result = createAstroBlock(block, 'styles')
    expect(result).toBe('<style>\nbody { color: red; }\n</style>')
  })

  it('Should handle multiple attributes correctly', () => {
    const block = {
      attrs: { lang: 'scss' },
      content: 'body { color: red; }',
    } as const

    const result = createAstroBlock(block, 'styles')
    expect(result).toBe('<style lang="scss">\nbody { color: red; }\n</style>')
  })

  it('Should return an empty string if no block is provided', () => {
    const result = createAstroBlock(undefined, 'templates')
    expect(result).toBe('')
  })

  it('Should handle missing block.attrs gracefully', () => {
    const block = {
      content: '<div>Hello</div>',
    }
    const result = createAstroBlock(block, 'templates')
    // Ensure that the block creation works without errors and the content is present
    expect(result).toBe('<div>Hello</div>')
  })
})

describe('Create Astro SFC', () => {
  beforeEach(() => {
    // Set default parser for MagicAstroSFC
    magicAstroSfcOptions.parser = parse
  })

  it('Can create an SFC with template, script, and styles', () => {
    const sfc = createAstroSFC({
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

    const expectedSFC = `<script>
export default {
  data() {
    return {
      msg: "Hello, world!",
    };
  },
};
</script>

<div>{{ msg }}</div>

<style>
.text {
  color: red;
}
</style>`

    expect(sfc.toString()).toBe(expectedSFC)
  })

  it('Can create an SFC with custom blocks', () => {
    const sfc = createAstroSFC({
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

    const expectedSFC = `<script>
export default {
  data() {
    return {
      msg: "Hello, world!",
    };
  },
};
</script>

<div>{{ msg }}</div>`

    expect(sfc.toString()).toBe(expectedSFC)
  })
})
