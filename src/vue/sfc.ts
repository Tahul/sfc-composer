import type { SFCBlock, SFCParseOptions, SFCParseResult, SFCScriptBlock, SFCStyleBlock, SFCTemplateBlock } from 'vue/compiler-sfc'
import type MagicString from 'magic-string'
import type { MagicBlock } from '../proxy'
import { proxyBlock } from '../proxy'
import type { MagicSFCOptions } from '../index'
import { MagicSFC } from '../index'

type VueParseFunction = (source: string, { sourceMap, filename, sourceRoot, pad, ignoreEmpty, compiler }?: SFCParseOptions) => SFCParseResult

export interface MagicVueSFCOptions extends MagicSFCOptions {
  parser?: VueParseFunction
  parserOptions?: SFCParseOptions
  silent?: boolean
}

export const magicVueSfcDefaultOptions: MagicVueSFCOptions = {
  parser: undefined,
  silent: false,
  parserOptions: undefined,
}

export class MagicVueSFC<T extends MagicVueSFCOptions = MagicVueSFCOptions> extends MagicSFC<T> {
  public options: MagicVueSFCOptions = magicVueSfcDefaultOptions
  declare public parsed?: SFCParseResult
  declare public templates: MagicBlock<SFCTemplateBlock>[]
  declare public scripts: MagicBlock<SFCScriptBlock | SFCBlock>[]
  declare public styles: MagicBlock<SFCStyleBlock>[]

  constructor(
    source: string | MagicString,
    options?: T,
  ) {
    super(
      source,
      { ...magicVueSfcDefaultOptions, ...options } as T,
    )
  }

  public parse(): void {
    const {
      parser,
      silent = true,
    } = this.options

    if (!parser) {
      if (!silent) { throw new Error('You must provide a `parser` function (from vue/compiler-sfc) in options when using MagicVueSFC.') }
      return
    }

    const parsedSfc = parser(this.ms.toString(), this.options?.parserOptions)

    if (!parsedSfc) { return }

    this.parsed = parsedSfc

    if (parsedSfc.descriptor?.template) { this.templates.push(proxyBlock(this.ms, parsedSfc.descriptor.template)) }

    if (parsedSfc.descriptor?.script) { this.scripts.push(proxyBlock(this.ms, parsedSfc.descriptor.script)) }

    if (parsedSfc.descriptor?.scriptSetup) { this.scripts.push(proxyBlock(this.ms, parsedSfc.descriptor.scriptSetup)) }

    if (parsedSfc.descriptor?.styles) { parsedSfc.descriptor?.styles.forEach(styleBlock => this.styles.push(proxyBlock(this.ms, styleBlock))) }

    if (parsedSfc.descriptor?.customBlocks) { parsedSfc.descriptor?.customBlocks.forEach(block => this.customs.push(proxyBlock(this.ms, block))) }
  }
}
