import type { BaseNode } from 'svelte/types/compiler/interfaces'
import { MagicSFC } from './sfc'

interface WriteableSFCBlock extends Partial<BaseNode> {
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

  return blockName === 'template'
    ? content
    : `<${blockName}>\n${content}\n</${blockName}>`
}

export function createSFC(options: CreateSvelteSFCOptions = {}): MagicSFC {
  const templates = options?.templates?.map(template => createBlock(template, 'templates')).join('\n\n') || ''
  const scripts = options?.scripts?.map(script => createBlock(script, 'scripts')).join('\n\n') || ''
  const styles = (options.styles || []).map(style => createBlock(style, 'styles')).join('\n\n') || ''
  const sfcContent = [templates, scripts, styles].filter(Boolean).join('\n\n')
  return new MagicSFC(sfcContent)
}
