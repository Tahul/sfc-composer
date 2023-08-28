<script setup lang="ts">
import { MagicVueSFC, magicVueSfcDefaultOptions } from 'sfc-composer'
import { parse as parser } from '@vue/compiler-sfc'
import { computed, ref, shallowRef, triggerRef } from 'vue'
import * as monaco from 'monaco-editor-core'
import lineColumn from 'line-column'
import EditBlock from './components/EditBlock.vue'
import EditSource from './components/EditSource.vue'
import Source from './components/Source.vue'
import Motd from './components/Motd.vue'
import TestComponent from './components/TestComponent.vue?raw'

magicVueSfcDefaultOptions.parser = parser

const sfc = shallowRef(new MagicVueSFC(TestComponent, { filename: 'test-file.vue' }))

const lastErrored = ref(false)

const editingSource = ref(false)

function updateSource(source: string) {
  sfc.value = new MagicVueSFC(source, { filename: 'test-file.vue' })
  editingSource.value = false
}

function update() {
  try {
    sfc.value.parse()
    lastErrored.value = false
  }
  catch (e) {
    lastErrored.value = true
    console.log({ 'compile-error': e })
    return
  }

  triggerRef(sfc)
}

const templates = computed(() => sfc.value.templates)
const scripts = computed(() => sfc.value.scripts)
const styles = computed(() => sfc.value.styles)
const customs = computed(() => sfc.value.customs)

const sourceEditor = shallowRef<monaco.editor.IStandaloneDiffEditor>()
function handleSourceMounted(e: monaco.editor.IStandaloneDiffEditor) {
  sourceEditor.value = e
}

let selectionDecorations: monaco.editor.IEditorDecorationsCollection | undefined

function handleBlockSelection(newSel: any) {
  if (selectionDecorations) {
    selectionDecorations.clear()
    selectionDecorations = undefined
  }

  const { sourceStart, sourceEnd } = newSel
  const { line: startLine, col: startColumn } = lineColumn(sfc.value.toString()).fromIndex(sourceStart)!
  const { line: endLine, col: endColumn } = lineColumn(sfc.value.toString()).fromIndex(sourceEnd)!

  selectionDecorations = sourceEditor.value?.getOriginalEditor().createDecorationsCollection([
    {
      range: new monaco.Range(
        startLine,
        startColumn,
        endLine,
        endColumn,
      ),
      options: {
        inlineClassName: 'highlited-line',
      },
    },
    {
      range: new monaco.Range(
        startLine,
        startColumn,
        endLine,
        endColumn,
      ),
      options: { inlineClassName: 'highlighted-range' },
    },
  ])
}

let cursorDecorations: monaco.editor.IEditorDecorationsCollection | undefined

function handleCursor(newCursor: any) {
  if (cursorDecorations) {
    cursorDecorations.clear()
    cursorDecorations = undefined
  }

  const { sourceOffset } = newCursor
  const { line: startLine, col: startColumn } = lineColumn(sfc.value.toString()).fromIndex(sourceOffset)!

  cursorDecorations = sourceEditor.value?.getOriginalEditor().createDecorationsCollection([
    {
      range: new monaco.Range(
        startLine,
        startColumn,
        startLine,
        startColumn + 1,
      ),
      options: {
        inlineClassName: 'cursor-line',
      },
    },
    {
      range: new monaco.Range(
        startLine,
        startColumn,
        startLine,
        startColumn + 1,
      ),
      options: { inlineClassName: 'cursor-range' },
    },
  ])
}
</script>

<template>
  <main>
    <h1>🎼 SFC Composer</h1>
    <Motd />
    <EditSource v-if="editingSource" :source="sfc" @update="updateSource" @cancel="editingSource = false" />
    <template v-else>
      <Source :key="sfc.toString()" :source="sfc" @parse="update" @mount="handleSourceMounted" @edit="editingSource = true" />
      <div :key="sfc.toString()" class="blocks">
        <EditBlock
          v-for="(_, index) of templates"
          :id="`templates-${index}`"
          :key="`templates-${index}`"
          type="templates"
          :source="sfc"
          :index="index"
          @parse="update"
          @select="handleBlockSelection"
          @cursor="handleCursor"
        />
        <EditBlock
          v-for="(_, index) of scripts"
          :id="`scripts-${index}`"
          :key="`scripts-${index}`"
          :source="sfc"
          :index="index"
          type="scripts"
          @parse="update"
          @select="handleBlockSelection"
          @cursor="handleCursor"
        />
        <EditBlock
          v-for="(_, index) of styles"
          :id="`styles-${index}`"
          :key="`styles-${index}`"
          :source="sfc"
          :index="index"
          type="styles"
          @parse="update"
          @select="handleBlockSelection"
          @cursor="handleCursor"
        />
        <EditBlock
          v-for="(_, index) of customs"
          :id="`customs-${index}`"
          :key="`customs-${index}`"
          :source="sfc"
          type="customs"
          :index="index"
          @parse="update"
          @select="handleBlockSelection"
          @cursor="handleCursor"
        />
      </div>
    </template>

    <div class="credits">
      <p>Made by <a href="https://twitter.com/yaeeelglx" target="_blank">@Tahul</a></p>
      <a href="https://github.com/Tahul/sfc-composer"> ↩️&nbsp;&nbsp;Bring me back to GitHub </a>
    </div>
  </main>
</template>

<style scoped lang="postcss">
main {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 2rem;
}

h1 {
  font-weight: bolder;
}

.blocks {
  width: 100%;
}

.credits {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
