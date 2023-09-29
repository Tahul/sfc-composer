import type { SFCBlock, SFCParseOptions, SFCParseResult, SFCScriptBlock, SFCStyleBlock, SFCTemplateBlock } from 'vue/compiler-sfc'
import type MagicString from 'magic-string'
import type { MagicBlock } from '../proxy'
import { proxyBlock } from '../proxy'
import type { MagicSFCOptions } from '../index'
import { MagicSFC as MagicSFCBase } from '../index'

type VueParseFunction = (source: string, { sourceMap, filename, sourceRoot, pad, ignoreEmpty, compiler }?: SFCParseOptions) => SFCParseResult

export interface MagicVueSFCOptions extends MagicSFCOptions {
  parser?: VueParseFunction
  parserOptions?: SFCParseOptions
  silent?: boolean
}

export const magicVueSfcOptions: MagicVueSFCOptions = {
  parser: undefined,
  silent: false,
  parserOptions: undefined,
}

export class MagicSFC<T extends MagicVueSFCOptions = MagicVueSFCOptions> extends MagicSFCBase<T> {
  declare public options: MagicVueSFCOptions
  declare public parsed?: SFCParseResult
  declare public templates: MagicBlock<SFCTemplateBlock>[]
  declare public scripts: MagicBlock<SFCScriptBlock | SFCBlock>[]
  declare public styles: MagicBlock<SFCStyleBlock>[]

  constructor(
    source: string | MagicString,
    userOptions?: T,
    defaultOptions = magicVueSfcOptions,
  ) {
    super(source, userOptions, defaultOptions as MagicVueSFCOptions)
  }

  public async parse(): Promise<MagicSFC<T>> {
    const {
      parser,
      silent = true,
      parserOptions = {},
    } = this.options

    if (!parser) {
      if (!silent) { throw new Error('You must provide a `parser` function (from vue/compiler-sfc) in options when using MagicVueSFC.') }
      return this
    }

    const parsedSfc = parser(this.ms.toString(), parserOptions)

    if (!parsedSfc) { return this }

    this.parsed = parsedSfc

    // <template>
    if (parsedSfc.descriptor?.template) { this.templates = [proxyBlock(this.ms, parsedSfc.descriptor.template)] }

    // <script> & <script setup>
    const scripts = []
    if (parsedSfc.descriptor?.script) { scripts.push(proxyBlock(this.ms, parsedSfc.descriptor.script)) }
    if (parsedSfc.descriptor?.scriptSetup) { scripts.push(proxyBlock(this.ms, parsedSfc.descriptor.scriptSetup)) }
    if (scripts.length) { this.scripts = scripts }

    // <style>
    if (parsedSfc.descriptor?.styles) { this.styles = parsedSfc.descriptor?.styles.map(styleBlock => proxyBlock(this.ms, styleBlock)) }

    // <custom>
    if (parsedSfc.descriptor?.customBlocks) { this.customs = parsedSfc.descriptor?.customBlocks.map(block => proxyBlock(this.ms, block)) }

    return this
  }
}
