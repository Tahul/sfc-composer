import { describe, expect, it } from 'vitest'
import { countLines, createSourceLocation, createSourceLocationFromOffsets, findAllSourceLocations, lastLineLength } from '../src'
import { completeComponent, script, scriptSetup, template } from './utils'

describe('LOC Helpers', () => {
  it('Can create SourceLocation from a string', () => {
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

  it('Can find SourceLocation in a string', () => {
    const locations = findAllSourceLocations(completeComponent, script)

    expect(locations[0]).toStrictEqual({
      source: script,
      start: {
        offset: 0,
        line: 0,
        column: 0,
      },
      end: {
        offset: script.length,
        line: countLines(script),
        column: lastLineLength(script),
      },
    })
  })

  it('Can create a SourceLocation from a string and two offsets', () => {
    const scriptLocation = createSourceLocationFromOffsets(completeComponent, 0, script.length)

    const templateLocation = createSourceLocationFromOffsets(completeComponent, script.length + scriptSetup.length + 2, script.length + scriptSetup.length + 2 + template.length)

    expect(scriptLocation).toStrictEqual({
      source: script,
      start: {
        offset: 0,
        line: 0,
        column: 0,
      },
      end: {
        offset: script.length,
        line: countLines(script),
        column: lastLineLength(script),
      },
    })

    // (+ 2 | + 1) are due to new line characters
    expect(templateLocation).toStrictEqual({
      source: template,
      start: {
        offset: script.length + scriptSetup.length + 2,
        line: 2,
        column: 1,
      },
      end: {
        offset: script.length + scriptSetup.length + 2 + template.length,
        line: 2,
        column: template.length + 1,
      },
    })
  })
})
