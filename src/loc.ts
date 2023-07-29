export function countLines(source: string) { return (source.match(/\n/g) || []).length }
export function lastLineLength(source: string) { return source.substring(source.lastIndexOf('\n')).length }

export function createSourceLocation(source: string) {
  const endLine = countLines(source)
  const endColumn = lastLineLength(source)

  return {
    start: {
      offset: 0,
      line: 0,
      column: 0,
    },
    end: {
      offset: source.length,
      line: endLine,
      column: endColumn,
    },
    source,
  }
}

export function findAllSourceLocations(source: string, search: string) {
  const locations = []
  let startOffset = 0

  while (startOffset < source.length) {
    const index = source.indexOf(search, startOffset)
    if (index === -1) {
      break
    }

    const endOffset = index + search.length

    // calculate line and column for start position
    const preStartStr = source.substring(0, index)
    const startLine = (preStartStr.match(/\n/g) || []).length
    const startColumn = preStartStr.substring(preStartStr.lastIndexOf('\n')).length

    // calculate line and column for end position
    const preEndStr = source.substring(0, endOffset)
    const endLine = (preEndStr.match(/\n/g) || []).length
    const endColumn = preEndStr.substring(preEndStr.lastIndexOf('\n')).length

    locations.push({
      start: {
        offset: index,
        line: startLine,
        column: startColumn,
      },
      end: {
        offset: endOffset,
        line: endLine,
        column: endColumn,
      },
      source: search,
    })

    // move startOffset to after the found occurrence
    startOffset = endOffset
  }

  return locations.length > 0 ? locations : null
}
