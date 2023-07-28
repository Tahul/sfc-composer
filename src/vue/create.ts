import type { SFCBlock } from 'vue/compiler-sfc'
import { MagicVueSFC } from './sfc'

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

export function createVueBlock(
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
  const attrs = Object.entries(block.attrs || {})
    // Filter out `setup` as it's used separately
    .filter(([key]) => key !== 'setup')
    // Map attributes
    .map(([key, value]) => (value === true ? key : `${key}="${value}"`))
    .join(' ')

  // Specific attributes
  const lang = block.lang ? ` lang="${block.lang}"` : ''
  const scoped = block.scoped ? ' scoped' : ''
  const setup = block.attrs.setup ? ' setup' : ''
  const src = block.src ? ` src="${block.src}"` : ''
  const content = block.content || ''

  return `<${blockName}${scoped}${attrs}${lang}${src}${setup}>\n${content}\n</${blockName}>\n`
}

export function createVueSFC(options: CreateVueSFCOptions = {}): MagicVueSFC {
  const templates = options?.templates?.map(template => createVueBlock(template, 'templates')).join('') || ''
  const scripts = options?.scripts?.map(script => createVueBlock(script, 'scripts')).join('') || ''
  const styles = (options.styles || []).map(style => createVueBlock(style, 'styles')).join('') || ''
  const customBlocks = options?.customs?.map(customBlock => createVueBlock(customBlock, 'customs')).join('') || ''
  const sfcContent = `${templates}${scripts}${styles}${customBlocks}`
  return new MagicVueSFC(sfcContent)
}
