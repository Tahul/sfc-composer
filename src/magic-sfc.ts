import type { MagicStringOptions, SourceMap, SourceMapOptions } from 'magic-string'
import MagicString from 'magic-string'
import type { TransformResult } from 'vite'

export interface MagicSFCOptions extends MagicStringOptions {}

export class MagicSFC<T extends MagicSFCOptions = MagicSFCOptions> {
  public source: string
  public options?: T
  public ms: MagicString

  constructor(
    source: string | MagicString,
    options?: T,
  ) {
    if (source instanceof MagicString) {
      this.source = source.toString()
      this.ms = source
      return
    }

    this.source = source
    this.options = options
    this.ms = new MagicString(this.source, { filename: options?.filename, indentExclusionRanges: options?.indentExclusionRanges })
  }

  public parse(): void { /* Parse has no effect here as this class is built to be extended. */ }

  public toString(): string { return this.ms.toString() }

  public getSourcemap(options?: SourceMapOptions): SourceMap { return this.ms.generateMap({ source: this.options?.filename, includeContent: true, ...options }) }

  public getTransformResult(): TransformResult { return { code: this.toString(), map: this.getSourcemap() } }
}

export interface Position {
  offset?: number
  line?: number
  column?: number
}

export interface SourceLocation {
  start?: Position
  end?: Position
  source?: string
}
