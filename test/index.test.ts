import MagicString, { SourceMap } from 'magic-string'
import { describe, expect, it } from 'vitest'
import { MagicSFC, createSourceLocation, proxyBlock } from '../src'

describe('Magic SFC', () => {
  it('Can create the class', () => {
    const sfc = new MagicSFC('<script setup>let test: string</script>')

    expect(sfc.toString()).toBe('<script setup>let test: string</script>')
  })

  it('Can create the class from a MagicString', () => {
    const ms = new MagicString('<script setup>let test: string</script>')

    const sfc = new MagicSFC(ms)

    expect(sfc.toString()).toBe('<script setup>let test: string</script>')
  })

  it('Can get a sourcemap', () => {
    const sfc = new MagicSFC('<script setup>let test: string</script>')

    expect(sfc.getSourcemap()).toBeInstanceOf(SourceMap)
  })

  it('Can access custom properties from proxified block', () => {
    const source = '<script setup>let test: string</script>'

    const block = proxyBlock(
      new MagicString(source),
      {
        loc: createSourceLocation(source),
        type: 'style',
        lang: 'postcss',
        attrs: {
          lang: 'postcss',
        },
      },
    )

    expect(block.type).toBe('style')
  })

  it('Do not parse on instanciation when lazy is set as option', () => {
    const sfc = new MagicSFC('<script setup>let test: string</script>', { lazy: true })

    expect(sfc.parsed).toBeUndefined()
  })
})
