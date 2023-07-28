import { beforeEach, describe, expect, it } from 'vitest'
import { parse } from 'vue/compiler-sfc'
import { createVueSFC as create } from '../src/vue/create'
import { magicVueSfcDefaultOptions } from '../src/vue/sfc'

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
</style>
`

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
</docs>
`

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
</style>
`

    expect(sfc.toString()).toBe(expectedSFC)
  })
})
