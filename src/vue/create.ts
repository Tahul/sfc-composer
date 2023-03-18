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
  template?: WriteableSFCBlock | true | null
  script?: WriteableSFCBlock | true | null
  scriptSetup?: WriteableSFCBlock | true | null
  styles?: WriteableSFCBlock[] | null
  customBlocks?: WriteableSFCBlock[] | null
}

interface CreateVueSFCOptions extends Partial<WriteableDescriptor> {} // Assuming this is the path to your MagicVueSFC implementation

export function createVueBlock(
  block: WriteableSFCBlock | true | null | undefined,
  blockType: keyof WriteableDescriptor,
): string {
  if (!block) { return '' }

  // Set most basic block structure if true used on blocks descriptors
  if (block === true) { block = { content: '', attrs: {} } }

  if (!block.attrs) { block.attrs = {} }

  // Map proper block type => name
  let blockName: string = blockType
  // Handle `setup` on scriptSetup
  if (blockType === 'scriptSetup') { blockName = 'script' }
  if (blockType === 'customBlocks') { blockName = block.type || block.attrs.type as string || 'custom' }
  if (blockType === 'styles') { blockName = 'style' }

  // Map attrs
  const attrs = Object.entries(block.attrs || {})
    .map(([key, value]) => (value === true ? key : `${key}="${value}"`))
    .join(' ')

  // Specific attributes
  const lang = block.lang ? ` lang="${block.lang}"` : ''
  const scoped = block.scoped ? ' scoped' : ''
  const src = block.src ? ` src="${block.src}"` : ''

  const content = block.content || ''

  return `<${blockName}${scoped}${attrs}${lang}${src}${blockType === 'scriptSetup' ? ' setup' : ''}>\n${content}\n</${blockName}>\n`
}

export function createVueSFC(options: CreateVueSFCOptions = {}): MagicVueSFC {
  const template = createVueBlock(options.template, 'template')
  const script = createVueBlock(options.script, 'script')
  const scriptSetup = createVueBlock(options.scriptSetup, 'scriptSetup')
  const styles = (options.styles || []).map(style => createVueBlock(style, 'styles')).join('\n')
  const customBlocks = (options.customBlocks || []).map(customBlock => createVueBlock(customBlock, 'customBlocks')).join('\n')
  const sfcContent = `${template}${script}${scriptSetup}${styles}${customBlocks}`
  return new MagicVueSFC(sfcContent)
}
