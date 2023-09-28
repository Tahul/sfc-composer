import type { Ast, ParserOptions } from 'svelte/types/compiler/interfaces'
import type MagicString from 'magic-string'
import type { MagicBlock } from '../proxy'
import { proxyBlock } from '../proxy'
import type { MagicSFCOptions } from '../index'
import { MagicSFC } from '../index'

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

export class MagicSvelteSFC<T extends MagicSvelteSFCOptions = MagicSvelteSFCOptions> extends MagicSFC<T> {
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

  public parse(): void {
    const {
      parser,
      silent = true,
      parserOptions = {},
    } = this.options

    if (!parser) {
      if (!silent) { throw new Error('You must provide a `parser` function (from svelte/compiler) in options when using MagicSvelteSFC.') }
      return
    }

    const parsedSfc = parser(this.ms.toString(), parserOptions)

    if (!parsedSfc) { return }

    this.parsed = parsedSfc

    // <html>
    if (parsedSfc?.html) {
      this.templates = [
        proxyBlock(
          this.ms,
          parsedSfc.html,
          {
            start: parsedSfc.html.start, end: parsedSfc.html.end,
          },
        ),
      ]
    }

    // <script>
    if (parsedSfc?.instance) {
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
  }
}