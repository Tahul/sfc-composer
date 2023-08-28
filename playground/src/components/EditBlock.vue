<script setup lang="ts">
import { computed, ref, shallowRef, triggerRef, watch } from 'vue'
import type { MagicSFC } from 'sfc-composer'
import * as monaco from 'monaco-editor-core'
import MonacoEditor from './monaco/Monaco.vue'

const props = defineProps<{
  source: MagicSFC
  id: string
  type: 'templates' | 'scripts' | 'styles' | 'customs'
  index: number
}>()

const $emit = defineEmits(['parse', 'select'])

const lang = computed(() => {
  switch (props.type) {
    case 'templates': return 'html'
    case 'scripts': return 'javascript'
    case 'styles': return 'css'
    default: return 'json'
  }
})

const block = computed(() => {
  return props.source?.[props.type]?.[props.index]
})

const editor = shallowRef<monaco.editor.IStandaloneCodeEditor>()

const localContent = computed(() => block?.value?.toString() || '')

const parsedLocalContent = computed(() => `sfc[\`${props.type}\`][${props.index}] = ${JSON.stringify(block.value, null, 2)}`)

function getOffset(content: string, lineNumber: number, column: number) {
  const lines = content.split('\n')
  let offset = 0

  for (let i = 0; i < lineNumber - 1; i++) {
    offset += lines[i].length + 1 // +1 for the newline character
  }

  offset += column - 1 // -1 because columns are 1-indexed

  return offset
}

const cursor = ref()

function handleCursor(e: monaco.editor.ICursorPositionChangedEvent) {
  const { lineNumber, column } = e.position

  const offset = getOffset(block.value.content, lineNumber, column)

  cursor.value = offset
}

const selection = ref<monaco.editor.ICursorSelectionChangedEvent>()
const selectionStart = ref()
const selectionEnd = ref()

function handleSelection(e: monaco.editor.ICursorSelectionChangedEvent) {
  const { selection: { startColumn, startLineNumber, endColumn, endLineNumber } } = e

  const startOffset = getOffset(block.value.content, startLineNumber, startColumn)
  const endOffset = getOffset(block.value.content, endLineNumber, endColumn)

  selectionStart.value = startOffset
  selectionEnd.value = endOffset

  selection.value = e

  $emit(
    'select',
    {
      id: props.id,
      target: block.value,
      raw: selection.value,
      selectionStart: selectionStart.value,
      selectionEnd: selectionEnd.value,
      sourceStart: block.value.loc.start.offset + selectionStart.value,
      sourceEnd: block.value.loc.start.offset + selectionEnd.value,
    },
  )
}

let decorations: monaco.editor.IEditorDecorationsCollection | undefined

watch(selection, (newSel) => {
  if (editor.value && newSel) {
    if (decorations) {
      decorations.clear()
      decorations = undefined
    }

    const { selection } = newSel
    const { startColumn, startLineNumber, endColumn, endLineNumber } = selection

    decorations = editor.value.createDecorationsCollection([
      {
        range: new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn),
        options: {
          inlineClassName: 'highlited-line',
        },
      },
      {
        range: new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn),
        options: { inlineClassName: 'highlighted-range' },
      },
    ])
  }
})

const content = ref('')

const magicStringMethods = computed(() => ({
  appendLeft: [cursor.value, content.value],
  appendRight: [cursor.value, content.value],
  append: [content.value],
  prepend: [cursor.value, content.value],
  prependLeft: [cursor.value, content.value],
  prependRight: [cursor.value, content.value],
  overwrite: [selectionStart.value, selectionEnd.value, content.value],
  remove: [selectionStart.value, selectionEnd.value],
}) as const)

const method = ref<keyof typeof magicStringMethods.value>('overwrite')

function apply() {
  const args = magicStringMethods?.value?.[method.value]

  /*
  try {
    const clone = new MagicVueSFC(props.source.ms.toString())
    const cloneTarget = clone?.[props.type]?.[Number(props.index)]
    // @ts-ignore
    cloneTarget[method.value](...args)
    clone.parse()
  }
  catch (e) {
    console.log({ 'compile-error': e })
    return
  }
  */

  if (block.value[method.value]) {
    // @ts-ignore
    block.value[method.value](...args)
    triggerRef(localContent)
    triggerRef(parsedLocalContent)
    $emit('parse')
  }
}

function handleMounted(e: monaco.editor.IStandaloneCodeEditor) {
  editor.value = e
}
</script>

<template>
  <div class="block">
    <div class="output">
      <div>
        <MonacoEditor
          class="editor"
          :value="localContent"
          :filename="`${id}.${lang}`"
          :lang="lang"
          readonly
          @selection="handleSelection"
          @cursor="handleCursor"
          @mount="handleMounted"
        />
      </div>
      <div>
        <MonacoEditor
          class="editor"
          :value="parsedLocalContent"
          :filename="`${id}.${lang}`"
          lang="typescript"
          readonly
        />
      </div>
    </div>
    <div class="actions">
      <div class="selection">
        <p>
          <span>sfc[`{{ type }}`][{{ index }}]</span>
        </p>
        <p>
          Cursor: <span>{{ cursor || 0 }}</span>
        </p>
        <p>
          Selection start: <span>{{ selectionStart || 0 }}</span>
        </p>
        <p>
          Selection end: <span>{{ selectionEnd || 0 }}</span>
        </p>
      </div>

      <div class="ms-functions">
        <input v-model="content" :placeholder="`${method} content`" type="text">

        <div>
          <select v-model="method">
            <option v-for="msMethod of Object.keys(magicStringMethods)" :key="msMethod">
              {{ msMethod }}
            </option>
          </select>
        </div>

        <button @click="apply">
          Apply
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
h2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0;
}

p {
  margin: 0;
  margin-block-end: 0.5rem !important;
  margin-block-start: 0.5rem !important;
}

.block {
  width: 100%;
  margin-top: 0;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
  border-bottom: 4px solid #1a1a1a;
}

.selection {
  width: auto;
  gap: 1rem;
}

.selection p {
  background-color: #1a1a1a;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
  width: 240px;
}

.selection span {
  color: #646cff;
}

.selection, .ms-functions {
  display: flex;
}

.ms-functions {
  align-items: center;
  gap: 1rem;
}

.editor {
  height: 200px;
  width: 100%;
}

.actions {
  gap: 1rem;
}

.output {
  display: flex;
  width: 100%;

  & > div {
    width: 50%;
  }
}
</style>
