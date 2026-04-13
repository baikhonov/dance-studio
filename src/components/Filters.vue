<script setup lang="ts">
import type { Filters as ScheduleFilters } from '@/types/lesson'

defineProps<{
  directions: string[]
  levels: string[]
}>()

const filters = defineModel<ScheduleFilters>({ required: true })

function updateDirection(event: Event) {
  const value = (event.target as HTMLSelectElement | null)?.value ?? ''
  filters.value = {
    ...filters.value,
    direction: value,
  }
}

function updateLevel(event: Event) {
  const value = (event.target as HTMLSelectElement | null)?.value ?? ''
  filters.value = {
    ...filters.value,
    level: value,
  }
}

const resetFilters = () => {
  filters.value = { direction: '', level: '' }
}
</script>

<template>
  <div class="filters flex flex-col md:flex-row gap-2 w-full md:w-auto">
    <select
      class="w-full md:w-auto max-w-full md:max-w-[200px] px-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm text-gray-700 cursor-pointer"
      :value="filters.direction"
      @change="updateDirection"
    >
      <option value="">Все направления</option>
      <option v-for="direction in directions" :key="direction" :value="direction">
        {{ direction }}
      </option>
    </select>
    <select
      class="w-full md:w-auto max-w-full md:max-w-[200px] px-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm text-gray-700 cursor-pointer"
      :value="filters.level"
      @change="updateLevel"
    >
      <option value="">Все уровни</option>
      <option v-for="level in levels" :key="level" :value="level">
        {{ level }}
      </option>
    </select>
    <button
      v-if="filters.direction || filters.level"
      @click="resetFilters"
      class="w-full md:w-auto px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
    >
      ✕ Сбросить
    </button>
  </div>
</template>
