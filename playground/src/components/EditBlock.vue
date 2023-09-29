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

const $emit = defineEmits(['parse', 'select', 'cursor'])

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

  $emit(
    'cursor',
    {
      id: props.id,
      target: block.value,
      raw: e,
      offset,
      sourceOffset: block.value.loc.start.offset + offset,
    },
  )
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
    <div class="selection">
      <p>
        ℹ️ <span>sfc[`{{ type }}`][{{ index }}]</span>
      </p>
    </div>
    <div class="output">
      <div class="content-wrapper">
        <MonacoEditor
          class="editor content"
          :value="localContent"
          :filename="`${id}.${lang}`"
          :lang="lang"
          readonly
          @selection="handleSelection"
          @cursor="handleCursor"
          @mount="handleMounted"
        />
      </div>
      <div class="parsed-wrapper">
        <MonacoEditor
          class="editor parsed"
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
}

.block {
  width: 100%;
  margin-top: 0;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.selection {
  width: auto;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.selection p {
  background-color: #1a1a1a;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: bold;
}

.selection span {
  color: #646cff;
}

.selection, .ms-functions {
  display: flex;
}

.ms-functions {
  align-items: center;
  gap: 0.5rem;
}

.editor {
  height: 200px;
  width: 100%;
}

.actions {
  gap: 0.5rem;
}

.output {
  display: flex;
  flex-direction: row;
  width: 100%;

  & > div {
    width: 50%;
  }
}

.content {
  border-right: 2px solid #646cff;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.output {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

@media (max-width: 920px) {
  .actions {
    gap: 0.5rem;
  }
  .output {
    flex-direction: column;

    & > div {
      width: 100%;
    }

    .content {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      border-bottom: 2px solid #646cff;
      border-right: none;
    }

    .parsed {
      border-top-right-radius: 0;
      border-top-left-radius: 0;
    }
  }
  .selection, .ms-functions {
    flex-direction: column;
    gap: 0.5rem;
    margin: 0.5rem 0;

    & > p {
      display: block;
      width: 100%;
    }

    & > input, button, select, div {
      width: 100%;
    }
  }
}

.parsed-wrapper,
.content-wrapper {
  position: relative;

  &::before {
    display: block;
    position: absolute;
    background-color: #1e1e1e;
    border-bottom: 1px solid #646cff;
    border-left: 1px solid #646cff;
    border-bottom-left-radius: 4px;
    font-weight: bold;
    padding: 0.25rem 0.5rem;
    z-index: 99;
    right: 0;
    top: 0;
  }
}

.parsed-wrapper {
  &::before {
    content: 'Parsed';
  }
}

.content-wrapper {
  &::before {
    content: 'Content';
    right: 2px
  }
}
</style>
