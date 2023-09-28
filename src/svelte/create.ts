import type { SFCBlock } from 'vue/compiler-sfc'
import { MagicSvelteSFC } from './sfc'

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

interface CreateSvelteSFCOptions extends Partial<WriteableDescriptor> {} // Assuming this is the path to your MagicVueSFC implementation

export function createSvelteBlock(
  block: WriteableSFCBlock,
  blockType: keyof WriteableDescriptor,
): string {
  if (!block) { return '' }

  // Map proper block type => name
  let blockName: string = blockType

  // Handle `setup` on scriptSetup
  blockName = blockType.slice(0, -1)

  const content = block.content || ''

  return blockName === 'template'
    ? content
    : `<${blockName}>\n${content}\n</${blockName}>`
}

export function createSvelteSFC(options: CreateSvelteSFCOptions = {}): MagicSvelteSFC {
  const templates = options?.templates?.map(template => createSvelteBlock(template, 'templates')).join('\n\n') || ''
  const scripts = options?.scripts?.map(script => createSvelteBlock(script, 'scripts')).join('\n\n') || ''
  const styles = (options.styles || []).map(style => createSvelteBlock(style, 'styles')).join('\n\n') || ''
  const sfcContent = [templates, scripts, styles].filter(Boolean).join('\n\n')
  return new MagicSvelteSFC(sfcContent)
}
