import { parse as vueParse } from 'vue/compiler-sfc'
import type { SFCBlock, SFCParseOptions, SFCParseResult, SFCScriptBlock, SFCStyleBlock, SFCTemplateBlock } from 'vue/compiler-sfc'
import type { MagicBlock } from '../proxy'
import { proxyBlock } from '../proxy'
import type { MagicSFCOptions } from '../index'
import { MagicSFC } from '../index'

export interface MagicVueSFCOptions extends MagicSFCOptions {
  parserOptions?: SFCParseOptions
}

export class MagicVueSFC<T extends MagicVueSFCOptions = MagicVueSFCOptions> extends MagicSFC<T> {
  public sfc: SFCParseResult | null = null
  public template: MagicBlock<SFCTemplateBlock> | null = null
  public script: MagicBlock<SFCScriptBlock> | null = null
  public scriptSetup: MagicBlock<SFCScriptBlock> | null = null
  public customBlocks: MagicBlock<SFCBlock>[] | null = null
  public styles: MagicBlock<SFCStyleBlock>[] = []

  constructor(
    source: string,
    options?: T,
  ) {
    super(source, options)
    this.parse()
  }

  public parse(): void {
    const parsedSfc = vueParse(this.ms.toString(), this.options?.parserOptions)

    if (!parsedSfc) { return }

    this.sfc = parsedSfc

    if (parsedSfc.descriptor?.template) { this.template = proxyBlock(this, parsedSfc.descriptor.template) }

    if (parsedSfc.descriptor?.script) { this.script = proxyBlock(this, parsedSfc.descriptor.script) }

    if (parsedSfc.descriptor?.scriptSetup) { this.scriptSetup = proxyBlock(this, parsedSfc.descriptor.scriptSetup) }

    if (parsedSfc.descriptor?.styles) { this.styles = parsedSfc.descriptor?.styles.map(styleBlock => proxyBlock(this, styleBlock)) }

    if (parsedSfc.descriptor?.customBlocks) { this.customBlocks = parsedSfc.descriptor?.customBlocks.map(block => proxyBlock(this, block)) }
  }
}
