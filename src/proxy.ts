import type MagicString from 'magic-string'
import type { MagicSFC, SourceLocation } from './magic-sfc'

export type MagicBlock<T extends { loc: SourceLocation } & object> = T & MagicString

export function proxyBlock<T extends { loc: any } & object>(
  sfc: MagicSFC,
  block: T,
  handler: ProxyHandler<object> = {},
): MagicBlock<T> {
  const { start: blockStart, end: blockEnd } = block?.loc || {}

  // Recreate a local Magic String from the block content.
  const ms: MagicString = sfc.ms.snip(blockStart.offset, blockEnd.offset)

  const proxified: { [K in keyof MagicString]?: MagicString[K] } = {
    append: (content: string) => {
      sfc.ms.appendRight(blockEnd.offset, content)
      return ms.append(content)
    },
    appendLeft: (index: number, content: string) => {
      sfc.ms.appendLeft(blockStart.offset + index, content)
      return ms.appendLeft(index, content)
    },
    appendRight: (index: number, content: string) => {
      sfc.ms.appendRight(blockStart.offset + index, content)
      return ms.appendRight(index, content)
    },
    prepend: (content: string) => {
      sfc.ms.prependRight(blockStart.offset, content)
      return ms.prepend(content)
    },
    prependLeft: (index: number, content: string) => {
      sfc.ms.prependLeft(blockStart.offset + index, content)
      return ms.prependLeft(index, content)
    },
    prependRight: (index: number, content: string) => {
      sfc.ms.prependRight(blockStart.offset + index, content)
      return ms.prependRight(index, content)
    },
    overwrite: (start: number, end: number, replacement: string, options?: { storeName?: boolean; contentOnly?: boolean }) => {
      sfc.ms.overwrite(blockStart.offset + start, blockStart.offset + end, replacement, options)
      return ms.overwrite(start, end, replacement, options)
    },
    remove: (start: number, end: number) => {
      sfc.ms.remove(blockStart.offset + start, blockStart.offset + end)
      return ms.remove(start, end)
    },
  }

  return new Proxy(
    block,
    {
      ...handler,
      get(target: T, key: string | symbol, receiver: any) {
        if (key === 'ms') { return ms }
        if (key in ms) {
          if (Object.hasOwn(proxified, key)) { return (proxified as any)[key] }
          return ms[key as unknown as keyof MagicString]
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
