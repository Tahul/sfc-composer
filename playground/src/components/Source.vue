<script setup lang="ts">
import type * as monaco from 'monaco-editor-core'
import type { MagicSFC } from 'sfc-composer'
import MonacoDiff from './monaco/MonacoDiff.vue'
import Monaco from './monaco/Monaco.vue'

defineProps<{
  source: MagicSFC
  currentFramwork: 'vue' | 'svelte'
}>()

defineEmits<{
  (e: 'mount', value: monaco.editor.IStandaloneDiffEditor): void
  (e: 'edit', value: boolean): void
  (e: 'framework', value: 'vue' | 'svelte'): void
}>()
</script>

<template>
  <div class="block">
    <div class="actions">
      <button @click="$emit('edit')">
        Edit source
      </button>

      <div class="frameworks">
        <button :class="{ active: currentFramwork === 'vue' }" @click="$emit('framework', 'vue')">
          <img src="https://vuejs.org/logo.svg" width="24" height="24">
          <span>Vue</span>
        </button>
        <button :class="{ active: currentFramwork === 'svelte' }" @click="$emit('framework', 'svelte')">
          <img src="https://svelte.dev/favicon.png" width="24" height="24">
          <span>Svelte</span>
        </button>
      </div>
    </div>
    <MonacoDiff class="diff" filename="test-file.vue" :source="source.ms.original" :value="source.ms.toString()" @mount="(e: any) => $emit('mount', e)" />
    <Monaco class="map" filename="test-file-map.ts" lang="typescript" :value="`// Sourcemap:\n\nconst sourceMap = ${JSON.stringify(source.getSourcemap(), null, 2)}\n\n// Decoded mappings:\n\nconst decodedMappings = ${JSON.stringify(source.ms.generateDecodedMap(), null, 2)}`" />
  </div>
</template>

<style lang="postcss" scoped>
.block {
  width: 100%;
  padding-bottom: 2rem;
}

.diff {
  height: 580px;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
  border-bottom: 2px solid #646cff;
}

.map, .decoded-map {
  height: 250px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.actions {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  justify-content: space-between;
}

.frameworks {
  display: flex;
  gap: 1rem;
}

.frameworks > .active {
  outline: 1px solid #646cff;
}

.frameworks > button {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}
</style>
