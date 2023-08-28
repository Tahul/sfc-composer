# sfc-composer

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]

> 👨‍🔬 Pre-compiler helpers for Single File Components

## Usage

Install package:

```sh
# npm
npm install sfc-composer

# yarn
yarn add sfc-composer

# pnpm
pnpm install sfc-composer
```

Import:

```js
import { MagicVueSFC, createVueSFC } from 'sfc-composer'
```

## API

## MagicSFC

`MagicSFC` is the root interface supplied to be extended by framework-specific utils.

It exposes:

- `getSourcemap(options?: SourceMapOptions): SourceMap`

Generates a [version 3 sourcemap](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit) like [`MagicString`](https://www.npmjs.com/package/magic-string).

- `getTransformResult(): TransformResult`

Compatible with [Vite](https://vitejs.dev) `transform()` hook result.

- `parse(): void`

Refresh the current content of the `MagicSFC` instance. Should be implemented by child classes.

`sfc-composer` currently only exposes `MagicVueSFC` on top of `MagicSFC`.

Learn more about all the usages by looking at [the tests](/test/index.test.ts)!

## MagicVueSFC

`MagicVueSFC` acts as a wrapper of `vue/compiler-sfc` and `MagicString`.

It makes it very easy to apply changes to specific Vue SFCs `<blocks>` without the hassle of handling character offsets in the MagicString.

It does so by creating a proxy of every block from the SFC parsed by `vue/compiler-sfc` offering all of the [`MagicString`](https://www.npmjs.com/package/magic-string) methods for each block.

```ts
const sfc = new MagicVueSFC('<template><div>Hello World!</div></template>\n<script>\nexport default {\n  name: "MyComponent",\n};\n</script>')

sfc.script.overwrite(27, 38, 'UpdatedComponent')

console.log(sfc.toString())
// ^ '<template><div>Hello World!</div></template>\n<script>\nexport default {\n  name: "UpdatedComponent",\n};\n</script>'
```

Learn more about all the usages by looking at [the tests](/test/vue.test.ts)!

## createVueSFC

`createVueSFC` helps in creating a MagicVueSFC from an object-like format.

It can be useful to create components programmatically or to recompose components from existing ones.

The input format is compatible with the `SFCDescriptor` format that is given by `vue/compiler-sfc`.

```ts
import { createVueSFC } from 'sfc-composer'

const MagicVueSFC = createVueSFC({
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
      lang: 'scss', // scss | less | ts
      content: `.text {
  color: red;
}`,
    },
  ],
})
```

Learn more about all the usages by looking at [the tests](/test/vue.create.test.ts)!

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
