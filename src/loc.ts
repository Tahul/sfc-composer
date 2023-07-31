/**
 * Count lines in a string.
 */
export function countLines(source: string): number { return (source.match(/\n/g) || []).length }

/**
 * Find the length of last line of a string.
 */
export function lastLineLength(source: string): number { return source.substring(source.lastIndexOf('\n')).length }

/**
 * Creates a SourceLocation from a string.
 */
export function createSourceLocation(source: string): SourceLocation {
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

/**
 * Finds a SourceLocation array from a string to search in a source.
 */
export function findAllSourceLocations(source: string, search: string): SourceLocation[] {
  const locations = []
  let startOffset = 0

  while (startOffset < source.length) {
    const index = source.indexOf(search, startOffset)
    if (index === -1) {
      break
    }

    const endOffset = index + search.length

    // Start position
    const preStartStr = source.substring(0, index)
    const startLine = (preStartStr.match(/\n/g) || []).length
    const startColumn = preStartStr.substring(preStartStr.lastIndexOf('\n')).length

    // End position
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

    // Find next occurences
    startOffset = endOffset
  }

  return locations
}

/**
 * Creates a SourceLocation from two string offset integers.
 */
export function createSourceLocationFromOffsets(source: string, start: number, end: number): SourceLocation {
  if (start > end || start < 0 || end > source.length) {
    throw new Error('Invalid start or end offsets.')
  }

  // calculate line and column for start position
  const preStartStr = source.substring(0, start)
  const startLine = countLines(preStartStr)
  const startColumn = preStartStr.substring(preStartStr.lastIndexOf('\n')).length

  // calculate line and column for end position
  const preEndStr = source.substring(0, end)
  const endLine = countLines(preEndStr)
  const endColumn = preEndStr.substring(preEndStr.lastIndexOf('\n')).length

  return {
    start: {
      offset: start,
      line: startLine,
      column: startColumn,
    },
    end: {
      offset: end,
      line: endLine,
      column: endColumn,
    },
    source: source.substring(start, end),
  }
}

/**
 * Position of a caret in a string.
 */
export interface Position {
  offset: number
  line: number
  column: number
}

/**
 * Position of a string in a source.
 */
export interface SourceLocation {
  source: string
  start: Position
  end: Position
}
