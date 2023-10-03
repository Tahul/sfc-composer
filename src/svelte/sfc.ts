import type { Ast, ParserOptions } from 'svelte/types/compiler/interfaces'
import type MagicString from 'magic-string'
import type { MagicBlock } from '../proxy'
import { proxyBlock } from '../proxy'
import type { MagicSFCOptions } from '../index'
import { MagicSFC as MagicSFCBase } from '../index'

type SvelteParseFunction = (source: string, options: ParserOptions) => Ast

type SvelteAST = Required<Ast>

export interface MagicSvelteSFCOptions extends MagicSFCOptions {
  parser?: SvelteParseFunction
  parserOptions?: ParserOptions
  silent?: boolean
}

export const magicSvelteSfcOptions: MagicSvelteSFCOptions = {
  parser: undefined,
  silent: false,
  parserOptions: undefined,
}

export class MagicSFC<T extends MagicSvelteSFCOptions = MagicSvelteSFCOptions> extends MagicSFCBase<T> {
  declare public options: MagicSvelteSFCOptions
  declare public parsed?: Ast
  declare public templates: MagicBlock<SvelteAST['html']>[]
  declare public scripts: MagicBlock<SvelteAST['instance']>[]
  declare public styles: MagicBlock<SvelteAST['css']>[]

  constructor(
    source: string | MagicString,
    userOptions?: T,
    defaultOptions = magicSvelteSfcOptions,
  ) {
    super(source, userOptions, defaultOptions as MagicSvelteSFCOptions)
  }

  public async parse(): Promise<MagicSFC<T>> {
    const {
      parser,
      silent = true,
      parserOptions = {},
    } = this.options

    if (!parser) {
      if (!silent) { throw new Error('You must provide a `parser` function (from svelte/compiler) in options when using MagicSvelteSFC.') }
      return this
    }

    const parsedSfc = parser(this.ms.toString(), parserOptions)

    if (!parsedSfc) { return this }

    this.parsed = parsedSfc

    // <html>
    if (parsedSfc?.html) {
      this.templates = [
        proxyBlock(
          this.ms,
          parsedSfc.html,
          {
            start: parsedSfc.html.start,
            // When the HTML part of the component is empty, the `end` will somehow be greater than `start`.
            // In that case, use the `start` as both `start` and `end` positions.
            end: parsedSfc.html.start <= parsedSfc.html.end ? parsedSfc.html.end : parsedSfc.html.start,
          },
        ),
      ]
    }

    // <script>
    if (parsedSfc?.instance) {
      // Resolve `lang="ts"` manually as an attr, as Svelte parser does not gives a hint on that.
      // @ts-expect-error - Svelte typings seem wrong
      const scriptTag = this.ms.toString().substring(parsedSfc.instance.start, parsedSfc.instance.content.start)
      parsedSfc.instance.attrs = parsedSfc.instance.attrs || {}
      if (scriptTag.includes('lang="ts"')) { parsedSfc.instance.attrs.lang = 'ts' }

      this.scripts = [
        proxyBlock(
          this.ms,
          parsedSfc.instance,
          {
            // @ts-expect-error - Svelte typings seem wrong; this is valid place to get <script> start
            start: parsedSfc.instance.content.start,
            // @ts-expect-error - Svelte typings seem wrong; this is valid place to get <script> end
            end: parsedSfc.instance.content.end,
          },
        ),
      ]
    }

    // <style>
    if (parsedSfc?.css) {
      this.styles = [
        proxyBlock(
          this.ms,
          parsedSfc.css,
          {
            start: parsedSfc.css.content.start,
            end: parsedSfc.css.content.end,
          },
        ),
      ]
    }

    return this
  }
}
