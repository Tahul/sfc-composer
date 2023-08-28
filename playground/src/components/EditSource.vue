<script setup lang="ts">
import type { MagicVueSFC } from 'sfc-composer'
import { ref } from 'vue'
import Monaco from './monaco/Monaco.vue'

const props = defineProps<{
  source: MagicVueSFC
}>()

const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'cancel', value: string): void
}>()

const localContent = ref(props.source.ms.toString())

function handleUpdate() {
  emit('update', localContent.value)
}

function handleUpdateModel(e: string) {
  localContent.value = e
}
</script>

<template>
  <div class="block">
    <div class="actions">
      <button @click="$emit('cancel')">
        Cancel
      </button>
      <button @click="handleUpdate">
        Save
      </button>
    </div>
    <Monaco :value="localContent" class="source" filename="source.vue" @update:model-value="handleUpdateModel" />
  </div>
</template>

<style lang="postcss" scoped>
.block {
  width: 100%;
}

.source {
  height: 580px;
}

.actions {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
}
</style>
