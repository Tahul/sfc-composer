<script lang="ts" setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue'
import * as monaco from 'monaco-editor-core'
import { loadGrammars, loadTheme } from 'monaco-volar'
import { getOrCreateModel } from './utils'
import { initMonaco } from './env'

const props = withDefaults(
  defineProps<{
    filename: string
    lang?: string
    value?: string
    readonly?: boolean
  }>(),
  {
    readonly: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: monaco.editor.IModelContentChangedEvent): void
  (e: 'selection', value: monaco.editor.ICursorSelectionChangedEvent): void
  (e: 'cursor', value: monaco.editor.ICursorPositionChangedEvent): void
  (e: 'mount', value: monaco.editor.IStandaloneCodeEditor): void
}>()

const containerRef = ref<HTMLDivElement>()
const ready = ref(false)
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor>()

initMonaco()

const lang = computed(() => props?.lang || 'vue')

const replTheme = ref('dark')
onMounted(async () => {
  const theme = await loadTheme(monaco.editor)
  ready.value = true
  await nextTick()

  if (!containerRef.value) {
    throw new Error('Cannot find containerRef')
  }

  const editorInstance = monaco.editor.create(containerRef.value, {
    ...(props.readonly
      ? { value: props.value, language: lang.value }
      : { model: null }),
    'fontSize': 12,
    'theme': replTheme.value === 'light' ? theme.light : theme.dark,
    'readOnly': props.readonly,
    'automaticLayout': true,
    'scrollBeyondLastLine': false,
    'minimap': {
      enabled: false,
    },
    'inlineSuggest': {
      enabled: false,
    },
    'semanticHighlighting.enabled': true,
    'fixedOverflowWidgets': true,
  })
  editor.value = editorInstance

  // Support for semantic highlighting
  const t = (editorInstance as any)._themeService._theme
  t.getTokenStyleMetadata = (
    type: string,
    modifiers: string[],
    _language: string,
  ) => {
    const _readonly = modifiers.includes('readonly')
    switch (type) {
      case 'function':
      case 'method':
        return { foreground: 12 }
      case 'class':
        return { foreground: 11 }
      case 'variable':
      case 'property':
        return { foreground: _readonly ? 21 : 9 }
      default:
        return { foreground: 0 }
    }
  }

  watch(
    () => props.value,
    (value) => {
      if (editorInstance.getValue() === value) { return }
      editorInstance.setValue(value || '')
    },
    { immediate: true },
  )

  watch(lang, lang =>
    monaco.editor.setModelLanguage(editorInstance.getModel()!, lang),
  )

  if (!props.readonly) {
    watch(
      () => props.filename,
      (_) => {
        if (!editorInstance) { return }
        const model = getOrCreateModel(
          monaco.Uri.parse(`file:///${props.filename}`),
          'vue',
          props.value || '',
        )

        editorInstance.setModel(model)
      },
      { immediate: true },
    )
  }

  await loadGrammars(monaco, editorInstance)

  editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    // ignore save event
  })

  editorInstance.onDidChangeModelContent((e) => {
    emit('change', e)
    emit('update:modelValue', editorInstance.getValue())
  })

  // update theme
  watch(replTheme, (n) => {
    editorInstance.updateOptions({
      theme: n === 'light' ? theme.light : theme.dark,
    })
  })

  editorInstance.onDidChangeCursorPosition((e) => {
    emit('cursor', e)
  })

  editorInstance.onDidChangeCursorSelection((e) => {
    emit('selection', e)
  })

  emit('mount', editorInstance)
})

onBeforeUnmount(() => {
  editor.value?.dispose()
})
</script>

<template>
  <div ref="containerRef" class="editor" />
</template>

<style>
.editor {
  position: relative;
  border-radius: 6px;
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
