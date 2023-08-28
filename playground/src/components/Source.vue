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
    <div class="titles">
      <h2>Original</h2>
      <button @click="$emit('edit')">
        Edit source
      </button>
      <h2>Transformed</h2>
    </div>
    <MonacoDiff class="diff" filename="test-file.vue" :source="source.ms.original" :value="source.ms.toString()" @mount="(e: any) => $emit('mount', e)" />
    <Monaco class="map" filename="test-file-map.ts" lang="typescript" :value="`// Sourcemap:\n\nconst sourceMap = ${JSON.stringify(source.getSourcemap(), null, 2)}\n\n// Decoded mappings:\n\nconst decodedMappings = ${JSON.stringify(source.ms.generateDecodedMap(), null, 2)}`" />
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
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: 2px solid #646cff;
}

.map, .decoded-map {
  height: 250px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.titles {
  display: flex;
  flex-direction: row;

  & > * {
    flex: 1;
    margin: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;

    &:first-child {
      text-align: left;
    }

    &:first-child,&:last-child {
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      color: #646cff;
    }

    &:last-child {
      text-align: right;
    }
  }
}
</style>
