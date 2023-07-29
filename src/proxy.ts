import type MagicString from 'magic-string'
import type { SourceLocation } from './magic-sfc'

export interface MagicBlockBase {
  loc: SourceLocation
  [key: string]: any
}

export type MagicBlock<T extends MagicBlockBase = MagicBlockBase> = T & MagicString

export function proxyBlock<T extends MagicBlockBase = MagicBlockBase>(
  source: MagicString,
  block: T,
  handler: ProxyHandler<object> = {},
): MagicBlock<T> {
  const { start: blockStart, end: blockEnd } = block?.loc || {}

  // Recreate a local Magic String from the block content.
  const snip: MagicString = source.snip(blockStart.offset, blockEnd.offset)

  const proxified: { [K in keyof MagicString]?: MagicString[K] } = {
    append: (content: string) => {
      source.appendRight(blockEnd.offset, content)
      return snip.append(content)
    },
    appendLeft: (index: number, content: string) => {
      source.appendLeft(blockStart.offset + index, content)
      return snip.appendLeft(index, content)
    },
    appendRight: (index: number, content: string) => {
      source.appendRight(blockStart.offset + index, content)
      return snip.appendRight(index, content)
    },
    prepend: (content: string) => {
      source.prependRight(blockStart.offset, content)
      return snip.prepend(content)
    },
    prependLeft: (index: number, content: string) => {
      source.prependLeft(blockStart.offset + index, content)
      return snip.prependLeft(index, content)
    },
    prependRight: (index: number, content: string) => {
      source.prependRight(blockStart.offset + index, content)
      return snip.prependRight(index, content)
    },
    overwrite: (start: number, end: number, replacement: string, options?: { storeName?: boolean; contentOnly?: boolean }) => {
      source.overwrite(blockStart.offset + start, blockStart.offset + end, replacement, options)
      return snip.overwrite(start, end, replacement, options)
    },
    remove: (start: number, end: number) => {
      source.remove(blockStart.offset + start, blockStart.offset + end)
      return snip.remove(start, end)
    },
  }

  return new Proxy(
    block,
    {
      ...handler,
      get(target: T, key: string | symbol, receiver: any) {
        if (key === 'source') { return source }
        if (key === 'snip') { return snip }
        if (key in snip) {
          if (Object.hasOwn(proxified, key)) { return (proxified as any)[key] }
          return snip[key as unknown as keyof MagicString]
        }
        if (handler.get) { return handler.get(target, key, receiver) }
      },
      set(target: T, key: string | symbol, value: any, receiver: any) {
        if (key in proxified) {
          (proxified as any)[key] = value
          return true
        }
        if (handler.set) { return handler.set(target, key, value, receiver) }
        return false
      },
    },
  ) as MagicBlock<T>
}
