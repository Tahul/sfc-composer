import { describe, expect, it, vi } from 'vitest'
import MagicString from 'magic-string'
import { type MagicBlockBase, proxyBlock } from '../src'

describe('proxyBlock', () => {
  it('should create a proxy for a given block', () => {
    const source = new MagicString('Hello, World!')
    const block: MagicBlockBase = {
      loc: {
        source: 'Hello, World!',
        start: { offset: 0, line: 1, column: 0 },
        end: { offset: 5, line: 1, column: 5 },
      },
    }

    const proxiedBlock = proxyBlock(source, block)
    expect(proxiedBlock).toBeDefined()
  })

  it('should update both source and block on append', () => {
    const source = new MagicString('Hello')
    const block: MagicBlockBase = {
      loc: {
        source: 'Hello',
        start: { offset: 0, line: 1, column: 0 },
        end: { offset: 5, line: 1, column: 5 },
      },
    }

    const proxiedBlock = proxyBlock(source, block)
    proxiedBlock.append(', World!')

    expect(source.toString()).toBe('Hello, World!')
    expect(proxiedBlock.toString()).toBe('Hello, World!')
  })

  it('should update only the block and not the source when modifying block outside of its location', () => {
    const source = new MagicString('Hello, World!')
    const block: MagicBlockBase = {
      loc: {
        source: 'World',
        start: { offset: 7, line: 1, column: 7 },
        end: { offset: 12, line: 1, column: 12 },
      },
    }

    const proxiedBlock = proxyBlock(source, block)
    proxiedBlock.append('!')

    expect(source.toString()).toBe('Hello, World!!') // Assuming that proxyBlock will modify the main source
    expect(proxiedBlock.toString()).toBe('World!')
  })

  it('should allow additional properties to be set on the block', () => {
    const source = new MagicString('Hello')
    const block: MagicBlockBase = {
      loc: {
        source: 'Hello',
        start: { offset: 0, line: 1, column: 0 },
        end: { offset: 5, line: 1, column: 5 },
      },
    }

    const proxiedBlock = proxyBlock(source, block)
    proxiedBlock.myProperty = 'test'
    expect(proxiedBlock.myProperty).toBe('test')
  })

  it('should update both source and block on appendLeft', () => {
    const source = new MagicString('Hello, World!')
    const block: MagicBlockBase = {
      loc: {
        source: 'World',
        start: { offset: 7, line: 1, column: 7 },
        end: { offset: 12, line: 1, column: 12 },
      },
    }

    const proxiedBlock = proxyBlock(source, block)
    proxiedBlock.appendLeft(1, 'Test')

    expect(source.toString()).toBe('Hello, WTestorld!')
    expect(proxiedBlock.toString()).toBe('WTestorld')
  })

  it('should update both source and block on appendRight', () => {
    const source = new MagicString('Hello, World!')
    const block: MagicBlockBase = {
      loc: {
        source: 'World',
        start: { offset: 7, line: 1, column: 7 },
        end: { offset: 12, line: 1, column: 12 },
      },
    }

    const proxiedBlock = proxyBlock(source, block)
    proxiedBlock.appendRight(1, 'Test')

    expect(source.toString()).toBe('Hello, WTestorld!')
    expect(proxiedBlock.toString()).toBe('WTestorld')
  })

  it('should update both source and block on prepend', () => {
    const source = new MagicString('Hello, World!')
    const block: MagicBlockBase = {
      loc: {
        source: 'World',
        start: { offset: 7, line: 1, column: 7 },
        end: { offset: 12, line: 1, column: 12 },
      },
    }

    const proxiedBlock = proxyBlock(source, block)
    proxiedBlock.prepend('Test')

    expect(source.toString()).toBe('Hello, TestWorld!')
    expect(proxiedBlock.toString()).toBe('TestWorld')
  })

  it('should update both source and block on remove', () => {
    const source = new MagicString('Hello, World!')
    const block: MagicBlockBase = {
      loc: {
        source: 'World',
        start: { offset: 7, line: 1, column: 7 },
        end: { offset: 12, line: 1, column: 12 },
      },
    }

    const proxiedBlock = proxyBlock(source, block)
    proxiedBlock.remove(0, 5)

    expect(source.toString()).toBe('Hello, !')
    expect(proxiedBlock.toString()).toBe('')
  })

  it('should update both source and block on overwrite', () => {
    const source = new MagicString('Hello, World!')
    const block: MagicBlockBase = {
      loc: {
        source: 'World',
        start: { offset: 7, line: 1, column: 7 },
        end: { offset: 12, line: 1, column: 12 },
      },
    }

    const proxiedBlock = proxyBlock(source, block)
    proxiedBlock.overwrite(0, 5, 'Planet')

    expect(source.toString()).toBe('Hello, Planet!')
    expect(proxiedBlock.toString()).toBe('Planet')
  })

  it('should return source', () => {
    const source = new MagicString('Hello, World!')
    const block: MagicBlockBase = {
      loc: {
        source: 'World',
        start: { offset: 7, line: 1, column: 7 },
        end: { offset: 12, line: 1, column: 12 },
      },
    }

    const proxiedBlock = proxyBlock(source, block)

    expect(proxiedBlock.source.toString()).toBe('Hello, World!')
  })

  it('should use custom get trap from handler', () => {
    const source = new MagicString('Hello, World!')
    const block: MagicBlockBase = {
      loc: {
        source: 'Hello, World!',
        start: { offset: 0, line: 1, column: 0 },
        end: { offset: 5, line: 1, column: 5 },
      },
      customProperty: 'initialValue',
    }

    const handler: ProxyHandler<MagicBlockBase> = {
      get(target, key) {
        if (key === 'customProperty') {
          return 'modifiedValue'
        }
        return Reflect.get(target, key)
      },
    }

    const proxiedBlock = proxyBlock(source, block, handler)
    expect(proxiedBlock.customProperty).toBe('modifiedValue')
  })

  it('should use custom set trap from handler', () => {
    const source = new MagicString('Hello')
    const block: MagicBlockBase = {
      loc: {
        source: 'Hello',
        start: { offset: 0, line: 1, column: 0 },
        end: { offset: 5, line: 1, column: 5 },
      },
    }

    const handler: ProxyHandler<MagicBlockBase> = {
      set(target, key, value) {
        if (key === 'newProperty') {
          target[key as keyof MagicBlockBase] = `prefixed-${value}`
          return true
        }
        return Reflect.set(target, key, value)
      },
    }

    const proxiedBlock = proxyBlock(source, block, handler)
    proxiedBlock.newProperty = 'testValue'
    expect(proxiedBlock.newProperty).toBe('prefixed-testValue')
  })

  it('should allow to overwrite proxified functions', () => {
    const source = new MagicString('Hello')
    const block: MagicBlockBase = {
      loc: {
        source: 'Hello',
        start: { offset: 0, line: 1, column: 0 },
        end: { offset: 5, line: 1, column: 5 },
      },
    }

    const proxiedBlock = proxyBlock(source, block)

    vi.spyOn(console, 'log').mockImplementationOnce(() => {})

    proxiedBlock.overwrite = (...args) => {
      console.log('is overwritten')
      return proxiedBlock
    }

    proxiedBlock.overwrite(1, 1, '')

    expect(console.log).toHaveBeenCalled()
  })

  it('should use createSourceLocation when loc is not provided', () => {
    const source = new MagicString('Hello, World!')

    // Not providing the loc property
    const block: MagicBlockBase = {}

    const proxiedBlock = proxyBlock(source, block)

    // Assuming createSourceLocation, when invoked with 'Hello, World!',
    // sets the block to span the entire string.
    // Here, we're testing the overwrite method as an example.
    proxiedBlock.overwrite(0, 5, 'Hey')

    expect(source.toString()).toBe('Hey, World!')
    expect(proxiedBlock.toString()).toBe('Hey, World!')
  })

  it('should default to an empty object if no block is provided', () => {
    const source = new MagicString('Hello, World!')

    // Not providing the block argument
    const proxiedBlock = proxyBlock(source)

    // Test that it behaves like an empty object
    expect(Object.keys(proxiedBlock)).toEqual([])

    // Assuming you want to still check for the MagicString methods
    // (just to ensure the proxy is working correctly)
    expect(typeof proxiedBlock.append).toBe('function')
    expect(typeof proxiedBlock.overwrite).toBe('function')
    // ... add more checks for other MagicString methods if desired

    // Modifying the source via proxiedBlock's MagicString methods
    proxiedBlock.append(' Check this!')
    expect(source.toString()).toBe('Hello, World! Check this!')
    expect(proxiedBlock.toString()).toBe('Hello, World! Check this!')
  })
})
