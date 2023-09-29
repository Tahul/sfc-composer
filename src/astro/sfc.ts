import type { ParseOptions, ParseResult } from '@astrojs/compiler'
import type * as AstroUtils from '@astrojs/compiler/utils'
import type MagicString from 'magic-string'
import type { MagicBlock } from '../proxy'
import { proxyBlock } from '../proxy'
import { MagicSFC as MagicSFCBase } from '../index'
import type { MagicSFCOptions } from '../index'

type AstroParseFunction = (source: string, options: ParseOptions) => Promise<ParseResult>

export interface MagicAstroSFCOptions extends MagicSFCOptions {
  parser?: AstroParseFunction
  parserUtils?: typeof AstroUtils
  parserOptions?: ParseOptions
  silent?: boolean
}

export const magicAstroSfcOptions: MagicAstroSFCOptions = {
  parser: undefined,
  parserUtils: undefined,
  silent: false,
  parserOptions: undefined,
}

export class MagicSFC<T extends MagicAstroSFCOptions = MagicAstroSFCOptions> extends MagicSFCBase<T> {
  declare public options: MagicAstroSFCOptions
  declare public templates: MagicBlock<any>[]
  declare public scripts: MagicBlock<any>[]
  declare public styles: MagicBlock<any>[]
  declare public customs: MagicBlock<any>[]

  constructor(
    source: string | MagicString,
    userOptions?: T,
    defaultOptions = magicAstroSfcOptions,
  ) {
    super(source, userOptions, defaultOptions as MagicAstroSFCOptions)
  }

  public async parse(): Promise<MagicSFC<T>> {
    const {
      parser,
      parserUtils,
      silent = true,
      parserOptions = {},
    } = this.options

    if (!parser) {
      if (!silent) { throw new Error('You must provide a `parser` function (from @astrojs/compiler) in options when using MagicAstroSFC.') }
      return this
    }

    if (!parserUtils) {
      if (!silent) { throw new Error('You must provide a `parserUtils` object (from @astrojs/compiler/utils) in options when using MagicAstroSFC.') }
      return this
    }

    const parsedSfc = await parser(this.ms.toString(), parserOptions)

    if (!parsedSfc) { return this }

    this.parsed = parsedSfc

    parserUtils.walk(
      parsedSfc.ast,
      (node) => {
        if (!node?.position?.end) { return }

        // Resolve ---frontmatter--- as <script> tag
        if (parserUtils.is.frontmatter(node)) {
          this.scripts.push(
            proxyBlock(
              this.ms,
              node,
              {
                // Astro includes `---` in the positining, we remove them to scope the block to only its content.
                start: node.position.start.offset + 3,
                end: node.position.end.offset - 3,
              },
            ),
          )
          return
        }

        // <script> tags
        if (parserUtils.is.element(node) && node.name === 'script') {
          const target = this.ms.toString().substring(node.position.start.offset, node.position.end.offset)

          const openingTag = target.match(/<script[^>]*>/)?.[0]

          if (!openingTag) { return }

          this.scripts.push(
            proxyBlock(
              this.ms,
              node,
              {
                // Astro includes `<style ...>` in the positining, we strip it out thanks to the openingTag regex.
                start: node.position.start.offset + openingTag.length,
                // Remove the `</style>` tag which is always 8 char long.
                end: node.position.end.offset - 9,
              },
            ),
          )
          return
        }

        // <style> tags
        if (parserUtils.is.element(node) && node.name === 'style') {
          const target = this.ms.toString().substring(node.position.start.offset, node.position.end.offset)

          const openingTag = target.match(/<style[^>]*>/)?.[0]

          if (!openingTag) { return }

          this.styles.push(
            proxyBlock(
              this.ms,
              node,
              {
                // Astro includes `<style ...>` in the positining, we strip it out thanks to the openingTag regex.
                start: node.position.start.offset + openingTag.length,
                // Remove the `</s>` tag which is always 8 char long.
                end: node.position.end.offset - 8,
              },
            ),
          )
          return
        }

        // <html> && <Component> tags
        if (parserUtils.is.element(node) || parserUtils.is.component(node)) {
          this.templates.push(
            proxyBlock(
              this.ms,
              node,
              {
                start: node.position.start.offset,
                end: node.position.end.offset,
              },
            ),
          )
        }
      },
    )

    return this
  }
}
