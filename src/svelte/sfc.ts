import type MagicString from 'magic-string'
import { type preprocess } from 'svelte/compiler'
import type { MagicBlock } from '../proxy'
import { proxyBlock } from '../proxy'
import type { MagicSFCOptions, SourceLocation } from '../index'
import { MagicSFC as MagicSFCBase, findAllSourceLocations } from '../index'

type SveltePreprocessFunction = typeof preprocess

interface SveltePreprocessBlock {
  parsed: {
    attributes?: Record<string, string | boolean>
    content?: string
    markup?: string
    filename?: string
  }
  attrs?: Record<string, string | boolean>
  loc: SourceLocation
}

export interface MagicSvelteSFCOptions extends MagicSFCOptions {
  parser?: SveltePreprocessFunction
  silent?: boolean
}

export const magicSvelteSfcOptions: MagicSvelteSFCOptions = {
  parser: undefined,
  silent: false,
  parserOptions: undefined,
}

export class MagicSFC<T extends MagicSvelteSFCOptions = MagicSvelteSFCOptions> extends MagicSFCBase<T> {
  declare public options: MagicSvelteSFCOptions
  declare public parsed: undefined
  declare public templates: MagicBlock<SveltePreprocessBlock>[]
  declare public scripts: MagicBlock<SveltePreprocessBlock>[]
  declare public styles: MagicBlock<SveltePreprocessBlock>[]

  constructor(
    source: string | MagicString,
    userOptions?: T,
    defaultOptions = magicSvelteSfcOptions,
  ) {
    super(source, userOptions, defaultOptions as MagicSvelteSFCOptions)
  }

  public async parse(): Promise<MagicSFC<T>> {
    const {
      silent = true,
      parser,
    } = this.options

    if (!parser) {
      if (!silent) { throw new Error('You must provide a `parser` function (usually preprocess from svelte/compiler) in options when using MagicSvelteSFC.') }
      return this
    }

    await parser(
      this.ms.toString(),
      {
        markup: ({ content, filename }) => {
          this.templates.push(
            proxyBlock(
              this.ms,
              {
                parsed: {
                  content,
                  filename,
                },
                loc: findAllSourceLocations(this.source, content)?.[0],
              },
            ),
          )
        },
        script: ({ content, attributes, markup, filename }) => {
          this.scripts.push(
            proxyBlock(
              this.ms,
              {
                parsed: {
                  content,
                  attributes,
                  markup,
                  filename,
                },
                attrs: attributes,
                loc: findAllSourceLocations(markup, content)?.[0],
              },
            ),
          )
        },
        style: ({ attributes, content, markup, filename }) => {
          this.styles.push(
            proxyBlock(
              this.ms,
              {
                parsed: {
                  attributes,
                  content,
                  markup,
                  filename,
                },
                attrs: attributes,
                loc: findAllSourceLocations(markup, content)?.[0],
              },
            ),
          )
        },
        name: 'svelte-sfc-composer',
      },
    )

    return this
  }
}
