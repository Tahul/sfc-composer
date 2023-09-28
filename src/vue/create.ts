import type { SFCBlock } from 'vue/compiler-sfc'
import { MagicSFC } from './sfc'

interface WriteableSFCBlock extends Partial<SFCBlock> {
  content?: string
  attrs?: Record<string, string | true>
  lang?: string
  src?: string
  [key: string]: any
}

interface WriteableDescriptor {
  templates?: WriteableSFCBlock[]
  scripts?: WriteableSFCBlock[]
  styles?: WriteableSFCBlock[]
  customs?: WriteableSFCBlock[]
}

interface CreateVueSFCOptions extends Partial<WriteableDescriptor> {} // Assuming this is the path to your MagicVueSFC implementation

export function createBlock(
  block: WriteableSFCBlock,
  blockType: keyof WriteableDescriptor,
): string {
  if (!block) { return '' }

  if (!block.attrs) { block.attrs = {} }

  // Map proper block type => name
  let blockName: string = blockType

  // Handle `setup` on scriptSetup
  if (blockType === 'templates') { blockName = 'template' }
  if (blockType === 'scripts') { blockName = 'script' }
  if (blockType === 'customs') { blockName = block.type || block.attrs.type as string || 'custom' }
  if (blockType === 'styles') { blockName = 'style' }

  // Map attrs
  const attrs = Object.keys(block.attrs).length
    ? Object.entries(block.attrs || {})
    // Filter out `setup` as it's used separately
      .filter(([key]) => !['setup', 'scoped'].includes(key))
    // Map attributes
      .map(([key, value]) => (value === true ? key : `${key}="${value}"`))
      .join(' ')
    : ''

  // Specific attributes
  const lang = block.lang ? `lang="${block.lang}"` : ''
  const scoped = block.scoped || block.attrs?.scoped ? 'scoped' : ''
  const setup = block.attrs?.setup ? 'setup' : ''
  const src = block.src ? `src="${block.src}"` : ''
  const content = block.content || ''

  return `<${[blockName, scoped, attrs, lang, src, setup].filter(Boolean).join(' ')}>\n${content}\n</${blockName}>`
}

export function createSFC(options: CreateVueSFCOptions = {}): MagicSFC {
  const templates = options?.templates?.map(template => createBlock(template, 'templates')).join('\n\n') || ''
  const scripts = options?.scripts?.map(script => createBlock(script, 'scripts')).join('\n\n') || ''
  const styles = (options.styles || []).map(style => createBlock(style, 'styles')).join('\n\n') || ''
  const customBlocks = options?.customs?.map(customBlock => createBlock(customBlock, 'customs')).join('\n\n') || ''
  const sfcContent = [templates, scripts, styles, customBlocks].filter(Boolean).join('\n\n')
  return new MagicSFC(sfcContent)
}
