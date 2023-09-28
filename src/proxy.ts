import MagicString from 'magic-string'
import type { SourceLocation } from './loc'
import { createSourceLocation } from './loc'

export interface MagicBlockBase {
  loc?: SourceLocation | { start: number; end: number }
  [key: string]: any
}

export type MagicBlock<T extends MagicBlockBase = MagicBlockBase> = T & MagicString

function resolveOffsets(
  loc: SourceLocation | { start: number; end: number },
): { start: number; end: number } {
  let { start, end } = loc

  // Set offset
  if (typeof start !== 'number') { start = start?.offset }
  if (typeof end !== 'number') { end = end?.offset }

  return {
    start: start as number,
    end: end as number,
  }
}

export function proxyBlock<T extends MagicBlockBase = MagicBlockBase>(
  source: MagicString,
  block?: T,
  loc?: SourceLocation | { start: number; end: number },
  handler: ProxyHandler<object> = {},
): MagicBlock<T> {
  const { start: blockStart, end: blockEnd } = resolveOffsets(loc || block?.loc || createSourceLocation(source.toString()))

  // Grab content from source
  const content = source.toString().substring(blockStart, blockEnd)

  // Recreate a local Magic String from the block content.
  const snip: MagicString = new MagicString(content)

  const proxified: { [K in keyof MagicString]?: MagicString[K] } = {
    append: (content: string) => {
      source.appendRight(blockEnd, content)
      return snip.append(content)
    },
    appendLeft: (index: number, content: string) => {
      source.appendLeft(blockStart + index, content)
      return snip.appendLeft(index, content)
    },
    appendRight: (index: number, content: string) => {
      source.appendRight(blockStart + index, content)
      return snip.appendRight(index, content)
    },
    prepend: (content: string) => {
      source.prependRight(blockStart, content)
      return snip.prepend(content)
    },
    prependLeft: (index: number, content: string) => {
      source.prependLeft(blockStart + index, content)
      return snip.prependLeft(index, content)
    },
    prependRight: (index: number, content: string) => {
      source.prependRight(blockStart + index, content)
      return snip.prependRight(index, content)
    },
    overwrite: (start: number, end: number, replacement: string, options?: { storeName?: boolean; contentOnly?: boolean }) => {
      source.overwrite(blockStart + start, blockStart + end, replacement, options)
      return snip.overwrite(start, end, replacement, options)
    },
    remove: (start: number, end: number) => {
      source.remove(blockStart + start, blockStart + end)
      return snip.remove(start, end)
    },
  }

  return new Proxy(
    block || {},
    {
      ...handler,
      get(target: T, key: string | symbol, receiver: any) {
        if (key === 'source') {
          return source
        }
        if (key in snip) {
          if (Object.hasOwn(proxified, key)) { return (proxified as any)[key] }
          return snip[key as unknown as keyof MagicString]
        }
        if (block && key in block && !handler.get) {
          return block[key as any]
        }
        if (handler.get) {
          return handler.get(target, key, receiver)
        }
      },
      set(target: T, key: string | symbol, value: any, receiver: any) {
        if (key in proxified) {
          (proxified as any)[key] = value
          return true
        }
        if (block && !handler.set) {
          (block as any)[key] = value
          return true
        }
        if (handler.set) {
          return handler.set(target, key, value, receiver)
        }
        /* c8 ignore next */
        return false
      },
    },
  ) as MagicBlock<T>
}
