import type { SFCBlock } from 'vue/compiler-sfc'
import { MagicSFC } from './sfc'

interface WriteableSFCBlock extends Partial<SFCBlock> {
  content?: string
  src?: string
  [key: string]: any
}

interface WriteableDescriptor {
  templates?: WriteableSFCBlock[]
  scripts?: WriteableSFCBlock[]
  styles?: WriteableSFCBlock[]
}

interface CreateAstroSFCOptions extends Partial<WriteableDescriptor> {} // Assuming this is the path to your MagicVueSFC implementation

export function createBlock(
  block: WriteableSFCBlock,
  blockType: keyof WriteableDescriptor,
): string {
  if (!block) { return '' }

  // Map proper block type => name
  let blockName: string = blockType

  // Handle `setup` on scriptSetup
  blockName = blockType.slice(0, -1)

  const content = block.content || ''

  const attrs = Object.keys(block?.attrs || {}).length
    ? Object.entries(block.attrs || {})
    // Filter out `setup` as it's used separately
      .filter(([key]) => !['setup', 'scoped'].includes(key))
    // Map attributes
      .map(([key, value]) => (value === true ? key : `${key}="${value}"`))
      .join(' ')
    : ''

  if (blockName === 'template') {
    return content || ''
  }

  if (blockName === 'script' && block.attrs?.frontmatter) {
    return `---\n${content}\n---`
  }

  return `<${[blockName, attrs].filter(Boolean).join(' ')}>\n${content}\n</${blockName}>`
}

export function createSFC(options: CreateAstroSFCOptions = {}): MagicSFC {
  const templates = options?.templates?.map(template => createBlock(template, 'templates')).join('\n\n') || ''
  const scripts = options?.scripts?.map(script => createBlock(script, 'scripts')).join('\n\n') || ''
  const styles = (options.styles || []).map(style => createBlock(style, 'styles')).join('\n\n') || ''
  const sfcContent = [scripts, templates, styles].filter(Boolean).join('\n\n')
  return new MagicSFC(sfcContent)
}
