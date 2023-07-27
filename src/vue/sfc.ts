import type { SFCBlock, SFCParseOptions, SFCParseResult, SFCScriptBlock, SFCStyleBlock, SFCTemplateBlock } from 'vue/compiler-sfc'
import type MagicString from 'magic-string'
import type { MagicBlock } from '../proxy'
import { proxyBlock } from '../proxy'
import type { MagicSFCOptions } from '../index'
import { MagicSFC } from '../index'

type VueParseFunction = (source: string, { sourceMap, filename, sourceRoot, pad, ignoreEmpty, compiler }?: SFCParseOptions) => SFCParseResult

export interface MagicVueSFCOptions extends MagicSFCOptions {
  parser?: VueParseFunction
  silent?: boolean
  parserOptions?: SFCParseOptions
}

export const defaults: MagicVueSFCOptions = {
  parser: undefined,
  silent: false,
  parserOptions: undefined,
}

export class MagicVueSFC<T extends MagicVueSFCOptions = MagicVueSFCOptions> extends MagicSFC<T> {
  public parser?: VueParseFunction
  public silent?: boolean
  public sfc?: SFCParseResult
  public template?: MagicBlock<SFCTemplateBlock>
  public script?: MagicBlock<SFCScriptBlock>
  public scriptSetup?: MagicBlock<SFCScriptBlock>
  public customBlocks?: MagicBlock<SFCBlock>[]
  public styles?: MagicBlock<SFCStyleBlock>[]

  constructor(
    source: string | MagicString,
    options?: T,
  ) {
    super(source, options || defaults as T)

    if (this?.options?.parser) { this.parser = this.options.parser }
    else { this.parser = defaults.parser }

    this.parse()
  }

  public parse(): void {
    if (!this?.parser) {
      if (!this?.options?.silent) { throw new Error('You must provide a `parser` function (from vue/compiler-sfc) in options when using MagicVueSFC.') }
      return
    }

    const parsedSfc = this?.parser(this.ms.toString(), this.options?.parserOptions)

    if (!parsedSfc) { return }

    this.sfc = parsedSfc

    if (parsedSfc.descriptor?.template) { this.template = proxyBlock(this, parsedSfc.descriptor.template) }

    if (parsedSfc.descriptor?.script) { this.script = proxyBlock(this, parsedSfc.descriptor.script) }

    if (parsedSfc.descriptor?.scriptSetup) { this.scriptSetup = proxyBlock(this, parsedSfc.descriptor.scriptSetup) }

    if (parsedSfc.descriptor?.styles) { this.styles = parsedSfc.descriptor?.styles.map(styleBlock => proxyBlock(this, styleBlock)) }

    if (parsedSfc.descriptor?.customBlocks) { this.customBlocks = parsedSfc.descriptor?.customBlocks.map(block => proxyBlock(this, block)) }
  }
}
