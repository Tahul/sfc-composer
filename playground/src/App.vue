<script setup lang="ts">
import { MagicSFC as MagicVueSFC, magicVueSfcOptions } from 'sfc-composer/vue'
import { MagicSFC as MagicSvelteSFC, magicSvelteSfcOptions } from 'sfc-composer/svelte'
import type { MagicSFC } from 'sfc-composer'
import { parse as vueParser } from '@vue/compiler-sfc'
import { parse as svelteParser } from 'svelte/compiler'
import { computed, onMounted, ref, shallowRef, triggerRef, watch } from 'vue'
import * as monaco from 'monaco-editor-core'
import lineColumn from 'line-column'
import EditBlock from './components/EditBlock.vue'
import EditSource from './components/EditSource.vue'
import Source from './components/Source.vue'
import Motd from './components/Motd.vue'
import TestComponent from './components/TestComponent.vue?raw'
import TestSvelteComponent from './components/TestSvelteComponent.svelte?raw'

magicVueSfcOptions.parser = vueParser
magicSvelteSfcOptions.parser = svelteParser

const currentFramework = ref<'vue' | 'svelte'>('vue')

const frameworks = {
  vue: { instance: MagicVueSFC, code: TestComponent },
  svelte: { instance: MagicSvelteSFC, code: TestSvelteComponent },
} as Record<'vue' | 'svelte', { instance: typeof MagicSFC; code: string }>

const frameworkMagicSFC = computed(() => {
  return frameworks[currentFramework.value].instance || frameworks.vue.instance
})

watch(
  currentFramework,
  async fw => await updateSource(frameworks[fw].code),
)

const sfc = shallowRef<MagicSFC>(new frameworkMagicSFC.value(TestComponent, { filename: `test-file.${currentFramework.value}` }))

const lastErrored = ref(false)

const editingSource = ref(false)

async function updateSource(source: string) {
  sfc.value = await new frameworkMagicSFC.value(source, { filename: `test-file.${currentFramework.value}` }).parse() as MagicSFC
  editingSource.value = false
}

async function update() {
  try {
    sfc.value = await sfc.value.parse() as MagicSFC
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

onMounted(async () => {
  await update()
})
</script>

<template>
  <div class="background" />
  <Suspense />
  <main>
    <h1>🎼 SFC Composer</h1>
    <Motd />
    <EditSource v-if="editingSource" :source="sfc" @update="updateSource" @cancel="editingSource = false" />
    <template v-else>
      <Source :key="sfc.toString()" :source="sfc" :current-framwork="currentFramework" @parse="update" @mount="handleSourceMounted" @edit="editingSource = true" @framework="(value) => (currentFramework = value)" />
      <div :key="sfc.toString()" class="blocks">
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

    <div class="credits message">
      <p id="astro-spec">
        (<a>*</a>) Due to its nature, the `@astrojs/compiler` package cannot be embedded into the browser, and so cannot be used in this playground. 😢
      </p>
      <p>
        <span>Made by <a href="https://twitter.com/yaeeelglx" target="_blank">@Tahul</a></span>
        <span>
          •
        </span>
        <span><a href="https://github.com/Tahul/sfc-composer">Back to GitHub</a></span>
      </p>
    </div>
  </main>
</template>

<style scoped lang="postcss">
main {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 4rem;
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

@media (max-width: 920px) {
  main {
    padding: 1rem;
  }
}

#astro-spec {
  opacity: 0.6;
}
</style>
