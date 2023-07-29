import { describe, expect, it } from 'vitest'
import { countLines, createSourceLocation, findAllSourceLocations, lastLineLength } from '../src'
import { completeComponent, script } from './utils'

describe('LOC Helpers', () => {
  it('Can create SourceLocation', () => {
    const source = '<script setup>let test: string</script>'

    const loc = createSourceLocation(source)

    expect(loc).toStrictEqual({
      start: {
        offset: 0,
        line: 0,
        column: 0,
      },
      end: {
        offset: source.length,
        column: source.length,
        line: 0,
      },
      source,
    })
  })

  it('Can find source locations', () => {
    const locations = findAllSourceLocations(completeComponent, script)

    expect(locations[0]).toStrictEqual({
      source: script,
      start: {
        offset: 3,
        line: 1,
        column: 3,
      },
      end: {
        offset: 3 + script.length,
        line: 1 + countLines(script),
        column: 3 + lastLineLength(script),
      },
    })
  })
})
