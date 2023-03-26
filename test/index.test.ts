import MagicString, { SourceMap } from 'magic-string'
import { describe, expect, it } from 'vitest'
import { MagicSFC } from '../src'

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
})
