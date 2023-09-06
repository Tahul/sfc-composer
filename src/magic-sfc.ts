import type { MagicStringOptions, SourceMap, SourceMapOptions } from 'magic-string'
import MagicString from 'magic-string'
import type { TransformResult } from 'vite'
import type { MagicBlock } from './proxy'

export interface MagicSFCOptions extends MagicStringOptions {
  parser?: any
  parserOptions?: any
  silent?: boolean
  lazy?: boolean
}

export const magicSfcDefaultOptions: MagicSFCOptions = {
  parser: undefined,
  silent: false,
  lazy: false,
  parserOptions: undefined,
}

export class MagicSFC<T extends MagicSFCOptions = MagicSFCOptions> {
  public source: string
  public ms: MagicString
  public options: MagicSFCOptions
  public parsed?: any
  public templates: MagicBlock<any>[] = []
  public scripts: MagicBlock<any>[] = []
  public styles: MagicBlock<any>[] = []
  public customs: MagicBlock<any>[] = []

  constructor(
    source: string | MagicString,
    userOptions?: T,
    defaultOptions = magicSfcDefaultOptions,
  ) {
    this.options = { ...defaultOptions, ...userOptions }

    if (source instanceof MagicString) {
      this.source = source.toString()
      this.ms = source
    }
    else {
      this.source = source
      this.ms = new MagicString(this.source, { filename: this.options?.filename, indentExclusionRanges: this.options?.indentExclusionRanges })
    }

    if (!this.options.lazy) { this.parse() }
  }

  public parse(): void { /* Parse has no effect here as this class is built to be extended. */ }

  public toString(): string {
    return this.ms.toString()
  }

  public getSourcemap(sourceMapOptions?: SourceMapOptions): SourceMap {
    return this.ms.generateMap({ source: this.options?.filename, includeContent: true, hires: true, ...sourceMapOptions })
  }

  public getTransformResult(): TransformResult { return { code: this.toString(), map: this.getSourcemap() } }
}
