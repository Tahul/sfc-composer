<script setup lang="ts">
import type * as monaco from 'monaco-editor-core'
import type { MagicVueSFC } from 'sfc-composer'
import MonacoDiff from './monaco/MonacoDiff.vue'
import Monaco from './monaco/Monaco.vue'

defineProps<{
  source: MagicVueSFC
}>()

defineEmits<{
  (e: 'mount', value: monaco.editor.IStandaloneDiffEditor): void
  (e: 'edit', value: boolean): void
}>()
</script>

<template>
  <div class="block">
    <div class="actions">
      <button @click="$emit('edit')">
        Edit source
      </button>
    </div>
    <MonacoDiff class="diff" filename="test-file.vue" :source="`// Source:\n${source.ms.original}`" :value="`// Output:\n${source.ms.toString()}`" @mount="(e: any) => $emit('mount', e)" />
    <Monaco class="map" filename="test-file-map.vue" :value="`Sourcemap:\n\n${JSON.stringify(source.getSourcemap(), null, 2)}\n\nDecoded mappings:\n\n${JSON.stringify(source.ms.generateDecodedMap(), null, 2)}`" />
  </div>
</template>

<style lang="postcss" scoped>
.block {
  width: 100%;
  padding-bottom: 2rem;
  border-bottom: 4px solid #1a1a1a;
}

.diff {
  height: 580px;
}

.map, .decoded-map {
  height: 250px;
}

.actions {
  margin-bottom: 0.5rem;
}
</style>
