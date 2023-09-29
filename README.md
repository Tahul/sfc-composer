# sfc-composer

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]

> 👨‍🔬 Pre-compiler helpers for Single File Components

> Currently supports: [.vue](https://vuejs.org), [.svelte](https://svelte.dev), [.astro](https://astro.build)

> [🕹️ Playground](https://sfc-composer.netlify.app)

## Usage

Install package:

```bash
pnpm install sfc-composer
```

```js
import { MagicSFC as MagicVueSFC } from 'sfc-composer/vue'
import { MagicSFC as MagicSvelteSFC } from 'sfc-composer/svelte'
import { MagicSFC as MagicAstroSFC } from 'sfc-composer/astro'
```

## Internals

### ⚙️ MagicSFC class

`MagicSFC<T>` is the root interface supplied to be extended by framework-specific child classes.

- `scripts: MagicBlock<T>[]`

  Referring to `<script>` or any `JavaScript/TypeScript` contexts of SFCs.

- `templates: MagicBlock<T>[]`

  Referring to `<template>` parts of SFCs.

- `styles: MagicBlock<T>[]`

  Referring to `<style>` parts of SFCs.

- `customs: MagicBlock<T>[]`

  Custom blocks from frameworks parsers supporting that feature.

- `getSourcemap(options?: SourceMapOptions): SourceMap`

  Generates a [version 3 sourcemap](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit) like [`MagicString`](https://www.npmjs.com/package/magic-string).

- `getTransformResult(): TransformResult`

  Compatible with [Vite](https://vitejs.dev) `transform()` hook result.

- `parse(): Promise<MagicSFC>`

  Uses the parser to update `MagicSFC` blocks.

Should be implemented by child classes.

Learn more about all the usages by looking at [the tests](/test/index.test.ts)!

### ⚙️ How MagicSFC works

When using the `parse` function, `MagicSFC` will split the supplied component using your framework native tooling.

The parsing result will be splitted into a standard format recognizing `templates`, `scripts` and `styles` blocks.

Each of these `MagicBlock` will preserve the original shape from the parser, but will also expose all the relevant [MagicString](https://www.npmjs.com/package/magic-string) functions.

Each of these function, when called, will both apply your changes on the local block.

You also get access to `_loc` and `_source` on every `MagicBlock`, which are standard copies of the block positioning and content.

When calling `result`, you will get the `code` as a string, and an appropriate `SourceMap` object.

Look at the [implementation](./src/proxy.ts).

### ⚙️ createSFC functions

Frameworks exports a `createSfc` function that makes generating SFCs programatically easier.

They all support the same input aguments:

```ts
import { createSFC as createVueSFC } from 'sfc-composer/vue'
import { createSFC as createSvelteSFC } from 'sfc-composer/svelte'
import { createSFC as createAstroSFC } from 'sfc-composer/astro'

const writeableSFC = {
  templates: [
    {
      content: '<div>Hello World!</div>'
    }
  ],
  scripts: [
    {
      content: 'console.log(`Hello World!`)'
    }
  ],
  styles: [
    {
      content: 'div { color: red; }'
    }
  ]
}

// Will output a valid Svelte SFC
createSvelteSFC(writeableSFC)

// Will output a valid Astro SFC
createAstroSFC(writeableSFC)

// Will output a valid Vue SFC
createVueSFC({
  ...writeableSFC,
  // Vue also natively supports `customs` block in its parser.
  customs: [
    {
      type: 'i18n',
      content: '{ "fr": "Bonjour!", "en": "Hello!" }',
    }
  ]
})
```

## <img src="https://vuejs.org/logo.svg" width="24" height="24" /> MagicVueSFC

<details>
  <summary>Example code</summary>

  ```ts
  import { MagicSFC as MagicVueSFC } from 'sfc-composer/vue'
  import { parse } from 'vue/compiler-sfc'

  async function transformVueSFC() {
    const sfc = new MagicVueSFC(
      '<template><div>Hello World!</div></template>'
      + '<script setup>let test: string</script>'
      + '<style scoped>div { color: red; }</style>',
      {
        parser: parse
      }
    )

    // Process the SFC code through the parser
    await sfc.parse()

    // Append to the <script> tag
    sfc.scripts[0].append(' = `Hello World`')

    return sfc.result()

    // {
    //    code: '<template><div>Hello World!</div></template>\n\n<script setup>let test: string = `Hello World`</script>\n\n<style scoped>div { color: red; }</style>'
    //    map: SourceMap
    // }
  }
  ```

</details>

> Learn more by looking at [the tests](/test/vue.test.ts).

## <img src="https://vuejs.org/logo.svg" width="24" height="24" /> createVueSFC

<details>
  <summary>Example code</summary>

  ```ts
  import { createSFC as createVueSFC } from 'sfc-composer/vue'

  const MagicVueSFC = createVueSFC({
    templates: [
      {
        content: '<div>{{ msg }}</div>',
      }
    ],
    script: [
      {
        content: 'export default { data() { return { msg: "Hello, world!" } } }'
      },
      {
        content: 'const setupMsg = "Hello from setup!"',
      }
    ],
    styles: [
      {
        lang: 'scss',
        scoped: true,
        content: '.text { color: red; }',
      },
    ],
})
```

  #### 🖨️ Will output

  ```
  <script>
  export default { data() { return { msg: "Hello, world!" } }
  </script>

  <script setup>
  const setupMsg = "Hello from setup!"
  </script>

  <template>
  <div>{{ msg }}</div>
  </template>

  <style scoped lang="scss">
  .text { color: red; }
  </style>
  ```

</details>

> Learn more by looking at [the tests](/test/vue.create.test.ts)!

## <img src="https://svelte.dev/favicon.png" width="24" height="24" />  MagicSvelteSFC

<details>
  <summary>Example code</summary>

  ```ts
  import { MagicSFC as MagicSvelteSFC } from 'sfc-composer/svelte'
  import { parse } from 'svelte/compiler'

  async function transformSvelteSFC() {
    const sfc = new MagicSvelteSFC(
      '<script>let test: string</script>\n\n'
      + '<div>Hello World!</div>\n\n'
      + '<style>div { color: red; }</style>',
      {
        parser: parse
      }
    )

    // Process the SFC code through the parser
    await sfc.parse()

    // Append to the <script> tag
    sfc.scripts[0].append(' = `Hello World`')

    return sfc.result()

    // {
    //    code: '<script>let test: string = `Hello World`</script>\n\n<div>Hello World!</div>\n\n<style>div { color: red; }</style>'
    //    map: SourceMap
    // }
  }
  ```

</details>

> Learn more by looking at [the tests](/test/svelte.test.ts)!

## <img src="https://svelte.dev/favicon.png" width="24" height="24" />  createSvelteSFC

<details>
  <summary>Example code</summary>

  ```ts
  import { createSFC as createSvelteSFC } from 'sfc-composer/svelte'

  const MagicVueSFC = createSvelteSFC({
    templates: [
      {
        content: '<div>{msg}</div>',
      }
    ],
    script: [
      {
        content: 'let test = `Hello World!`;'
      }
    ],
    styles: [
      {
        content: '.text { color: red; }',
      },
    ],
})
```

  #### 🖨️ Will output

  ```
  <script>
  let test = `Hello World!`;
  </script>

  <script setup>
  const setupMsg = "Hello from setup!"
  </script>

  <div>{msg}</div>

  <style>
  .text { color: red; }
  </style>
  ```

</details>

> Learn more by looking at [the tests](/test/svelte.create.test.ts)!

## <img src="https://astro.build/favicon.svg" width="24" height="24" /> MagicAstroSFC

<details>
  <summary>Example code</summary>

  ```ts
  import { MagicSFC as MagicAstroSFC } from 'sfc-composer/astro'
  import { parse } from '@astrojs/compiler'

  async function transformAstroSFC() {
    const sfc = new MagicAstroSFC(
      '---\nlet test: string\n---\n\n'
      + '<div>Hello World!</div>\n\n'
      + '<style>div { color: red; }</style>',
      {
        parser: parse
      }
    )

    // Process the SFC code through the parser
    await sfc.parse()

    // Append to the <script> tag
    sfc.scripts[0].append('test = `Hello World`')

    return sfc.result()

    // {
    //    code: '---\nlet test: string\ntest = `Hello World`\n---\n\n<div>Hello World!</div>\n\n<style>div { color: red; }</style>'
    //    map: SourceMap
    // }
  }
  ```

</details>

> Learn more by looking at [the tests](/test/astro.test.ts)!

## <img src="https://astro.build/favicon.svg" width="24" height="24" /> createAstroSFC

<details>
  <summary>Example code</summary>

  ```ts
  import { createSFC as createAstroSFC } from 'sfc-composer/astro'

  const MagicVueSFC = createAstroSFC({
    templates: [
      {
        content: '<div>{msg}</div>',
      }
    ],
    script: [
      {
        content: 'let test = `Hello World!`;',
        attrs: {
          frontmatter: true
        }
      },
      {
        content: 'let secondTest = `Hello World`;'
      }
    ],
    styles: [
      {
        content: '.text { color: red; }',
      },
    ],
})
```

  #### 🖨️ Will output

  ```
  ---
  let test = `Hello World!`;
  ---

  <script>
  let secondTest = `Hello World`;
  </script>

  <div>{msg}</div>

  <style>
  .text { color: red; }
  </style>
  ```

</details>

> Learn more by looking at [the tests](/test/astro.create.test.ts)!

## Development

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

## License

Made with 💚

Published under [MIT License](./LICENSE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/sfc-composer?style=flat-square
[npm-version-href]: https://npmjs.com/package/sfc-composer
[npm-downloads-src]: https://img.shields.io/npm/dm/sfc-composer?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/sfc-composer
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/tahul/sfc-composer/ci.yml?branch=main&style=flat-square
[github-actions-href]: https://github.com/tahul/sfc-composer/actions?query=workflow%3Aci
