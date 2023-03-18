import { describe, expect, it } from 'vitest'
import { createVueSFC as create } from '../src/vue/create'

describe('Create Vue SFC', () => {
  it('Can create an SFC with template, script, scriptSetup, and styles', () => {
    const sfc = create({
      template: {
        content: '<div>{{ msg }}</div>',
      },
      script: {
        content: `export default {
  data() {
    return {
      msg: "Hello, world!",
    };
  },
};`,
      },
      scriptSetup: {
        content: 'const setupMsg = \'Hello from setup!\';',
      },
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
      template: {
        content: '<div>{{ msg }}</div>',
      },
      script: {
        content: `export default {
  data() {
    return {
      msg: "Hello, world!",
    };
  },
};`,
      },
      customBlocks: [
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
      template: {
        content: '<div>{{ msg }}</div>',
      },
      script: {
        lang: 'ts',
        src: './script.ts',
      },
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
